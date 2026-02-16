import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { apiSlice } from '../services/apiSlice';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3008';

export default function useSocket(boardId) {
  const socketRef = useRef(null);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token || !boardId) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => socket.emit('join:board', boardId));

    // refetch board data when anything changes
    const refresh = () => dispatch(apiSlice.util.invalidateTags([{ type: 'Board', id: boardId }]));

    socket.on('board:updated', refresh);
    socket.on('list:created', refresh);
    socket.on('list:updated', refresh);
    socket.on('list:deleted', refresh);
    socket.on('task:created', refresh);
    socket.on('task:updated', refresh);
    socket.on('task:moved', refresh);
    socket.on('task:deleted', refresh);
    socket.on('member:added', refresh);
    socket.on('member:removed', refresh);

    return () => {
      socket.emit('leave:board', boardId);
      socket.disconnect();
    };
  }, [token, boardId, dispatch]);

  return socketRef;
}
