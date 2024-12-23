import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { server_url } from '../common/serverConfig';

// 스타일 정의
const SignInContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 110vh;

  background-color: #f9f5ee;
  color: #333;
  font-family: 'Roboto', sans-serif;
`;

const FormContainer = styled.div`
  background-color: #fff;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 300px;
  text-align: center;
  margin-top: -60px;

  @media (max-width: 768px) {
    padding: 20px;
    margin-top: -30px; /* 모바일에서 여백 조정 */
  }
`;

const ImageContainer = styled.div`
  width: 30%;
  max-width: 90px;
  margin-top: -70px; /* 이미지 아래로 이동 */
  position: relative;
  left: -130px;

  img {
    width: 110%;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;

    @media (max-width: 768px) {
      width: 90%; /* 작은 화면에서 이미지 크기 조정 */
      position: relative;
      transform: translate(45px, 15px);
    }
  }
`;

const Title = styled.h2`
  text-align: center;
  color: #1f3c73; /* 남색 */
  margin-bottom: 30px;

  @media (max-width: 768px) {
    font-size: 1.5rem; /* 제목 크기 축소 */
  }
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
  margin-top: 5px;
  outline: none;

  &:focus {
    border-color: #1f3c73; /* 남색으로 포커스 시 색상 변경 */
  }

  @media (max-width: 768px) {
    padding: 12px; /* 모바일에서 입력 필드 패딩 축소 */
  }
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
`;

const StyledButton = styled.button`
  background-color: #ffe787; /* 버튼 색상 */
  color: #fff;
  font-size: 1rem;
  padding: 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;

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
    font-size: 0.9rem; /* 작은 화면에서 글씨 크기 축소 */
    padding: 12px;
  }
`;

const SignIn: React.FC<{ handleLogin: (accessToken: string) => void }> = ({
  handleLogin,
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch(`${server_url}/users/signIn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('last_login', data.last_login);
      handleLogin(data.accessToken);

      navigate('/main');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <SignInContainer>
      <ImageContainer>
        <img src='/maruhi.png' alt='Login Banner' />
      </ImageContainer>
      <FormContainer>
        <Title></Title>
        <form onSubmit={handleSubmit}>
          <InputGroup>
            {/* <Label>Email:</Label>*/}
            <Input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='이메일'
              required
            />
          </InputGroup>

          <InputGroup>
            {/*<Label>Password:</Label>*/}
            <Input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='비밀번호'
              required
            />
          </InputGroup>

          <Buttons>
            <StyledButton type='submit'>로그인</StyledButton>
          </Buttons>
        </form>
      </FormContainer>
    </SignInContainer>
  );
};

export default SignIn;
