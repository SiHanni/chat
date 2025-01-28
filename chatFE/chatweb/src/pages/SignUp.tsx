import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { server_url } from '../common/serverConfig';
import axios from 'axios';
import { FaQuestionCircle } from 'react-icons/fa';
import BasicModal from '../components/BasicModal';

// 스타일 정의
const SignUpContainer = styled.div`
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
  }
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
  position: relative;
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

const QuestionMarkIcon = styled.div`
  position: relative;
  display: inline-block;
  color: #ddd;
  font-size: 20px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 10px;
`;

const QuestionModal = styled.div<{ show: boolean }>`
  position: absolute;
  top: 36%;
  left: 60%;
  transform: translate(-50%, -50%);
  background-color: #ddd;
  opacity: ${({ show }) => (show ? 0.6 : 0)};
  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
  color: #333;
  padding: 15px; /* 여백 조정 */
  border-radius: 10px;
  display: ${({ show }) => (show ? 'block' : 'none')};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  font-size: 0.7rem; /* 글씨 크기 작게 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 모달 그림자 */
  white-space: nowrap;

  @media (max-width: 768px) {
    top: 30%;
    left: 60%;
  }
`;

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState<string | null>(null);

  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${server_url}/users/sign-up`, {
        username,
        email,
        password,
      });

      if (response.status === 201) {
        setModalMsg('회원가입 완료');
        navigate('/');
      }
    } catch (error: any) {
      if (error.response) {
        const errorMessage = error.response.data.message;

        if (errorMessage === 'Email already exists') {
          setModalMsg('회원가입 실패\n이미 가입된 이메일입니다.');
        } else if (errorMessage === 'Username already exists') {
          setModalMsg('회원가입 실패\n이미 가입된 유저네임입니다.');
        }
      } else {
        setModalMsg('회원가입 중 문제가 발생했습니다.');
      }
    }
  };

  const handleCloseModal = () => {
    setModalMsg(null); // 모달 닫기
  };

  return (
    <div>
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
                placeholder='이름'
                required
              />
              <QuestionMarkIcon onClick={() => setShowModal(true)}>
                <FaQuestionCircle />
              </QuestionMarkIcon>
            </InputGroup>

            <InputGroup>
              {/*<Label>Email:</Label> */}
              <Input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='이메일'
                required
              />
            </InputGroup>

            <InputGroup>
              {/*<Label>Password:</Label> */}
              <Input
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='비밀번호'
                required
              />
            </InputGroup>

            <Buttons>
              <StyledButton type='submit'>회원 가입</StyledButton>
            </Buttons>
          </form>
        </FormContainer>
        <QuestionModal show={showModal}>
          정책상 중복된 이름은 <br />
          사용할 수 없습니다
        </QuestionModal>
      </SignUpContainer>
      {modalMsg && (
        <BasicModal modalMsg={modalMsg} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default SignUp;
