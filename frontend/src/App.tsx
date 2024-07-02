import React, { useState, useEffect } from 'react';
import './App.css';

const App: React.FC = () => {
  const [isLeftLayoutVisible, setIsLeftLayoutVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>('');

  const toggleLeftLayout = () => {
    setIsLeftLayoutVisible(!isLeftLayoutVisible);
  };

  const isZero = (num: number) => (num < 10 ? '0' : '') + num;

  const getDateTime = () => {
    const datetime = new Date();
    const year = datetime.getFullYear();
    const month = isZero(datetime.getMonth() + 1);
    const day = isZero(datetime.getDate());
    const hour = isZero(datetime.getHours());
    const minute = isZero(datetime.getMinutes());
    const seconds = isZero(datetime.getSeconds());
    return `${year}/${month}/${day} ${hour}:${minute}:${seconds}`;
  };

  useEffect(() => {
    setCurrentTime(getDateTime());
    const interval = setInterval(() => {
      setCurrentTime(getDateTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      {!isLeftLayoutVisible && (
        <div className="son_icon son_icon_hidden" onClick={toggleLeftLayout}>
          &gt;
        </div>
      )}
      {isLeftLayoutVisible && (
        <div className="left_layout">
          <div className="father_icon">
            <div className="son_icon son_icon_display" onClick={toggleLeftLayout}>
              &lt;
            </div>
            <div className="left_person">
              <div className="person_info">
                <div className="false_img">
                  <div className="flase_img_son"></div>
                </div>
                <div className="false_img_right">
                  <strong>Michael Jackson</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="new_chat">新建聊天</div>
          <div className="new_chat new_chat_text">
            <div className="false_img text_icon">...</div>
            <div className="text_message">前端有哪些性能优化？</div>
          </div>
        </div>
      )}
      <div className="right_layout">
        <div className="right_layout_son">
          <div className="right_layout_myselfChat">
            <div className="datetime" style={{ flex: 2, fontSize: 13, color: 'lightgray' }}>{currentTime}</div>
            <div className="profile_image" style={{ flex: 1 }}>
              <div className="flase_img_son" style={{ width: 40, height: 40 }}></div>
            </div>
          </div>
          <div className="myself_chat">
            前端有哪些性能优化？
          </div>
          <div className="right_layout_son_ipt">
            <input className="ipt" type="text" placeholder="来说点什么吧..." />
            <button className="btn">发送</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
