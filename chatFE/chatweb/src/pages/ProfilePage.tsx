import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { server_url } from '../common/serverConfig';
import { FiArrowLeft } from 'react-icons/fi';

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f4f4f9;
  font-family: 'Roboto', sans-serif;

  @media (max-width: 768px) {
    padding: 0px;
  }
`;

const GoBackButton = styled.button`
  background-color: #f4d03f;
  color: white;
  border: none;
  padding: -15px;
  margin-top: -5px;
  margin-bottom: -55px;
  transform: translateY(-10px);
  font-size: 35rem;
  border-radius: 50%; /* 원형 버튼 */
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 40px; /* 버튼 크기 설정 */
  height: 40px; /* 버튼 크기 설정 */
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #0056b3; /* Hover 시 색상 변경 */
  }

  &:active {
    background-color: #004085; /* 클릭 시 색상 변경 */
  }

  @media (max-width: 768px) {
    width: 35px;
    height: 35px;
    font-size: 35px;
    margin-top: 0px;
    margin-bottom: -15px;
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

const ProfileForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 768px) {
    gap: 15px;
  }
`;

const Label = styled.label`
  margin-bottom: 5px; /* 라벨과 입력 칸 간의 간격 추가 */
  font-size: 1rem;
  color: #333;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ProfileInput = styled.input`
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 100%;
  max-width: 200px;
  background-color: #f4f4f9;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 10px;
  }
`;

const ProfileSelect = styled.select`
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 100%;
  max-width: 100px;
  background-color: #f4f4f9;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 10px;
  }
`;

const StyledButton = styled.button`
  background-color: #ffe787; /* 버튼 색상 */
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
    font-size: 0.9rem; /* 작은 화면에서 글씨 크기 축소 */
    padding: 12px;
  }
`;

const ProfileImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    margin-bottom: 5px;
  }
`;

const ProfileImage = styled.img`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
  opacity: 0.9;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    margin-bottom: 15px;
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProfileImg, setNewProfileImg] = useState<File | null>(null);

  const navigate = useNavigate();

  const getProfile = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Please log in first');
      navigate('/');
      return;
    }

    const response = await fetch(`${server_url}/users/getMyProfile`, {
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

    const updateData = { username, gender, status_msg };

    const response = await fetch(`${server_url}/users/updateProfile`, {
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

  const handleGoBack = () => {
    navigate('/main');
  };

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setNewProfileImg(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  const handleUploadImage = async () => {
    if (!newProfileImg) {
      alert('No image selected');
      return;
    }

    //const reader = new FileReader();
    //reader.onloadend = async () => {
    //  const fileData = reader.result as ArrayBuffer;

    const formData = new FormData();
    formData.append('profile_img_name', newProfileImg.name);
    formData.append('profile_img_data', newProfileImg);
    formData.append('profile_img_content_type', newProfileImg.type);

    //console.log(formData);

    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${server_url}/users/updateProfileImg`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const responseData = await response.json(); // 서버에서 반환한 JSON 데이터를 파싱

      if (responseData.status === 'success') {
        //alert('Profile image updated successfully');
        setProfileImg(responseData.new_profile_img); // 서버에서 반환된 이미지 URL로 프로필 이미지를 업데이트
        setIsModalOpen(false);
      } else {
        //alert('Failed to update profile image');
      }
    } catch (error) {
      //console.error('Upload image error:', error);
    }
    //};

    //reader.readAsArrayBuffer(newProfileImg); // ArrayBuffer로 파일 읽기
  };

  return (
    <ProfileContainer>
      <Content>
        <GoBackButton onClick={handleGoBack}>
          <FiArrowLeft />
        </GoBackButton>
        <ProfileImageWrapper>
          <ProfileImage
            src={profile_img || '/maruu.jpeg'}
            alt='Profile'
            onClick={handleImageClick}
          />
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
          <StyledButton type='submit'>프로필 수정</StyledButton>
        </ProfileForm>
      </Content>

      {isModalOpen && (
        <ModalBackdrop onClick={handleCloseModal}>
          <Modal onClick={e => e.stopPropagation()}>
            <h2>프로필 이미지 변경</h2>
            <input type='file' accept='image/*' onChange={handleImageChange} />
            <StyledButton onClick={handleUploadImage}>변경</StyledButton>
            <StyledButton onClick={handleCloseModal}>닫기</StyledButton>
          </Modal>
        </ModalBackdrop>
      )}
    </ProfileContainer>
  );
};

export default ProfilePage;
