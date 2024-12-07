import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import styled from 'styled-components';
import { User } from '../type/user';
import { useNavigate } from 'react-router-dom';
import { server_url } from '../common/serverConfig';

const ChatContainer = styled.div`
  width: 70%; /* 화면 너비의 70% */
  height: 85vh; /* 화면 높이의 80% */
  margin: 0 auto; /* 중앙 정렬 */
  display: flex;
  flex-direction: column;
  padding: 20px;
  position: relative;
  padding-bottom: 60px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
`;

const MessageContainer = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'isOwnMessage',
})<{ isOwnMessage: boolean }>`
  display: flex;
  flex-direction: ${props => (props.isOwnMessage ? 'row-reverse' : 'row')};
  margin-bottom: 15px;
  align-items: flex-start;
`;

const ProfileImage = styled.img.withConfig({
  shouldForwardProp: prop => prop !== 'isOwnMessage',
})<{ isOwnMessage: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: ${props => (props.isOwnMessage ? '0 0 5px 10px' : '0 10px 5px 0')};
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
`;

const Username = styled.div`
  font-weight: bold;
  font-size: 0.8rem;
  margin-bottom: 5px;
`;

const MessageText = styled.div`
  font-size: 0.9rem;
`;

const Timestamp = styled.div`
  margin-top: 5px;
  font-size: 0.7rem;
  color: #888;
  align-self: flex-end;
`;

const InputContainer = styled.div`
  width: 92%; /* 채팅창 전체 너비에 맞춤 */
  display: flex;
  padding: 10px;
  background-color: white;
  /* box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1); */
  position: absolute; /* 고정 위치가 아닌 채팅창 내에 배치 */
  bottom: 0; /* 하단에 위치 */
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 10px;
`;

const SendButton = styled.button`
  padding: 10px 20px;
  background-color: #f4d03f;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #e1b347;
  }
`;

const FileButton = styled.button`
  padding: 10px;
  background-color: #ddd;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;

  &:hover {
    background-color: #bbb;
  }
`;

/** 채팅 페이지 */
const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get('uid');
  const room_type = queryParams.get('room_type');
  const room_id = queryParams.get('room_id');
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<
    {
      sender_id: number;
      message: string;
      timestamp: string;
      sender_username: string;
      sender_profile_img: string;
      file_name: string;
      file_path: string;
    }[]
  >([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Parsing error:', error);
    }
  }, []);

  /** 메세지를 가져오는 useEffect (room_id에 의존성 존재) */
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${server_url}/chat/messages?room_id=${room_id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [room_id]);

  useEffect(() => {
    const newSocket = io(`${server_url}/chat`);
    setSocket(newSocket);
    console.log('Emitting joinRoom:', { room_id, uid, room_type });
    newSocket.emit('joinRoom', { uid, room_id, room_type });

    newSocket.on('receiveMessage', data => {
      console.log(data);
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('receiveFile', data => {
      console.log('data', data);
      setMessages(prev => [
        ...prev,
        {
          ...data,
        },
      ]);
    });

    return () => {
      newSocket.emit('leaveRoom', room_id);
      newSocket.disconnect();
    };
  }, [room_id, uid, room_type]);

  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.emit('sendMessage', {
        room_id: room_id,
        message: input,
        sender_id: user?.id,
        sender_email: user?.email,
        sender_username: user?.username,
        sender_profile_img: user?.profile_img,
        file: file ? { filename: file.name, buffer: file } : null,
      });
      setInput('');
      setFile(null);
    }
  };

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

  useEffect(() => {
    // 메시지가 업데이트될 때마다 자동으로 스크롤을 최신 메시지로 이동
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleGoBack = () => {
    navigate('/main');
  };

  const handleFileButtonClick = () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  };
  /** onloadend는 파일읽기가 끝나야 호출됌 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && socket && room_id) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileData = reader.result as string; // base64 데이터

        // 파일 전송
        socket.emit('sendFile', {
          room_id,
          file_name: file.name,
          file_data: fileData,
          sender_id: user?.id,
          sender_email: user?.email,
          sender_username: user?.username,
          sender_profile_img: user?.profile_img,
        });
      };
      reader.readAsDataURL(file); // 파일을 base64로 변환
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('fileDownload', data => {
        const { file_data, file_url } = data;

        // base64로 디코딩하여 Blob 객체로 변환
        const byteCharacters = atob(file_data); // base64 디코딩
        const byteArrays = [];

        // base64 데이터를 Blob으로 변환
        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
          const slice = byteCharacters.slice(offset, offset + 1024);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          byteArrays.push(new Uint8Array(byteNumbers));
        }

        const blob = new Blob(byteArrays, { type: 'application/octet-stream' });

        // 파일을 다운로드 링크로 변환
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = file_url.split('/').pop(); // 파일 이름을 다운로드 이름으로 설정
        downloadLink.click(); // 다운로드 시작
      });
    }
  }, [socket]);

  const handleFileClick = (fileUrl: string) => {
    if (socket) {
      socket.emit('downloadFile', { file_url: fileUrl }); // 다운로드 요청
    }
  };

  return (
    <ChatContainer>
      <button onClick={handleGoBack}>Back to Chat</button>
      <MessageList ref={messageListRef}>
        {messages.map((msg, index) => (
          <MessageContainer
            key={index}
            isOwnMessage={msg.sender_id === user?.id}
          >
            <ProfileImage
              src={
                msg.sender_profile_img && msg.sender_profile_img.trim() !== ''
                  ? msg.sender_profile_img
                  : '/maruu.jpg'
              }
              alt='profile'
              isOwnMessage={msg.sender_id === user?.id}
            />
            <MessageContent isOwnMessage={msg.sender_id === user?.id}>
              <Username>{msg.sender_username}</Username>
              <MessageText>{msg.message}</MessageText>
              {msg.file_path && (
                <div>
                  <button onClick={() => handleFileClick(msg.file_path)}>
                    {msg.file_name} 다운로드
                  </button>
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
        <SendButton onClick={sendMessage}>Send</SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatPage;
