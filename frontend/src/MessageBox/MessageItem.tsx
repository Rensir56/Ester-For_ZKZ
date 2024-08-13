import React, { useState, useRef } from 'react';
import { Button, Modal } from 'antd';
import "./MessageItem.css";

type ContentType = {
  data: string; // mediaUrl
  type: "video" | "text" | "voice";
};

export function MessageItem(props: ContentType) {
  const { data, type } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const togglePlay = () => {
    const audioElement = audioRef.current;
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (type === "video" && data) {
    return (
      <>
        <Button type="primary" onClick={showModal}>
          点击观看视频 ▷
        </Button>
        <Modal
          title="视频"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          centered
        >
          <video controls width="100%">
            <source src={data} type="video/mp4" />
            您的浏览器不支持视频标签。
          </video>
        </Modal>
      </>
    );
  } else if (type === "text") {
    return <span>{data}</span>;
  } else if (type === "voice" && data) {
    return (
      <div className="audio-message" onClick={togglePlay}>
        <div className={`audio-icon ${isPlaying ? 'playing' : ''}`}>
          <span className={`audio-dot ${isPlaying ? 'animate' : ''}`}></span>
          <span className={`audio-dot ${isPlaying ? 'animate' : ''}`}></span>
          <span className={`audio-dot ${isPlaying ? 'animate' : ''}`}></span>
        </div>
        <audio ref={audioRef} src={data} />
      </div>
    );
  } else {
    return null;
  }
}

export default MessageItem;
