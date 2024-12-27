import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import MainPage from './pages/MainPage';
import ProfilePage from './pages/ProfilePage';
import PrivateRoute from './components/PrivateRoute';
import ChatPage from './components/ChatPage';
import TokenManager from './common/tokenManager';
import SettingsPage from './pages/SettingPage';

const App: React.FC = () => {
  const refreshAuthToken = () => {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      const newTokenManager = new TokenManager(accessToken);
      newTokenManager.startTokenUpdate();
    }
  };

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route
          path='/signIn'
          element={<SignIn handleLogin={refreshAuthToken} />}
        />
        <Route path='/signUp' element={<SignUp />} />

        {/* PrivateRoute로 감싸서 /main 경로에 접근을 인증된 사용자로 제한 */}

        <Route element={<PrivateRoute />}>
          <Route path='/main' element={<MainPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/chat' element={<ChatPage />} />
          <Route path='/chat/:id' element={<ChatPage />} />
          <Route path='/settings' element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
