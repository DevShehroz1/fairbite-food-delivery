import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { QBLogoMark } from './components/ui';

// LandingPage handles both sign-in and registration tabs.
import LandingPage from './pages/auth/LandingPage';

// ChunkLoadError = stale tab requesting a JS chunk that was replaced by a
// new deploy. Reload once to pull the fresh HTML + chunk hashes; the
// sessionStorage guard stops a reload loop if the chunk is genuinely 404.
const isChunkLoadError = (err) =>
  err && (err.name === 'ChunkLoadError' || /Loading chunk [^ ]+ failed/i.test(err.message || ''));

class AppErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null, info: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) {
    if (isChunkLoadError(err)) {
      try {
        if (!sessionStorage.getItem('qb_chunk_reload')) {
          sessionStorage.setItem('qb_chunk_reload', '1');
          window.location.reload();
          return;
        }
      } catch (_) { /* sessionStorage unavailable — fall through to red screen */ }
    }
    this.setState({ err, info });
    console.error('QuickBite render error:', err, info);
  }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div style={{
        minHeight: '100vh', padding: 24, background: '#fff',
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex', flexDirection: 'column', gap: 16,
        maxWidth: 640, margin: '0 auto',
      }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#E53935' }}>Something broke</div>
        <div style={{ fontSize: 14, color: '#374151' }}>
          The page hit a runtime error. Share this with whoever's debugging:
        </div>
        <pre style={{
          fontSize: 12, color: '#111', background: '#FFF1F0', padding: 14,
          borderRadius: 5, border: '1px solid #FECACA', overflow: 'auto',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {String(this.state.err?.stack || this.state.err)}
          {this.state.info?.componentStack || ''}
        </pre>
        <button onClick={() => window.location.reload()} style={{
          alignSelf: 'flex-start', padding: '10px 18px', borderRadius: 5,
          border: 0, background: '#E53935', color: '#fff', fontWeight: 700, cursor: 'pointer',
        }}>Reload</button>
      </div>
    );
  }
}

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
const AdminLoginPage       = lazy(() => import('./pages/admin/AdminLoginPage'));

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
    alignItems: 'center', justifyContent: 'center', gap: 18,
    background: '#F5F5F5',
  }}>
    {/* Soft breathing scale on the wordmark — keeps the splash calm and
        avoids the cartoon wiggle the old roundel mark needed. */}
    <motion.div
      animate={{ opacity: [0.55, 1, 0.55] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <QBLogoMark size={56}/>
    </motion.div>
    <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.8, textTransform: 'uppercase' }}>
      Loading
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
    <AppErrorBoundary>
    <Suspense fallback={<SuspenseFallback/>}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/"
            element={isAuthenticated
              ? <Navigate to={DASHBOARD_ROUTES[user?.role] || '/home'} replace />
              : <PageWrap><LandingPage /></PageWrap>}
          />

          {/* Legacy /login + /register routes funnel into Landing. */}
          <Route path="/login"    element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />

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

          {/* Separate admin sign-in URL (not advertised from the public LandingPage) */}
          <Route path="/admin/login"
            element={isAuthenticated && user?.role === 'admin'
              ? <Navigate to="/dashboard/admin" replace />
              : <PageWrap><AdminLoginPage /></PageWrap>}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
    </AppErrorBoundary>
  );
};

export default App;
