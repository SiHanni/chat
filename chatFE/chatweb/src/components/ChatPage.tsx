import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import styled from 'styled-components';
import { User } from '../type/user';
import { useNavigate } from 'react-router-dom';
import { server_url } from '../common/serverConfig';
import { Message } from '../type/chat';
import FilePreviewModal from './FilePreviewModal';
import { FiArrowLeft } from 'react-icons/fi';
import BasicModal from './BasicModal';
import axios from 'axios';

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: -1px 0;

  @media (max-width: 768px) {
    align-items: flex-start;
    height: 15px;
  }
`;

const RoomName = styled.h1`
  margin-left: 25px; /* GoBackButton과 채팅방 이름 사이의 간격 설정 */
  font-size: 18px;
  font-weight: normal;
  margin-top: -20px;

  @media (max-width: 768px) {
    font-size: 13px; /* 작은 화면에서는 폰트 크기 조정 */
    margin-left: 15px; /* 모바일에서 왼쪽 여백 제거 */
    margin-top: -5px;
  }
`;

const GoBackButton = styled.button`
  background-color: #f4d03f; /* 전송 버튼과 동일한 색상 */
  color: white;
  border: none;
  padding: 5px;
  margin-top: -15px;
  transform: translateY(-10px);
  font-size: 30px;
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
    font-size: 22px;
    margin-top: -3px;
  }
`;

const ChatContainer = styled.div`
  width: 60%;
  height: 85vh;
  margin: 0 auto; /* 중앙 정렬 */
  display: flex;
  flex-direction: column;
  padding: 25px;
  position: relative;
  padding-top: 40px;
  padding-bottom: 70px;
  background-color: #fff;
  border-radius: 10px;

  @media (max-width: 768px) {
    width: 90%;
    padding: 15px;
  }
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto; /* 자동 스크롤 */
  overflow-x: hidden;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding-right: 0px;
  }
`;

const MessageContainer = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'isOwnMessage',
})<{ isOwnMessage: boolean }>`
  display: flex;
  flex-direction: ${props => (props.isOwnMessage ? 'row-reverse' : 'row')};
  margin-bottom: 15px;
  align-items: flex-start;

  @media (max-width: 768px) {
    margin-bottom: 5px; /* 작은 화면에서 메시지 간격 줄이기 */
  }
`;

const ProfileImage = styled.img.withConfig({
  shouldForwardProp: prop => prop !== 'isOwnMessage',
})<{ isOwnMessage: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: ${props => (props.isOwnMessage ? '0 0 5px 10px' : '0 10px 5px 0')};

  @media (max-width: 768px) {
    width: 33px;
    height: 33px;
  }
`;

const MessageContent = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'isOwnMessage',
})<{ isOwnMessage: boolean }>`
  max-width: 60%;
  background-color: ${props => (props.isOwnMessage ? '#d1e7dd' : '#f1f1f1')};
  padding: 10px;
  border-radius: 10px;
  font-size: 1rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: ${props => (props.isOwnMessage ? 'flex-end' : 'flex-start')};

  @media (max-width: 768px) {
    max-width: 40%;
    font-size: 0.75rem;
  }
`;

const Username = styled.div`
  font-weight: bold;
  font-size: 0.8rem;
  margin-bottom: 5px;

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;
/** overflow-wrap: 컨테이너 크기를 넘어서면 줄바꿈 발생 */
const MessageText = styled.div`
  font-size: 0.9rem;
  word-break: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const Timestamp = styled.div`
  margin-top: 5px;
  font-size: 0.7rem;
  color: #888;
  align-self: flex-end;

  @media (max-width: 768px) {
    font-size: 0.6rem;
  }
`;

const InputContainer = styled.div`
  width: 90%;
  display: flex;
  padding: 20px 10px;
  background-color: white;
  position: absolute;
  bottom: 0;
  gap: 10px;

  @media (max-width: 768px) {
    width: 90%;
    height: 8%;
    padding: 5px 10px;

    bottom: -50px;
    gap: 7px;
  }
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 15px;

  @media (max-width: 768px) {
    padding: 9px; /* 작은 화면에서 입력창 여백 줄이기 */
  }
`;

const SendButton = styled.button`
  padding: 10px 20px;
  background-color: #f4d03f;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap;
  margin-right: 5px;
  margin-left: -15px;

  &:hover {
    background-color: #e1b347;
  }

  @media (max-width: 768px) {
    padding: 5px 13px; /* 작은 화면에서 버튼 크기 줄이기 */
    margin-right: 5px;
  }
`;

const FileButton = styled.button`
  padding: 10px;
  background-color: #ddd;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 5px;
  margin-left: -15px;
  padding-bottom: -10px;

  &:hover {
    background-color: #bbb;
  }

  @media (max-width: 768px) {
    padding: 10px; /* 작은 화면에서 버튼 크기 줄이기 */
  }
`;

