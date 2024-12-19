import React from 'react';
import styled from 'styled-components';

interface FilePreviewModalProps {
  filePreview: string | null;
  fileName: string | null;
  onClose: () => void;
  onSend: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  filePreview,
  fileName,
  onClose,
  onSend,
}) => {
  if (!filePreview) return null;

  console.log(':QWEQWEQWEQWE', filePreview);
  const fileType = fileName?.split('.').pop()?.toLowerCase();
  console.log('FF', fileType);
  const getFilePreviewIcon = () => {
    const iconPath = () => {
      console.log('File Type:', fileType); // 파일 타입을 확인해 보세요.
      switch (fileType) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'webp':
          console.log('Image preview:', filePreview); // 미리보기 이미지 경로 확인
          return filePreview !== null ? filePreview : '/static/nopreview.png';
        case 'xlsx':
        case 'xls':
        case 'sheet':
          return '/static/xls.png';
        case 'docx':
        case 'doc':
          return '/static/doc.png';
        case 'pdf':
          return '/static/pdf.png';
        case 'mp3':
        case 'wav':
        case 'flac':
          return '/static/music.png';
        case 'json':
        case 'JSON':
          return '/static/json.png';
        case 'zip':
        case 'rar':
          return '/static/zip.png';
        case 'txt':
          return '/static/txt.png';
        default:
          return '/static/nopreview.png';
      }
    };

    const icon = iconPath();
    console.log('Returned Icon Path:', icon); // 최종 아이콘 경로 확인
    return icon;
  };
  return (
    <div style={modalStyles}>
      <div style={modalContentStyles}>
        <img
          src={getFilePreviewIcon()}
          alt='File Preview'
          style={imageStyles}
        />
        <p style={fileNameStyles}>{fileName}</p> {/* 파일 이름 표시 */}
        <div style={buttonContainerStyles}>
          <CancelButton onClick={onClose}>취소</CancelButton>
          <SendButton onClick={onSend}>전송</SendButton>
        </div>
      </div>
    </div>
  );
};

const modalStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '10px', // 화면 크기에 따라 패딩을 추가하여 모달이 고정되도록 설정
};

const modalContentStyles: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '90%',
  maxWidth: '300px', // 모달이 너무 커지지 않도록 최대 너비를 설정
  minWidth: '200px', // 모달의 최소 너비 설정
  height: 'auto',
  maxHeight: '90vh', // 최대 높이를 화면의 90%로 제한하여 과도하게 커지지 않도록 함
  overflow: 'auto', // 내용이 넘칠 경우 스크롤이 생기도록 설정
};

const imageStyles: React.CSSProperties = {
  width: '60%', // 이미지가 부모 요소의 100% 너비를 차지하도록 설정
  maxWidth: '100px', // 이미지 최대 너비를 250px로 제한
  height: 'auto', // 이미지의 비율을 유지하면서 높이를 자동으로 조절
  marginBottom: '5px', // 이미지와 버튼 간 간격
};

const fileNameStyles: React.CSSProperties = {
  fontSize: '14px',
  color: '#333',
  marginBottom: '10px',
};

const buttonContainerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '60%',
  gap: '10px', // 버튼 간의 간격을 좁히기 위해 gap을 사용
  marginTop: '10px',
};

const buttonStyles = `
  padding: 10px 20px;
  font-size: 14px;
  font-weight: bold;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  width: 45%; /* 버튼이 모달 내에서 적절히 배치되도록 설정 */
`;

const CancelButton = styled.button`
  ${buttonStyles}
  background-color: #ddd; /* 지정된 색상 #f4d03f 사용 */
  color: white;

  &:hover {
    background-color: #e1c234; /* 호버 시 색상 변경 */
  }
`;

const SendButton = styled.button`
  ${buttonStyles}
  background-color: #f4d03f; /* 지정된 색상 #f4d03f 사용 */
  color: white;

  &:hover {
    background-color: #e1c234; /* 호버 시 색상 변경 */
  }
`;

export default FilePreviewModal;
