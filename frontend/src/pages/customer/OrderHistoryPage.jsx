import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, Box, Chip, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const STATUS_COLORS = {
  pending: 'warning', confirmed: 'info', preparing: 'info',
  'ready-for-pickup': 'info', 'picked-up': 'primary', 'on-the-way': 'primary',
  delivered: 'success', cancelled: 'error',
};

const DEMO_ORDERS = [
  { _id: 'o1', orderNumber: 'FB202604001', status: 'delivered', pricing: { total: 950 }, createdAt: new Date(), restaurant: { name: 'Karachi Grill House' } },
  { _id: 'o2', orderNumber: 'FB202603045', status: 'delivered', pricing: { total: 650 }, createdAt: new Date(Date.now() - 86400000), restaurant: { name: 'Pizza Palace' } },
];

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/orders')
      .then(res => setOrders(res.data.data?.length ? res.data.data : DEMO_ORDERS))
      .catch(() => setOrders(DEMO_ORDERS))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>My Orders</Typography>
      {orders.length === 0 ? (
        <Box textAlign="center" mt={8}>
          <Typography variant="h2">🍽️</Typography>
          <Typography variant="h6" mt={2}>No orders yet</Typography>
          <Button variant="contained" onClick={() => navigate('/restaurants')} sx={{ mt: 2 }}>Order Now</Button>
        </Box>
      ) : (
        orders.map(order => (
          <Card key={order._id} sx={{ p: 3, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography fontWeight={700}>#{order.orderNumber}</Typography>
              <Typography variant="body2" color="text.secondary">{order.restaurant?.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(order.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Chip label={order.status.replace(/-/g, ' ')} color={STATUS_COLORS[order.status] || 'default'} sx={{ textTransform: 'capitalize' }} />
            <Box textAlign="right">
              <Typography fontWeight={700} color="primary">PKR {order.pricing?.total}</Typography>
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <Button size="small" onClick={() => navigate(`/orders/${order._id}/track`)}>Track</Button>
              )}
            </Box>
          </Card>
        ))
      )}
    </Container>
  );
};

export default OrderHistoryPage;
