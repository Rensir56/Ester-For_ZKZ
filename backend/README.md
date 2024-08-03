# Django 后端使用
## 1. 安装依赖
```shell
pip install django
```
## 2. 运行后端
- 在`/backend/myLLM`目录下运行
```shell
python manage.py runserver
```

## 3. 后端接口
> 关于后端URL和函数映射关系，可以查看`/backend/myLLM/urls.py`文件
- 本地根接口地址：`http://localhost:8000/` （后面部署服务器再改）
- 本后端有效接口：
- ~~`voice/` # 语音提问接口， 参数为`voice_str`，值为语音转化的字符串~~
- ~~`text/` # 文本提问接口, 参数为`text_str`，值为文本字符串~~
- `answer/` # 统一提问接口。其中一个参数为`str`，值为问题文本内容；另一个参数为`type`，值为问题类型，目前支持`text`、`voice`、`video`三种类型

## 4. 待补充功能函数
- `get_voice_answer_by_llm` # 调用模型，返回语音回答，具体实现在`/backend/myLLM/utils.py`文件，还待完善
- `get_text_answer_by_llm` # 调用模型，返回文本回答，具体实现在`/backend/myLLM/utils.py`文件，还待完善
- `get_video_answer_by_llm` # 调用模型，返回视频回答，具体实现在`/backend/myLLM/utils.py`文件，还待完善

## 5. 其他说明
- 本后端使用Django框架，具体实现在`/backend/myLLM`目录下
- 本后端暂未配置数据库，后续可能会用到，待补充

## 6. 新的修改
- answer接口的 text/voice 参数方法都已经测试过，可以正常使用；text现在还是直接调用qwen模型的默认回答（没有训练过的）
- voice可以正常使用 不过讯飞星火模型的非默认声线有免费试用期限，如果需要男声的话要换个账号换一下apikey（在`chukochen/WordToWav/ToWave.py里面更改`），现在是默认女声
- video和voice都更改为了base64传输，统一为inline方式
- MakeItTalk里面做了一些修改，因为我的电脑跑不了原来的模型、、；实际运用的话需要把`apps.py`里面构建模型的参数注释去掉；然后video这边还有一些路径问题，测试起来也很耗时间，可能还不一定能用，但是格式没问题
- 另外模型的启动逻辑是在后端启动后先生成一个实例，后续统一调用这个实例