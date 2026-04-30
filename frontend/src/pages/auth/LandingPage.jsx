import React, { useState } from 'react';
import { Box, Card, Typography, Button, Avatar, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DEMO_ROLES = [
  {
    id:          'customer',
    label:       'Customer',
    icon:        '🛍️',
    desc:        'Order food from local restaurants',
    color:       '#E53935',
    bg:          '#FFF5F5',
    email:       'customer@demo.com',
    password:    'demo123',
    name:        'Alex Customer',
    initials:    'AC',
    googleEmail: 'alex.customer@gmail.com',
  },
  {
    id:          'rider',
    label:       'Rider',
    icon:        '🏍️',
    desc:        'Deliver orders & earn fairly',
    color:       '#2E7D32',
    bg:          '#F1F8E9',
    email:       'rider@demo.com',
    password:    'demo123',
    name:        'Sam Rider',
    initials:    'SR',
    googleEmail: 'sam.rider@gmail.com',
  },
  {
    id:          'restaurant',
    label:       'Restaurant',
    icon:        '🍽️',
    desc:        'Manage your restaurant & menu',
    color:       '#1565C0',
    bg:          '#E3F2FD',
    email:       'restaurant@demo.com',
    password:    'demo123',
    name:        'Foodie Place',
    initials:    'FP',
    googleEmail: 'foodieplace.owner@gmail.com',
  },
];

const ROUTE_MAP = {
  customer:   '/',
  rider:      '/dashboard/rider',
  restaurant: '/dashboard/restaurant',
  admin:      '/dashboard/admin',
};

const GoogleLogo = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width={size} height={size} style={{ flexShrink: 0 }}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

// ─── Google-style account picker modal ────────────────────────────────────────
const GooglePicker = ({ open, onClose, onSelect }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 1400,
          background: 'rgba(32,33,36,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'white',
            borderRadius: 28,
            width: '100%',
            maxWidth: 380,
            boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
            overflow: 'hidden',
          }}
        >
          {/* Google header */}
          <Box sx={{ px: 4, pt: 4, pb: 2.5, textAlign: 'center', borderBottom: '1px solid #f1f3f4' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2.5 }}>
              <GoogleLogo size={26} />
              <Typography sx={{ fontFamily: 'sans-serif', fontWeight: 400, color: '#202124', fontSize: 22, letterSpacing: '-0.5px' }}>
                Google
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 17, fontWeight: 500, color: '#202124', mb: 0.5 }}>
              Sign in
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#5f6368' }}>
              to continue to <strong style={{ color: '#E53935' }}>FairBite</strong>
            </Typography>
          </Box>

          {/* Account list */}
          <Box sx={{ py: 1 }}>
            {DEMO_ROLES.map(role => (
              <Box
                key={role.id}
                onClick={() => onSelect(role)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 2,
                  px: 3, py: 1.5, cursor: 'pointer',
                  '&:hover': { bgcolor: '#f8f9fa' },
                  '&:active': { bgcolor: '#f1f3f4' },
                  transition: 'background 0.12s',
                }}
              >
                <Avatar sx={{ bgcolor: role.color, width: 42, height: 42, fontSize: 14, fontWeight: 700 }}>
                  {role.initials}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#202124', lineHeight: 1.4 }}>
                    {role.name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#5f6368', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {role.googleEmail}
                  </Typography>
                </Box>
                <Chip
                  label={role.label}
                  size="small"
                  sx={{
                    bgcolor: role.bg, color: role.color,
                    fontWeight: 700, fontSize: 10,
                    border: `1px solid ${role.color}40`,
                    height: 22,
                  }}
                />
              </Box>
            ))}
          </Box>

          {/* Footer */}
          <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f3f4' }}>
            <Button
              onClick={onClose}
              sx={{ color: '#1a73e8', textTransform: 'none', fontWeight: 500, borderRadius: 20, fontSize: 13 }}
            >
              Cancel
            </Button>
            <Typography sx={{ fontSize: 11, color: '#bdbdbd' }}>
              Demo accounts
            </Typography>
          </Box>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Landing Page ──────────────────────────────────────────────────────────────
