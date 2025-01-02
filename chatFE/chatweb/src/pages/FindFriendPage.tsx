import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import FriendCard from '../components/FriendCard';
import { server_url } from '../common/serverConfig';
import BasicModal from '../components/BasicModal';

// 스타일 정의
const FindFriendContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const SearchInput = styled.input`
  padding: 10px;
  width: 300px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;

  @media (max-width: 600px) {
    width: 100%;
    padding: 8px;
  }
`;

const FriendListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;

  @media (max-width: 600px) {
    gap: 10px;
  }
`;

const StyledButton = styled.button`
  background-color: #ffe787; /* 버튼 색상 */
  color: #7d7d7d;
  font-size: 1rem;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  margin-bottom: 15px;

  &:hover {
    background-color: #f4d03f;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  @media (max-width: 768px) {
    font-size: 0.7rem;
    margin-top: -10px;
    padding: 12px;
  }
`;

const FindFriendPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [friends, setFriends] = useState<any[]>([]);
  const [modalMsg, setModalMsg] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!email) {
      setModalMsg('이메일을 입력해주세요.');
      return;
    }

    try {
      const response = await axios.get(`${server_url}/users/find-friend`, {
        params: { email },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setFriends([response.data]);
      setModalMsg(null);
    } catch (err) {
      setModalMsg('친구를 찾을 수 없습니다.');
      setFriends([]);
    }
  };

  const handleCloseModal = () => {
    setModalMsg(null); // 모달 닫기
  };

  return (
    <div>
      <FindFriendContainer>
        <SearchInput
          type='email'
          placeholder='이메일로 친구 찾기'
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <StyledButton onClick={handleSearch}>친구 찾기</StyledButton>

        <FriendListContainer>
          {friends.map((friend, index) => (
            <FriendCard key={index} friend={friend} />
          ))}
        </FriendListContainer>
      </FindFriendContainer>
      {modalMsg && (
        <BasicModal modalMsg={modalMsg} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default FindFriendPage;
