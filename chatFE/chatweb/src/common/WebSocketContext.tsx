import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { server_url } from './serverConfig';

// createContext : React에서 제공하는 Context
interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectWebSocket: (token: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connectWebSocket = (token: string) => {
    if (socketRef.current) return;

    const socket = io(`${server_url}/chat`, {
      transports: ['websocket'],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      //console.log('WebSocket connected!');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      //console.log('WebSocket disconnected!;;');
    });

    // Heartbeat (Ping-Pong)
    // 소켓이 연결되있어야 보내는 핑퐁이기 떄문에 재연결 정책이 제대로 되어 있지 않은듯 하다.
    const interval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping', 'heartbeat');
      }
    }, 30000); // 30초마다 핑

    socket.on('pong', message => {
      //console.log('Pong received:', message);
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      connectWebSocket(token);
    }

    return () => {
      // 컴포넌트 언마운트 시 소켓 연결 해제
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{ socket: socketRef.current, isConnected, connectWebSocket }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
