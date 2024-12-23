import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';
import { server_url } from '../common/serverConfig';

interface WebSocketProviderProps {
  children: ReactNode;
}
const WebSocketContext = createContext<Socket | null>(null);

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const isLoggedIn = Boolean(localStorage.getItem('accessToken'));

  useEffect(() => {
    if (isLoggedIn && !socket) {
      const token = localStorage.getItem('accessToken');

      if (token) {
        const socketInstance = io(`${server_url}`, {
          auth: { token },
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
        });

        socketInstance.on('connect', () => {
          console.log('Connected to WebSocket');
        });

        socketInstance.on('disconnect', () => {
          console.log('Disconnected from WebSocket');
        });

        socketInstance.on('reconnect_attempt', () => {
          setIsReconnecting(true);
        });

        socketInstance.on('reconnect', attemptNumber => {
          console.log(`Reconnected after ${attemptNumber} attempts`);
          setIsReconnecting(false);
        });

        socketInstance.on('reconnect_error', error => {
          console.error('Reconnection failed:', error);
        });

        setSocket(socketInstance);
      }
    } else if (!isLoggedIn && socket) {
      socket.disconnect(); // 로그인하지 않으면 웹소켓 연결 해제
      setSocket(null);
    }

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [isLoggedIn, socket]);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
      {isReconnecting && <div>Reconnecting to the server...</div>}{' '}
      {/* 재연결 중 메시지 */}
    </WebSocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(WebSocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a WebSocketProvider');
  }
  return socket;
};
