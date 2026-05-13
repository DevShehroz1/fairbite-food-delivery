require('dotenv').config();
const http       = require('http');
const { Server } = require('socket.io');
const app        = require('./app');

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT'] },
  transports: ['websocket', 'polling'],
});

// Track online riders: userId -> socketId (for auto-assignment)
const onlineRiders = new Map();
app.set('io', io);
app.set('onlineRiders', onlineRiders);

io.on('connection', (socket) => {
  // Rider comes online — joins personal room + global riders pool
  socket.on('join_rider', ({ userId } = {}) => {
    socket.join('riders');
    if (userId) {
      socket.join(`rider_${userId}`);
      onlineRiders.set(userId, socket.id);
      socket.data.userId = userId;
      socket.data.role = 'rider';
    }
  });

  // Restaurant comes online — joins restaurant-specific room
  socket.on('join_restaurant', ({ restaurantId } = {}) => {
    if (restaurantId) {
      socket.join(`restaurant_${restaurantId}`);
      socket.data.restaurantId = restaurantId;
      socket.data.role = 'restaurant';
    }
  });

  // Customer tracks a specific order
  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`);
  });

  // Rider broadcasts GPS location to customer
  socket.on('rider_location', ({ orderId, lat, lng }) => {
    io.to(`order_${orderId}`).emit('rider_location', { lat, lng });
  });

  socket.on('disconnect', () => {
    if (socket.data.role === 'rider' && socket.data.userId) {
      onlineRiders.delete(socket.data.userId);
    }
  });
});

server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('QuickBite Backend + Socket.io + Supabase Started!');
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
