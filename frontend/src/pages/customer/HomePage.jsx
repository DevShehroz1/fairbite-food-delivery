import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  { icon: '💰', title: '15% Commission', desc: 'We charge restaurants half of what competitors do. Savings reach you.' },
  { icon: '🧾', title: 'Full Transparency', desc: 'See exactly what you pay — subtotal, delivery fee, platform fee. Zero hidden charges.' },
  { icon: '🥗', title: 'Dietary Filters', desc: 'Halal, Vegan, Gluten-Free, Keto, Allergen-free — find what works for your lifestyle.' },
  { icon: '🏍️', title: 'Fair Rider Pay', desc: 'Our riders earn fair wages with transparent calculation shown to you.' },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #FF5722 0%, #FF8A65 100%)',
        color: 'white',
        py: { xs: 8, md: 12 },
        textAlign: 'center',
        px: 2,
      }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
            Food Delivery That's Actually Fair
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto', mb: 4 }}>
            15% commission. Zero hidden fees. Fair rider pay. Support your local restaurants.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" onClick={() => navigate('/restaurants')}
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f5f5f5' }, px: 4 }}>
              Order Now
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/register')}
              sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
              Join as Restaurant
            </Button>
          </Box>
        </motion.div>
      </Box>

      {/* Stats bar */}
      <Box sx={{ bgcolor: '#1a1a1a', color: 'white', py: 3 }}>
        <Container>
          <Grid container spacing={2} justifyContent="center" textAlign="center">
            {[
              { value: '15%', label: 'Commission Rate' },
              { value: '500+', label: 'Restaurants' },
              { value: '10K+', label: 'Happy Customers' },
              { value: '0', label: 'Hidden Fees' },
            ].map(s => (
              <Grid item xs={6} md={3} key={s.label}>
                <Typography variant="h4" fontWeight={800} color="primary.light">{s.value}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>{s.label}</Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
          Why FairBite?
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" mb={6}>
          We're not just another food delivery app. We're fixing what's broken.
        </Typography>
        <Grid container spacing={3}>
          {features.map((f, i) => (
            <Grid item xs={12} sm={6} md={3} key={f.title}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 2, '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' } }}>
                  <CardContent>
                    <Typography variant="h2" mb={2}>{f.icon}</Typography>
                    <Typography variant="h6" fontWeight={700} gutterBottom>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Commission comparison */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container>
          <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
            The Commission Revolution
          </Typography>
          <Grid container spacing={3} justifyContent="center" mt={2}>
            {[
              { name: 'Foodpanda', rate: '30%', color: '#e0e0e0', highlight: false },
              { name: 'Careem NOW', rate: '25%', color: '#e0e0e0', highlight: false },
              { name: 'UberEats', rate: '30%', color: '#e0e0e0', highlight: false },
              { name: 'FairBite', rate: '15%', color: 'primary.main', highlight: true },
            ].map(p => (
              <Grid item xs={6} sm={3} key={p.name} textAlign="center">
                <Box sx={{
                  p: 3, borderRadius: 3,
                  bgcolor: p.highlight ? 'primary.main' : 'grey.100',
                  color: p.highlight ? 'white' : 'text.primary',
                  transform: p.highlight ? 'scale(1.05)' : 'none',
                  boxShadow: p.highlight ? 4 : 0,
                }}>
                  <Typography variant="h4" fontWeight={800}>{p.rate}</Typography>
                  <Typography variant="body2">{p.name}</Typography>
                  {p.highlight && <Chip label="That's Us!" size="small" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.default' }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Ready to Order?</Typography>
        <Typography color="text.secondary" mb={4}>Discover restaurants near you with transparent pricing.</Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/restaurants')} sx={{ px: 6 }}>
          Browse Restaurants
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;
