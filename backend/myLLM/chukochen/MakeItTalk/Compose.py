import torch
from typing import List
from src.approaches.train_image_translation import Image_translation_block
import numpy as np
from torch import nn
import pickle
import cv2
import face_alignment
import util.utils as util
import os
import shutil
from src.autovc.AutoVC_mel_Convertor_retrain_version import AutoVC_mel_Convertor
from src.autovc.retrain_version.model_vc_37_1 import Generator
import re
from src.dataset.audio2landmark.audio2landmark_dataset import Audio2landmark_Dataset
from src.models.model_audio2landmark import Audio2landmark_pos, Audio2landmark_content
from src.approaches.train_audio2landmark import Audio2landmark_model
from src.models.model_image_translation import ResUnetGenerator


def find_next_file(folder_path, prefix="tmp_", extension=""):
    files = os.listdir(folder_path)
    pattern = re.compile(f'^{re.escape(prefix)}(\\d+){re.escape(extension)}$')
    numbers = []
    for file in files:
        match = pattern.match(file)
        if match:
            numbers.append(int(match.group(1)))
    if numbers:
        next_number = max(numbers) + 1
    else:
        next_number = 1
    next_file = f"{prefix}{next_number}{extension}"
    return next_file


class Composer:
    def __init__(
        self,
        # ckpts
        a2v_ckpt:str,
        a2l_G_ckpt:str,
        a2l_C_ckpt:str,
        comb_G_ckpt:str,
        # embs
        id_emb_path:str,
        anchor_t_shape_path:str,
        test_emb_path:str,
        au_mean_std_path:str,
        # images
        images_path:List[str] 
    ):
        self.id_emb,self.anchor_t_shape,self.test_emb,self.au_mean_std = self.prepareEmbedding(
            id_emb_path,
            anchor_t_shape_path,
            test_emb_path,
            au_mean_std_path
        )
        self.face_predictor,self.a2v_G,self.a2l_model,self.translation_model = self.prepareModules(
            a2v_ckpt,
            a2l_G_ckpt,
            a2l_C_ckpt,
            comb_G_ckpt
        )
        self.imgs_prop = []
        for image_path in images_path:
            self.imgs_prop.append(self.prepareImage(
                image_path,
                face_std = self.anchor_t_shape
            ))


    def prepareImage(
            self,   
            image_in: str,
            close_input_face_mouth: bool = False,
            face_std = None
    ):
        '''
        input:
             image_in : str, absolute path of input image
             close_input_face_mouth: bool = False
        output:
             shape_3d
             scale
             shift
        '''
        img = cv2.imread(image_in)

        shapes = self.face_predictor.get_landmarks(img)
        if not shapes or len(shapes) != 1:
            print('Cannot detect face landmarks. Exit.')
            exit(-1)
        shape_3d = shapes[0]
        if close_input_face_mouth:
            util.close_input_face_mouth(shape_3d)
        shape_3d[49:54, 1] += 1.
        shape_3d[55:60, 1] -= 1.
        shape_3d[[37, 38, 43, 44], 1] -= 2
        shape_3d[[40, 41, 46, 47], 1] += 2
        shape_3d, scale, shift = util.norm_input_face(shape_3d,face_std)
        return img,shape_3d, scale, shift
    def prepareModules(
            self,
            a2v_ckpt: str,
            a2l_G_ckpt:str,
            a2l_C_ckpt:str,
            comb_G_ckpt:str
    ):
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        a2v_G = Generator(16, 256, 512, 16).eval().to(device)

        if a2v_ckpt:
            g_checkpoint = torch.load(a2v_ckpt, map_location=device)
            a2v_G.load_state_dict(g_checkpoint['model'])

        a2l_G = Audio2landmark_pos(drop_out=0.5,
                                   spk_emb_enc_size=128,
                                   c_enc_hidden_size=256,
                                   transformer_d_model=32, N=2, heads=2,
                                   z_size=128, audio_dim=256)
        if a2l_G_ckpt:
            model_dict = a2l_G.state_dict()
            ckpt = torch.load(a2l_G_ckpt)
            pretrained_dict = {k: v for k, v in ckpt['G'].items() if k.split('.')[0] not in ['comb_mlp']}
            model_dict.update(pretrained_dict)
            a2l_G.load_state_dict(model_dict)
        a2l_G.to(device)

        a2l_C = Audio2landmark_content(num_window_frames=18,
                                       in_size=80, use_prior_net=True,
                                       bidirectional=False, drop_out=0.5)
        if a2l_C_ckpt:
            ckpt = torch.load(a2l_C_ckpt)
            a2l_C.load_state_dict(ckpt['model_g_face_id'])
        a2l_C.to(device)
        a2l_model = Audio2landmark_model(None, None, a2l_G, a2l_C)
        a2l_model.update_test_emb(self.test_emb)

        comb_G = ResUnetGenerator(input_nc=6, output_nc=3, num_downs=6, use_dropout=False)
        if comb_G_ckpt:
            ckpt = torch.load(comb_G_ckpt)
            try:
                comb_G.load_state_dict(ckpt['G'])
            except:
                tmp = nn.DataParallel(comb_G)
                tmp.load_state_dict(ckpt['G'])
                comb_G.load_state_dict(tmp.module.state_dict())
                del tmp
        comb_G.to(device)
        translation_model = Image_translation_block(opt_parser=None, single_test=True, comb_G=comb_G)

        face_predictor = face_alignment.FaceAlignment(face_alignment.LandmarksType._3D, device='cuda', flip_input=True)
        return face_predictor, a2v_G, a2l_model, translation_model

    def prepareEmbedding(
            self,
            id_emb_path : str,
            anchor_t_shape_path :str,
            test_emb_path: str,
            au_mean_std_path:str
    ):
        id_emb = np.loadtxt(id_emb_path)
        anchor_t_shape = np.loadtxt(anchor_t_shape_path)
        au_mean_std = np.loadtxt(au_mean_std_path)
        with open(test_emb_path, 'rb') as fp:
            test_emb = pickle.load(fp)
        return id_emb,anchor_t_shape,test_emb,au_mean_std
    def prepareAudio(
            self,
            audio_in: str
    ):
        if not os.path.exists("./temp"):
            os.makedirs("./temp")
        next_file = os.path.join("./temp",find_next_file("./temp","tmp_",".wav"))
        os.system(f'ffmpeg -y -loglevel error -i {audio_in} -ar 16000 {next_file}')
        shutil.copyfile(next_file, audio_in)
        from thirdparty.resemblyer_util.speaker_emb import get_spk_emb
        au_emb, ae = get_spk_emb(audio_in)
        au_emb = au_emb.reshape(-1)
        c = AutoVC_mel_Convertor('placeholder')
        au,info = c.convert_single_wav_to_autovc_input_G_Emb(audio_in,self.a2v_G,self.id_emb)[0]
        if os.path.isfile(next_file):
            os.remove(next_file)
        fl_data = []
        rot_tran, rot_quat, anchor_t_shape = [], [], []
        au_length = au.shape[0]
        fl = np.zeros(shape=(au_length, 68 * 3))
        fl_data.append((fl, info))
        rot_tran.append(np.zeros(shape=(au_length, 3, 4)))
        rot_quat.append(np.zeros(shape=(au_length, 4)))
        anchor_t_shape.append(np.zeros(shape=(au_length, 68 * 3)))
        # if os.path.exists(os.path.join('./dump', 'random_val_fl.pickle')):
            # os.remove(os.path.join('./dump', 'random_val_fl.pickle'))
        # if os.path.exists(os.path.join('./dump', 'random_val_fl_interp.pickle')):
            # os.remove(os.path.join('./dump','random_val_fl_interp.pickle'))
        # if os.path.exists(os.path.join('./dump', 'random_val_au.pickle')):
            # os.remove(os.path.join('./dump','random_val_au.pickle'))
        # if os.path.exists(os.path.join('./dump', 'random_val_gaze.pickle')):
            # os.remove(os.path.join('./dump', 'random_val_gaze.pickle'))
        eval_data = Audio2landmark_Dataset(
            num_window_frames=18,
            num_window_step=1,
            au_data=[[au,info]],
            fl_data=fl_data,
            au_mean_std=self.au_mean_std
        )
        # with open(os.path.join('./dump','random_val_fl.pickle'), 'wb') as fp:
            # pickle.dump(fl_data, fp)
        # with open(os.path.join('./dump','random_val_au.pickle'), 'wb') as fp:
            # pickle.dump([[au,info]], fp)
        # with open(os.path.join('./dump','random_val_gaze.pickle'), 'wb') as fp:
            # gaze = {'rot_trans': rot_tran, 'rot_quat': rot_quat, 'anchor_t_shape': anchor_t_shape}
            # pickle.dump(gaze, fp)
        return au_emb,eval_data
    def compose(self,
                image_id:int,
                audio_in:str,
                amp_pos:float = .5,
                amp_lip_x:float = 2.,
                amp_lip_y:float = 2.
                ):
        if image_id < 0 or image_id >= len(self.imgs_prop):
            raise RuntimeError("invalid image_id")
        au_emb,eval_data =  self.prepareAudio(audio_in)
        img,shape_3d,scale,shift = self.imgs_prop[image_id]
        self.a2l_model.update_face(shape_3d)
        self.a2l_model.set_eval_data(eval_data)
        filenames = self.a2l_model.test(
            au_emb = [au_emb],
            amp_pos = amp_pos,
            amp_lip_x = amp_lip_x,
            amp_lip_y = amp_lip_y 
        )
        output_filenames = self.translation_model.translation(
            img,
            scale,
            shift,
            filenames
        )
        return output_filenames
        
