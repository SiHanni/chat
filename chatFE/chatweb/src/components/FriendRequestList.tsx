import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { calculateTimeAgo } from '../common/tidmediff';
import { server_url } from '../common/serverConfig';

const FriendRequestContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  border-radius: 10px;

  @media (max-width: 600px) {
    padding: 15px;
  }
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

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const ProfileImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;

  @media (max-width: 600px) {
    width: 40px;
    height: 40px;
    margin-right: 10px;
  }
`;

const Username = styled.span`
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  white-space: nowrap;

  @media (max-width: 600px) {
    font-size: 0.9rem;
  }
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #888;
  font-size: 1rem;

  @media (max-width: 600px) {
    font-size: 0.9rem;
  }
`;

const Button = styled.button<{ variant: 'accept' | 'reject' }>`
  padding: 8px 15px;
  margin-left: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  white-space: nowrap;

  background-color: ${props =>
    props.variant === 'accept' ? '#f8e8b6' : '#f8b0b0'};
  color: ${props => (props.variant === 'accept' ? '#4e4b3f' : '#741a1a')};

  &:hover {
    background-color: ${props =>
      props.variant === 'accept' ? '#e5d88d' : '#f29c9c'};
    transform: scale(1.05);
  }

  @media (max-width: 600px) {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start; /* 버튼을 약간 왼쪽으로 위치시킴 */
  gap: 15px; /* 버튼 간 간격 조정 */
  margin-right: 50px;

  @media (max-width: 600px) {
    flex-direction: row;
    gap: 10px;
    margin-right: 0;
  }
`;

const TimeAgo = styled.span`
  font-size: 0.9rem;
  color: #888;
  margin-left: 300px;
  white-space: nowrap;

  @media (max-width: 600px) {
    margin-left: 15px;
    font-size: 0.8rem;
  }
`;

interface FriendRequest {
  id: number;
  created_at: string;
  requester: {
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
        console.error('Failed to fetch friend requests');
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
        prev.filter(request => request.requester.id !== friendId)
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
        prev.filter(request => request.requester.id !== friendId)
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
          <RequestItem key={request.requester.id}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ProfileImage
                src={request.requester.profile_img || '/maruu.jpeg'}
                alt={request.requester.username}
              />
              <Username>{request.requester.username}</Username>
              <TimeAgo>{calculateTimeAgo(request.created_at)}</TimeAgo>
            </div>
            <ButtonContainer>
              <Button
                variant='accept'
                onClick={() => handleAccept(request.requester.id)}
              >
                수락
              </Button>
              <Button
                variant='reject'
                onClick={() => handleReject(request.requester.id)}
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
