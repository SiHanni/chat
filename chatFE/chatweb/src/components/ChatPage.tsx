import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import styled from 'styled-components';
import { User } from '../types';

const ChatContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
`;

const MessageContainer = styled.div<{ isOwnMessage: boolean }>`
  display: flex;
  flex-direction: ${props => (props.isOwnMessage ? 'row-reverse' : 'row')};
  margin-bottom: 15px;
  align-items: flex-start;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  margin-left: 10px;
  margin-bottom: 5px;
`;

const MessageContent = styled.div`
  max-width: 80%;
  background-color: #f1f1f1;
  padding: 5px;
  border-radius: 10px;
  font-size: 1rem;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const Username = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 0.8rem;
`;
const MessageText = styled.div`
  font-size: 0.85rem;
  margin-bottom: 5px;
`;

const Timestamp = styled.div`
  position: absolute;
  bottom: -15px;
  right: 0;
  font-size: 0.8rem;
  color: #888;
`;

const InputContainer = styled.div`
  display: flex;
  padding: 10px;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 10px;
`;

const SendButton = styled.button`
  padding: 10px 20px;
  background-color: #f4d03f;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #e1b347;
  }
`;

const ChatPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<
    {
      sender_id: number;
      message: string;
      timestamp: string;
      sender_username: string;
      sender_profile_img: string;
    }[]
  >([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const roomId = 1; // roomId관리

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Parsing error:', error);
    }
  }, []);

  useEffect(() => {
    const newSocket = io('http://localhost:3000/chat');
    setSocket(newSocket);

    newSocket.emit('joinRoom', roomId);

    newSocket.on('receiveMessage', data => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      newSocket.emit('leaveRoom', roomId);
      newSocket.disconnect();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.emit('sendMessage', {
        room_id: roomId,
        message: input,
        sender_id: user?.id,
        sender_email: user?.email,
        sender_username: user?.username,
        sender_profile_img: user?.profileImageUrl,
      });
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <ChatContainer>
      <MessageList>
        {messages.map((msg, index) => (
          <MessageContainer
            key={index}
            isOwnMessage={msg.sender_id === user?.id}
          >
            <ProfileImage
              src={msg.sender_profile_img || '/maruu.jpg'}
              alt='profile'
            />
            <Username>{msg.sender_username}</Username>{' '}
            <MessageContent>
              <MessageText>{msg.message}</MessageText>
              <Timestamp>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Timestamp>
            </MessageContent>
          </MessageContainer>
        ))}
      </MessageList>
      <InputContainer>
        <Input
          type='text'
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='Type your message...'
          onKeyDown={handleKeyDown}
        />
        <SendButton onClick={sendMessage}>Send</SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatPage;
