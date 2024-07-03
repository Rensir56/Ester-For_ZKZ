import React, { useState, useEffect } from 'react';
import './App.css';
import {LeftLayout} from "./leftLayout/leftLayout.tsx";
import {Layout, Menu, theme, Input} from "antd"
import type {MenuProps} from "antd"
import {AppstoreOutlined,MailOutlined} from "@ant-design/icons"
import {defaultUsr, figures} from "./CONST.ts";
import {message} from "./interfaces.ts"
import {MessageBox} from "./MessageBox/MessageBox.tsx";
import {Message} from "@arco-design/web-react";
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
  const [messages, setMessages] = useState<message[]>([]);

  const chooseMode : MenuProps["onClick"] = (e) => { setCurrentMode(e.key)}
  const onSearch = (value: string) => {
    setLoading(!loading)
    // send requests here according to currentMode(API) and currentFigure(request content)
    //TODO
    setMessages([...messages,{
      type : 'text',
      data : value,
      avatarPath : defaultUsr.avatarPath,
      username : defaultUsr.username,
      time  : Date.now()
    }])
  }
  const chooseFigure = (val : string) => {
    setCurrentFigure(val)
  }
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();


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
            }}
        >
      main
        <div className="inputBox" style={{display: "flex", justifyContent: "center"}}>
          <Search placeholder={"说点什么吧"} enterButton={"发送"} loading={loading} style={{position:"fixed" ,bottom: "10%", zIndex : 1, width:"50%"}} onSearch={onSearch}>
          </Search>
        </div>
      </Content>
    </Layout>
  </Layout>
  );
};

export default App;
