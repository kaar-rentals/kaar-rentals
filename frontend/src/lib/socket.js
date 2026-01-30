import { io } from 'socket.io-client';

const SOCKET_BASE = import.meta.env.VITE_SOCKET_URL || '';

const socket = io(SOCKET_BASE, {
  path: '/socket.io',
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

export default socket;

