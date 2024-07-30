Tips:
1. Face-alignment的版本是1.3.4，默认下载的版本可能是1.4.1，需要修改
2. pytorch的版本可能是1.*，2.*有waring，但能跑
3. 绝对导入了src模块，所以在别的目录下需要用sys.path.append添加MakeItTalk路径
4. 使用时不要重复创建Compose类，会变慢，可能有冲突(原代码竟然大量用本地文件传输数据)，创建好之后调用compose即可。
5. compose输出的是文件名，默认输出在output目录下