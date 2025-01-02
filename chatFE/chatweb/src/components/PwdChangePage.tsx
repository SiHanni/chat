import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { server_url } from '../common/serverConfig';
import PwdChangeModal from './PwdChangeModal';
import BasicModal from './BasicModal';

const PwdChangeContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: 'Roboto', sans-serif;
  margin-right: 15px;

  @media (max-width: 768px) {
    padding: 0px;
    width:100%
    margin-right: 25px;
    margin-left: -15px;
  }
`;

const Content = styled.div`
  flex-grow: 1;
  padding: 40px;
  color: #333;
  overflow-y: auto;
  border-radius: 10px;
  margin: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  @media (max-width: 768px) {
    padding: 20px;
    margin: 0;
  }
`;

const PwdChangeForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 768px) {
    gap: 15px;
  }
`;

const Label = styled.label`
  margin-bottom: 5px;
  font-size: 1rem;
  color: #333;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const PwdInput = styled.input`
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 90%;
  max-width: 300px;
  background-color: #f4f4f9;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 10px;
  }
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
  width: 150px;
  max-width: 100%;

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

const PwdChangePage: React.FC = () => {
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [modalMsg, setModalMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/');
      return;
    }

    if (!oldPwd) {
      setModalMsg('현재 비밀번호를 입력해주세요.');
      return;
    }

    if (!newPwd) {
      setModalMsg('새 비밀번호를 입력해주세요.');
      return;
    }

    const changePwdData = { inputedOldPwd: oldPwd, newPwd };

    const response = await fetch(`${server_url}/users/changePwd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(changePwdData),
    });

    if (response.ok) {
      setOldPwd('');
      setNewPwd('');
      setModalMsg('비밀번호 변경에 성공했습니다!');
    } else {
      const error = await response.json();
      if (error.message === 'Invalid password') {
        setModalMsg('현재 비밀번호를 확인해주세요');
      } else if (error.message === 'Required Data Missing') {
        setModalMsg('새 비밀번호를 입력해야 합니다.');
      } else {
        setModalMsg('비밀번호 변경 실패');
      }
    }
  };

  const handleCloseModal = () => {
    setModalMsg(null); // 모달 닫기
  };

  return (
    <div>
      <PwdChangeContainer>
        <Content>
          <PwdChangeForm onSubmit={handlePasswordChange}>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}
            >
              <Label>현재 비밀번호</Label>
              <PwdInput
                type='password'
                value={oldPwd}
                onChange={e => setOldPwd(e.target.value)}
              />
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}
            >
              <Label>새 비밀번호</Label>
              <PwdInput
                type='password'
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
              />
            </div>
            <StyledButton type='submit'>비밀번호 변경</StyledButton>
          </PwdChangeForm>
        </Content>
      </PwdChangeContainer>
      {modalMsg && (
        <BasicModal modalMsg={modalMsg} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default PwdChangePage;
