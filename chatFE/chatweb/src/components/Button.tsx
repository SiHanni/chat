import React from 'react';

interface ButtonProps {
  children: React.ReactNode; // 버튼의 텍스트나 콘텐츠
  type: 'button' | 'submit' | 'reset'; // 버튼의 종류
  onClick?: () => void; // 클릭 시 실행되는 함수
}

const Button: React.FC<ButtonProps> = ({ children, type, onClick }) => {
  return (
    <button type={type} onClick={onClick} className='button'>
      {children}
    </button>
  );
};

export default Button;
