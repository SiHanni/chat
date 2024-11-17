import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f4f4f9;
  font-family: 'Roboto', sans-serif;
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
`;

const ProfileForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
`;

const Label = styled.label`
  margin-bottom: 5px; /* 라벨과 입력 칸 간의 간격 추가 */
  font-size: 1rem;
  color: #333;
`;

const ProfileInput = styled.input`
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 100%;
  max-width: 200px;
  background-color: #f4f4f9;
`;

const ProfileSelect = styled.select`
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 100%;
  max-width: 100px;
  background-color: #f4f4f9;
`;

const ProfileButton = styled.button`
  background-color: #eae1d9;
  color: #1e2a47;
  border: 0.1px solid #1e2a47;
  padding: 14px 30px;
  font-weight: bold;
  border-radius: 30px;
  width: 100%;
  max-width: 200px;
  align-self: center;
  transition: all 0.3s ease;

  &:hover {
    background-color: #d4c8b2;
    border-color: #d4c8b2;
    transform: translateY(-3px) scale(1.05);
  }

  &:active {
    transform: translateY(2px);
  }
`;

const ProfileImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
  opacity: 0.7;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

interface UserProfile {
  id: number;
  username: string;
  profile_img: string;
  gender: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState('');
  const [profile_img, setProfileImg] = useState('');
  const [gender, setGender] = useState('');
  const [status_msg, setStatusMsg] = useState('');
  const navigate = useNavigate();

  const getProfile = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Please log in first');
      navigate('/');
      return;
    }

    const response = await fetch('http://localhost:3000/users/getMyProfile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setUser(data);
      setUsername(data.username);
      setProfileImg(data.profile_img);
      setGender(data.gender);
      setStatusMsg(data.status_msg);
    } else {
      alert('Failed to fetch profile');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Please log in first');
      navigate('/');
      return;
    }

    const updateData = { username, profile_img, gender, status_msg };

    const response = await fetch('http://localhost:3000/users/update', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (response.ok) {
      alert('Profile updated successfully');
      getProfile();
    } else {
      alert('Failed to update profile');
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <ProfileContainer>
      <Content>
        <ProfileImageWrapper>
          <ProfileImage src={profile_img || '/maruu.jpg'} alt='Profile' />
        </ProfileImageWrapper>
        <ProfileForm onSubmit={handleProfileUpdate}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <Label>이름</Label>
            <ProfileInput
              type='text'
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <Label>이미지url</Label>
            <ProfileInput
              type='text'
              value={profile_img}
              onChange={e => setProfileImg(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <Label>상태 메시지</Label>
            <ProfileInput
              type='text'
              value={status_msg}
              onChange={e => setStatusMsg(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <Label>성별</Label>
            <ProfileSelect
              value={gender}
              onChange={e => setGender(e.target.value)}
            >
              <option value='male'>남자</option>
              <option value='female'>여자</option>
              <option value='alien'>외계인</option>
            </ProfileSelect>
          </div>
          <ProfileButton type='submit'>프로필 수정</ProfileButton>
        </ProfileForm>
      </Content>
    </ProfileContainer>
  );
};

export default ProfilePage;
