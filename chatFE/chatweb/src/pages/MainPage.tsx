import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/Button';
import axios from 'axios';
import FriendsList from '../components/FriendList';
import FriendRequestsList from '../components/FriendRequestList';
import ProfilePage from './ProfilePage';
import FindFriendPage from './FindFriendPage';
//import ChatPage from '../components/ChatPage';
import ChatRoomsList from '../components/ChatRoomList';

// 스타일 정의
const MainContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f4f9;
  font-family: 'Roboto', sans-serif;
`;

const Sidebar = styled.div`
  width: 200px;
  background-color: #f4f4f9;
  color: #1e2a47;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-shadow: 4px 0 8px rgba(0, 0, 0, 0.1);
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 15px;
  margin-left: 50px;
`;

const Logo = styled.h3`
  font-size: 1.7rem;
  color: #f4d03f; /* 골드 */
  margin-bottom: 30px;
  font-weight: bold;
  text-align: center;
`;

const MenuList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin-top: 50px;
  width: 100%;
`;

const MenuItem = styled.li<{ isActive: boolean }>`
  padding: 12px 20px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
  border-radius: 5px;
  margin: 5px 0;
  background-color: ${({ isActive }) => (isActive ? '#f4d03f' : 'transparent')};
  color: ${({ isActive }) =>
    isActive ? '#1e2a47' : '#1e2a47'}; /* 텍스트 색상 유지 */

  &:hover {
    background-color: #f2e6b6; /* 연한 베이지색의 밝은 버전 */
    transform: scale(1.05);
  }
`;

const Content = styled.div`
  flex-grow: 1;
  padding: 40px;
  background-color: white;
  color: #333;
  overflow-y: auto;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin: 20px;
`;

const LogoutButton = styled(Button)`
  background-color: #f4d03f; /* 골드 */
  color: #1e2a47; /* 남색 */
  border: 2px solid #1e2a47;
  padding: 12px 25px;
  font-weight: bold;
  margin-top: 40px;
  border-radius: 30px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #ffcc00;
    border-color: #ffcc00;
    transform: translateY(-2px);
  }
`;

const MainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // JWT 토큰에서 사용자 정보 가져오기
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          'http://localhost:3000/users/getMyProfile',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
        setProfileImage(response.data.profile_img); // 프로필 이미지 URL 설정
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };

    fetchProfile();
  }, []);

  // 로그아웃 처리 함수
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/'); // 홈 페이지로 이동
  };

  // 탭 클릭 시 activeTab 변경
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <MainContainer>
      <Sidebar>
        <Logo>MaruTalk</Logo>
        <ProfileImage src={profileImage || '/maruu.jpg'} alt='Profile' />
        <MenuList>
          <MenuItem
            isActive={activeTab === 'profile'}
            onClick={() => handleTabClick('profile')}
          >
            프로필
          </MenuItem>
          <MenuItem
            isActive={activeTab === 'friends'}
            onClick={() => handleTabClick('friends')}
          >
            친구
          </MenuItem>
          <MenuItem
            isActive={activeTab === 'findFriend'}
            onClick={() => handleTabClick('findFriend')}
          >
            친구 찾기
          </MenuItem>
          <MenuItem
            isActive={activeTab === 'friendRequests'}
            onClick={() => handleTabClick('friendRequests')}
          >
            친구 요청
          </MenuItem>

          <MenuItem
            isActive={activeTab === 'chat'}
            onClick={() => handleTabClick('chat')}
          >
            채팅
          </MenuItem>
        </MenuList>
        <LogoutButton type='button' onClick={handleLogout}>
          로그아웃
        </LogoutButton>
      </Sidebar>
      <Content>
        {activeTab === 'profile' && <ProfilePage />}
        {activeTab === 'friends' && <FriendsList />}
        {activeTab === 'findFriend' && <FindFriendPage />}
        {activeTab === 'friendRequests' && <FriendRequestsList />}

        {activeTab === 'chat' && <ChatRoomsList />}
      </Content>
    </MainContainer>
  );
};

export default MainPage;
