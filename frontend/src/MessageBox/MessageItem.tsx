import React, { useState, useRef, useEffect } from 'react';
import { Button, Modal } from 'antd';
import "./MessageItem.css";

type ContentType = {
  data: string;
  type: "video" | "text" | "voice";
};

export function MessageItem(props: ContentType) {
  const { data, type } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaSource, setMediaSource] = useState<string | null>(null);

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

  const base64ToBlob = (base64: string, mime: string): Blob => {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mime });
  };

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.onended = () => setIsPlaying(false);
    }
  
    if ((type === "voice" || type === "video") && data) {
      try {
        const mimeType = type === "voice" ? "audio/mpeg" : "video/mp4";
        const blob = base64ToBlob(data, mimeType);
        const url = URL.createObjectURL(blob);
        setMediaSource(url);
  
        // 清理 URL 对象
        return () => URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Failed to create media source:", error);
      }
    }
  }, [data, type]);
  

  if (type === "video" && mediaSource) {
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
            <source src={mediaSource} type="video/mp4" />
            您的浏览器不支持视频标签。
          </video>
        </Modal>
      </>
    );
  } else if (type === "text") {
    return <span>{data}</span>;
  } else if (type === "voice" && mediaSource) {
    return (
      <div className="audio-message" onClick={togglePlay}>
        <div className={`audio-icon ${isPlaying ? 'playing' : ''}`}>
          <span className={`audio-dot ${isPlaying ? 'animate' : ''}`}></span>
          <span className={`audio-dot ${isPlaying ? 'animate' : ''}`}></span>
          <span className={`audio-dot ${isPlaying ? 'animate' : ''}`}></span>
        </div>
        <audio ref={audioRef} src={mediaSource} />
      </div>
    );
  } else {
    return null;
  }
}

export default MessageItem;
