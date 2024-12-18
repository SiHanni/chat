import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/Button';
import { server_url } from '../common/serverConfig';

// 스타일 정의
const SignInContainer = styled.div`
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
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h2`
  text-align: center;
  color: #1f3c73; /* 남색 */
  margin-bottom: 30px;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

//const Label = styled.label`
//  font-size: 1rem;
//  color: #555;
//  margin-bottom: 5px;
//  display: block;
//`;

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
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
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
      <FormContainer>
        <Title></Title>
        <form onSubmit={handleSubmit}>
          <InputGroup>
            {/* <Label>Email:</Label>*/}
            <Input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='email'
              required
            />
          </InputGroup>

          <InputGroup>
            {/*<Label>Password:</Label>*/}
            <Input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='password'
              required
            />
          </InputGroup>

          <Buttons>
            <Button type='submit'>Sign In</Button>
          </Buttons>
        </form>
      </FormContainer>
    </SignInContainer>
  );
};

export default SignIn;
