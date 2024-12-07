import React from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { server_url } from '../common/serverConfig';

const FriendCardContainer = styled.div`
  width: 200px;
  height: 250px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 15px;
  text-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProfileImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
`;

const Username = styled.h4`
  font-size: 1.2rem;
  margin-bottom: 10px;
`;

const StatusMsg = styled.p`
  font-size: 1rem;
  color: #777;
  margin-bottom: 15px;
`;

const FriendButton = styled.button`
  background-color: #f4d03f;
  color: #1e2a47;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #ffcc00;
  }
`;

const FriendCard: React.FC<{ friend: any }> = ({ friend }) => {
  const handleSendRequest = async () => {
    try {
      await axios.post(
        `${server_url}/users/send/friend-request`,
        { email: friend.email },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      alert('친구 요청이 보내졌습니다!');
    } catch (err) {
      alert('친구 요청에 실패했습니다.');
    }
  };

  return (
    <FriendCardContainer>
      <ProfileImage src={friend.profile_img || '/maruu.jpg'} alt='Profile' />
      <Username>{friend.username}</Username>
      <StatusMsg>{friend.status_msg}</StatusMsg>
      <FriendButton onClick={handleSendRequest}>친구 요청</FriendButton>
    </FriendCardContainer>
  );
};

export default FriendCard;
