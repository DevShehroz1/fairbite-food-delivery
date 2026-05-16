import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Icons, Pressable, BottomNav } from '../../components/ui';

const STATUS_COLOR = {
  pending:          '#f59e0b',
  confirmed:        '#f59e0b',
  preparing:        '#f59e0b',
  'ready-for-pickup': '#f59e0b',
  'picked-up':      '#8b5cf6',
  'on-the-way':     '#8b5cf6',
  delivered:        '#10b981',
  cancelled:        '#ef4444',
};

function statusLabel(s) {
  return (s || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('orders');

  useEffect(() => {
    api.get('/orders')
      .then(res => setOrders(res.data.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleTab = (t) => {
    setTab(t);
    if (t === 'home')    navigate('/home');
    if (t === 'search')  navigate('/restaurants');
    if (t === 'profile') navigate('/profile');
  };

  return (
    <div style={{ background: '#fff', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30, background: '#fff',
        padding: '52px 16px 14px', borderBottom: '1px solid rgba(0,0,0,0.04)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Pressable onClick={() => navigate('/home')} style={{
          width: 38, height: 38, borderRadius: 5, background: '#F5F5F5',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icons.ChevronL size={20} stroke="#111" sw={2.5}/>
        </Pressable>
        <span style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>My Orders</span>
      </div>

      <div style={{ padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i}/>)
        ) : orders.length === 0 ? (
          <EmptyState navigate={navigate}/>
        ) : (
          orders.map((order, i) => (
            <motion.div key={order._id || order.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.28 }}>
              <OrderCard order={order} navigate={navigate}/>
            </motion.div>
          ))
        )}
      </div>

      <BottomNav tab={tab} onTab={handleTab}/>
    </div>
  );
}

function OrderCard({ order, navigate }) {
  const status = order.status || 'pending';
  const dotColor = STATUS_COLOR[status] || '#9CA3AF';
  const isActive = status !== 'delivered' && status !== 'cancelled';
  const isDelivered = status === 'delivered';
  const orderId = order._id || order.id;

  return (
    <div style={{
      background: '#fff', borderRadius: 5, border: '1px solid #F0F0F0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.04)', padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Top row: order number + status badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>
          #{order.orderNumber || orderId}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 5,
          background: dotColor + '18', fontSize: 12, fontWeight: 700, color: dotColor,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0,
          }}/>
          {statusLabel(status)}
        </span>
      </div>

      {/* Restaurant + date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icons.MapPin size={14} stroke="#9CA3AF" sw={2}/>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
          {order.restaurant?.name || 'Restaurant'}
        </span>
        <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 'auto' }}>
          {new Date(order.created_at || order.createdAt).toLocaleDateString('en-PK', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </span>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px dashed #ECECEC' }}/>

      {/* Total + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--qb-primary)' }}>
          PKR {order.pricing?.total ?? '—'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isActive && (
            <Pressable onClick={() => navigate(`/orders/${orderId}/track`)} style={{
              padding: '7px 16px', borderRadius: 5,
              background: 'var(--qb-primary)', color: '#fff',
              fontSize: 13, fontWeight: 700,
            }}>
              Track Order
            </Pressable>
          )}
          {isDelivered && (
            <Pressable onClick={() => navigate('/restaurants')} style={{
              fontSize: 13, fontWeight: 600, color: '#6b7280',
              padding: '7px 4px',
            }}>
              Reorder
            </Pressable>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  const shimmer = {
    background: '#EEE',
    backgroundImage: 'linear-gradient(90deg, #EEE 0%, #F8F8F8 50%, #EEE 100%)',
    backgroundSize: '200% 100%',
    animation: 'qb-shimmer 1.2s linear infinite',
    borderRadius: 5,
  };
  return (
    <div style={{
      background: '#fff', borderRadius: 5, border: '1px solid #F0F0F0',
      padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '40%', height: 14, ...shimmer }}/>
        <div style={{ width: '25%', height: 22, borderRadius: 5, ...shimmer }}/>
      </div>
      <div style={{ width: '55%', height: 12, ...shimmer }}/>
      <div style={{ borderTop: '1px dashed #ECECEC' }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: '30%', height: 16, ...shimmer }}/>
        <div style={{ width: '28%', height: 32, borderRadius: 5, ...shimmer }}/>
      </div>
    </div>
  );
}

function EmptyState({ navigate }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0 40px' }}>
      <div style={{ fontSize: 56 }}>🍽️</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#111', marginTop: 16 }}>No orders yet</div>
      <div style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
        Your order history will appear here
      </div>
      <Pressable onClick={() => navigate('/restaurants')} style={{
        marginTop: 20, padding: '12px 28px', borderRadius: 5,
        background: 'var(--qb-primary)', color: '#fff',
        fontSize: 15, fontWeight: 700, display: 'inline-flex',
      }}>
        Browse Restaurants
      </Pressable>
    </div>
  );
}
