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
  white-space: nowrap;

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

const SearchTypeSelector = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 15px;

  button {
    width: 70px; /* 고정된 너비 설정 */
    padding: 5px 20px;
    font-size: 14px;
    font-weight: bold;
    border: none;
    background-color: #ddd;
    color: #ababab;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 0;
    white-space: nowrap;

    &:first-child {
      border-radius: 5px 0 0 5px; /* 왼쪽 버튼 둥근 모서리 */
    }

    &:last-child {
      border-radius: 0 5px 5px 0; /* 오른쪽 버튼 둥근 모서리 */
    }

    &:hover {
      background-color: #e9ecef;
    }

    &.active {
      background-color: #ffe787;
      color: #403f3f;
      border-color: #f4d03f;
    }
  }

  button + button {
    border-left: none; /* 버튼 간 경계 제거 */
  }
`;

const FindFriendPage: React.FC = () => {
  const [searchType, setSearchType] = useState<string>('email'); // 'email' or 'username'
  const [searchValue, setSearchValue] = useState<string>('');
  const [friends, setFriends] = useState<any[]>([]);
  const [modalMsg, setModalMsg] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchValue && searchType === 'email') {
      setModalMsg('이메일을 입력해주세요.');
      return;
    } else if (!searchValue && searchType === 'username') {
      setModalMsg('닉네임을 입력해주세요.');
    }

    try {
      const response = await axios.get(`${server_url}/users/find-friend`, {
        params: { [searchType]: searchValue },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      console.log(response.data);
      setFriends([response.data]);
      setModalMsg(null);
    } catch (err) {
      setModalMsg('친구를 찾을 수 없습니다.');
      setFriends([]);
    }
  };

  const handleCloseModal = () => {
    setModalMsg(null);
  };

  const handleSearchTypeChange = (type: string) => {
    setSearchType(type);
    setSearchValue('');
  };

  return (
    <div>
      <FindFriendContainer>
        {/* 검색 타입 선택 */}
        <SearchTypeSelector>
          <button
            className={searchType === 'email' ? 'active' : ''}
            onClick={() => handleSearchTypeChange('email')}
          >
            이메일
          </button>
          <button
            className={searchType === 'username' ? 'active' : ''}
            onClick={() => handleSearchTypeChange('username')}
          >
            이름
          </button>
        </SearchTypeSelector>

        {/* 검색 입력창 */}
        <SearchInput
          type='text'
          placeholder={
            searchType === 'email'
              ? '이메일로 친구 찾기'
              : '닉네임으로 친구 찾기'
          }
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
        />
        <StyledButton onClick={handleSearch}>친구 찾기</StyledButton>

        {/* 친구 목록 */}
        <FriendListContainer>
          {friends.map((friend, index) => (
            <FriendCard key={index} friend={friend} />
          ))}
        </FriendListContainer>
      </FindFriendContainer>

      {/* 모달 */}
      {modalMsg && (
        <BasicModal modalMsg={modalMsg} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default FindFriendPage;
