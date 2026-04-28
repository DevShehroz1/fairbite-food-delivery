import React, { useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, Tab, Tabs, Chip, Button, Table, TableHead, TableRow, TableCell, TableBody, Switch } from '@mui/material';
import { People, Restaurant, ShoppingBag, AttachMoney, VerifiedUser } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DEMO_USERS = [
  { _id: 'u1', name: 'Ahmed Khan', email: 'ahmed@example.com', role: 'customer', isActive: true, createdAt: '2026-04-01' },
  { _id: 'u2', name: 'Zara Foods', email: 'zara@restaurant.com', role: 'restaurant', isActive: true, createdAt: '2026-04-02' },
  { _id: 'u3', name: 'Ali Rider', email: 'ali@rider.com', role: 'rider', isActive: true, createdAt: '2026-04-03' },
  { _id: 'u4', name: 'Sara Bibi', email: 'sara@example.com', role: 'customer', isActive: false, createdAt: '2026-04-05' },
];

const DEMO_RESTAURANTS = [
  { _id: 'r1', name: 'Karachi Grill House', owner: 'Ahmed', status: { isVerified: true, isActive: true }, stats: { totalOrders: 847, totalRevenue: 284000 } },
  { _id: 'r2', name: 'Pizza Palace', owner: 'Zara', status: { isVerified: false, isActive: true }, stats: { totalOrders: 320, totalRevenue: 105000 } },
  { _id: 'r3', name: 'Green Bowl', owner: 'Sara', status: { isVerified: true, isActive: true }, stats: { totalOrders: 95, totalRevenue: 42000 } },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);

  const stats = [
    { icon: <People />, label: 'Total Users', value: '1,240', color: '#2196F3' },
    { icon: <Restaurant />, label: 'Restaurants', value: '156', color: '#4CAF50' },
    { icon: <ShoppingBag />, label: 'Orders Today', value: '842', color: '#FF9800' },
    { icon: <AttachMoney />, label: 'Platform Revenue', value: 'PKR 89K', color: '#FF5722' },
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Admin Dashboard</Typography>
      <Typography color="text.secondary" mb={4}>Platform Overview — Welcome, {user?.name}</Typography>

      {/* Stats */}
      <Grid container spacing={3} mb={4}>
        {stats.map(s => (
          <Grid item xs={6} md={3} key={s.label}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: s.color }}>{s.icon}</Box>
                <Typography variant="h5" fontWeight={700}>{s.value}</Typography>
                <Typography variant="body2" color="text.secondary">{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Commission impact */}
      <Card sx={{ bgcolor: 'primary.main', color: 'white', p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight={700}>FairBite Impact This Month</Typography>
        <Grid container spacing={3} mt={1}>
          <Grid item xs={6} md={3}>
            <Typography variant="h5" fontWeight={800}>PKR 2.4M</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Saved for restaurants (vs 30% commission)</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="h5" fontWeight={800}>156</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Restaurants onboarded</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="h5" fontWeight={800}>PKR 156</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Avg rider earning per delivery</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="h5" fontWeight={800}>0</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Hidden fees charged</Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Users" />
        <Tab label="Restaurants" />
      </Tabs>

      {tab === 0 && (
        <Card>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell fontWeight={700}>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {DEMO_USERS.map(u => (
                <TableRow key={u._id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell><Chip label={u.role} size="small" color={u.role === 'admin' ? 'error' : u.role === 'restaurant' ? 'primary' : 'default'} /></TableCell>
                  <TableCell>{u.createdAt}</TableCell>
                  <TableCell><Switch checked={u.isActive} size="small" /></TableCell>
                  <TableCell><Button size="small" variant="outlined">View</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {tab === 1 && (
        <Card>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Restaurant</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Total Orders</TableCell>
                <TableCell>Revenue</TableCell>
                <TableCell>Verified</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {DEMO_RESTAURANTS.map(r => (
                <TableRow key={r._id}>
                  <TableCell fontWeight={600}>{r.name}</TableCell>
                  <TableCell>{r.owner}</TableCell>
                  <TableCell>{r.stats.totalOrders}</TableCell>
                  <TableCell>PKR {r.stats.totalRevenue.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={r.status.isVerified ? 'Verified' : 'Pending'}
                      color={r.status.isVerified ? 'success' : 'warning'}
                      size="small"
                      icon={r.status.isVerified ? <VerifiedUser fontSize="small" /> : undefined}
                    />
                  </TableCell>
                  <TableCell>
                    {!r.status.isVerified && <Button size="small" variant="contained" color="success">Verify</Button>}
                    {r.status.isVerified && <Button size="small" variant="outlined">View</Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </Container>
  );
};

export default AdminDashboard;
