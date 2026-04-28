import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Box, Switch, Tooltip, Avatar, Menu, MenuItem } from '@mui/material';
import { ShoppingCart, Restaurant, AdminPanelSettings, TwoWheeler } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isDemoMode, enableDemoMode, disableDemoMode } from '../../services/demoService';
import useCart from '../../hooks/useCart';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const [demo, setDemo] = useState(isDemoMode());
  const [anchorEl, setAnchorEl] = useState(null);

  const toggleDemo = () => {
    if (demo) { disableDemoMode(); } else { enableDemoMode(); }
    setDemo(!demo);
  };

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    navigate('/');
  };

  const getDashboardPath = () => {
    const paths = { restaurant: '/dashboard/restaurant', rider: '/dashboard/rider', admin: '/dashboard/admin' };
    return paths[user?.role] || '/orders';
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #eee' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo */}
        <Typography
          component={Link} to="/"
          variant="h6" fontWeight={700}
          sx={{ color: 'primary.main', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1 }}
        >
          🍔 FairBite
        </Typography>

        {/* Center nav */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          <Button component={Link} to="/restaurants" color="inherit" sx={{ color: 'text.primary' }}>
            Restaurants
          </Button>
          {isAuthenticated && user?.role === 'customer' && (
            <Button component={Link} to="/orders" color="inherit" sx={{ color: 'text.primary' }}>
              My Orders
            </Button>
          )}
        </Box>

        {/* Right side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Demo Mode toggle */}
          <Tooltip title={demo ? 'Demo Mode ON — orders auto-progress for presentation' : 'Enable Demo Mode for class demo'}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" color={demo ? 'primary' : 'text.secondary'} fontWeight={600}>
                DEMO
              </Typography>
              <Switch
                checked={demo}
                onChange={toggleDemo}
                size="small"
                color="primary"
              />
            </Box>
          </Tooltip>

          {/* Cart — only for customers */}
          {isAuthenticated && user?.role === 'customer' && (
            <IconButton onClick={() => navigate('/cart')} color="primary">
              <Badge badgeContent={itemCount} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>
          )}

          {/* Auth buttons */}
          {!isAuthenticated ? (
            <>
              <Button onClick={() => navigate('/login')} variant="outlined" size="small">Login</Button>
              <Button onClick={() => navigate('/register')} variant="contained" size="small">Sign Up</Button>
            </>
          ) : (
            <>
              <Tooltip title={`${user.name} • ${user.role}`}>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => { navigate(getDashboardPath()); setAnchorEl(null); }}>
                  Dashboard
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>

      {/* Demo mode banner */}
      {demo && (
        <Box sx={{ bgcolor: 'primary.main', color: 'white', textAlign: 'center', py: 0.5, fontSize: 12 }}>
          DEMO MODE ACTIVE — Orders will auto-progress through all stages for your class presentation
        </Box>
      )}
    </AppBar>
  );
};

export default Navbar;
