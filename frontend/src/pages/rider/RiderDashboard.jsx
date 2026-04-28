import React, { useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, Button, Chip, Switch, FormControlLabel } from '@mui/material';
import { TwoWheeler, AttachMoney, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DEMO_AVAILABLE = [
  { _id: 'o1', orderNumber: 'FB202604003', restaurant: { name: 'Karachi Grill', address: { street: '123 Burns Road' } }, deliveryAddress: { street: '456 Clifton', city: 'Karachi' }, pricing: { total: 950, deliveryFee: 50 } },
  { _id: 'o2', orderNumber: 'FB202604004', restaurant: { name: 'Pizza Palace', address: { street: '78 Main Blvd' } }, deliveryAddress: { street: '12 Defence', city: 'Karachi' }, pricing: { total: 650, deliveryFee: 60 } },
];

const RiderDashboard = () => {
  const { user } = useAuth();
  const [online, setOnline] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  const todayEarnings = 1850;
  const totalDeliveries = 12;
  const riderCut = Math.round(todayEarnings * 0.8); // Rider gets 80% of delivery fees

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Rider Dashboard</Typography>

      {/* Online toggle */}
      <Card sx={{ p: 3, mb: 3, bgcolor: online ? 'secondary.main' : 'grey.100', color: online ? 'white' : 'text.primary' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>{online ? 'You are ONLINE' : 'You are OFFLINE'}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>{online ? 'Ready to receive orders' : 'Go online to start earning'}</Typography>
          </Box>
          <Switch checked={online} onChange={e => setOnline(e.target.checked)} sx={{ '& .MuiSwitch-thumb': { bgcolor: 'white' } }} />
        </Box>
      </Card>

      {/* Earnings */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} md={4}>
          <Card>
            <CardContent>
              <AttachMoney color="primary" />
              <Typography variant="h5" fontWeight={700}>PKR {riderCut}</Typography>
              <Typography variant="body2" color="text.secondary">Today's Earnings (Your Share)</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4}>
          <Card>
            <CardContent>
              <CheckCircle color="success" />
              <Typography variant="h5" fontWeight={700}>{totalDeliveries}</Typography>
              <Typography variant="body2" color="text.secondary">Deliveries Today</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <TwoWheeler />
              <Typography variant="h5" fontWeight={700}>PKR {Math.round(riderCut / totalDeliveries)}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Avg per Delivery</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Wage transparency */}
      <Card sx={{ bgcolor: '#e8f5e9', p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>Fair Wage Calculator</Typography>
        <Typography variant="body2" color="text.secondary">
          FairBite's transparent rider pay formula:
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2">Base delivery fee: PKR 50-70 per order</Typography>
          <Typography variant="body2">Your cut: <strong>80%</strong> of delivery fees</Typography>
          <Typography variant="body2">Bonus: PKR 20 per 5-star rating</Typography>
          <Typography variant="body2" color="secondary.main" fontWeight={600} mt={1}>
            Today: PKR {riderCut} earned from {totalDeliveries} deliveries
          </Typography>
        </Box>
      </Card>

      {/* Available orders */}
      {online && (
        <>
          <Typography variant="h6" fontWeight={700} mb={2}>Available Orders Near You</Typography>
          {DEMO_AVAILABLE.map(order => (
            <Card key={order._id} sx={{ p: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography fontWeight={700}>#{order.orderNumber}</Typography>
                  <Typography variant="body2">📍 From: {order.restaurant.name}</Typography>
                  <Typography variant="body2">🏠 To: {order.deliveryAddress.street}, {order.deliveryAddress.city}</Typography>
                  <Typography variant="body2" color="secondary.main" fontWeight={600}>
                    Delivery fee: PKR {order.pricing.deliveryFee} → You earn: PKR {Math.round(order.pricing.deliveryFee * 0.8)}
                  </Typography>
                </Box>
                <Button variant="contained" onClick={() => setActiveOrder(order)}>
                  Accept Delivery
                </Button>
              </Box>
            </Card>
          ))}
        </>
      )}

      {activeOrder && (
        <Card sx={{ p: 3, mt: 3, border: '2px solid', borderColor: 'primary.main' }}>
          <Typography variant="h6" fontWeight={700} gutterBottom color="primary">Active Delivery</Typography>
          <Typography>Order #{activeOrder.orderNumber}</Typography>
          <Typography>Pickup: {activeOrder.restaurant.name}</Typography>
          <Typography>Deliver to: {activeOrder.deliveryAddress.street}</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="contained" color="success">Mark Picked Up</Button>
            <Button variant="outlined" color="primary">Mark Delivered</Button>
          </Box>
        </Card>
      )}
    </Container>
  );
};

export default RiderDashboard;
