import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_SOCKET_URL || '';

const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10,
});

export default socket;
