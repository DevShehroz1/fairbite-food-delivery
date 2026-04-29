import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardMedia, CardContent, Typography, Box, TextField, ToggleButton, ToggleButtonGroup, Chip, Rating, CircularProgress } from '@mui/material';
import { Search, AccessTime, DeliveryDining } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DIETARY_FILTERS = ['halal', 'vegan', 'vegetarian', 'gluten-free', 'keto'];

// Demo restaurants for when backend is not connected
const DEMO_RESTAURANTS = [
  { _id: 'demo1', name: 'Karachi Grill House', cuisine: ['BBQ', 'Pakistani'], 'rating': { average: 4.7, count: 320 }, delivery: { fee: 50, estimatedTime: 25 }, images: { cover: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400' }, address: { city: 'Karachi' } },
  { _id: 'demo2', name: 'Pizza Palace', cuisine: ['Pizza', 'Italian'], 'rating': { average: 4.3, count: 180 }, delivery: { fee: 60, estimatedTime: 35 }, images: { cover: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400' }, address: { city: 'Karachi' } },
  { _id: 'demo3', name: 'Green Bowl — Vegan', cuisine: ['Vegan', 'Healthy'], 'rating': { average: 4.9, count: 95 }, delivery: { fee: 40, estimatedTime: 20 }, images: { cover: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' }, address: { city: 'Karachi' } },
  { _id: 'demo4', name: 'Halal Biryani Corner', cuisine: ['Pakistani', 'Rice'], 'rating': { average: 4.5, count: 540 }, delivery: { fee: 30, estimatedTime: 30 }, images: { cover: 'https://images.unsplash.com/photo-1563379091339-03246963d52a?w=400' }, address: { city: 'Karachi' } },
  { _id: 'demo5', name: 'Burger Bros', cuisine: ['Burgers', 'American'], 'rating': { average: 4.2, count: 210 }, delivery: { fee: 55, estimatedTime: 28 }, images: { cover: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' }, address: { city: 'Karachi' } },
  { _id: 'demo6', name: 'Sushi Studio', cuisine: ['Japanese', 'Sushi'], 'rating': { average: 4.6, count: 130 }, delivery: { fee: 70, estimatedTime: 40 }, images: { cover: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400' }, address: { city: 'Karachi' } },
];

const RestaurantCard = ({ restaurant, onClick }) => (
  <Card onClick={onClick} sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s', boxShadow: 6 } }}>
    <CardMedia
      component="img" height="180"
      image={restaurant.images?.cover || 'https://via.placeholder.com/400x180?text=Restaurant'}
      alt={restaurant.name}
      sx={{ objectFit: 'cover' }}
    />
    <CardContent>
      <Typography variant="h6" fontWeight={700} noWrap>{restaurant.name}</Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {restaurant.cuisine?.join(' • ')}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
        <Rating value={restaurant.rating?.average || 0} precision={0.1} size="small" readOnly />
        <Typography variant="caption" color="text.secondary">({restaurant.rating?.count || 0})</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AccessTime fontSize="small" color="action" />
          <Typography variant="caption">{restaurant.delivery?.estimatedTime || 30} min</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <DeliveryDining fontSize="small" color="action" />
          <Typography variant="caption">PKR {restaurant.delivery?.fee || 50} delivery</Typography>
        </Box>
      </Box>
      <Box sx={{ mt: 1 }}>
        <Chip label="15% Fair Commission" size="small" color="secondary" variant="outlined" sx={{ fontSize: 10 }} />
      </Box>
    </CardContent>
  </Card>
);

const RestaurantListPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dietary, setDietary] = useState([]);
  const [usingDemo, setUsingDemo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/restaurants');
        if (data.data?.length > 0) {
          setRestaurants(data.data);
        } else {
          setRestaurants(DEMO_RESTAURANTS);
          setUsingDemo(true);
        }
      } catch {
        setRestaurants(DEMO_RESTAURANTS);
        setUsingDemo(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = restaurants.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine?.some(c => c.toLowerCase().includes(search.toLowerCase()));
    return matchSearch;
  });

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Restaurants Near You</Typography>

      {usingDemo && (
        <Box sx={{ bgcolor: 'primary.light', p: 2, borderRadius: 2, mb: 3 }}>
          <Typography color="white" variant="body2">Demo Mode: Showing sample restaurants. Connect MongoDB to see real data.</Typography>
        </Box>
      )}

      {/* Search */}
      <TextField
        fullWidth placeholder="Search restaurants or cuisines..."
        value={search} onChange={e => setSearch(e.target.value)}
        InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
        sx={{ mb: 3 }}
      />

      {/* Dietary filters */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" fontWeight={600} mb={1}>Dietary Filters:</Typography>
        <ToggleButtonGroup value={dietary} onChange={(_, v) => setDietary(v)} size="small">
          {DIETARY_FILTERS.map(d => (
            <ToggleButton key={d} value={d} sx={{ textTransform: 'capitalize', borderRadius: '20px !important', mx: 0.5, border: '1px solid #ddd !important' }}>
              {d}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>{filtered.length} restaurants found</Typography>

      <Grid container spacing={3}>
        {filtered.map(r => (
          <Grid item xs={12} sm={6} md={4} key={r._id}>
            <RestaurantCard restaurant={r} onClick={() => navigate(`/restaurants/${r._id}`)} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default RestaurantListPage;
