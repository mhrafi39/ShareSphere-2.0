import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage, setMessages, updateConversation } from '../features/messageSlice';
import { addNotification } from '../features/notificationSlice';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !token) {
      // Disconnect if user is not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create Socket.io connection
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const socketUrl = apiUrl.replace('/api', ''); // Remove /api for Socket.io connection
    const newSocket = io(socketUrl, {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket.io connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.io disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // User online/offline status
    newSocket.on('user-online', ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    newSocket.on('user-offline', ({ userId }) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    // Message events
    newSocket.on('new-message', (message) => {
      console.log('New message received:', message);
      dispatch(addMessage(message));
    });

    newSocket.on('message-sent', (message) => {
      console.log('Message sent confirmation:', message);
    });

    newSocket.on('conversation-updated', (data) => {
      console.log('Conversation updated:', data);
      dispatch(updateConversation(data));
    });

    newSocket.on('message-read-receipt', ({ messageId, conversationId, readBy }) => {
      console.log('Message read:', messageId);
      // You can dispatch an action to update message read status if needed
    });

    // Notification events
    newSocket.on('new-notification', (notification) => {
      console.log('New notification received:', notification);
      dispatch(addNotification(notification));
      
      // Show browser notification if permission is granted
      if (Notification.permission === 'granted') {
        new Notification('ShareSphere', {
          body: notification.message,
          icon: notification.sender?.avatar || '/logo.png',
        });
      }
    });

    // Typing events
    newSocket.on('user-typing', ({ userId, userName }) => {
      // You can dispatch an action or use a callback to show typing indicator
      console.log(`${userName} is typing...`);
    });

    newSocket.on('user-stop-typing', ({ userId }) => {
      console.log(`User stopped typing`);
    });

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user, token, dispatch]);

  // Request notification permissions on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Socket helper methods
  const joinConversation = (conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('join-conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-conversation', conversationId);
    }
  };

  const emitTyping = (conversationId, receiverId) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { conversationId, receiverId });
    }
  };

  const emitStopTyping = (conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('stop-typing', { conversationId });
    }
  };

  const emitMessageRead = (messageId, conversationId, senderId) => {
    if (socketRef.current) {
      socketRef.current.emit('message-read', { messageId, conversationId, senderId });
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    emitTyping,
    emitStopTyping,
    emitMessageRead,
    isUserOnline,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
