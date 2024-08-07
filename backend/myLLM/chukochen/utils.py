import base64
import time
import markdown
from bs4 import BeautifulSoup
import sys
import os
from django.conf import settings
from .WordToWav.ToWave import Ws_Param
from http import HTTPStatus
import dashscope
from dashscope import Application

dashscope.api_key = "sk-87765b0793374f5cb831e625407e2702"


def generate_voice_by_xf(str):
    print(os.path.dirname(__file__))
    try:
        wsParam = Ws_Param(APPID='7fe1e960', APISecret='ODU1MmZmZjg5ZDc0ZDYzYTg5MGJlNzdl',
                           APIKey='35db67ca3f4e905b5c6bc3197f4838ed',
                           Text=str)
        final_url = wsParam.generate_wav(audio_dir='../media/audio')
        return {"link": f"/media/audio/{final_url}"}
    except Exception as e:
        print(e)
        return "Failed to generate voice!"


def get_voice_answer_by_llm(voice_str):
    print(f"receive data from front end: {voice_str}")
    if type(voice_str) is str:
        text_answer = text_generator(voice_str)
        if text_answer["success"]:
            return generate_voice_by_xf(text_answer["response"])
        else:
            return "Failed to generate original text!"
    else:
        return "Not A Correct String for Voice!"


def get_text_answer_by_llm(text):
    print(f"receive data from front end: {text}")
    if type(text) is str:
        try:
            text_answer = text_generator(text)
            if text_answer["success"]:
                return text_answer["response"]
            else:
                return "Failed to generate original text!"
        except Exception as e:
            print(e)
    else:
        return "Not A Correct String for Text!"


def get_video_answer_by_llm(video_str):
    print(f"receive data from front end: {video_str}")
    if type(video_str) is str:
        # if text_generator(video_str)["success"]:
        #     generate_voice_by_xf(text_generator(video_str)["response"])
        # else:
        #     return "Failed to generate original text!"
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), "MakeItTalk"))
        # output_filenames = [
        #     os.path.join(os.path.dirname(__file__), "output/out_6.mp4")
        # ]
        output_filenames = settings.COMPOSER_INSTANCE.compose(
            image_id=0,
            audio_in=os.path.join(os.path.dirname(os.path.abspath(__file__)), "../media/audio/input.wav")
        )
        # 删除media文件夹下原来所有的文件
        for root, dirs, files in os.walk(os.path.join(os.path.dirname(__file__), "../media/video")):
            for name in files:
                os.remove(os.path.join(root, name))
        # 将output_filenames下的内容转存到media文件夹下
        ts = time.time()
        target = open(os.path.join(os.path.dirname(__file__), f"../media/video/{ts}.mp4"), 'wb+')
        for filename in output_filenames:
            file = open(filename, 'rb+')
            target.write(file.read())
            file.close()
        target.close()
        return {"link": f"/media/video/{ts}.mp4" }
    else:
        return "Not A Correct String for Video!"


def text_generator(text):
    response = Application.call(app_id='f655aa1c24674d2d9df3f1975a848e3c',
                                prompt=text,
                                )
    print(response)
    if response.status_code == HTTPStatus.OK:
        print(response)
        resp = response.output.text
        html = markdown.markdown(resp)
        soup = BeautifulSoup(html, 'html.parser')
        return {"success": True, "response": soup.text.replace('\n', '')}
    else:
        print('Failed request_id: %s, status_code: %s, code: %s, message:%s' % (
        response.request_id, response.status_code, response.code, response.message))
        return {"success": False, "response": response.message}
