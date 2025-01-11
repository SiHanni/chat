import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FaCommentDots } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { server_url } from '../common/serverConfig';
import { useWebSocket } from '../common/WebSocketContext';

interface Friend {
  uid: number;
  username: string;
  profile_img: string;
  status_msg: string;
  email: string;
}

const MyContainer = styled.div`
  width: 100%;
  background-color: transparent;
  border-radius: 10px;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    margin-left: -20px;
  }
`;

const MyProfileCard = styled.div`
  height: 80px;
  display: flex;
  padding: -3px;
  border-radius: 30px;
  position: relative; /* 자식 요소의 절대 위치를 설정하려면 부모가 relative여야 함 */

  @media (max-width: 768px) {
    height: 60px;
  }
`;

const MyProfileImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 30%;
  object-fit: cover;
  position: absolute; /* 고정 위치 설정 */
  left: 10px; /* 카드 내 왼쪽에서 10px 위치 */
  top: 50%; /* 카드 내 세로 중앙에 위치 */
  transform: translateY(-50%); /* 세로 중앙 정렬을 위해 offset을 조정 */

  @media (max-width: 768px) {
    width: 50px; /* 작은 화면에서 이미지 크기 줄이기 */
    height: 50px;
  }
`;

const MyDetails = styled.div`
  display: flex;
  align-items: center; /* 수평 정렬 */
`;

const MyUsername = styled.span`
  font-size: 1rem;
  font-weight: bold;
  color: #1e2a47;
  margin-left: 100px;
  margin-right: 30px;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    white-space: nowrap;
    margin-left: 80px;
    margin-right: 20px;
    margin-bottom: 5px;
  }
`;
const MyStatusMessage = styled.span`
  font-size: 0.9rem;
  color: #555;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 5px;
    white-space: nowrap;
  }
`;

const FriendCount = styled.div`
  font-size: 0.9rem;
  font-weight: bold;
  color: #555;
  margin-bottom: -10px;
  text-align: left;
  width: 100%;

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const FriendListContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  background-color: #ffffff; /* 배경색을 흰색으로 */
  border-radius: 1px; /* 라운드 처리 */
  margin-top: 20px; /* 프로필 카드와의 간격 */
  min-height: 200px; /* 최소 높이 설정 */
  max-height: 500px; /* 최대 높이 설정 */

  @media (max-width: 768px) {
    margin-top: -5px;
    margin-left: -20px;
  }
`;

const FriendCard = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
  margin-left: -30px;
  margin-right: 20px;
  margin-bottom: 15px;
  border-radius: 10px;
  background-color: #transparent; /* 배경색을 밝은 회색으로 설정 */
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  height: 55px; /* 기본 카드 높이 */
  cursor: pointer; /* 클릭 가능한 카드 */
  position: relative;
  flex-basis: 100%;

  &:hover {
    background-color: #f0f0f0; /* 호버 시 배경색 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:nth-child(odd) {
    background-color: #white; /* 홀수번째 카드 배경색 변경 */
  }

  @media (max-width: 768px) {
    margin-right: 20px;
    height: 50px; /* 작은 화면에서 카드 높이 줄이기 */
  }
`;
const ProfileImage = styled.img`
  width: 55px;
  height: 55px;
  border-radius: 30%;
  object-fit: cover;
  margin-right: 15px;

  @media (max-width: 768px) {
    width: 45px;
    height: 45px;
  }
`;

const FriendDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const Username = styled.span`
  font-size: 1rem;
  font-weight: bold;
  color: #1e2a47;
  white-space: nowrap; /* 텍스트가 한 줄로 유지되도록 */

  @media (max-width: 768px) {
    font-size: 0.9rem;
    font-weight: normal;
  }
`;

const StatusMessage = styled.span`
  font-size: 0.8rem;
  color: #555;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.7rem;
    font-weight: normal;
  }
`;

const ChatButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: #f4d03f;
  font-size: 1.5rem;
  transition: color 0.3s;
  margin-left: 20px;

  &:hover {
    color: #0056b3;
  }

  @media (max-width: 768px) {
    margin-left: 50px;
    margin-right: 10px;
  }
`;

const ProfileButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: #f4d03f;
  font-size: 1.5rem;
  transition: color 0.3s;
  margin-left: 100px;

  &:hover {
    color: #0056b3;
  }

  @media (max-width: 768px) {
    margin-left: 20px;
    margin-right: 10px;
  }
`;

const FriendsList: React.FC = () => {
  const [my, setMy] = useState<Friend>();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [uid, setUid] = useState<number>();
  const [friendCnt, setFriendCnt] = useState<number>();
  const { socket } = useWebSocket();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(`${server_url}/users/friends/lists`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setMy(response.data.userInfo);
        setFriends(response.data.friends);
        setUid(response.data.uid);
        setFriendCnt(response.data.friendCnt);
      } catch (error) {
        console.error('Failed to fetch friends', error);
      }
    };

    fetchFriends();
  }, []);

  const handleChatClick = async (friend_id: number) => {
    try {
      const response = await axios.post(
        `${server_url}/chat/create`,
        { friend_ids: [friend_id] },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      const { id, room_type } = response.data;
      const room_id = id;
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
    } catch (error) {
      console.error('Failed to create or fetch chat', error);
    }
  };

  const handleProfileClick = async (uid: number) => {
    try {
      navigate(`/profile`);
    } catch (error) {
      console.error('Failed to navigate to profile', error);
    }
  };

  return (
    <div>
      <div style={{ borderBottom: '1px solid #ddd', margin: '10px 0' }} />
      {my && (
        <MyContainer>
          <MyProfileCard>
            <MyProfileImage
              src={my.profile_img || '/maruu.jpeg'}
              alt={my.username}
            />
            <MyDetails>
              <MyUsername>{my.username}</MyUsername>
              {my.status_msg && (
                <MyStatusMessage>{my.status_msg}</MyStatusMessage>
              )}
            </MyDetails>
            <ProfileButton onClick={() => handleProfileClick(my.uid)}>
              <FaUser />
            </ProfileButton>
          </MyProfileCard>
        </MyContainer>
      )}
      <div style={{ borderBottom: '1px solid #ddd', margin: '10px 0' }} />
      {friendCnt !== undefined && (
        <FriendCount>{`친구 ${friendCnt}`}</FriendCount>
      )}
      <FriendListContainer>
        {friends.length === 0 ? (
          <p>친구가 없습니다.</p>
        ) : (
          <ul>
            {friends.map(friend => (
              <FriendCard key={friend.uid}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ProfileImage
                    src={friend.profile_img || '/maruu.jpeg'}
                    alt={friend.username}
                  />
                  <FriendDetails>
                    <Username>{friend.username}</Username>
                    {friend.status_msg && (
                      <StatusMessage>{friend.status_msg}</StatusMessage>
                    )}
                  </FriendDetails>
                </div>
                <ChatButton onClick={() => handleChatClick(friend.uid)}>
                  <FaCommentDots />
                </ChatButton>
              </FriendCard>
            ))}
          </ul>
        )}
      </FriendListContainer>
    </div>
  );
};

export default FriendsList;
