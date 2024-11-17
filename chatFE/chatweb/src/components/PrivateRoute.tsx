import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute: React.FC = () => {
  // localStorage에서 accessToken을 확인
  const token = localStorage.getItem('accessToken');

  // accessToken이 없으면 로그인 페이지로 리디렉션
  if (!token) {
    return <Navigate to='/' />; // 로그인 페이지로 리디렉션
  }

  return <Outlet />; // 인증된 사용자는 페이지 접근 허용
};

export default PrivateRoute;
