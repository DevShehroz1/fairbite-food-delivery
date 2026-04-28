import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Link as MuiLink, Alert, Divider } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
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
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      const routes = { restaurant: '/dashboard/restaurant', rider: '/dashboard/rider', admin: '/dashboard/admin' };
      navigate(routes[data.user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Demo quick-login
  const demoLogin = (email, password) => setForm({ email, password });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
            Welcome to FairBite
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Sign in to continue
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Password" name="password" type="password" value={form.password} onChange={handleChange} required sx={{ mb: 3 }} />
            <Button fullWidth type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>Quick Demo Login</Divider>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {[
              { label: 'Customer', email: 'customer@demo.com', pw: 'demo123' },
              { label: 'Restaurant', email: 'restaurant@demo.com', pw: 'demo123' },
              { label: 'Rider', email: 'rider@demo.com', pw: 'demo123' },
              { label: 'Admin', email: 'admin@demo.com', pw: 'demo123' },
            ].map(d => (
              <Button key={d.label} size="small" variant="outlined" onClick={() => demoLogin(d.email, d.pw)} sx={{ flex: 1 }}>
                {d.label}
              </Button>
            ))}
          </Box>

          <Typography variant="body2" textAlign="center" mt={3}>
            Don't have an account?{' '}
            <MuiLink component={Link} to="/register" color="primary">Register</MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
