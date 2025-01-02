import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { server_url } from '../common/serverConfig';
import BasicModal from '../components/BasicModal';

// 스타일 정의
const SignInContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f3e7;
  color: #333;
  font-family: 'Roboto', sans-serif;
`;

const FormContainer = styled.div`
  background-color: #f5f3e7;
  padding: 30px;
  border-radius: 15px;

  width: 80%;
  max-width: 300px;
  text-align: center;
  margin-top: -60px;

  @media (max-width: 768px) {
    padding: 20px;
    margin-top: -30px;
  }
`;

const ImageContainer = styled.div`
  width: 30%;
  max-width: 90px;
  margin-top: -70px;
  position: relative;
  left: -130px;

  img {
    width: 110%;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;

    @media (max-width: 768px) {
      width: 90%;
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
    font-size: 1.5rem; 
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px;
  background-color: transparent;
  font-size: 1rem;
  border: none;
  border-bottom: 2px solid #ddd;
  box-sizing: border-box;
  margin-top: 5px;
  outline: none;

  &:focus {
    border-color: #1f3c73;
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
`;

const StyledButton = styled.button`
  background-color: #ffe787;
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
    font-size: 0.9rem;
    padding: 12px;
  }
`;

const SignIn: React.FC<{ handleLogin: (accessToken: string) => void }> = ({
  handleLogin,
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${server_url}/users/signIn`,
        { email, password },
        { withCredentials: true } // 쿠키 포함
      );

      const data = await response.data;

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('last_login', data.last_login);
      handleLogin(data.accessToken);

      navigate('/main');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMsg = error.response.data.message;

        if (errorMsg === 'Invalid email') {
          setErrorMessage('로그인 실패\n이메일을 확인해주세요');
        } else if (errorMsg === 'Invalid password') {
          setErrorMessage('로그인 실패\n패스워드를 확인해주세요');
        }
      } else {
        setErrorMessage(
          '로그인 실패\n로그인서버 접속 실패\n잠시 후 다시 시도해주세요'
        );
      }
    }
  };

  const handleCloseModal = () => {
    setErrorMessage(null); // 모달 닫기
  };

  return (
    <div>
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
      {errorMessage && (
        <BasicModal modalMsg={errorMessage} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default SignIn;
