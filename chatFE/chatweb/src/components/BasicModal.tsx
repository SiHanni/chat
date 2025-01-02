import React from 'react';
import styled from 'styled-components';

interface ModalProps {
  modalMsg: string;
  onClose: () => void;
}

const BasicModal: React.FC<ModalProps> = ({ modalMsg, onClose }) => {
  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalContent>{modalMsg}</ModalContent>
        {/* 하단 전체를 버튼으로 처리 */}
        <ModalButtonArea onClick={onClose}>
          <ModalButton>확인</ModalButton>
        </ModalButtonArea>
      </ModalContainer>
    </ModalOverlay>
  );
};

// 스타일 정의
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 10px;
  width: 40%;
  max-width: 500px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 200px;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 40%;
    height: 150px;
  }

  @media (max-width: 480px) {
    width: 70%;
    height: 130px;
  }
`;

const ModalContent = styled.div`
  font-size: 18px;
  margin: 50px 20px;
  color: #333;
  flex-grow: 1;
  white-space: pre-line;

  @media (max-width: 768px) {
    font-size: 14px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const ModalButtonArea = styled.div`
  width: 100%;
  height: 40px; // 버튼의 높이 지정
  background-color: #ffe787;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  cursor: pointer;

  @media (max-width: 768px) {
    height: 35px;
  }
`;

const ModalButton = styled.button`
  width: 100%;
  background-color: #ffe787;
  color: white;
  padding: 15px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
  font-weight: bold;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;

  &:hover {
    background-color: #ffe787;
  }

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 12px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 10px;
  }s
`;

export default BasicModal;
