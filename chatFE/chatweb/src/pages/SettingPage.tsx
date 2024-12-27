import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import PwdChangePage from '../components/PwdChangePage';

const SettingsPageContainer = styled.div`
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
    bottom: 12px;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 0 10px;
  }
`;

const TabContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-start;
  margin-top: 5px;
  margin-left: 45px;
  overflow-x: auto; /* 가로 스크롤을 활성화 */
  padding-bottom: 5px; /* 스크롤바가 겹치지 않도록 여유 공간 추가 */
  gap: 55px; /* 메뉴 간 간격을 늘림 */

  @media (max-width: 768px) {
    justify-content: flex-start;
    margin-top: -20px;
    margin-bottom: 5px;
    margin-right: -5px;
    margin-left: -20px;
    gap: 10px;
    transform: translateY(5px);
  }
`;

const Tab = styled.div<{ isActive: boolean }>`
  padding: 12px 20px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
  border-radius: 2px;
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
    padding: 7px 10px;
    maring-left: -5px;
    margin-top: 8px;

    position: relative;
    bottom: -15px;
    left: 5px;
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

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('passwordChange');
  const navigate = useNavigate();

  const handleTabClick = (tab: string) => setActiveTab(tab);

  const handleGoBack = () => {
    navigate('/main');
  };

  return (
    <SettingsPageContainer>
      <Header>
        <TabContainer>
          <Tab isActive={false} onClick={handleGoBack}>
            돌아가기
          </Tab>
          <Tab
            isActive={activeTab === 'passwordChange'}
            onClick={() => handleTabClick('passwordChange')}
          >
            비밀번호 변경
          </Tab>
          <Tab
            isActive={activeTab === 'modeChange'}
            onClick={() => handleTabClick('modeChange')}
          >
            모드 변경
          </Tab>
          <Tab
            isActive={activeTab === 'security'}
            onClick={() => handleTabClick('security')}
          >
            보안
          </Tab>
          <Tab
            isActive={activeTab === 'notifications'}
            onClick={() => handleTabClick('notifications')}
          >
            알림
          </Tab>
          <Tab
            isActive={activeTab === 'screen'}
            onClick={() => handleTabClick('screen')}
          >
            화면
          </Tab>
        </TabContainer>
      </Header>

      <Content>
        {activeTab === 'passwordChange' && <PwdChangePage />}
        {activeTab === 'modeChange' && <div>모드 변경 화면</div>}
        {activeTab === 'security' && <div>보안 설정 화면</div>}
        {activeTab === 'notifications' && <div>알림 설정 화면</div>}
        {activeTab === 'screen' && <div>화면 설정 화면</div>}
      </Content>
    </SettingsPageContainer>
  );
};

export default SettingsPage;
