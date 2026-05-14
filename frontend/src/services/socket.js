import { io } from 'socket.io-client';

const PROD_SOCKET = 'https://quickbite-backend-two.vercel.app';

const getURL = () => {
  if (process.env.REACT_APP_SOCKET_URL) return process.env.REACT_APP_SOCKET_URL;
  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:5001';
  return PROD_SOCKET;
};

const socket = io(getURL(), {
  transports: ['websocket', 'polling'],
  autoConnect: true,
});

export default socket;
