import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Link as MuiLink, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      toast.success(`Welcome to FairBite, ${data.user.name}!`);
      const routes = { restaurant: '/dashboard/restaurant', rider: '/dashboard/rider', admin: '/dashboard/admin' };
      navigate(routes[data.user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ maxWidth: 440, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
            Join FairBite
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Fair commissions. Transparent pricing. Better food.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Full Name" name="name" value={form.name} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Password" name="password" type="password" value={form.password} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Phone Number" name="phone" value={form.phone} onChange={handleChange} required sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>I am a...</InputLabel>
              <Select name="role" value={form.role} label="I am a..." onChange={handleChange}>
                <MenuItem value="customer">Customer — Order Food</MenuItem>
                <MenuItem value="restaurant">Restaurant Owner — Sell Food</MenuItem>
                <MenuItem value="rider">Delivery Rider — Earn Money</MenuItem>
              </Select>
            </FormControl>
            <Button fullWidth type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <Typography variant="body2" textAlign="center" mt={3}>
            Already have an account?{' '}
            <MuiLink component={Link} to="/login" color="primary">Sign In</MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;
