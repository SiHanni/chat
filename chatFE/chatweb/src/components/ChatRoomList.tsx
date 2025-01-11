import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ChatRoom, UnreadInfo } from '../type/chat';
import { server_url } from '../common/serverConfig';
import BasicModal from '../components/BasicModal';
import { useWebSocket } from '../common/WebSocketContext';

// 스타일 정의
const ChatRoomListContainer = styled.div`
  padding: 10px;
  margin-left: -25px;
  border-radius: 10px;
`;

const ChatRoomList = styled.ul`
  list-style-type: none; /* 목록 앞의 점 제거 */
  padding: 0;
`;

const ChatRoomItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 12px;
  margin-bottom: 10px;
  margin-right: -10px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  position: relative;

  &:hover {
    background-color: #f1f1f1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:hover button {
    opacity: 1;
    visibility: visible;
  }

  @media (max-width: 768px) {
    margin-right: -20px;
  }
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
  margin-right: 15px;
`;

const RoomName = styled.div`
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 25px;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    margin-bottom: 23px;
    margin-left: -10px;
  }
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

const UnreadInfoContainer = styled.div`
  margin-left: 10px;
  font-size: 0.9rem;
  color: gray;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const UnreadMessageCount = styled.div`
  background-color: #f4d03f;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);

  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    font-size: 0.7rem;
    margin-bottom: 20px;
  }
`;

const LastMessage = styled.div`
  font-size: 0.85rem;
  color: #777;
  margin-top: 28px;
  margin-left: -75px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;

  @media (max-width: 768px) {
    font-size: 0.7rem;
    margin-top: 20px;
    margin-left: -55px;
  }
`;

const ChatRoomsList: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [unReadInfos, setUnreadInfos] = useState<UnreadInfo[]>([]);
  const [uid, setUid] = useState<number | any>();
  const [modalMsg, setModalMsg] = useState<string | null>(null);
  const { socket } = useWebSocket();

  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');
  if (!token) {
    navigate('/');
  }

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
        setUnreadInfos(response.data.unread_info);
      } catch (error) {
        console.error('Failed to fetch chat rooms', error);
      }
    };

    fetchChatRooms();
  }, []);

  useEffect(() => {
    if (socket) {
      // 채팅방 정보(안 읽은 메시지 수, 마지막 메시지)를 받아서 UI 업데이트
      socket.on('newMessage', data => {
        const { room_id, chatMemberId } = data;
        if (room_id && chatMemberId) {
          socket.emit('unReadChatInfo', {
            room_id: room_id,
            chatMemberId: chatMemberId,
          });
        }
        // UI에서 채팅방 리스트 업데이트 (안 읽은 메시지 수, 마지막 메시지 표시)
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on('newChatRoomInfo', data => {
        const { room_id, messageCnt, lastMessage } = data;
        const unRead = {
          room_id: room_id,
          unread_message_cnt: messageCnt,
          last_message: lastMessage,
        };
        setUnreadInfos(prevInfos =>
          prevInfos.map(
            info =>
              info.room_id === room_id
                ? { ...info, ...unRead } // 기존 데이터 교체
                : info // 그대로 유지
          )
        );
      });
    }

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.off('newChatRoomInfo');
      }
    };
  }, [socket]);

  const handleRoomClick = (uid: number, room_id: number, room_type: string) => {
    //navigate(`/chat/?room_type=${room_type}&room_id=${room_id}&uid=${uid}`);
    if (socket) {
      socket.emit('joinRoom', { room_id: room_id, room_type, uid });
      navigate('/chat', {
        state: {
          room_type,
          room_id,
          uid,
        },
      });
    }
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

        if (response.status === 200) {
          setChatRooms(prevRooms =>
            prevRooms.filter(room => room.id !== room_id)
          );
          navigate('/main');
        } else {
          setModalMsg('채팅방 나가기 실패');
        }
      } catch (error) {
        //console.error('Error leaving chat:', error);
        setModalMsg('오류가 발생했습니다.');
      }
    }
  };

  const handleCloseModal = () => {
    setModalMsg(null); // 모달 닫기
  };

  return (
    <div>
      <ChatRoomListContainer>
        <ChatTitle>채팅</ChatTitle>
        <ChatRoomList>
          {chatRooms.map(room => {
            // unReadInfos에서 해당 room.id와 일치하는 정보를 찾음
            const unreadInfo = unReadInfos.find(
              info => info.room_id === room.id
            );

            return (
              <li
                key={room.id}
                onClick={() => handleRoomClick(uid, room.id, room.room_type)}
              >
                <ChatRoomItem>
                  <ProfileImage src={'/marunotwe.png'} alt='Profile' />
                  <RoomName>{room.name}</RoomName>
                  {/* 읽지 않은 메시지 수와 마지막 메시지 표시 */}
                  {unreadInfo && (
                    <UnreadInfoContainer>
                      {unreadInfo.unread_message_cnt > 0 && (
                        <UnreadMessageCount>
                          {unreadInfo.unread_message_cnt}
                        </UnreadMessageCount>
                      )}
                      <LastMessage>{unreadInfo.last_message}</LastMessage>
                    </UnreadInfoContainer>
                  )}
                  {room.room_type !== 'open' && (
                    <LeaveButton onClick={e => handleLeaveClick(e, room.id)}>
                      나가기
                    </LeaveButton>
                  )}
                </ChatRoomItem>
              </li>
            );
          })}
        </ChatRoomList>
      </ChatRoomListContainer>
      {modalMsg && (
        <BasicModal modalMsg={modalMsg} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default ChatRoomsList;
