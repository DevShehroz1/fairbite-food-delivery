import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { QBLogoMark } from './components/ui';

// Auth pages stay eager — first paint goes through Landing or Login.
import LandingPage from './pages/auth/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Everything else loads on demand → smaller initial bundle.
const HomePage             = lazy(() => import('./pages/customer/HomePage'));
const RestaurantListPage   = lazy(() => import('./pages/customer/RestaurantListPage'));
const RestaurantDetailPage = lazy(() => import('./pages/customer/RestaurantDetailPage'));
const CartPage             = lazy(() => import('./pages/customer/CartPage'));
const OrderTrackingPage    = lazy(() => import('./pages/customer/OrderTrackingPage'));
const OrderHistoryPage     = lazy(() => import('./pages/customer/OrderHistoryPage'));
const ProfilePage          = lazy(() => import('./pages/customer/ProfilePage'));
const RewardsPage          = lazy(() => import('./pages/customer/RewardsPage'));
const RestaurantDashboard  = lazy(() => import('./pages/restaurant/RestaurantDashboard'));
const RiderDashboard       = lazy(() => import('./pages/rider/RiderDashboard'));
const AdminDashboard       = lazy(() => import('./pages/admin/AdminDashboard'));

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

const SuspenseFallback = () => (
  <div style={{
    height: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 16,
    background: '#F5F5F5',
  }}>
    <motion.div
      animate={{ scale: [1, 1.08, 1], rotate: [0, 8, -8, 0] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <QBLogoMark size={64}/>
    </motion.div>
    <div style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.6, textTransform: 'uppercase' }}>
      Loading…
    </div>
  </div>
);

const PageWrap = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
    style={{ minHeight: '100vh' }}
  >
    {children}
  </motion.div>
);

const App = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <SuspenseFallback/>;

  return (
    <Suspense fallback={<SuspenseFallback/>}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/"
            element={isAuthenticated
              ? <Navigate to={DASHBOARD_ROUTES[user?.role] || '/home'} replace />
              : <PageWrap><LandingPage /></PageWrap>}
          />

          <Route path="/login"
            element={isAuthenticated
              ? <Navigate to={DASHBOARD_ROUTES[user?.role] || '/home'} replace />
              : <PageWrap><LoginPage /></PageWrap>}
          />
          <Route path="/register" element={<PageWrap><RegisterPage /></PageWrap>} />

          {/* Customer-only */}
          <Route path="/home"             element={<RoleRoute allow={['customer']}><PageWrap><HomePage /></PageWrap></RoleRoute>} />
          <Route path="/restaurants"      element={<RoleRoute allow={['customer']}><PageWrap><RestaurantListPage /></PageWrap></RoleRoute>} />
          <Route path="/restaurants/:id"  element={<RoleRoute allow={['customer']}><PageWrap><RestaurantDetailPage /></PageWrap></RoleRoute>} />
          <Route path="/cart"             element={<RoleRoute allow={['customer']}><PageWrap><CartPage /></PageWrap></RoleRoute>} />
          <Route path="/orders"           element={<RoleRoute allow={['customer']}><PageWrap><OrderHistoryPage /></PageWrap></RoleRoute>} />
          <Route path="/orders/:id/track" element={<RoleRoute allow={['customer']}><PageWrap><OrderTrackingPage /></PageWrap></RoleRoute>} />
          <Route path="/profile"          element={<RoleRoute allow={['customer']}><PageWrap><ProfilePage /></PageWrap></RoleRoute>} />
          <Route path="/rewards"          element={<RoleRoute allow={['customer']}><PageWrap><RewardsPage /></PageWrap></RoleRoute>} />

          {/* Role dashboards */}
          <Route path="/dashboard/restaurant" element={<RoleRoute allow={['restaurant']}><PageWrap><RestaurantDashboard /></PageWrap></RoleRoute>} />
          <Route path="/dashboard/rider"      element={<RoleRoute allow={['rider']}><PageWrap><RiderDashboard /></PageWrap></RoleRoute>} />
          <Route path="/dashboard/admin"      element={<RoleRoute allow={['admin']}><PageWrap><AdminDashboard /></PageWrap></RoleRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

export default App;
