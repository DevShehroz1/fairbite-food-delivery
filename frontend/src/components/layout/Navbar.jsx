import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Box, Switch, Avatar, Menu, MenuItem, Chip } from '@mui/material';
import { ShoppingCart, RestaurantMenu } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isDemoMode, enableDemoMode, disableDemoMode } from '../../services/demoService';
import useCart from '../../hooks/useCart';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const { itemCount } = useCart();
  const [demo, setDemo]     = useState(isDemoMode());
  const [anchorEl, setAnchorEl] = useState(null);

  const toggleDemo = () => {
    demo ? disableDemoMode() : enableDemoMode();
    setDemo(!demo);
  };

  const getDashboardPath = () => ({
    restaurant: '/dashboard/restaurant',
    rider:      '/dashboard/rider',
    admin:      '/dashboard/admin',
  }[user?.role] || '/orders');

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #F0EDE8',
          borderRadius: 0,
        }}
      >
        <Toolbar sx={{ justifyContent:'space-between', minHeight:'60px !important' }}>
          {/* Logo */}
          <Typography
            component={Link} to="/"
            variant="h6" fontWeight={800}
            sx={{
              textDecoration:'none', display:'flex', alignItems:'center', gap:1,
              background:'linear-gradient(135deg,#E53935,#FF5722)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              letterSpacing:-0.5,
            }}
          >
            <RestaurantMenu sx={{ color:'#E53935', fontSize:22 }}/>
            FairBite
          </Typography>

          {/* Centre nav */}
          <Box sx={{ display:{ xs:'none', md:'flex' }, gap:0.5 }}>
            <Button
              component={Link} to="/restaurants"
              sx={{ color:'text.primary', borderRadius:10, px:2, fontSize:14,
                '&:hover':{ bgcolor:'#FFF5F5', color:'#E53935' } }}
            >
              Restaurants
            </Button>
            {isAuthenticated && user?.role === 'customer' && (
              <Button
                component={Link} to="/orders"
                sx={{ color:'text.primary', borderRadius:10, px:2, fontSize:14,
                  '&:hover':{ bgcolor:'#FFF5F5', color:'#E53935' } }}
              >
                My Orders
              </Button>
            )}
          </Box>

          {/* Right side */}
          <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
            {/* Demo toggle */}
            <Box sx={{
              display:'flex', alignItems:'center', gap:0.75,
              bgcolor: demo ? '#FFF5F5' : '#F7F7F7',
              borderRadius:10, px:1.5, py:0.4,
              border: demo ? '1px solid #FFCDD2' : '1px solid #EEEEEE',
              transition:'all 0.3s',
            }}>
              <Typography variant="caption" fontWeight={800}
                sx={{ color: demo ? '#E53935' : '#9E9E9E', fontSize:11, letterSpacing:0.5 }}>
                DEMO
              </Typography>
              <Switch checked={demo} onChange={toggleDemo} size="small" color="error"/>
            </Box>

            {/* Cart */}
            {isAuthenticated && user?.role === 'customer' && (
              <IconButton
                onClick={() => navigate('/cart')}
                sx={{
                  bgcolor: itemCount > 0 ? '#FFF5F5' : 'transparent',
                  border: itemCount > 0 ? '1px solid #FFCDD2' : '1px solid transparent',
                  borderRadius:12, width:40, height:40,
                  '&:hover':{ bgcolor:'#FFF5F5' },
                }}
              >
                <Badge badgeContent={itemCount} color="error" sx={{ '& .MuiBadge-badge':{ fontSize:10, minWidth:16, height:16 } }}>
                  <ShoppingCart sx={{ color: itemCount>0 ? '#E53935' : '#9E9E9E', fontSize:20 }}/>
                </Badge>
              </IconButton>
            )}

            {/* Auth */}
            {!isAuthenticated ? (
              <Box sx={{ display:'flex', gap:1 }}>
                <Button onClick={() => navigate('/login')} variant="outlined" size="small"
                  sx={{ borderRadius:12, borderColor:'#E53935', color:'#E53935', px:2, fontSize:13 }}>
                  Login
                </Button>
                <Button onClick={() => navigate('/register')} variant="contained" size="small"
                  sx={{ borderRadius:12, fontSize:13, px:2 }}>
                  Sign Up
                </Button>
              </Box>
            ) : (
              <>
                <IconButton onClick={e => setAnchorEl(e.currentTarget)} size="small"
                  sx={{ p:0.3 }}>
                  <Avatar sx={{ width:34, height:34,
                    background:'linear-gradient(135deg,#E53935,#FF5722)',
                    fontSize:14, fontWeight:700, boxShadow:'0 2px 10px rgba(229,57,53,0.4)' }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl} open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  PaperProps={{ sx:{ borderRadius:3, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', mt:0.5, minWidth:160 } }}
                  transformOrigin={{ horizontal:'right', vertical:'top' }}
                  anchorOrigin={{ horizontal:'right', vertical:'bottom' }}
                >
                  <Box sx={{ px:2, py:1.5, borderBottom:'1px solid #F5F5F5' }}>
                    <Typography variant="body2" fontWeight={700}>{user.name}</Typography>
                    <Chip label={user.role} size="small"
                      sx={{ mt:0.5, height:18, fontSize:10, bgcolor:'#FFF5F5', color:'#E53935', fontWeight:700 }}/>
                  </Box>
                  <MenuItem onClick={() => { navigate(getDashboardPath()); setAnchorEl(null); }}
                    sx={{ fontSize:14, borderRadius:2, mx:1, mt:0.5 }}>
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => { logout(); setAnchorEl(null); navigate('/'); }}
                    sx={{ fontSize:14, borderRadius:2, mx:1, mb:0.5, color:'#E53935' }}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Demo banner */}
      {demo && (
        <Box sx={{
          background:'linear-gradient(135deg,#E53935,#FF5722)',
          color:'white', textAlign:'center', py:0.75, fontSize:12, fontWeight:700,
          letterSpacing:0.5,
        }}>
          🎬 DEMO MODE — Orders auto-progress through all stages for your presentation
        </Box>
      )}
    </>
  );
};

export default Navbar;
