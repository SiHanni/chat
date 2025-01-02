import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { server_url } from '../common/serverConfig';
import { FiArrowLeft } from 'react-icons/fi';
import BasicModal from '../components/BasicModal';
import axios from 'axios';

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
  font-size: 0.9rem;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  width: 100px;
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
  padding: 15px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 250px; /* 기본 모달 크기 */

  /* 모바일 대응 */
  @media (max-width: 600px) {
    width: 80%; /* 화면 크기가 작으면 모달을 더 작게 */
    padding: 10px; /* 여백 줄이기 */
  }
`;

const FileInput = styled.input`
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: -10px;
  cursor: pointer;
  width: 82%; /* 모바일에서 더 넓게 표시되도록 */

  &:hover {
    border-color: #007bff;
  }

  @media (max-width: 600px) {
    margin-top: -10px;
  }
`;

const ModalButtonContainer = styled.div`
  display: flex;
  gap: 10px; /* 버튼 간 간격 */
  justify-content: center;
  width: 100%;
  gap: 20px;

  /* 모바일 대응 */
  @media (max-width: 600px) {
    margin-top: -15px;
    gap: 15px; /* 버튼 간 간격을 좀 더 넓게 */
  }
`;

const StyledModalButton = styled.button`
  background-color: #ffe787; /* 버튼 색상 */
  color: #fff;
  font-size: 0.9rem;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  width: 100px;
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
    font-size: 0.8rem; /* 작은 화면에서 글씨 크기 축소 */
    padding: 10px;
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
  const [profileImg, setProfileImg] = useState('');
  const [gender, setGender] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProfileImg, setNewProfileImg] = useState<File | null>(null);
  const [profileImgModalMsg, setProfileImgModalMsg] = useState('');

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [modalMsg, setModalMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  const getProfile = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setModalMsg('로그인 만료');
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
      setModalMsg('서버 에러\n잠시 후 다시 시도해주세요');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setModalMsg('로그인 만료');
      navigate('/');
      return;
    }
    const status_msg = statusMsg;
    const updateData = { username, gender, status_msg };

    try {
      const response = await axios.patch(
        `${server_url}/users/updateProfile`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const data = await response.data;
        localStorage.setItem('user', JSON.stringify(data));
        getProfile();
        setModalMsg('프로필수정 완료');
      } else {
        setModalMsg('서버 에러');
      }
    } catch (error) {
      setModalMsg('서버 에러');
      console.error(error);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  if (!user) {
    navigate('/');
  }

  const handleGoBack = () => {
    navigate('/main');
  };

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setImagePreview(null);
    setModalMsg(null);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setNewProfileImg(file);
      const previewUrl = URL.createObjectURL(file); // 미리보기 URL 생성
      setImagePreview(previewUrl); // 미리보기 이미지 업데이트
    } else {
      setModalMsg('이미지를 확인해주세요');
    }
  };

  const handleUploadImage = async () => {
    if (!newProfileImg) {
      setProfileImgModalMsg('선택된 이미지가 없어요');
      return;
    }

    const formData = new FormData();
    formData.append('profile_img_name', newProfileImg.name);
    formData.append('profile_img_data', newProfileImg);
    formData.append('profile_img_content_type', newProfileImg.type);

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
        setModalMsg('서버 에러\n잠시 후 다시 시도해주세요');
      }

      const responseData = await response.json();

      if (responseData.status === 'success') {
        const localUserStr = localStorage.getItem('user');
        if (localUserStr) {
          const localUserObj = JSON.parse(localUserStr);

          localUserObj.profile_img = responseData.new_profile_img;
          setProfileImg(responseData.new_profile_img);
          localStorage.setItem('user', JSON.stringify(localUserObj));
          setIsModalOpen(false);
        }
      } else {
        setProfileImgModalMsg('오늘 변경 횟수를 다 사용했어요');
      }
    } catch (error) {
      setModalMsg('서버 에러\n잠시 후 다시 시도해주세요');
    }
    //};

    //reader.readAsArrayBuffer(newProfileImg); // ArrayBuffer로 파일 읽기
  };

  return (
    <div>
      <ProfileContainer>
        <Content>
          <GoBackButton onClick={handleGoBack}>
            <FiArrowLeft />
          </GoBackButton>
          <ProfileImageWrapper>
            <ProfileImage
              src={profileImg || '/maruu.jpeg'}
              alt='Profile'
              onClick={handleImageClick}
            />
          </ProfileImageWrapper>
          <ProfileForm onSubmit={handleProfileUpdate}>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}
            >
              <Label>이름</Label>
              <ProfileInput
                type='text'
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}
            >
              <Label>상태 메시지</Label>
              <ProfileInput
                type='text'
                value={statusMsg}
                onChange={e => setStatusMsg(e.target.value)}
              />
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}
            >
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
              {imagePreview && (
                <div style={{ margin: '20px 0' }}>
                  <ProfileImage src={imagePreview} alt='Profile Preview' />
                </div>
              )}
              <FileInput
                type='file'
                accept='image/*'
                onChange={handleImageChange}
              />
              {profileImgModalMsg && <p>{profileImgModalMsg}</p>}
              <ModalButtonContainer>
                <StyledModalButton onClick={handleUploadImage}>
                  변경
                </StyledModalButton>
                <StyledModalButton onClick={handleCloseModal}>
                  닫기
                </StyledModalButton>
              </ModalButtonContainer>
            </Modal>
          </ModalBackdrop>
        )}
      </ProfileContainer>
      {modalMsg && (
        <BasicModal modalMsg={modalMsg} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default ProfilePage;
