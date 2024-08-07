from django.apps import AppConfig


class ChukochenConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'chukochen'

    def ready(self):
        import os
        import sys
        from django.conf import settings
        MakeItTalk_path = os.path.join(os.path.dirname(__file__), 'MakeItTalk')
        sys.path.insert(0, MakeItTalk_path)
        from .MakeItTalk.Compose import Composer
        print(os.path.dirname(os.path.abspath(__file__)))
        settings.COMPOSER_INSTANCE = Composer(
            a2v_ckpt=os.path.dirname(os.path.abspath(__file__))+"/MakeItTalk/ckpt/ckpt_autovc.pth",
            a2l_G_ckpt=os.path.dirname(os.path.abspath(__file__))+"/MakeItTalk/ckpt/ckpt_speaker_branch.pth",
            a2l_C_ckpt=os.path.dirname(os.path.abspath(__file__))+"/MakeItTalk/ckpt/ckpt_content_branch.pth",
            comb_G_ckpt=os.path.dirname(os.path.abspath(__file__))+"/MakeItTalk/ckpt/ckpt_116_i2i_comb.pth",

            id_emb_path=os.path.dirname(os.path.abspath(__file__))+"/embedding/emb.txt",
            anchor_t_shape_path=os.path.dirname(os.path.abspath(__file__))+"/embedding/STD_FACE_LANDMARKS.txt",
            test_emb_path=os.path.dirname(os.path.abspath(__file__))+"/embedding/emb.pickle",
            au_mean_std_path=os.path.dirname(os.path.abspath(__file__))+"/embedding/MEAN_STD_AUTOVC_RETRAIN_MEL_AU.txt",

            images_path=[
                os.path.dirname(os.path.abspath(__file__))+"/input/image/zkz1.jpg",
                os.path.dirname(os.path.abspath(__file__))+"/input/image/zkz2.jpg",
                os.path.dirname(os.path.abspath(__file__))+"/input/image/zkz3.jpg"
            ]
        )
