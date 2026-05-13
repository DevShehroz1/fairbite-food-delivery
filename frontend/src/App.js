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
import RewardsPage from './pages/customer/RewardsPage';

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

const RoleRoute = ({ allow, children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (allow && !allow.includes(user?.role)) {
    return <Navigate to={DASHBOARD_ROUTES[user?.role] || '/'} replace />;
  }
  return children;
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

      {/* Customer-only */}
      <Route path="/home"             element={<RoleRoute allow={['customer']}><HomePage /></RoleRoute>} />
      <Route path="/restaurants"      element={<RoleRoute allow={['customer']}><RestaurantListPage /></RoleRoute>} />
      <Route path="/restaurants/:id"  element={<RoleRoute allow={['customer']}><RestaurantDetailPage /></RoleRoute>} />
      <Route path="/cart"             element={<RoleRoute allow={['customer']}><CartPage /></RoleRoute>} />
      <Route path="/orders"           element={<RoleRoute allow={['customer']}><OrderHistoryPage /></RoleRoute>} />
      <Route path="/orders/:id/track" element={<RoleRoute allow={['customer']}><OrderTrackingPage /></RoleRoute>} />
      <Route path="/profile"          element={<RoleRoute allow={['customer']}><ProfilePage /></RoleRoute>} />
      <Route path="/rewards"          element={<RoleRoute allow={['customer']}><RewardsPage /></RoleRoute>} />

      {/* Role dashboards */}
      <Route path="/dashboard/restaurant" element={<RoleRoute allow={['restaurant']}><RestaurantDashboard /></RoleRoute>} />
      <Route path="/dashboard/rider"      element={<RoleRoute allow={['rider']}><RiderDashboard /></RoleRoute>} />
      <Route path="/dashboard/admin"      element={<RoleRoute allow={['admin']}><AdminDashboard /></RoleRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
