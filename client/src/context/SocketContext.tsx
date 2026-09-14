import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onAlert: (callback: (alert: any) => void) => void;
  onLog: (callback: (log: any) => void) => void;
  onIPBlocked: (callback: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const rawSocketUrl = (import.meta as any)?.env?.VITE_API_URL;
    const socketUrl = rawSocketUrl ? String(rawSocketUrl).replace(/\/$/, '') : undefined;
    const newSocket = io(socketUrl, {
      auth: { token },
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity
    });

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, isAuthenticated]);

  const onAlert = useCallback((callback: (alert: any) => void) => {
    if (socket) {
      socket.off('new-alert');
      socket.on('new-alert', callback);
    }
  }, [socket]);

  const onLog = useCallback((callback: (log: any) => void) => {
    if (socket) {
      socket.off('new-log');
      socket.on('new-log', callback);
    }
  }, [socket]);

  const onIPBlocked = useCallback((callback: (data: any) => void) => {
    if (socket) {
      socket.off('ip-blocked');
      socket.on('ip-blocked', callback);
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onAlert, onLog, onIPBlocked }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    // Return safe default when outside provider (e.g. login page)
    return {
      socket: null,
      isConnected: false,
      onAlert: () => {},
      onLog: () => {},
      onIPBlocked: () => {}
    };
  }
  return context;
};

export const useSocket = useSocketContext;
