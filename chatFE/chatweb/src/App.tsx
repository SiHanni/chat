import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import MainPage from './pages/MainPage';
import ProfilePage from './pages/ProfilePage';
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signIn' element={<SignIn />} />
        <Route path='/signUp' element={<SignUp />} />

        {/* PrivateRoute로 감싸서 /main 경로에 접근을 인증된 사용자로 제한 */}
        <Route element={<PrivateRoute />}>
          <Route path='/main' element={<MainPage />} />
          <Route path='/profile' element={<ProfilePage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
