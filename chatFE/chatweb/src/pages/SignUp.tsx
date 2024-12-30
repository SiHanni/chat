import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { server_url } from '../common/serverConfig';
import axios from 'axios';

// 스타일 정의
const SignUpContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f3e7; /* 아주 연한 베이지색 */
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

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${server_url}/users/signUp`, {
        username,
        email,
        password,
      });

      if (response.status === 201) {
        alert('회원가입 완료');
        navigate('/');
      }
    } catch (error: any) {
      if (error.response) {
        const errorMessage = error.response.data.message;

        if (errorMessage === 'Email already exists') {
          alert('이미 가입된 이메일입니다.');
        } else if (errorMessage === 'Username already exists') {
          alert('이미 가입된 유저네임입니다.');
        }
      } else {
        alert('회원가입 중 문제가 발생했습니다.');
      }
    }
  };

  return (
    <SignUpContainer>
      <ImageContainer>
        <img src='/marusi.png' alt='signin Banner' />
      </ImageContainer>
      <FormContainer>
        <Title></Title>
        <form onSubmit={handleSubmit}>
          <InputGroup>
            {/*<Label>Username:</Label> */}
            <Input
              type='text'
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder='Nickname'
              required
            />
          </InputGroup>

          <InputGroup>
            {/*<Label>Email:</Label> */}
            <Input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='Email'
              required
            />
          </InputGroup>

          <InputGroup>
            {/*<Label>Password:</Label> */}
            <Input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='Password'
              required
            />
          </InputGroup>

          <Buttons>
            <StyledButton type='submit'>회원 가입</StyledButton>
          </Buttons>
        </form>
      </FormContainer>
    </SignUpContainer>
  );
};

export default SignUp;