const DownloadButton = styled.button`
  background-color: #fcf1c0;
  border: none;
  border-radius: 12px; /* 둥근 모서리 */
  padding: 10px 20px; /* 버튼 안의 여백 */
  font-size: 13px; /* 글자 크기 */
  color: black; /* 글자 색 */
  cursor: pointer; /* 마우스를 올렸을 때 커서 변경 */
  transition: background-color 0.3s ease; /* 배경색 변화 효과 */

  &:hover {
    background-color: #bbb;
  }

  @media (max-width: 768px) {
    padding: 5px 12px;
    font-size: 12px;
  }
`;

/** 채팅 페이지 */
const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { room_type, room_id, uid } = location.state || {};
  const [user, setUser] = useState<User | null>(null);
  const [roomName, setRoomName] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showFilePreviewModal, setShowFilePreviewModal] = useState<
    boolean | null
  >(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const messageListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!room_type || !room_id || !uid) {
      console.error('Missing required chat room information');
      navigate('/');
    }
  }, [room_type, room_id, uid, navigate]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        navigate('/');
      }
    } catch (error) {
      //console.error('Parsing error:', error);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    const socketInstance = io(`${server_url}/chat`, {
      auth: { token },
    });

    socketInstance.emit('join:room', { uid, room_id, room_type });

    socketInstance.on('broadcast:message', data => {
      //console.log('broadcastMessage:', data);
      setMessages(prev => [...prev, data]);
    });

    socketInstance.on('broadcast:file', data => {
      //console.log('broadcastFile data:', data);
      setMessages(prev => [
        ...prev,
        {
          ...data,
        },
      ]);
    });
    setSocket(socketInstance);

    return () => {
      socketInstance.emit('leave:room', { uid, room_id, room_type });
      socketInstance.disconnect();
      //console.log('DISCONNECT');
    };
  }, [room_id, uid, room_type]);

  useEffect(() => {
    let pingInterval: any;

    if (socket) {
      pingInterval = setInterval(() => {
        //console.log('Sending ping...');
        socket.emit('ping');
      }, 10000); // 10초

      socket.on('pong', data => {
        //console.log('Received pong:', data);
      });
    }

    return () => {
      if (pingInterval) {
        clearInterval(pingInterval);
      }
      if (socket) {
        socket.off('pong');
      }
    };
  }, [socket]);

  /** 메세지를 가져오는 useEffect (room_id에 의존성 존재) */
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${server_url}/chat/messages`, {
          params: {
            room_id: room_id,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setRoomName(response.data.room_name);
        setMessages(
          Array.isArray(response.data.messages) ? response.data.messages : []
        );
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [room_id]);

  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.emit('send:message', {
        room_id: room_id,
        message: input,
        sender_id: user?.id,
        sender_email: user?.email,
        sender_username: user?.username,
        sender_profile_img:
          user?.profile_img !== null
            ? user?.profile_img
            : 'https://marutalk-build.s3.ap-northeast-2.amazonaws.com/maruu.jpeg',
        file: selectedFile
          ? { filename: selectedFile.name, buffer: selectedFile }
          : null,
      });
      setInput('');
      setSelectedFile(null);
    }
  };

  const handleFileButtonClick = () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  };

  /** onloadend는 파일읽기가 끝나야 호출됌 */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;
    setFilePreview(null);
    setFileName(null);

    if (file.size > 5 * 1024 * 1024) {
      setModalMessage(
        '파일 크기가 너무 큽니다.\n5MB 이하의 파일만 가능합니다.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
    setShowFilePreviewModal(true);
  };

  const handleSendFile = async () => {
    if (!selectedFile || !socket || !room_id) return;

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileData = reader.result as ArrayBuffer;

        socket.emit('send:file', {
          room_id,
          file_name: selectedFile.name,
          file_data: fileData, // ArrayBuffer 형태로 파일 데이터를 전송
          content_type: selectedFile.type,
          sender_id: user?.id,
          sender_email: user?.email,
          sender_username: user?.username,
          sender_profile_img:
            user?.profile_img ||
            'https://marutalk-build.s3.ap-northeast-2.amazonaws.com/maruu.jpeg',
          file: selectedFile
            ? { filename: selectedFile.name, buffer: selectedFile }
            : null,
        });
      };

      reader.readAsArrayBuffer(selectedFile); // ArrayBuffer로 파일 읽기
      setShowFilePreviewModal(false); // 전송 후 모달 닫기
    } catch (error) {
      setModalMessage('파일 전송 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    if (!socket) return;

    // 서버에서 fileUploadStatus 이벤트를 받는 리스너 설정
    const handleFileUploadStatus = (statusData: any) => {
      const { status, message } = statusData;
      if (status === 'failed') {
        setModalMessage(message); // 서버에서 받은 메시지를 모달에 표시
      }
    };

    socket.on('alert:file-upload-status', handleFileUploadStatus);

    // 컴포넌트가 언마운트될 때 이벤트 리스너 정리
    return () => {
      socket.off('alert:file-upload-status', handleFileUploadStatus);
    };
  }, [socket]);

  const handleFileClick = (fileUrl: string) => {
    if (socket) {
      socket.emit('download:file', { file_url: fileUrl }); // 다운로드 요청
    }
  };

  const handleCancelFilePreview = () => {
    setShowFilePreviewModal(null); // 취소 버튼 클릭 시 모달 닫기
    setFilePreview(null); // 초기화
    setFileName(null); // 초기화
    setSelectedFile(null); //초기화
  };

  useEffect(() => {
    if (socket) {
      socket.on('send:file-data', data => {
        const { file_data, file_url, original_file_name } = data;

        const blob = new Blob([file_data], {
          type: 'application/octet-stream',
        });

        // 파일을 다운로드 링크로 변환
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = original_file_name || file_url.split('/').pop();
        downloadLink.click();
      });
    }
  }, [socket]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // 한글 입력 시작
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  // 한글 입력 끝났을 때
  const handleCompositionEnd = () => {
    setIsComposing(false); // 한글 입력 종료
  };

  // 엔터키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing && input.trim()) {
      sendMessage(); // 한글 입력이 끝난 후에만 전송
    }
  };

  /** 자동으로 스크롤을 최신 메시지로 이동 */
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleGoBack = () => {
    navigate('/main');
  };

  const handleCloseModal = () => {
    setModalMessage(null); // 모달 닫기
  };

  const getFileExtension = (filename: string) => {
    const match = filename.match(/\.(jpg|jpeg|png|gif|webp|pdf)$/i);
    return match ? match[0] : null; // 이미지 확장자일 경우 확장자 반환, 아니면 null 반환
  };

  return (
    <div>
      <ChatContainer>
        <ChatHeader>
          <GoBackButton onClick={handleGoBack}>
            <FiArrowLeft />
          </GoBackButton>
          <RoomName>{roomName}</RoomName>
        </ChatHeader>
        <MessageList ref={messageListRef}>
          {messages.map((msg, index) => (
            <MessageContainer
              key={index}
              isOwnMessage={msg.sender_id === user?.id}
            >
              {msg.sender_id !== user?.id && (
                <ProfileImage
                  src={
                    msg.sender_profile_img &&
                    msg.sender_profile_img.trim() !== ''
                      ? msg.sender_profile_img
                      : '/maruu.jpeg'
                  }
                  alt='profile'
                  isOwnMessage={msg.sender_id === user?.id}
                />
              )}
              <MessageContent isOwnMessage={msg.sender_id === user?.id}>
                <Username>{msg.sender_username}</Username>
                <MessageText>{msg.message}</MessageText>
                {msg.file_path && (
                  <div>
                    {getFileExtension(msg.file_name) ? (
                      // 이미지 파일인 경우
                      <img
                        src={msg.file_path}
                        alt='file preview'
                        style={{
                          width: '100px',
                          height: 'auto',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleFileClick(msg.file_path)} // 파일 클릭 시 다운로드 처리
                      />
                    ) : (
                      // 이미지 파일이 아닌 경우 파일명 표시
                      <DownloadButton
                        onClick={() => handleFileClick(msg.file_path)}
                      >
                        {msg.file_name}
                      </DownloadButton>
                    )}
                  </div>
                )}

                <Timestamp>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Timestamp>
              </MessageContent>
            </MessageContainer>
          ))}
        </MessageList>
        <InputContainer>
          {/* FileButton을 label로 감싸서 클릭 시 input이 트리거되도록 */}
          <label htmlFor='fileInput'>
            <FileButton onClick={handleFileButtonClick}>+</FileButton>
          </label>
          <input
            type='file'
            id='fileInput'
            style={{ display: 'none' }} // input을 숨기고 label로 대체
            onChange={handleFileChange}
          />
          <Input
            type='text'
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
          />
          <SendButton
            onClick={() => {
              if (input.trim()) sendMessage();
              //if (selectedFile) handleSendFile();
            }}
          >
            전송
          </SendButton>
        </InputContainer>

        {showFilePreviewModal && (
          <FilePreviewModal
            filePreview={filePreview}
            fileName={fileName}
            onClose={handleCancelFilePreview}
            onSend={handleSendFile}
          />
        )}
      </ChatContainer>
      {modalMessage && (
        <BasicModal modalMsg={modalMessage} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default ChatPage;
