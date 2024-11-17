import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/Button';

// 스타일 정의
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f3e7; /* 아주 연한 베이지색 */
  color: #333;
  font-family: 'Roboto', sans-serif;
`;

const Logo = styled.div`
  margin-bottom: 50px;
  text-align: center;

  h1 {
    font-size: 4rem;
    color: #1f3c73; /* 남색 */
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: none;
    margin: 0;
  }
`;

const Description = styled.div`
  margin-bottom: 40px;

  p {
    font-size: 1.2rem;
    text-align: center;
    color: #555;
    line-height: 1.5;
    max-width: 600px;
    overflow: hidden; /* 내용이 영역을 넘치지 않도록 함 */
    white-space: nowrap; /* 텍스트를 한 줄로 유지 */
    display: inline-block;
    position: relative;
    animation: marquee 10s linear infinite; /* 애니메이션 설정 */
  }

  @keyframes marquee {
    0% {
      transform: translateX(100%); /* 처음에는 화면 오른쪽 끝에 위치 */
    }
    100% {
      transform: translateX(-100%); /* 끝에 도달하면 화면 왼쪽 끝으로 이동 */
    }
  }
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px; /* 버튼 간격을 넓혀줍니다 */
`;

const ButtonStyled = styled(Button)`
  padding: 25px 45px; /* 버튼 크기 조금 더 키움 */
  font-size: 1.3rem; /* 글자 크기 조금 더 키움 */
  font-weight: bold;
  border-radius: 50px;
  border: none;
  background: linear-gradient(45deg, #d4a200, #c27c31); /* 연한 갈색 배경 */
  color: #fff;
  cursor: pointer;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;

  /* 호버 효과 */
  &:hover {
    background: linear-gradient(45deg, #c27c31, #d4a200);
    transform: translateY(-5px); /* 호버 시 약간 떠오르는 효과 */
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: none;
  }
`;

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/signin'); // 로그인 페이지로 이동
  };

  const handleSignUp = () => {
    navigate('/signup'); // 회원가입 페이지로 이동
  };

  return (
    <HomeContainer>
      <Logo>
        <h1>MaruTalk</h1>
      </Logo>
      <Description>
        <p>마루 킁킁, 마루 쫑긋, 마루 덥석 총총총총총 짧은 다리 파다닥</p>
      </Description>
      <Buttons>
        <ButtonStyled type='button' onClick={handleSignUp}>
          회원가입
        </ButtonStyled>
        <ButtonStyled type='button' onClick={handleLogin}>
          로그인
        </ButtonStyled>
      </Buttons>
    </HomeContainer>
  );
};

export default Home;
