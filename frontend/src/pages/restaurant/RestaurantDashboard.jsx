import React, { useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, Chip, Button, Tab, Tabs } from '@mui/material';
import { TrendingUp, ShoppingBag, Star, AttachMoney } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DEMO_ORDERS = [
  { _id: 'o1', orderNumber: 'FB202604001', status: 'preparing', pricing: { total: 950 }, customer: { name: 'Ahmed Khan' }, items: [{ name: 'Chicken Karahi', quantity: 1 }] },
  { _id: 'o2', orderNumber: 'FB202604002', status: 'confirmed', pricing: { total: 650 }, customer: { name: 'Sara Ali' }, items: [{ name: 'Mutton Biryani', quantity: 2 }] },
  { _id: 'o3', orderNumber: 'FB202603045', status: 'delivered', pricing: { total: 1200 }, customer: { name: 'Usman Malik' }, items: [{ name: 'Beef Nihari', quantity: 1 }] },
];

const STATUS_COLORS = { pending: 'warning', confirmed: 'info', preparing: 'info', 'ready-for-pickup': 'success', delivered: 'success', cancelled: 'error' };

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);

  const stats = [
    { icon: <ShoppingBag />, label: 'Total Orders', value: '847', color: '#2196F3' },
    { icon: <TrendingUp />, label: 'Revenue', value: 'PKR 284K', color: '#4CAF50' },
    { icon: <Star />, label: 'Avg Rating', value: '4.7 ⭐', color: '#FF9800' },
    { icon: <AttachMoney />, label: 'Commission Rate', value: '15%', color: '#FF5722', note: 'vs 25-35% elsewhere' },
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Restaurant Dashboard</Typography>
      <Typography color="text.secondary" mb={4}>Welcome back, {user?.name}</Typography>

      {/* Stats */}
      <Grid container spacing={3} mb={4}>
        {stats.map(s => (
          <Grid item xs={6} md={3} key={s.label}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ color: s.color }}>{s.icon}</Box>
                  <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                </Box>
                <Typography variant="h5" fontWeight={700}>{s.value}</Typography>
                {s.note && <Typography variant="caption" color="secondary.main">{s.note}</Typography>}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Commission savings highlight */}
      <Card sx={{ bgcolor: 'secondary.main', color: 'white', p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight={700}>Fair Commission Savings</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          With FairBite at 15% vs Foodpanda at 30%, on PKR 284,000 revenue you saved approximately{' '}
          <strong>PKR 42,600</strong> this month.
        </Typography>
      </Card>

      {/* Orders tab */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Active Orders" />
        <Tab label="Order History" />
      </Tabs>

      {DEMO_ORDERS.filter(o => tab === 0 ? ['pending','confirmed','preparing','ready-for-pickup'].includes(o.status) : ['delivered','cancelled'].includes(o.status))
        .map(order => (
          <Card key={order._id} sx={{ p: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography fontWeight={700}>#{order.orderNumber}</Typography>
                <Typography variant="body2" color="text.secondary">{order.customer.name}</Typography>
                <Typography variant="caption">{order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Chip label={order.status.replace(/-/g, ' ')} color={STATUS_COLORS[order.status] || 'default'} size="small" sx={{ mb: 1, textTransform: 'capitalize' }} />
                <Typography fontWeight={700} color="primary" sx={{ display: 'block' }}>PKR {order.pricing.total}</Typography>
                {tab === 0 && (
                  <Button size="small" variant="outlined" sx={{ mt: 1 }}>
                    {order.status === 'confirmed' ? 'Start Preparing' : order.status === 'preparing' ? 'Mark Ready' : 'Update Status'}
                  </Button>
                )}
              </Box>
            </Box>
          </Card>
        ))
      }
    </Container>
  );
};

export default RestaurantDashboard;
