import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// 스타일 정의
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: transparent; /* 아주 연한 베이지색 */
  color: #333;
  font-family: 'Roboto', sans-serif;
  overflow: hidden; /* 화면 넘침 방지 */
  position: relative;

  @media (max-width: 768px) {
    padding: 20px; /* 모바일에서 여백 추가 */
    height: auto; /* 높이 조정 */
  }
`;

const LogoContainer = styled.div`
  position: fixed;
  top: 43%;
  left: 50%;
  transform: translate(-50%, -70%); /* 정확한 중앙 배치 */
  z-index: 1;
  text-align: center;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  color: #fce37e; /* 타이틀 색상 */
  font-weight: bold;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4); /* 글자 그림자 효과 */
  font-family: 'Nunito', sans-serif;
  animation: textAnimation 3s ease-in-out infinite;

  @keyframes textAnimation {
    0% {
      color: #fce37e;
      transform: scale(1); /* 원래 크기 */
    }
    50% {
      color: #fce37e;
      transform: scale(1.05); /* 살짝 커짐 */
    }
    100% {
      color: #fce37e;
      transform: scale(1); /* 원래 크기로 돌아옴 */
    }
  }

  @media (max-width: 768px) {
    font-size: 1.2rem; /* 글자 크기 줄이기 */
  }
`;

const TitleImage = styled.img`
  width: 80px; /* 이미지 크기 조정 */
  height: auto;
  position: absolute; /* 이미지가 로고 위에 배치되도록 */
  top: -26%; /* 로고 바로 위에 위치 */
  left: 0%;
  transform: translateX(-50%); /* 중앙 정렬 */
  margin-top: 0; /* 간격을 없앰 */
  animation: imageAnimation 10s ease-in-out infinite; /* 애니메이션 적용 */

  @keyframes imageAnimation {
    0% {
      transform: translateX(0) scaleX(-1); /* 왼쪽에서 시작, 반전 없이 */
    }
    50% {
      transform: translateX(18vw) scaleX(-1); /* 10으로 이동, 반전 없이 */
    }
    75% {
      transform: translateX(18vw) scaleX(1); /* 10에서 반전 시작 */
    }
    100% {
      transform: translateX(0) scaleX(1); /* 다시 0으로 돌아가며 반전 */
    }
  }
  @media (max-width: 768px) {
    width: 60px; /* 이미지 크기 줄이기 */
    top: -23%; /* 이미지 위치 조정 */
  }
`;

const Buttons = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: 30px; /* 버튼 간격을 넓혀줍니다 */
  bottom: 30vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  @media (max-width: 768px) {
    bottom: 20vh;
    gap: 20px; /* 작은 화면에서 버튼 간격 줄이기 */
  }
`;

const ButtonStyled = styled.button`
  padding: 10px 18px; /* 버튼 크기 조금 더 키움 */
  font-size: 1rem; /* 글자 크기 조금 더 키움 */
  font-weight: bold;
  border-radius: 10px;
  border: none;
  background: linear-gradient(145deg, #ffe787, #f4d03f); /* 그라데이션 색상 */
  color: white;
  cursor: pointer;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;

  /* 버튼 크기 조정 */
  @media (max-width: 768px) {
    font-size: 0.8rem; /* 작은 화면에서 글자 크기 줄이기 */
    padding: 8px 25px; /* 버튼 크기 줄이기 */
  }

  /* 호버 효과 */
  &:hover {
    background: linear-gradient(145deg, #f4d03f, #ffe787); /* 그라데이션 반전 */
    transform: translateY(-5px); /* 호버 시 약간 떠오르는 효과 */
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: none;
  }

  /* 버튼을 젤리처럼 보이게 하는 효과 */
  &:active {
    transform: scale(0.98); /* 클릭 시 살짝 눌리는 효과 */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }
`;
const CloudDescription = styled.div<{ show: boolean }>`
  position: absolute;
  bottom: 75vh;
  left: 50%;
  transform: translateX(-50%);
  background: #faf7eb;
  color: #333;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
  font-size: 0.7rem;
  text-align: center;
  opacity: ${props => (props.show ? 1 : 0)};
  visibility: ${props => (props.show ? 'visible' : 'hidden')};
  transition: opacity 0.5s ease, visibility 0.5s ease;
  white-space: pre-line;

  @media (max-width: 768px) {
    position: fixed;
    white-space: nowrap;
    bottom: 80vh;
    left: 50%; /* 중앙 정렬 유지 */
    z-index: 99999; /* 우선순위 높이기 */
  }
`;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showDescription, setShowDescription] = useState(false);

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('last_login');
  localStorage.removeItem('socketState');
  localStorage.removeItem('user');

  const handleLogin = () => {
    navigate('/signin'); // 로그인 페이지로 이동
  };

  const handleSignUp = () => {
    navigate('/signup'); // 회원가입 페이지로 이동
  };

  const handleShowDescription = () => {
    setShowDescription(true);
    setTimeout(() => {
      setShowDescription(false);
    }, 3000); // 3초 후에 설명 사라짐
  };

  return (
    <HomeContainer>
      <LogoContainer>
        <TitleImage src='/maruTitle.png' alt='MaruTalk Logo' />
        <Logo>
          <h1>MaruTalk</h1>
        </Logo>
      </LogoContainer>
      <Buttons>
        <ButtonStyled type='button' onClick={handleSignUp}>
          회원가입
        </ButtonStyled>
        <ButtonStyled type='button' onClick={handleLogin}>
          로그인
        </ButtonStyled>
        <ButtonStyled type='button' onClick={handleShowDescription}>
          마루톡?
        </ButtonStyled>
      </Buttons>
      <CloudDescription show={showDescription}>
        마루톡은 마루는 강쥐를 사랑하는 <br />
        누구나 사용할 수 있는 웹 메신저입니다.
      </CloudDescription>
    </HomeContainer>
  );
};

export default Home;