if __name__ == "__main__":
    composer = Composer(
        a2v_ckpt="/mnt/e/models/Ester-For_ZKZ/backend/myLLM/MakeItTalk/ckpt/ckpt_autovc.pth",
        a2l_G_ckpt="/mnt/e/models/Ester-For_ZKZ/backend/myLLM/MakeItTalk/ckpt/ckpt_speaker_branch.pth",
        a2l_C_ckpt="/mnt/e/models/Ester-For_ZKZ/backend/myLLM/MakeItTalk/ckpt/ckpt_content_branch.pth",
        comb_G_ckpt="/mnt/e/models/Ester-For_ZKZ/backend/myLLM/MakeItTalk/ckpt/ckpt_116_i2i_comb.pth",

        id_emb_path="/mnt/e/models/Ester-For_ZKZ/backend/myLLM/MakeItTalk/embedding/emb.txt",
        anchor_t_shape_path="/mnt/e/models/Ester-For_ZKZ/backend/myLLM/MakeItTalk/embedding/STD_FACE_LANDMARKS.txt",
        test_emb_path="/mnt/e/models/Ester-For_ZKZ/backend/myLLM/MakeItTalk/embedding/emb.pickle",
        au_mean_std_path="/mnt/e/models/Ester-For_ZKZ/backend/myLLM/MakeItTalk/embedding/MEAN_STD_AUTOVC_RETRAIN_MEL_AU.txt",

        images_path=[
            "/mnt/e/models/Ester-For_ZKZ/backend/myLLM/MakeItTalk/input/image/zkz1.jpg",
            "/mnt/e/models/Ester-For_ZKZ/backend/myLLM/MakeItTalk/input/image/zkz2.jpg",
            "/mnt/e/models/Ester-For_ZKZ/backend/myLLM/MakeItTalk/input/image/zkz3.jpg"
        ]
    )
    output_filenames = composer.compose(
        image_id=0,
        audio_in="/mnt/e/models/Ester-For_ZKZ/backend/myLLM/MakeItTalk/input/audio/M6_04_16k.wav" 
    )
    # id_emb, anchor_t_shape, test_emb = prepareEmbedding(
        # id_emb_path="/mnt/c/Users/耳东七月/PycharmProjects/Ester-For_ZKZ/backend/myLLM/MakeItTalk/embedding/emb.txt",
        # anchor_t_shape_path="/mnt/c/Users/耳东七月/PycharmProjects/Ester-For_ZKZ/backend/myLLM/MakeItTalk/embedding/STD_FACE_LANDMARKS.txt",
        # test_emb_path="/mnt/c/Users/耳东七月/PycharmProjects/Ester-For_ZKZ/backend/myLLM/MakeItTalk/embedding/emb.pickle"
    # )
    # a2v_G,a2l_model,translation_model = prepareModules(
        # a2v_ckpt="/mnt/c/Users/耳东七月/PycharmProjects/Ester-For_ZKZ/backend/myLLM/MakeItTalk/ckpt/ckpt_autovc.pth",
        # a2l_G_ckpt="/mnt/c/Users/耳东七月/PycharmProjects/Ester-For_ZKZ/backend/myLLM/MakeItTalk/ckpt/ckpt_speaker_branch.pth",
        # a2l_C_ckpt="/mnt/c/Users/耳东七月/PycharmProjects/Ester-For_ZKZ/backend/myLLM/MakeItTalk/ckpt/ckpt_content_branch.pth",
        # comb_G_ckpt="/mnt/c/Users/耳东七月/PycharmProjects/Ester-For_ZKZ/backend/myLLM/MakeItTalk/ckpt/ckpt_116_i2i_comb.pth"
    # )
    # au_emb = prepareAudio("/mnt/c/Users/耳东七月/PycharmProjects/Ester-For_ZKZ/backend/myLLM/MakeItTalk/input/audio/M6_04_16k.wav",
                #  G=a2v_G,
                #  emb=id_emb)
    # img,shape_3d,scale,shift = prepareImage("/mnt/c/Users/耳东七月/PycharmProjects/Ester-For_ZKZ/backend/myLLM/MakeItTalk/input/image/zkz2.jpg",
                                        # face_std=anchor_t_shape)
    # amp_pos,amp_lip_x,amp_lip_y = .5, 2. ,2.
    # a2l_model.update_face(shape_3d)
    # a2l_model.update_test_emb(test_emb)
    # filenames = a2l_model.test(au_emb=[au_emb],amp_pos=amp_pos,amp_lip_x=amp_lip_x,amp_lip_y=amp_lip_y)
    # output_filenames = translation_model.translation(img,scale,shift,filenames)
    # print(output_filenames)
