import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import FriendsList from '../components/FriendList';
import FriendRequestsList from '../components/FriendRequestList';
import FindFriendPage from './FindFriendPage';
import ChatRoomsList from '../components/ChatRoomList';
import { io, Socket } from 'socket.io-client';
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

const MoreMenu = styled.div<{ show: boolean }>`
  position: absolute;
  top: 60px;
  right: 10px;
  background-color: #f7f6ed;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 10px;
  display: ${({ show }) => (show ? 'block' : 'none')};
  width: 150px;
  transition: background-color 0.3s ease;

  @media (max-width: 768px) {
    top: -40px;
    right: 0;
    width: 70px;
    height: 30px;
    font-size: 0.8em;
    margin-right: 35px;
  }

  & > button {
    width: 100%;
    padding: 10px;
    background-color: #f7f6ed; /* 기본 배경색 */
    color: #1e2a47; /* 텍스트 색상 */
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em; /* 글씨 크기 조정 */
    text-align: center;
    position: relative;
    overflow: hidden; /* 자식 요소가 버튼 밖으로 나가지 않도록 */
    transition: transform 0.3s ease; /* 호버 시 애니메이션 */
  }

  & > button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(211, 211, 211, 0.3); /* 아주 얕은 회색 */
    border-radius: 5px;
    transform: scaleX(0); /* 처음에는 가로 크기를 0으로 설정 */
    transform-origin: left; /* 왼쪽에서부터 확장되도록 설정 */
    transition: transform 0.4s ease;
  }

  & > button:hover {
    transform: translateY(-2px); /* 버튼 호버 시 살짝 위로 올라가는 효과 */
  }

  & > button:hover::before {
    transform: scaleX(1); /* 호버 시 배경이 왼쪽에서부터 오른쪽으로 확장됨 */
  }
`;

const MainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 로그인 후 메인 페이지로 왔을 때 웹소켓 연결 확인 및 초기화
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/');
    }

    if (!socket) {
      const socketInstance = io(`${server_url}`, {
        auth: { token },
      });

      socketInstance.on('connect', () => {
        console.log('Connected to WebSocket');
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
      });

      setSocket(socketInstance);
    }

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [socket, navigate]);

  // 로그아웃 처리 함수
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/'); // 홈 페이지로 이동
  };

  // 탭 클릭 시 activeTab 변경
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const handleMoreClick = () => {
    setShowMoreMenu(prevState => !prevState); // 현재 상태의 반대값으로 토글
  };

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
          <Tab isActive={activeTab === 'more'} onClick={handleMoreClick}>
            더보기
          </Tab>
        </TabContainer>
        <MoreMenu ref={moreMenuRef} show={showMoreMenu}>
          <button onClick={handleLogout}>로그아웃</button>
        </MoreMenu>
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
