require('dotenv').config();
const http       = require('http');
const { Server } = require('socket.io');
const app        = require('./app');

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
});

// Make io available to controllers via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Rider joins their own room to receive order notifications
  socket.on('join_rider', () => {
    socket.join('riders');
    console.log(`Rider joined: ${socket.id}`);
  });

  // Customer joins order-specific room to receive live updates
  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Customer watching order: ${orderId}`);
  });

  // Rider broadcasts their GPS location
  socket.on('rider_location', ({ orderId, lat, lng }) => {
    io.to(`order_${orderId}`).emit('rider_location', { lat, lng });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('FairBite Backend + Socket.io + Supabase Started!');
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
