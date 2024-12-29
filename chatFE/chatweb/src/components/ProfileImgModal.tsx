import React, { useState } from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeImage: (file: File) => void;
  currentImage: string;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  onChangeImage,
  currentImage,
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setSelectedImage(file);

      // 선택한 파일로 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // 미리보기 이미지로 설정
      };
      reader.readAsDataURL(file); // 파일을 읽어 data URL로 변환
    }
  };

  const handleSubmit = () => {
    if (selectedImage) {
      onChangeImage(selectedImage); // 서버로 이미지를 전송
      onClose(); // 모달 닫기
    }
  };

  if (!isOpen) return null;

  return (
    <div className='modal-overlay'>
      <div className='modal-content'>
        {/* 이미지 미리보기 */}
        <img
          src={imagePreview || currentImage} // 미리보기 이미지 또는 기본 이미지
          alt='Profile'
          style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }}
        />
        <div>
          <button onClick={handleSubmit}>변경</button>
          <button onClick={onClose}>닫기</button>
        </div>
        <input type='file' onChange={handleImageChange} />
      </div>
    </div>
  );
};

export default ImageModal;
