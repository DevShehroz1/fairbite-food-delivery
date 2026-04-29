import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Navbar from './components/layout/Navbar';

// Pages — Auth
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

// Login not required — all routes are open for demo
const ProtectedRoute = ({ children }) => children;

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/restaurants" element={<RestaurantListPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />

        {/* Customer routes */}
        <Route path="/cart" element={<ProtectedRoute roles={['customer']}><CartPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute roles={['customer']}><OrderHistoryPage /></ProtectedRoute>} />
        <Route path="/orders/:id/track" element={<ProtectedRoute roles={['customer']}><OrderTrackingPage /></ProtectedRoute>} />

        {/* Restaurant routes */}
        <Route path="/dashboard/restaurant" element={<ProtectedRoute roles={['restaurant']}><RestaurantDashboard /></ProtectedRoute>} />

        {/* Rider routes */}
        <Route path="/dashboard/rider" element={<ProtectedRoute roles={['rider']}><RiderDashboard /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/dashboard/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
