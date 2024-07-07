``
import React, { useState, useRef, useEffect } from 'react';
import { Button, Modal } from 'antd';
import "./MessageItem.css"

type ContentType = {
    data: string;
    type: "video" | "text" | "audio";
  };

export function MessageItem(props:ContentType) {
  const { data, type } = props;
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.onended = () => setIsPlaying(false);
    }
  }, []);


  if (type == "video"){
    return (
        <>
            <Button type="primary" onClick={showModal}>
                点击观看视频 ▷
            </Button>
            <Modal
                title="Basic Modal"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                centered={true}
            >
                <video controls width="100%">
                <source src="your-video-url.mp4" type="video/mp4" />
                Your browser does not support the video tag.
                </video>
            </Modal>
        </>
    );
  } else if (type == "text"){
    return (
        <>
            <span>{data}</span>
        </>
    )
  } else if (type == "audio"){
    return (
        <>
            <div className="audio-message" onClick={togglePlay}>
                <div className={`audio-icon ${isPlaying ? 'playing' : ''}`}>
                    <span className={`audio-dot ${isPlaying ? 'animate' : ''}`}></span>
                    <span className={`audio-dot ${isPlaying ? 'animate' : ''}`}></span>
                    <span className={`audio-dot ${isPlaying ? 'animate' : ''}`}></span>
                </div>
                <audio ref={audioRef} src={data} />
            </div>
        </>
    )
  }
}

export default MessageItem;