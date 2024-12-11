import React, {useEffect, useState} from 'react';
import io from 'socket.io-client';
import './static/App.css'; // CSS 경로 수정

const socket = io('http://localhost:3000/chat'); // 서버의 URL을 사용합니다.

const App = () => {
  const [message, setMessage] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<
    {sender_id: number; message: string; timestamp: string}[]
  >([]);

  useEffect(() => {
    socket.on('receiveMessage', newMessage => {
      setChatMessages(prevMessages => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      const room_id = 1; // 예시로 방 ID 1 사용
      const sender_id = 1; // 예시로 보낸 사람 ID 1 사용
      socket.emit('sendMessage', {room_id, sender_id, message});
      setMessage('');
    }
  };

  const joinRoom = () => {
    const room_id = 1;
    socket.emit('joinRoom', room_id);
  };

  const leaveRoom = () => {
    const room_id = 1;
    socket.emit('leaveRoom', room_id);
  };

  return (
    <div className="chat-container">
      <h1 className="chat-header">Real-Time Chat</h1>
      <div className="message-list">
        {chatMessages.map((msg, index) => (
          <div key={index} className="message">
            <span className="sender">{msg.sender_id}</span>: {msg.message}
          </div>
        ))}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setMessage((e.target as HTMLInputElement).value)
          } // 타입 단언 추가
          placeholder="Type your message"
          className="message-input"
        />
        <button onClick={sendMessage} className="send-button">
          Send
        </button>
      </div>

      <div className="room-controls">
        <button onClick={joinRoom} className="join-button">
          Join Room
        </button>
        <button onClick={leaveRoom} className="leave-button">
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default App;
