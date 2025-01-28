import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import FriendsList from '../components/FriendList';
import FriendRequestsList from '../components/FriendRequestList';
import FindFriendPage from './FindFriendPage';
import ChatRoomsList from '../components/ChatRoomList';
import { useWebSocket } from '../common/WebSocketContext';
import axios from 'axios';
import { server_url } from '../common/serverConfig';

// 스타일 정의
const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  background-color: transparent;
  font-family: 'Roboto', sans-serif;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Header = styled.div`
  width: 100%;
  background-color: #f7f6ed;
  color: #1e2a47;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 0 10px;
  }
`;

const Logo = styled.h3`
  font-size: 1.7rem;
  color: #f4d03f; /* 골드 */
  margin-bottom: 30px;
  font-weight: bold;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
`;

const TabContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-around;
  margin-top: 5px;

  @media (max-width: 768px) {
    justify-content: space-evenly;
    margin-top: -20px;
    margin-bottom: 15px;
    margin-rigth: -5px;
    margin-left: -20px;
  }
`;

const Tab = styled.div<{ isActive: boolean }>`
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
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 3px 10px;
    maring-left: -5px;
    margin-top: -2px;
  }
`;

const Content = styled.div`
  flex-grow: 1;
  padding: 40px;
  background-color: transparent;
  color: transparent;
  overflow-y: auto;

  border-radius: 3px;
  margin: 20px;

  @media (max-width: 768px) {
    padding: 20px;
    margin: 10px;
  }
`;

const MoreMenu = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  background-color: #f7f6ed;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  z-index: 1000;
  padding: 10px;
  top: 100%;
  right: 30px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;

  /* 메뉴 활성화 시 */
  &.active {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    top: auto;
    bottom: calc(100%);
    right: 5px;
  }
`;

const MoreMenuItem = styled.div`
  padding: 10px;
  cursor: pointer;
  font-size: 1rem;
  color: #1e2a47;
  border-radius: 5px;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #f2e6b6;
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.9rem;
    / &:hover {
      background-color: #f4d03f;
      transform: scale(1.03);
    }
  }
`;

const MainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { connectWebSocket, socket } = useWebSocket();

  const navigate = useNavigate();

  const userAuthToken = localStorage.getItem('accessToken');
  if (userAuthToken) {
    connectWebSocket(userAuthToken);
  }

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      navigate('/');
      await axios.post(
        `${server_url}/users/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          withCredentials: true,
        }
      );

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('last_login');
      localStorage.removeItem('socketState');
      localStorage.removeItem('user');
      if (socket) {
        socket.disconnect();
      }
    } catch (error) {
      //console.log(error);
    }
  };

  const handleTabClick = (tab: string) => setActiveTab(tab);
  const toggleMoreMenu = () => setShowMoreMenu(prev => !prev);

  return (
    <MainContainer>
      <Header>
        <Logo></Logo>
        <TabContainer>
          <Tab
            isActive={activeTab === 'friends'}
            onClick={() => handleTabClick('friends')}
          >
            친구
          </Tab>
          <Tab
            isActive={activeTab === 'chat'}
            onClick={() => handleTabClick('chat')}
          >
            채팅
          </Tab>
          <Tab
            isActive={activeTab === 'findFriend'}
            onClick={() => handleTabClick('findFriend')}
          >
            친구 찾기
          </Tab>
          <Tab
            isActive={activeTab === 'friendRequests'}
            onClick={() => handleTabClick('friendRequests')}
          >
            친구 요청
          </Tab>
          <Tab isActive={activeTab === 'more'} onClick={toggleMoreMenu}>
            더보기
          </Tab>
          {showMoreMenu && (
            <MoreMenu className={showMoreMenu ? 'active' : ''}>
              <MoreMenuItem onClick={() => navigate('/settings')}>
                환경설정
              </MoreMenuItem>
              <MoreMenuItem onClick={handleLogout}>로그아웃</MoreMenuItem>
              <MoreMenuItem
                onClick={() =>
                  window.open(
                    'https://comic.naver.com/webtoon/list?titleId=796152',
                    '_blank'
                  )
                }
              >
                마루는강쥐
              </MoreMenuItem>
              <MoreMenuItem onClick={() => navigate('/update-logs')}>
                업데이트 일지
              </MoreMenuItem>
            </MoreMenu>
          )}
        </TabContainer>
      </Header>

      <Content>
        {activeTab === 'friends' && <FriendsList />}
        {activeTab === 'findFriend' && <FindFriendPage />}
        {activeTab === 'friendRequests' && <FriendRequestsList />}
        {activeTab === 'chat' && <ChatRoomsList />}
      </Content>
    </MainContainer>
  );
};

export default MainPage;
