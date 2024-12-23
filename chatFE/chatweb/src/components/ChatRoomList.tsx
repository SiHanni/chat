import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ChatRoom } from '../type/chat';
import io from 'socket.io-client';
import { server_url } from '../common/serverConfig';

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
  position: relative; /* LeaveButton을 절대 위치로 조정하기 위함 */
  &:hover {
    background-color: #f1f1f1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  &:hover button {
    opacity: 1;
    visibility: visible;
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

const LeaveButton = styled.button`
  position: absolute;
  right: 15px;
  background-color: #ffb6b9;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;

  &:hover {
    background-color: #2f2f2f;
  }
`;

const ChatRoomsList: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [uid, setUid] = useState<number>();
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');
  if (!token) {
    navigate('/');
  }
  const socket = io(`${server_url}`, {
    auth: { token },
  });

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await axios.get(`${server_url}/chat/rooms`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setChatRooms(response.data.chat);
        setUid(response.data.uid);
      } catch (error) {
        console.error('Failed to fetch chat rooms', error);
      }
    };

    fetchChatRooms();
  }, []);

  const handleRoomClick = (room_id: number, room_type: string) => {
    //navigate(`/chat/?room_type=${room_type}&room_id=${room_id}&uid=${uid}`);
    navigate('/chat', {
      state: {
        room_type,
        room_id,
        uid,
      },
    });
  };

  const handleLeaveClick = async (e: React.MouseEvent, room_id: number) => {
    e.stopPropagation();
    // "나가시겠습니까?" 확인 창 띄우기
    const confirmLeave = window.confirm('채팅방을 나가시겠습니까?');
    if (confirmLeave) {
      try {
        const response = await axios.post(
          `${server_url}/chat/leave`,
          { room_id: room_id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
        //console.log('res', response);
        if (response.status === 200) {
          setChatRooms(prevRooms =>
            prevRooms.filter(room => room.id !== room_id)
          );
          navigate('/main');
        } else {
          alert('채팅방 나가기 실패');
        }
      } catch (error) {
        //console.error('Error leaving chat:', error);
        alert('오류가 발생했습니다.');
      }
    }
  };

  useEffect(() => {
    // WebSocket에서 'roomLeft' 이벤트를 받으면 채팅방 목록에서 해당 방 제거
    socket.on('roomLeft', ({ room_id }) => {
      setChatRooms(prevRooms => prevRooms.filter(room => room.id !== room_id));
    });

    return () => {
      socket.off('roomLeft');
    };
  }, []);

  return (
    <ChatRoomListContainer>
      <ChatTitle>채팅</ChatTitle>
      <ChatRoomList>
        {chatRooms.map(room => (
          <li
            key={room.id}
            onClick={() => handleRoomClick(room.id, room.room_type)}
          >
            <ChatRoomItem>
              <ProfileImage src={'/marunotwe.png'} alt='Profile' />
              <RoomName>{room.name}</RoomName>
              {room.room_type !== 'open' && (
                <LeaveButton onClick={e => handleLeaveClick(e, room.id)}>
                  나가기
                </LeaveButton>
              )}
            </ChatRoomItem>
          </li>
        ))}
      </ChatRoomList>
    </ChatRoomListContainer>
  );
};

export default ChatRoomsList;
