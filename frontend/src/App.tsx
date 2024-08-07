import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { LeftLayout } from "./leftLayout/leftLayout.tsx";
import { Layout, Menu, theme, Input } from "antd";
import type { MenuProps } from "antd";
import { AppstoreOutlined, MailOutlined } from "@ant-design/icons";
import { defaultUsr, figures } from "./CONST.ts";
import { message } from "./interfaces.ts";
import { MessageBox } from "./MessageBox/MessageBox.tsx";
import axios from 'axios';

const { Header, Content, Sider } = Layout;
const { Search } = Input;
type MenuItem = Required<MenuProps>['items'][number];
const items: MenuItem[] = [
  {
    label: '文本对话',
    key: 'text',
    icon: <MailOutlined />,
  },
  {
    label: '语音对话',
    key: 'voice',
    icon: <MailOutlined />,
  },
  {
    label: "视频对话",
    key: "video",
    icon: <AppstoreOutlined />,
  }
];

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentFigure, setCurrentFigure] = useState<string>('');
  const [currentMode, setCurrentMode] = useState<string>("text");
  const [loading, setLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [messages, setMessages] = useState<message[]>([{ username: "rwy", avatarPath: "", flag: 1, type: "text", data: "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq", time: 0 }]);

  const chooseMode: MenuProps["onClick"] = (e) => { setCurrentMode(e.key) };

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
    setInputValue(''); // 清空输入框
    try {
      const initialResponse = await axios.get(
        `http://127.0.0.1:8000/chukochen/answer?str=${encodeURIComponent(value)}&type=${currentMode}`,
        {
          headers: {
            'User-Agent': 'Apifox/1.0.0 (https://apifox.com)'
          }
        }
      );

      const responseData = initialResponse.data.answer;
      let responseType: 'text' | 'voice' | 'video' = 'text';
      let mediaUrl = '';

      if (currentMode === 'voice' || currentMode === 'video') {
        mediaUrl = `http://127.0.0.1:8000${responseData.link}`;
        const mediaResponse = await axios.get(mediaUrl, {
          responseType: 'arraybuffer' // For downloading binary data
        });
        responseType = currentMode;

        // 创建一个 Blob URL 或其他方式来表示下载的二进制数据
        mediaUrl = URL.createObjectURL(new Blob([mediaResponse.data]));
      }

      setMessages(prevMessages => [
        ...prevMessages,
        {
          type: responseType,
          data: responseType === 'text' ? responseData : mediaUrl,
          flag: 0,
          avatarPath: '', // 使用实际的 GPT 头像路径
          username: 'GPT', // 发送者标识
          time: Date.now()
        }
      ]);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chooseFigure = (val: string) => {
    setCurrentFigure(val);
  }

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageRef.current) {
      // 自动滚动到 Content 的底部
      messageRef.current.scrollTop = messageRef.current.scrollHeight;
    }
  }, [messages]); // 依赖于 messages，每次 messages 更新时都会触发

  useEffect(() => {
    setCurrentTime(Date.now());
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        overflow: 'auto',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        width: window.innerWidth, // 使用百分比代替 window.innerWidth
        display: 'flex',
        alignItems: 'center',
        height: '50px', // 固定 Header 高度
      }}>
        <Menu theme="dark" items={items} onClick={chooseMode} selectedKeys={[currentMode]} mode="horizontal" style={{ flex: 1, minWidth: 0, justifyContent: "space-evenly" }}></Menu>
      </Header>
      <Layout style={{ display: 'flex', flexDirection: 'column' }}>
        <Layout style={{ flex: 1, display: 'flex' }}>
          <Sider collapsible collapsed={collapsed} collapsedWidth={0} onCollapse={(value) => setCollapsed(value)} width={200}>
            <LeftLayout figures={figures} curFig={currentFigure} chooseFig={chooseFigure}></LeftLayout>
          </Sider>
          <Content
            ref={messageRef}
            style={{
              overflowY: 'auto', // 使内容区域可滚动
              padding: 0,
              margin: 0,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              maxHeight: 'calc(100vh - 32px - 70px)', // 固定 Content 的最大高度，减去 Header 和 inputBox 的高度
            }}>
            <div className="chat-body">
              {messages.map(item => (
                <MessageBox
                  key={item.time} // 确保每个消息都有一个唯一的 key
                  username={item.username}
                  avatarPath={item.avatarPath}
                  flag={item.flag}
                  type={item.type}
                  data={item.data}
                  time={item.time}
                />
              ))}
            </div>
          </Content>
        </Layout>
        <div className="inputBox" style={{ position: 'fixed', bottom: 0, width: '100%', display: 'flex', justifyContent: 'center', zIndex: 1, padding: '10px', boxSizing: 'border-box', backgroundColor: 'white' }}>
          <Search
            placeholder="说点什么吧"
            enterButton="发送"
            loading={loading}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onSearch={onSearch}
            style={{ width: '50%' }}
          />
        </div>
      </Layout>
    </Layout>
  );
};

export default App;
