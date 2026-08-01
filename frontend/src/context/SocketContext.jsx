import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Teardown connections if no active authenticated user session exists
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setNotifications([]);
      return;
    }

    // Dynamically map API_BASE_URL to Socket URL
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    const socketUrl = apiBaseUrl.replace('/api/v1', '');

    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      upgrade: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('⚡ [AlphaMatrix Socket] Connected to real-time alerts server');
    });

    newSocket.on('notification', (noti) => {
      setNotifications((prev) => [noti, ...prev]);

      // Broadcast event globally so ToastProvider can pick it up
      window.dispatchEvent(new CustomEvent('app-toast', { detail: noti }));
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 [AlphaMatrix Socket] Disconnected from alerts server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, setNotifications, markAllAsRead, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
