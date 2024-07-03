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
- `voice/` # 语音提问接口， 参数为`voice_str`，值为语音转化的字符串
- `text/` # 文本提问接口, 参数为`text_str`，值为文本字符串

## 4. 待补充函数
- `get_voice_answer_by_llm` # 调用模型，返回语音回答，具体实现在`/backend/myLLM/utils.py`文件，还待完善
- `get_text_answer_by_llm` # 调用模型，返回文本回答，具体实现在`/backend/myLLM/utils.py`文件，还待完善


## 5. 其他说明
- 本后端使用Django框架，具体实现在`/backend/myLLM`目录下
- 本后端暂未配置数据库，后续可能会用到，待补充