import React from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  color: #333;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
  text-align: center;
`;

const ModalButton = styled.button`
  background-color: #ffe787;
  color: #fff;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  width: 100%;

  &:hover {
    background-color: #f4d03f;
  }
`;

interface ModalProps {
  message: string;
  onClose: () => void;
}

const PwdChangeModal: React.FC<ModalProps> = ({ message, onClose }) => {
  return (
    <ModalOverlay>
      <ModalContent>
        <div>{message}</div>
        <ModalButton onClick={onClose}>확인</ModalButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PwdChangeModal;
