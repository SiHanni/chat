import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import FriendCard from '../components/FriendCard';

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
`;

const FriendListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
`;

const FindFriendPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [friends, setFriends] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    try {
      const response = await axios.get(
        'http://localhost:3000/users/find-friend',
        {
          params: { email },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setFriends([response.data]); // 검색된 친구 정보를 리스트에 저장
      setError(null);
    } catch (err) {
      setError('친구를 찾을 수 없습니다.');
      setFriends([]);
    }
  };

  return (
    <FindFriendContainer>
      <SearchInput
        type='email'
        placeholder='이메일로 친구 찾기'
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button onClick={handleSearch}>친구 찾기</button>

      {error && <div>{error}</div>}

      <FriendListContainer>
        {friends.map((friend, index) => (
          <FriendCard key={index} friend={friend} />
        ))}
      </FriendListContainer>
    </FindFriendContainer>
  );
};

export default FindFriendPage;
