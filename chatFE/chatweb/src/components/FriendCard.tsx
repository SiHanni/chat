import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { server_url } from '../common/serverConfig';
import { FindFriend } from '../type/user';
import BasicModal from './BasicModal';

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
    width: 160px;
    height: 210px;
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
    padding: 6px;
  }
`;

const FriendCard: React.FC<{ friend: FindFriend }> = ({ friend }) => {
  const [modalMsg, setModalMsg] = useState<string | null>(null);

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
        setModalMsg('친구 요청 완료');
      } else if (response.data.msg === 'too many request') {
        setModalMsg('잠시 후 다시 시도해주세요');
      } else if (response.data.msg === 'already friend') {
        setModalMsg('이미 등록된 친구입니다');
      }
    } catch (err) {
      // 상세화 필요
      setModalMsg('친구 요청 실패');
    }
  };

  const handleCloseModal = () => {
    setModalMsg(null); // 모달 닫기
  };

  return (
    <div>
      <FriendCardContainer>
        <ProfileImage src={friend.profile_img || '/maruu.jpeg'} alt='Profile' />
        <Username>{friend.username}</Username>
        <StatusMsg>{friend.status_msg}</StatusMsg>
        <FriendButton onClick={handleSendRequest}>친구 요청</FriendButton>
      </FriendCardContainer>
      {modalMsg && (
        <BasicModal modalMsg={modalMsg} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default FriendCard;
