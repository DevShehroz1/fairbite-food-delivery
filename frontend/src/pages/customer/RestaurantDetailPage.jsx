import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Button, Card, CardMedia, Rating, Chip, Divider, CircularProgress, IconButton, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Add, Remove, ShoppingCart, AccessTime, ExpandMore, LocalFireDepartment } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import useCart from '../../hooks/useCart';

// Demo menu for when backend not connected
const DEMO_RESTAURANT = {
  _id: 'demo1',
  name: 'Karachi Grill House',
  cuisine: ['BBQ', 'Pakistani'],
  description: 'The finest BBQ and Pakistani cuisine. Halal certified. Fresh ingredients daily.',
  rating: { average: 4.7, count: 320 },
  delivery: { fee: 50, estimatedTime: 25 },
  pricing: { commissionRate: 15, minimumOrder: 200 },
  images: { cover: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200', logo: 'https://ui-avatars.com/api/?name=KGH&background=FF5722&color=fff&size=100' },
  address: { street: '123 Burns Road', city: 'Karachi' },
  contact: { phone: '021-1234567' },
  menu: [
    { _id: 'm1', name: 'Chicken Karahi', price: 850, category: 'main-course', description: 'Classic spicy Karahi with fresh tomatoes and ginger', dietaryTags: ['halal'], spiceLevel: 'hot', calories: 520, isAvailable: true },
    { _id: 'm2', name: 'Mutton Biryani', price: 650, category: 'main-course', description: 'Aromatic basmati rice with tender mutton pieces', dietaryTags: ['halal'], spiceLevel: 'medium', calories: 680, isAvailable: true },
    { _id: 'm3', name: 'Seekh Kebab (6pcs)', price: 450, category: 'appetizer', description: 'Juicy minced meat kebabs served with chutney', dietaryTags: ['halal'], spiceLevel: 'medium', calories: 380, isAvailable: true },
    { _id: 'm4', name: 'Gulab Jamun', price: 150, category: 'dessert', description: 'Soft milk-solid dumplings in sugar syrup', dietaryTags: ['vegetarian'], spiceLevel: 'mild', calories: 280, isAvailable: true },
    { _id: 'm5', name: 'Mango Lassi', price: 120, category: 'beverage', description: 'Chilled yogurt-based mango drink', dietaryTags: ['vegetarian'], spiceLevel: 'mild', calories: 180, isAvailable: true },
    { _id: 'm6', name: 'Beef Nihari', price: 780, category: 'main-course', description: 'Slow-cooked beef stew with bone marrow', dietaryTags: ['halal'], spiceLevel: 'hot', calories: 720, isAvailable: true },
  ],
};

const SPICE_COLORS = { mild: '#4CAF50', medium: '#FF9800', hot: '#F44336', 'extra-hot': '#B71C1C' };

const MenuItemCard = ({ item, onAdd, onRemove, qty }) => (
  <Box sx={{ display: 'flex', gap: 2, p: 2, borderBottom: '1px solid #f0f0f0', '&:last-child': { borderBottom: 'none' } }}>
    <Box sx={{ flex: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Typography variant="subtitle1" fontWeight={600}>{item.name}</Typography>
        {item.spiceLevel !== 'mild' && (
          <LocalFireDepartment fontSize="small" sx={{ color: SPICE_COLORS[item.spiceLevel] }} />
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" mb={1}>{item.description}</Typography>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
        {item.dietaryTags?.map(t => <Chip key={t} label={t} size="small" color="secondary" variant="outlined" sx={{ fontSize: 10, textTransform: 'capitalize' }} />)}
        {item.calories && <Chip label={`${item.calories} cal`} size="small" variant="outlined" sx={{ fontSize: 10 }} />}
      </Box>
      <Typography variant="subtitle1" fontWeight={700} color="primary">PKR {item.price}</Typography>
    </Box>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, minWidth: 80 }}>
      {qty > 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid', borderColor: 'primary.main', borderRadius: 2, px: 1 }}>
          <IconButton size="small" onClick={onRemove}><Remove fontSize="small" /></IconButton>
          <Typography fontWeight={700}>{qty}</Typography>
          <IconButton size="small" onClick={onAdd}><Add fontSize="small" /></IconButton>
        </Box>
      ) : (
        <Button variant="outlined" size="small" onClick={onAdd} disabled={!item.isAvailable}>
          {item.isAvailable ? 'Add' : 'N/A'}
        </Button>
      )}
    </Box>
  </Box>
);

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addItem, removeItem, items, itemCount, subtotal } = useCart();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/restaurants/${id}`);
        setRestaurant(data.data);
      } catch {
        setRestaurant(DEMO_RESTAURANT);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const getQty = (itemId) => items.find(i => i._id === itemId)?.quantity || 0;

  const categories = [...new Set(restaurant?.menu?.map(i => i.category) || [])];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!restaurant) return <Typography sx={{ mt: 10, textAlign: 'center' }}>Restaurant not found</Typography>;

  return (
    <Box>
      {/* Cover */}
      <Box sx={{ position: 'relative', height: 300 }}>
        <CardMedia component="img" height="300" image={restaurant.images?.cover} alt={restaurant.name} sx={{ objectFit: 'cover' }} />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
        <Box sx={{ position: 'absolute', bottom: 24, left: 24, color: 'white' }}>
          <Typography variant="h4" fontWeight={800}>{restaurant.name}</Typography>
          <Typography>{restaurant.cuisine?.join(' • ')}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Rating value={restaurant.rating?.average} precision={0.1} size="small" readOnly sx={{ '& .MuiRating-iconFilled': { color: 'white' } }} />
            <Typography variant="body2">({restaurant.rating?.count} reviews)</Typography>
            <Chip label={`${restaurant.delivery?.estimatedTime} min`} size="small" icon={<AccessTime />} sx={{ color: 'white', borderColor: 'white' }} variant="outlined" />
          </Box>
        </Box>
      </Box>

      <Container sx={{ py: 3 }}>
        <Grid container spacing={4}>
          {/* Menu */}
          <Grid item xs={12} md={8}>
            {/* Pricing transparency box */}
            <Box sx={{ bgcolor: 'secondary.light', borderRadius: 2, p: 2, mb: 3, color: 'white' }}>
              <Typography variant="body2" fontWeight={600}>Fair Pricing</Typography>
              <Typography variant="caption">Platform commission: {restaurant.pricing?.commissionRate}% (industry avg: 25-35%)</Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>Delivery fee: PKR {restaurant.delivery?.fee} | Min order: PKR {restaurant.pricing?.minimumOrder}</Typography>
            </Box>

            <Typography variant="h6" fontWeight={700} mb={2}>Menu</Typography>

            {categories.map(cat => (
              <Accordion key={cat} defaultExpanded sx={{ mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography fontWeight={600} sx={{ textTransform: 'capitalize' }}>{cat.replace('-', ' ')}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  {restaurant.menu?.filter(i => i.category === cat).map(item => (
                    <MenuItemCard
                      key={item._id} item={item}
                      qty={getQty(item._id)}
                      onAdd={() => { addItem(item, restaurant._id, restaurant.name); toast.success(`${item.name} added!`, { autoClose: 1000 }); }}
                      onRemove={() => removeItem(item._id)}
                    />
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>

          {/* Cart summary */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 80 }}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  <ShoppingCart sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Your Order ({itemCount} items)
                </Typography>
                {itemCount === 0 ? (
                  <Typography color="text.secondary" variant="body2">Add items from the menu to get started</Typography>
                ) : (
                  <>
                    {items.map(i => (
                      <Box key={i._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{i.name} ×{i.quantity}</Typography>
                        <Typography variant="body2" fontWeight={600}>PKR {i.price * i.quantity}</Typography>
                      </Box>
                    ))}
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                      <Typography variant="body2">PKR {subtotal}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">Delivery Fee</Typography>
                      <Typography variant="body2">PKR {restaurant.delivery?.fee}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
                      <Typography variant="subtitle1" fontWeight={700} color="primary">PKR {subtotal + (restaurant.delivery?.fee || 0)}</Typography>
                    </Box>
                    <Button fullWidth variant="contained" size="large" onClick={() => navigate('/cart')}>
                      Proceed to Checkout
                    </Button>
                  </>
                )}
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default RestaurantDetailPage;
