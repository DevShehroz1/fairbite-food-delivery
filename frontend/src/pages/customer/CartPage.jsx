import React, { useState } from 'react';
import { Container, Grid, Card, Typography, Box, Button, TextField, Divider, IconButton, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Alert } from '@mui/material';
import { Add, Remove, DeleteOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useCart from '../../hooks/useCart';
import api from '../../services/api';
import { isDemoMode } from '../../services/demoService';

const CartPage = () => {
  const { items, restaurantId, restaurantName, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const [address, setAddress] = useState({ street: '', city: 'Karachi' });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const DELIVERY_FEE = 50;
  const PLATFORM_FEE = Math.round(subtotal * 0.15);
  const TOTAL = subtotal + DELIVERY_FEE;

  const handlePlaceOrder = async () => {
    if (!address.street) { toast.error('Please enter your delivery address'); return; }
    if (items.length === 0) { toast.error('Your cart is empty'); return; }

    setLoading(true);
    try {
      const orderData = {
        restaurantId,
        items: items.map(i => ({ menuItemId: i._id, quantity: i.quantity })),
        deliveryAddress: address,
        payment: { method: paymentMethod },
      };

      let orderId;

      if (isDemoMode()) {
        // In demo mode, create a fake order ID and go straight to tracking
        orderId = 'demo-' + Date.now();
        toast.success('Order placed! Demo mode active — watch it progress automatically!');
      } else {
        const { data } = await api.post('/orders', orderData);
        orderId = data.data._id;
        toast.success(`Order #${data.data.orderNumber} placed successfully!`);
      }

      clearCart();
      navigate(`/orders/${orderId}/track`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h2" mb={2}>🛒</Typography>
        <Typography variant="h5" fontWeight={700} gutterBottom>Your cart is empty</Typography>
        <Typography color="text.secondary" mb={4}>Add items from a restaurant to get started</Typography>
        <Button variant="contained" onClick={() => navigate('/restaurants')}>Browse Restaurants</Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Your Cart</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>From: {restaurantName}</Typography>

      {isDemoMode() && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Demo Mode is ON — after placing order, it will auto-progress through all delivery stages for your class demo!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Cart items */}
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 2 }}>
            {items.map(item => (
              <Box key={item._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, borderBottom: '1px solid #f0f0f0' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">PKR {item.price} each</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton size="small" onClick={() => updateQuantity(item._id, item.quantity - 1)}><Remove /></IconButton>
                  <Typography fontWeight={700} sx={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</Typography>
                  <IconButton size="small" onClick={() => updateQuantity(item._id, item.quantity + 1)}><Add /></IconButton>
                </Box>
                <Typography fontWeight={700} sx={{ minWidth: 80, textAlign: 'right' }}>PKR {item.price * item.quantity}</Typography>
                <IconButton size="small" color="error" onClick={() => removeItem(item._id)}><DeleteOutline /></IconButton>
              </Box>
            ))}
          </Card>

          {/* Delivery address */}
          <Card sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Delivery Address</Typography>
            <TextField fullWidth label="Street Address" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} sx={{ mb: 2 }} required />
            <TextField fullWidth label="City" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
          </Card>

          {/* Payment */}
          <Card sx={{ p: 3, mt: 3 }}>
            <FormControl>
              <FormLabel><Typography variant="h6" fontWeight={700}>Payment Method</Typography></FormLabel>
              <RadioGroup value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} row>
                <FormControlLabel value="cash" control={<Radio />} label="Cash on Delivery" />
                <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card (Test)" />
                <FormControlLabel value="wallet" control={<Radio />} label="Digital Wallet" />
              </RadioGroup>
            </FormControl>
          </Card>
        </Grid>

        {/* Order summary */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, position: 'sticky', top: 80 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Order Summary</Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Subtotal ({items.length} items)</Typography>
              <Typography>PKR {subtotal}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Delivery Fee</Typography>
              <Typography>PKR {DELIVERY_FEE}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Platform Fee (15%)</Typography>
              <Typography>PKR {PLATFORM_FEE}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
              <Typography variant="subtitle1" fontWeight={700} color="primary">PKR {TOTAL}</Typography>
            </Box>

            <Box sx={{ bgcolor: 'secondary.light', borderRadius: 2, p: 2, mb: 3, color: 'white' }}>
              <Typography variant="caption" fontWeight={600}>Fair Pricing Note</Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Our 15% platform fee is the lowest in the industry. Competitors charge 25-35%.
              </Typography>
            </Box>

            <Button fullWidth variant="contained" size="large" onClick={handlePlaceOrder} disabled={loading}>
              {loading ? 'Placing Order...' : isDemoMode() ? 'Place Demo Order' : `Place Order • PKR ${TOTAL}`}
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;
