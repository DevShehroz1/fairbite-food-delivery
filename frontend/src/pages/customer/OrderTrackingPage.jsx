import React, { useState, useEffect, useRef } from 'react';
import { Container, Box, Typography, Card, CardContent, Stepper, Step, StepLabel, Avatar, Chip, LinearProgress, Divider, Button } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked, TwoWheeler, Home, Restaurant, LocalDining } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { runDemoOrder, DEMO_RIDER_INFO, isDemoMode } from '../../services/demoService';
import api from '../../services/api';

const ORDER_STAGES = [
  { key: 'pending',           label: 'Order Placed',       icon: '📋', desc: 'Waiting for restaurant' },
  { key: 'confirmed',         label: 'Confirmed',          icon: '✅', desc: 'Restaurant accepted' },
  { key: 'preparing',         label: 'Preparing',          icon: '👨‍🍳', desc: 'Chef is cooking' },
  { key: 'ready-for-pickup',  label: 'Ready',              icon: '🎁', desc: 'Food is ready' },
  { key: 'picked-up',         label: 'Picked Up',          icon: '🏍️', desc: 'Rider has your food' },
  { key: 'on-the-way',        label: 'On The Way',         icon: '🚀', desc: 'Heading to you' },
  { key: 'delivered',         label: 'Delivered',          icon: '🎉', desc: 'Enjoy your meal!' },
];

// Simple animated map placeholder (replace with Google Maps when API key available)
const TrackingMap = ({ riderPos, restaurantPos, deliveryPos }) => (
  <Box sx={{
    height: 280, borderRadius: 3, bgcolor: '#e8f5e9', position: 'relative', overflow: 'hidden',
    backgroundImage: 'linear-gradient(#e8f5e9 1px, transparent 1px), linear-gradient(90deg, #e8f5e9 1px, transparent 1px)',
    backgroundSize: '30px 30px',
    backgroundPosition: '-1px -1px',
    border: '2px solid #c8e6c9',
  }}>
    {/* Fake roads */}
    <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 8, bgcolor: '#bdbdbd', opacity: 0.5 }} />
    <Box sx={{ position: 'absolute', left: '40%', top: 0, bottom: 0, width: 8, bgcolor: '#bdbdbd', opacity: 0.5 }} />

    {/* Restaurant pin */}
    <Box sx={{ position: 'absolute', top: '30%', left: '35%', textAlign: 'center' }}>
      <Typography sx={{ fontSize: 28 }}>🍽️</Typography>
      <Chip label="Restaurant" size="small" sx={{ bgcolor: 'white', fontSize: 10 }} />
    </Box>

    {/* Delivery pin */}
    <Box sx={{ position: 'absolute', top: '65%', left: '65%', textAlign: 'center' }}>
      <Typography sx={{ fontSize: 28 }}>🏠</Typography>
      <Chip label="Your Location" size="small" sx={{ bgcolor: 'white', fontSize: 10 }} />
    </Box>

    {/* Rider pin — animated */}
    {riderPos && (
      <motion.div
        style={{ position: 'absolute' }}
        animate={{
          top: `${30 + (riderPos.progress || 0) * 35}%`,
          left: `${35 + (riderPos.progress || 0) * 30}%`,
        }}
        transition={{ duration: 0.3 }}
      >
        <Typography sx={{ fontSize: 32 }}>🏍️</Typography>
      </motion.div>
    )}

    <Typography variant="caption" sx={{ position: 'absolute', bottom: 8, right: 8, color: 'text.secondary' }}>
      Live Tracking (Demo)
    </Typography>
  </Box>
);

