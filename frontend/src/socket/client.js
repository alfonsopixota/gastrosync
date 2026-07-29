import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_SOCKET_URL || '';

const getToken = () => localStorage.getItem('gastrosync_token');

const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10,
  auth: () => ({
    token: getToken(),
  }),
});

export default socket;
