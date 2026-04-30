import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';

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

// Pages — Restaurant
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';

// Pages — Rider
import RiderDashboard from './pages/rider/RiderDashboard';

// Pages — Admin
import AdminDashboard from './pages/admin/AdminDashboard';

const DASHBOARD_ROUTES = {
  customer:   '/restaurants',
  rider:      '/dashboard/rider',
  restaurant: '/dashboard/restaurant',
  admin:      '/dashboard/admin',
};

const App = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (loading) return null;

  return (
    <>
      {/* Hide Navbar on the landing/login page */}
      {!isLanding && <Navbar />}

      <Routes>
        {/* Landing = login page; redirect logged-in users to their dashboard */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to={DASHBOARD_ROUTES[user?.role] || '/restaurants'} replace />
              : <LandingPage />
          }
        />

        {/* Legacy login/register kept for direct access */}
        <Route path="/login" element={isAuthenticated ? <Navigate to={DASHBOARD_ROUTES[user?.role] || '/restaurants'} replace /> : <LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer routes */}
        <Route path="/restaurants"     element={<RestaurantListPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="/home"            element={<HomePage />} />
        <Route path="/cart"            element={<CartPage />} />
        <Route path="/orders"          element={<OrderHistoryPage />} />
        <Route path="/orders/:id/track" element={<OrderTrackingPage />} />

        {/* Role dashboards */}
        <Route path="/dashboard/restaurant" element={<RestaurantDashboard />} />
        <Route path="/dashboard/rider"      element={<RiderDashboard />} />
        <Route path="/dashboard/admin"      element={<AdminDashboard />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
