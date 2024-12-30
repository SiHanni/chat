import React from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { server_url } from '../common/serverConfig';
import { FindFriend } from '../type/user';

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

  @media (max-width: 600px) {
    width: 150px;
    height: 200px;
    padding: 10px;
  }
`;

const ProfileImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;

  @media (max-width: 480px) {
    width: 75px;
    height: 75px;
  }
`;

const Username = styled.p`
  font-size: 1rem;
  color: black;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 10px;
  }
`;

const StatusMsg = styled.p`
  font-size: 1rem;
  color: #777;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-top: 5px;
  }
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

  @media (max-width: 768px) {
    padding: 7px;
  }
`;

const FriendCard: React.FC<{ friend: FindFriend }> = ({ friend }) => {
  const handleSendRequest = async () => {
    try {
      const response = await axios.post(
        `${server_url}/users/send/friend-request`,
        { email: friend.email },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      if (response.data.msg === 'success') {
        alert('친구 요청 완료');
      } else if (response.data.msg === 'too many request') {
        alert('잠시 후 다시 시도해주세요');
      }
    } catch (err) {
      // 상세화 필요
      alert('친구 요청 실패');
    }
  };

  return (
    <FriendCardContainer>
      <ProfileImage src={friend.profile_img || '/maruu.jpeg'} alt='Profile' />
      <Username>{friend.username}</Username>
      <StatusMsg>{friend.status_msg}</StatusMsg>
      <FriendButton onClick={handleSendRequest}>친구 요청</FriendButton>
    </FriendCardContainer>
  );
};

export default FriendCard;
