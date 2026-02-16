import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { apiSlice } from '../services/apiSlice';
import { useDispatch } from 'react-redux';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3008';

const useSocket = (boardId) => {
  const socketRef = useRef(null);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token || !boardId) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('join:board', boardId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Listen for real-time events and invalidate cache
    const events = [
      'board:updated',
      'list:created',
      'list:updated',
      'list:deleted',
      'task:created',
      'task:updated',
      'task:moved',
      'task:deleted',
      'member:added',
      'member:removed',
    ];

    events.forEach((event) => {
      socket.on(event, () => {
        dispatch(apiSlice.util.invalidateTags([{ type: 'Board', id: boardId }]));
      });
    });

    return () => {
      socket.emit('leave:board', boardId);
      socket.disconnect();
    };
  }, [token, boardId, dispatch]);

  return socketRef.current;
};

export default useSocket;