const RiderCard = ({ rider }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <Card sx={{ bgcolor: 'primary.main', color: 'white', mt: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>Your Rider</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={rider.avatar} sx={{ width: 56, height: 56, border: '2px solid white' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700}>{rider.name}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>{rider.vehicle}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <Typography variant="body2">⭐ {rider.rating}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>• {rider.totalDeliveries} deliveries</Typography>
            </Box>
          </Box>
          <Button variant="outlined" size="small" sx={{ borderColor: 'white', color: 'white' }}>
            📞 Call
          </Button>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('pending');
  const [statusMessage, setStatusMessage] = useState('Order placed! Waiting for restaurant...');
  const [riderPos, setRiderPos] = useState(null);
  const [riderProgress, setRiderProgress] = useState(0);
  const [order, setOrder] = useState(null);
  const cancelDemoRef = useRef(null);

  const currentStageIndex = ORDER_STAGES.findIndex(s => s.key === status);
  const isOnTheWay = status === 'on-the-way' || status === 'delivered';
  const isDelivered = status === 'delivered';

  useEffect(() => {
    // Load order from API
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.data);
        setStatus(data.data.status);
      } catch {
        // Use demo data if not connected
        setOrder({ orderNumber: 'FB202604DEMO', pricing: { subtotal: 1450, deliveryFee: 50, platformFee: 218, total: 1500 } });
      }
    };
    fetchOrder();

    // Start demo mode if enabled
    if (isDemoMode()) {
      toast.info('Demo Mode: Order will auto-progress through all stages!', { autoClose: 4000 });

      cancelDemoRef.current = runDemoOrder({
        onStatusChange: (newStatus, message) => {
          setStatus(newStatus);
          setStatusMessage(message);
          toast.info(message, { autoClose: 3000 });

          if (newStatus === 'delivered') {
            toast.success('Order delivered! Rate your experience!', { autoClose: 5000 });
          }
        },
        onRiderLocationChange: (coords) => {
          setRiderProgress(prev => Math.min(prev + 0.02, 1));
          setRiderPos({ ...coords, progress: riderProgress });
        },
        restaurantCoords: { lat: 24.8607, lng: 67.0011 },
        deliveryCoords: { lat: 24.8800, lng: 67.0150 },
      });
    }

    return () => {
      if (cancelDemoRef.current) cancelDemoRef.current();
    };
  }, [id]);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom textAlign="center">
        Track Your Order
      </Typography>
      {order && (
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
          Order #{order.orderNumber}
        </Typography>
      )}

      {/* Status banner */}
      <motion.div key={status} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Card sx={{
          p: 3, textAlign: 'center', mb: 3,
          bgcolor: isDelivered ? 'secondary.main' : 'primary.main',
          color: 'white',
        }}>
          <Typography variant="h2" mb={1}>{ORDER_STAGES.find(s => s.key === status)?.icon}</Typography>
          <Typography variant="h5" fontWeight={700}>
            {ORDER_STAGES.find(s => s.key === status)?.label}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>{statusMessage}</Typography>

          {isDemoMode() && !isDelivered && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={(currentStageIndex / (ORDER_STAGES.length - 1)) * 100} sx={{ bgcolor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }} />
              <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                Demo auto-progress: {currentStageIndex + 1} of {ORDER_STAGES.length} stages
              </Typography>
            </Box>
          )}
        </Card>
      </motion.div>

      {/* Progress stepper */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Order Progress</Typography>
        {ORDER_STAGES.map((stage, idx) => {
          const done = idx <= currentStageIndex;
          const active = idx === currentStageIndex;
          return (
            <Box key={stage.key} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: done ? 'primary.main' : 'grey.200',
                  color: done ? 'white' : 'text.disabled',
                  transition: 'all 0.3s',
                  transform: active ? 'scale(1.2)' : 'scale(1)',
                }}>
                  {done ? <CheckCircle fontSize="small" /> : <Typography variant="caption">{idx + 1}</Typography>}
                </Box>
                {idx < ORDER_STAGES.length - 1 && (
                  <Box sx={{ width: 2, height: 24, bgcolor: done ? 'primary.main' : 'grey.200', mt: 0.5, transition: 'all 0.3s' }} />
                )}
              </Box>
              <Box sx={{ pt: 0.5 }}>
                <Typography variant="subtitle2" fontWeight={active ? 700 : 400} color={done ? 'primary' : 'text.secondary'}>
                  {stage.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">{stage.desc}</Typography>
              </Box>
            </Box>
          );
        })}
      </Card>

      {/* Map — show when rider is on the way */}
      <AnimatePresence>
        {isOnTheWay && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card sx={{ mb: 3, overflow: 'hidden' }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <TrackingMap riderPos={{ progress: riderProgress }} />
              </CardContent>
            </Card>

            {/* Rider info */}
            <RiderCard rider={DEMO_RIDER_INFO} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing breakdown */}
      {order && (
        <Card sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Transparent Pricing</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Food Subtotal</Typography>
            <Typography variant="body2">PKR {order.pricing?.subtotal}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Delivery Fee</Typography>
            <Typography variant="body2">PKR {order.pricing?.deliveryFee}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Platform Fee (15%)</Typography>
            <Typography variant="body2">PKR {order.pricing?.platformFee}</Typography>
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" fontWeight={700}>Total Paid</Typography>
            <Typography variant="subtitle1" fontWeight={700} color="primary">PKR {order.pricing?.total}</Typography>
          </Box>
          <Typography variant="caption" color="secondary.main" sx={{ mt: 1, display: 'block' }}>
            FairBite charged 15% platform fee vs. 25-35% on other platforms — saving restaurants money which means better food for you!
          </Typography>
        </Card>
      )}

      {isDelivered && (
        <Button fullWidth variant="contained" size="large" sx={{ mt: 3 }} onClick={() => navigate('/orders')}>
          Rate Your Experience
        </Button>
      )}
    </Container>
  );
};

export default OrderTrackingPage;
