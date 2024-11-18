import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import styled from 'styled-components';
import { User } from '../type/user';

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

const MessageContainer = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'isOwnMessage',
})<{ isOwnMessage: boolean }>`
  display: flex;
  flex-direction: ${props => (props.isOwnMessage ? 'row-reverse' : 'row')};
  margin-bottom: 15px;
  align-items: flex-start;
`;

const ProfileImage = styled.img.withConfig({
  shouldForwardProp: prop => prop !== 'isOwnMessage',
})<{ isOwnMessage: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: ${props => (props.isOwnMessage ? '0 0 5px 10px' : '0 10px 5px 0')};
`;
const MessageContent = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'isOwnMessage',
})<{ isOwnMessage: boolean }>`
  max-width: 60%;
  background-color: ${props => (props.isOwnMessage ? '#d1e7dd' : '#f1f1f1')};
  padding: 10px;
  border-radius: 10px;
  font-size: 1rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: ${props => (props.isOwnMessage ? 'flex-end' : 'flex-start')};
`;

const Username = styled.div`
  font-weight: bold;
  font-size: 0.8rem;
  margin-bottom: 5px;
`;

const MessageText = styled.div`
  font-size: 0.9rem;
`;

const Timestamp = styled.div`
  margin-top: 5px;
  font-size: 0.7rem;
  color: #888;
  align-self: flex-end;
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
      console.log(data);
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
        sender_profile_img: user?.profile_img,
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
              src={
                msg.sender_profile_img && msg.sender_profile_img.trim() !== ''
                  ? msg.sender_profile_img
                  : '/maruu.jpg'
              }
              alt='profile'
              isOwnMessage={msg.sender_id === user?.id}
            />
            <MessageContent isOwnMessage={msg.sender_id === user?.id}>
              <Username>{msg.sender_username}</Username>
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
