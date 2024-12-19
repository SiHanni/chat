import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { calculateTimeAgo } from '../common/tidmediff';
import { server_url } from '../common/serverConfig';

// 스타일 컴포넌트 정의
const FriendRequestContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  background-color: #f9f9f9;
  border-radius: 10px;
`;

const RequestItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
  justify-content: space-between; /* 아이템 사이에 간격을 주고 오른쪽으로 정렬 */

  &:hover {
    background-color: #f2f2f2;
  }
`;

const ProfileImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
`;

const Username = styled.span`
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  white-space: nowrap; /* 텍스트가 세로로 나타나지 않게 수정 */
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #888;
  font-size: 1rem;
`;

const Button = styled.button<{ variant: 'accept' | 'reject' }>`
  padding: 8px 15px;
  margin-left: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  background-color: ${props =>
    props.variant === 'accept' ? '#f8e8b6' : '#f8b0b0'};
  color: ${props => (props.variant === 'accept' ? '#4e4b3f' : '#741a1a')};

  &:hover {
    background-color: ${props =>
      props.variant === 'accept' ? '#e5d88d' : '#f29c9c'};
    transform: scale(1.05);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start; /* 버튼을 약간 왼쪽으로 위치시킴 */
  gap: 15px; /* 버튼 간 간격 조정 */
  margin-right: 50px;
`;

const TimeAgo = styled.span`
  font-size: 0.9rem;
  color: #888;
  margin-left: 300px;
`;

interface FriendRequest {
  id: number;
  created_at: string;
  friend: {
    id: number;
    username: string;
    profile_img: string;
    created_at: string;
  };
}

const FriendRequestsList: React.FC = () => {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const response = await axios.get(
          `${server_url}/users/friend/requests`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );

        setFriendRequests(response.data);
      } catch (error) {
        console.error('Failed to fetch friend requests', error);
      }
    };

    fetchFriendRequests();
  }, []);

  const handleAccept = async (friendId: number) => {
    try {
      await axios.patch(
        `${server_url}/users/accept/friend-request`,
        { friend_id: friendId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setFriendRequests(prev =>
        prev.filter(request => request.friend.id !== friendId)
      );
    } catch (error) {
      console.error('Failed to accept friend request', error);
    }
  };

  const handleReject = async (friendId: number) => {
    try {
      await axios.delete(`${server_url}/users/refuse/friend-request`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        data: { friend_id: friendId },
      });
      setFriendRequests(prev =>
        prev.filter(request => request.friend.id !== friendId)
      );
    } catch (error) {
      console.error('Failed to refuse friend request', error);
    }
  };

  return (
    <FriendRequestContainer>
      {friendRequests.length === 0 ? (
        <EmptyMessage>친구 요청이 없습니다.</EmptyMessage>
      ) : (
        friendRequests.map(request => (
          <RequestItem key={request.friend.id}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ProfileImage
                src={request.friend.profile_img || '/maruu.jpg'}
                alt={request.friend.username}
              />
              <Username>{request.friend.username}</Username>
            </div>
            <div>
              <TimeAgo>{calculateTimeAgo(request.created_at)}</TimeAgo>
            </div>
            <ButtonContainer>
              <Button
                variant='accept'
                onClick={() => handleAccept(request.friend.id)}
              >
                수락
              </Button>
              <Button
                variant='reject'
                onClick={() => handleReject(request.friend.id)}
              >
                거절
              </Button>
            </ButtonContainer>
          </RequestItem>
        ))
      )}
    </FriendRequestContainer>
  );
};

export default FriendRequestsList;
