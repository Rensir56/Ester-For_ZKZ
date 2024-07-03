

def get_voice_answer_by_llm(voice_str):
    print(f"receive data from front end: {voice_str}")
    if type(voice_str) is str:
        # 后面添加对接模型的业务逻辑
        return "I am a robot. This is a test for voice answer."
    else:
        return "Not A Correct String for Voice!"


def get_text_answer_by_llm(text):
    print(f"receive data from front end: {text}")
    if type(text) is str:
        # 后面添加对接模型的业务逻辑
        return "I am a robot. This is a test for text answer."
    else:
        return "Not A Correct String for Text!"


def get_video_answer_by_llm(video_str):
    print(f"receive data from front end: {video_str}")
    if type(video_str) is str:
        # 后面添加对接模型的业务逻辑
        return "I am a robot. This is a test for video answer."
    else:
        return "Not A Correct String for Video!"