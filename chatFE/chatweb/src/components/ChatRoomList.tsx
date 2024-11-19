import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ChatRoom } from '../type/chat';

// 스타일 정의
const ChatRoomListContainer = styled.div`
  padding: 15px;
  background-color: #f9fafb;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 그림자 크기 조정 */
`;

const ChatRoomList = styled.ul`
  list-style-type: none; /* 목록 앞의 점 제거 */
  padding: 0;
`;

const ChatRoomItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #ffffff;
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: #f1f1f1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ProfileImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
  margin-right: 15px;
`;

const RoomName = styled.div`
  font-size: 1rem;
  font-weight: normal;
  color: #555;
`;

const ChatTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: normal;
  color: #777;
  margin-bottom: 15px;
`;

const ChatRoomsList: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await axios.get('http://localhost:3000/chat/rooms', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setChatRooms(response.data);
      } catch (error) {
        console.error('Failed to fetch chat rooms', error);
      }
    };

    fetchChatRooms();
  }, []);

  const handleRoomClick = (room_id: number) => {
    navigate(`/chat/${room_id}`);
  };

  return (
    <ChatRoomListContainer>
      <ChatTitle>채팅</ChatTitle>
      <ChatRoomList>
        {chatRooms.map(room => (
          <li key={room.id} onClick={() => handleRoomClick(room.chatting.id)}>
            <ChatRoomItem>
              <ProfileImage src={'/marunotwe.png'} alt='Profile' />
              <RoomName>{room.chatting.name}</RoomName>
            </ChatRoomItem>
          </li>
        ))}
      </ChatRoomList>
    </ChatRoomListContainer>
  );
};

export default ChatRoomsList;
