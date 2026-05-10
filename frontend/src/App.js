import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages — Auth
import LandingPage from './pages/auth/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Pages — Customer
import HomePage from './pages/customer/HomePage';
import RestaurantListPage from './pages/customer/RestaurantListPage';
import RestaurantDetailPage from './pages/customer/RestaurantDetailPage';
import CartPage from './pages/customer/CartPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import ProfilePage from './pages/customer/ProfilePage';

// Pages — Role dashboards
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import RiderDashboard from './pages/rider/RiderDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

const DASHBOARD_ROUTES = {
  customer:   '/home',
  rider:      '/dashboard/rider',
  restaurant: '/dashboard/restaurant',
  admin:      '/dashboard/admin',
};

const App = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/"
        element={isAuthenticated
          ? <Navigate to={DASHBOARD_ROUTES[user?.role] || '/home'} replace />
          : <LandingPage />}
      />

      <Route path="/login"
        element={isAuthenticated
          ? <Navigate to={DASHBOARD_ROUTES[user?.role] || '/home'} replace />
          : <LoginPage />}
      />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customer */}
      <Route path="/home"                element={<HomePage />} />
      <Route path="/restaurants"         element={<RestaurantListPage />} />
      <Route path="/restaurants/:id"     element={<RestaurantDetailPage />} />
      <Route path="/cart"                element={<CartPage />} />
      <Route path="/orders"              element={<OrderHistoryPage />} />
      <Route path="/orders/:id/track"    element={<OrderTrackingPage />} />
      <Route path="/profile"             element={<ProfilePage />} />

      {/* Role dashboards */}
      <Route path="/dashboard/restaurant" element={<RestaurantDashboard />} />
      <Route path="/dashboard/rider"      element={<RiderDashboard />} />
      <Route path="/dashboard/admin"      element={<AdminDashboard />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
