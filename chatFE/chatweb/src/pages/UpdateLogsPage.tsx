import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

// 스타일 정의
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f9f9f9;
  font-family: 'Roboto', sans-serif;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1e2a47;
  margin-bottom: 20px;
`;

const LogList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  max-width: 800px;
`;

const LogItem = styled.li`
  background-color: #fff;
  padding: 15px;
  margin: 10px 0;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const Date = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #1e2a47;
  margin-bottom: 8px;
`;

const LogDescription = styled.div`
  font-size: 1rem;
  color: #555;
`;

const GoBackButton = styled.button`
  background-color: #f4d03f;
  color: white;
  border: none;
  padding: 5px;
  margin-top: -25px;
  transform: translate(-250px, 59px);
  font-size: 30px;
  border-radius: 50%;
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
    transform: translate(0%, 30%);
    width: 35px;
    height: 35px;
    font-size: 22px;
    margin-top: -3px;
  }
`;

const UpdateLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // JSON 파일을 public 폴더에서 fetch 가능
    fetch('./updateLogs.json')
      .then(response => response.json())
      .then(data => {
        setLogs(data);
      })
      .catch(error => console.error('Error loading update logs:', error));
  }, []);

  const handleGoBack = () => {
    navigate('/main');
  };

  return (
    <PageContainer>
      <GoBackButton onClick={handleGoBack}>
        <FiArrowLeft />
      </GoBackButton>
      <Title>업데이트 일지</Title>
      <LogList>
        {logs.map((log, index) => (
          <LogItem key={index}>
            <Date>{log.date}</Date>
            <LogDescription>
              {log.log.map((item: string, i: number) => (
                <React.Fragment key={i}>
                  {item}
                  <br />
                </React.Fragment>
              ))}
            </LogDescription>
          </LogItem>
        ))}
      </LogList>
    </PageContainer>
  );
};

export default UpdateLogsPage;
