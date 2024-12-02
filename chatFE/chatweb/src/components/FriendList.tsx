import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
//import { useNavigate } from 'react-router-dom';
import { FaCommentDots } from 'react-icons/fa';
interface Friend {
  uid: number;
  username: string;
  profile_img: string;
  status_msg: string;
  email: string;
}

const FriendListContainer = styled.div`
  width: 100%;
  padding: 10px;
  background-color: #f4f4f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const FriendItem = styled.li`
  display: flex;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background-color: #f7f7f7;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:nth-child(odd) {
    background-color: #f9f9f9; /* 홀수 항목 배경색 다르게 */
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const ProfileImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
`;

const FriendDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const Username = styled.span`
  font-size: 1.1rem;
  font-weight: bold;
  color: #1e2a47;
`;

const StatusMessage = styled.span`
  font-size: 0.9rem;
  color: #555;
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
`;

const FriendsList: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(
          'http://localhost:3000/users/friends/lists',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
        setFriends(response.data);
      } catch (error) {
        console.error('Failed to fetch friends', error);
      }
    };

    fetchFriends();
  }, []);

  const handleChatClick = async (friend_id: number) => {
    console.log('Chat click handler triggered', friend_id);
    try {
      await axios.post(
        'http://localhost:3000/chat/create',
        { friend_ids: [friend_id] },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
    } catch (error) {
      console.error('Failed to create or fetch chat', error);
    }
  };

  return (
    <FriendListContainer>
      {friends.length === 0 ? (
        <p>친구가 없습니다.</p>
      ) : (
        <ul>
          {friends.map(friend => (
            <FriendItem key={friend.uid}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ProfileImage
                  src={friend.profile_img || '/maruu.jpg'}
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
            </FriendItem>
          ))}
        </ul>
      )}
    </FriendListContainer>
  );
};

export default FriendsList;