const LandingPage = () => {
  const [selectedRole, setSelectedRole] = useState('customer');
  const [pickerOpen, setPickerOpen]     = useState(false);
  const [loading, setLoading]           = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const doLogin = async (role) => {
    setPickerOpen(false);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: role.email, password: role.password });
      login(data.token, data.user);
      toast.success(`Welcome, ${data.user.name}! 👋`, {
        position: 'bottom-center',
        autoClose: 2500,
        style: { borderRadius: 14, background: role.color, color: 'white', fontWeight: 700 },
      });
      navigate(ROUTE_MAP[data.user.role] || '/');
    } catch {
      toast.error('Login failed — check your connection', { position: 'bottom-center' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #FFF5F5 0%, #FFFFFF 45%, #F8FFF8 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflowX: 'hidden', pb: 6,
    }}>

      {/* Hero */}
      <Box sx={{ width: '100%', textAlign: 'center', px: 3, pt: 7, pb: 5 }}>
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 0] }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{ display: 'inline-block', fontSize: 54, lineHeight: 1, marginBottom: 8 }}
          >
            🍔
          </motion.div>
          <Typography variant="h3" fontWeight={900} sx={{ color: '#E53935', letterSpacing: '-1px', lineHeight: 1 }}>
            FairBite
          </Typography>
          <Typography variant="body1" sx={{ color: '#9E9E9E', mt: 1, fontWeight: 500, letterSpacing: 0.2 }}>
            Fair food · Fair wages · Fair prices
          </Typography>
        </motion.div>
      </Box>

      {/* Role Selection + CTA */}
      <Box sx={{ width: '100%', maxWidth: 460, px: 2.5 }}>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <Typography
            sx={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
              color: '#BDBDBD', textTransform: 'uppercase', mb: 1.5, px: 0.5,
            }}
          >
            I am a...
          </Typography>
        </motion.div>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {DEMO_ROLES.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.2, type: 'spring', stiffness: 260, damping: 22 }}
            >
              <Card
                onClick={() => setSelectedRole(role.id)}
                elevation={0}
                sx={{
                  p: 2, cursor: 'pointer',
                  border: `2px solid ${selectedRole === role.id ? role.color : '#EEEEEE'}`,
                  background: selectedRole === role.id ? role.bg : 'white',
                  borderRadius: 3,
                  boxShadow: selectedRole === role.id
                    ? `0 4px 20px ${role.color}22`
                    : '0 1px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    border: `2px solid ${role.color}99`,
                    transform: 'translateY(-1px)',
                    boxShadow: `0 6px 18px ${role.color}18`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 50, height: 50, borderRadius: 2.5, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26,
                    background: selectedRole === role.id ? `${role.color}18` : '#F7F7F7',
                    transition: 'background 0.18s',
                  }}>
                    {role.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700} sx={{ color: selectedRole === role.id ? role.color : '#212121', lineHeight: 1.3 }}>
                      {role.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9E9E9E', display: 'block', mt: 0.2 }}>
                      {role.desc}
                    </Typography>
                  </Box>
                  <AnimatePresence>
                    {selectedRole === role.id && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      >
                        <Box sx={{
                          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                          bgcolor: role.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Typography sx={{ color: 'white', fontSize: 14, fontWeight: 700, lineHeight: 1 }}>✓</Typography>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              </Card>
            </motion.div>
          ))}
        </Box>

        {/* Google Sign In */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <Box sx={{ mt: 3 }}>
            <Button
              fullWidth
              onClick={() => setPickerOpen(true)}
              disabled={loading}
              sx={{
                py: 1.6, borderRadius: 12,
                background: 'white',
                border: '1.5px solid #DADCE0',
                color: '#3C4043',
                fontWeight: 600, fontSize: 15,
                textTransform: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'center',
                '&:hover': {
                  background: '#F8F9FA',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
                  border: '1.5px solid #C9CBCE',
                },
                '&:active': { background: '#F1F3F4' },
              }}
            >
              <GoogleLogo size={20} />
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>
          </Box>
        </motion.div>

        {/* Demo hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <Box sx={{
            mt: 2, p: 2, borderRadius: 2.5,
            background: 'linear-gradient(135deg, #FFFDE7, #FFF8E1)',
            border: '1px solid #FFE082',
          }}>
            <Typography variant="caption" sx={{ color: '#E65100', fontWeight: 700, display: 'block', mb: 0.3, fontSize: 11 }}>
              🎓 Class Demo Mode
            </Typography>
            <Typography variant="caption" sx={{ color: '#795548', lineHeight: 1.5 }}>
              Select your role above, then tap <strong>Continue with Google</strong> to sign in instantly — no real account needed.
            </Typography>
          </Box>
        </motion.div>

        {/* Fair promise strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
          <Box sx={{
            mt: 2.5, display: 'flex', justifyContent: 'center', gap: 2.5, flexWrap: 'wrap',
          }}>
            {['15% commission', '80% rider pay', 'Zero hidden fees'].map((text, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4CAF50' }} />
                <Typography variant="caption" sx={{ color: '#757575', fontWeight: 600, fontSize: 11 }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>
        </motion.div>
      </Box>

      <GooglePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={doLogin}
      />
    </Box>
  );
};

export default LandingPage;
