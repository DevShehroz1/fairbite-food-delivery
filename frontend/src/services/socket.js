import { io } from 'socket.io-client';

const getURL = () => {
  // Production (Vercel): point directly to Render backend
  if (process.env.REACT_APP_SOCKET_URL) return process.env.REACT_APP_SOCKET_URL;
  // Local dev: connect directly to backend port (avoids proxy WebSocket issues)
  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:5001';
  // ngrok / other external: same origin proxied through React dev server
  const { protocol, port } = window.location;
  return `${protocol}//${hostname}${port ? ':' + port : ''}`;
};

const socket = io(getURL(), {
  transports: ['websocket', 'polling'],
  autoConnect: true,
});

export default socket;
