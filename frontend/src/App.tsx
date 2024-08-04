import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import {LeftLayout} from "./leftLayout/leftLayout.tsx";
import {Layout, Menu, theme, Input} from "antd"
import type {MenuProps} from "antd"
import {AppstoreOutlined,MailOutlined} from "@ant-design/icons"
import {defaultUsr, figures} from "./CONST.ts";
import {message} from "./interfaces.ts"
import {MessageBox} from "./MessageBox/MessageBox.tsx";
import axios from 'axios';

const {Header,Content,Sider} = Layout
const {Search} = Input
type MenuItem = Required<MenuProps>['items'][number];
const items: MenuItem[] = [
  {
    label: '文本对话',
    key: 'text',
    icon: <MailOutlined />,
  },
  {
    label: '语音对话',
    key: 'audio',
    icon: <MailOutlined />,
  },
  {
    label: "视频对话",
    key : "video",
    icon: <AppstoreOutlined />,
  }
];

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentFigure,setCurrentFigure] = useState<string>('');
  const [currentMode, setCurrentMode] = useState<string>("text")
  const [loading, setLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [messages, setMessages] = useState<message[]>([{username:"rwy",avatarPath:"",flag:1,type:"text",data:"hello",time:0}]);

  const chooseMode : MenuProps["onClick"] = (e) => { setCurrentMode(e.key)}

  const onSearch = async (value: string) => {
    setMessages([
      ...messages,
      {
        type: 'text',
        data: value,
        flag: 1,
        avatarPath: defaultUsr.avatarPath, // 使用实际默认用户的头像路径
        username: defaultUsr.username,    // 使用实际默认用户名
        time: Date.now()
      }
    ]);

    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/chukochen/answer?str=${encodeURIComponent(value)}&type=${currentMode}`,
        {
          headers: {
            'User-Agent': 'Apifox/1.0.0 (https://apifox.com)'
          }
        }
      );

      const responseData = response.data;

      let responseType: 'text' | 'audio' | 'video' = 'text';
      if (currentMode === 'audio') {
        responseType = 'audio';
      } else if (currentMode === 'video') {
        responseType = 'video';
      }

      setMessages(prevMessages => [
        ...prevMessages,
        {
          type: responseType,
          data: responseData,
          flag: 0,
          avatarPath: '', // 使用实际的 GPT 头像路径
          username: 'GPT', // 发送者标识
          time: Date.now()
        }
      ]);

      setInputValue(''); // 清空输入框
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chooseFigure = (val : string) => {
    setCurrentFigure(val)
  }

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentTime(Date.now());
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [collapsed ,setCollapsed] = useState(false);

  return (
  <Layout style={{minHeight: '100vh'}}>
    <Header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1,
      width: window.innerWidth,
      display: 'flex',
      alignItems: 'center',
    }}>
      <Menu theme="dark" items={items} onClick={chooseMode} selectedKeys={[currentMode]} mode={"horizontal"} style={{flex: 1 , minWidth : 0, justifyContent:"space-evenly"}}></Menu>
    </Header>
    <Layout>
      <Sider collapsible collapsed={collapsed} collapsedWidth={0} onCollapse={(value) => setCollapsed(value)} width={200} >
          <LeftLayout figures={figures} curFig={currentFigure} chooseFig={chooseFigure}></LeftLayout>
      </Sider>
      <Content
            style={{
              padding: 50,
              margin: 20,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}>
       <div className="chat-body" ref = {messageRef}>
        {/* {roomMessageData?.messages && roomMessageData.messages */}
        {messages
            .map(item => (
                <MessageBox
                    username = {item.username}
                    avatarPath = {item.avatarPath}
                    flag = {item.flag}
                    type = {item.type}
                    data = {item.data}
                    time = {item.time}
                />
            ))}
        </div>
        <div className="inputBox" style={{display: "flex", justifyContent: "center"}}>
          <Search
            placeholder="说点什么吧"
            enterButton="发送"
            loading={loading}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onSearch={onSearch}
            style={{ position: "fixed", bottom: "10%", zIndex: 1, width: "50%" }}
          />
        </div>
      </Content>
    </Layout>
  </Layout>
  );
};

export default App;
