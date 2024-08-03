import markdown
from bs4 import BeautifulSoup
import sys
import os
from django.conf import settings
from .WordToWav.ToWave import Ws_Param
from http import HTTPStatus
import dashscope
dashscope.api_key ="sk-ecc1cff623fe4c91975ce625767074a6"


def generate_voice_by_xf(str):
    print(os.path.dirname(__file__))
    try:
        wsParam = Ws_Param(APPID='7fe1e960', APISecret='ODU1MmZmZjg5ZDc0ZDYzYTg5MGJlNzdl',
                           APIKey='35db67ca3f4e905b5c6bc3197f4838ed',
                           Text=str)
        result_bytes = wsParam.generate_wav(audio_dir='input/audio')
        print(result_bytes)
        return result_bytes
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
        if text_generator(video_str)["success"]:
            generate_voice_by_xf(text_generator(video_str)["response"])
        else:
            return "Failed to generate original text!"
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), "MakeItTalk"))
        output_filenames = settings.COMPOSER_INSTANCE.compose(
            image_id=0,
            audio_in=os.path.dirname(os.path.abspath(__file__)) + "/input/audio/input.wav"
        )
        result_bytes = []
        for filename in output_filenames:
            with open(filename, 'rb') as f:
                result_bytes.append(f.read())
        return result_bytes
    else:
        return "Not A Correct String for Video!"


def text_generator(text):
    response = dashscope.Generation.call(model='qwen-turbo',
                                           messages=[{'role': 'user', 'content': text}],
                                           )
    if response.status_code == HTTPStatus.OK:
        print(response)
        resp = response.output.text
        html = markdown.markdown(resp)
        soup = BeautifulSoup(html, 'html.parser')
        return {"success": True, "response": soup.text.replace('\n', '')}
    else:
        print('Failed request_id: %s, status_code: %s, code: %s, message:%s' %(response.request_id, response.status_code, response.code,response.message))
        return {"success": False, "response": response.message}
