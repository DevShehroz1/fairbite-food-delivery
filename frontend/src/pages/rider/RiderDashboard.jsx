import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import socket from '../../services/socket';
import { Icons, PKR, Pressable, SmartImg } from '../../components/ui';

export default function RiderDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [available, setAvailable] = useState(true);
  const [availableOrders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [earnings, setEarnings] = useState({ today: 0, week: 0, trips: 0, rating: 4.9, onlineHours: '0h 0m' });
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    api.get('/orders/available')
      .then(r => setOrders(r.data.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchOrders();
    setLoading(false);
    const poll = setInterval(fetchOrders, 5000);

    // Join with userId so backend can route auto-assignments to this rider
    socket.emit('join_rider', { userId: user?.id });

    socket.on('new_order', fetchOrders);

    // Auto-assigned by backend when restaurant marks order ready
    socket.on('order_assigned', (order) => {
      setActiveOrder(order);
      setOrders(prev => prev.filter(o => o.id !== order.id));
      toast(`Order assigned to you! 🛵 #${order.orderNumber}`, {
        icon: '🎯',
        style: { background: '#fff', color: '#111', fontWeight: 700 },
      });
    });

    return () => {
      clearInterval(poll);
      socket.off('new_order', fetchOrders);
      socket.off('order_assigned');
    };
  }, [user?.id]);

  const acceptOrder = async (orderId) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/accept`);
      setActiveOrder(data.data);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setEarnings(e => ({ ...e, today: e.today + 150, trips: e.trips + 1 }));
      toast.success('Order accepted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not accept order');
    }
  };

  const updateStatus = async (status) => {
    if (!activeOrder) return;
    try {
      await api.put(`/orders/${activeOrder.id}/status`, { status });
      if (status === 'delivered') {
        setEarnings(e => ({ ...e, today: e.today + 80 }));
        setActiveOrder(null);
        toast.success('Delivery completed!');
      } else {
        setActiveOrder(prev => ({ ...prev, status }));
      }
    } catch {
      toast.error('Status update failed');
    }
  };

  const ACTIVE_STEPS = ['on-the-way', 'delivered'];
  const activeStepIndex = activeOrder ? ACTIVE_STEPS.indexOf(activeOrder.status) : -1;

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', paddingBottom: 40 }}>

      {/* Header */}
      <div style={{
        background: '#fff', padding: '52px 18px 0',
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
        overflow: 'hidden',
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SmartImg
              src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop'}
              style={{ width: 44, height: 44, borderRadius: 14 }}
            />
            <div>
              <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                FairBite Rider
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#111', marginTop: 1 }}>
                Hey, {user?.name?.split(' ')[0] || 'Rider'}!
              </div>
            </div>
          </div>
          <Pressable onClick={() => { logout(); navigate('/'); }} style={{
            width: 40, height: 40, borderRadius: 12, background: '#F5F5F5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icons.LogOut size={18} stroke="#374151" />
          </Pressable>
        </div>

        {/* Earnings gradient card */}
        <div style={{
          background: 'linear-gradient(135deg, #E53935 0%, #FF7043 100%)',
          borderRadius: 20, padding: '18px 18px 14px', color: '#fff',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                Today's earnings
              </div>
              <div style={{ fontSize: 34, fontWeight: 800, marginTop: 4, letterSpacing: -1 }}>
                {PKR(earnings.today)}
              </div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                {earnings.trips} trips completed
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
              <MiniStat label="Rating" value={`${earnings.rating}★`} />
              <MiniStat label="Online" value={earnings.onlineHours} />
              <MiniStat label="Week" value={PKR(earnings.week)} />
            </div>
          </div>

          {/* Bar chart */}
          <div style={{ display: 'flex', gap: 5, marginTop: 14, alignItems: 'flex-end', height: 36 }}>
            {[40, 65, 50, 80, 45, 90, 35].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                style={{
                  flex: 1, borderRadius: 4,
                  background: i === 6 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                  alignSelf: 'flex-end',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, fontWeight: 700, opacity: i === 6 ? 1 : 0.55 }}>{d}</div>
            ))}
          </div>
        </div>

        {/* Availability toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px',
          borderRadius: 16,
          background: available ? 'rgba(16,185,129,0.06)' : '#F8F8F8',
          border: `1.5px solid ${available ? '#10b981' : '#E5E5E5'}`,
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: available ? '#10b981' : '#D1D5DB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icons.Power size={18} stroke="#fff" sw={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>
                {available ? 'Online — Accepting orders' : 'Offline'}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Tap to toggle availability</div>
            </div>
          </div>
          <Pressable onClick={() => setAvailable(!available)} style={{
            width: 50, height: 28, borderRadius: 999, position: 'relative',
            background: available ? '#10b981' : '#D1D5DB', transition: 'background .25s',
          }}>
            <motion.div
              animate={{ x: available ? 22 : 2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                position: 'absolute', top: 2, width: 24, height: 24,
                borderRadius: 999, background: '#fff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
              }}
            />
          </Pressable>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Active order */}
        <AnimatePresence>
          {activeOrder && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              style={{ background: '#fff', borderRadius: 20, padding: 16, border: '1.5px solid var(--fb-primary)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ width: 8, height: 8, borderRadius: 999, background: '#10b981' }}
                />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Active Delivery
                </span>
              </div>

              {/* Route rows */}
              <RouteRow
                icon="🍴"
                color="var(--fb-primary)"
                title={activeOrder.restaurant?.name || 'Restaurant'}
                sub={activeOrder.restaurant?.address?.street || 'Pickup point'}
                tag="Pickup"
              />
              <div style={{ marginLeft: 18, height: 14, borderLeft: '2px dashed #E5E5E5' }} />
              <RouteRow
                icon="🏠"
                color="var(--fb-accent)"
                title={activeOrder.customer?.name || 'Customer'}
                sub={activeOrder.deliveryAddress?.street || 'Drop point'}
                tag="Drop"
              />

              {/* Progress bar */}
              <div style={{ display: 'flex', gap: 5, marginTop: 14 }}>
                {['Picked up', 'On the way', 'Delivered'].map((step, i) => (
                  <div key={i} style={{ flex: 1 }}>
                    <div style={{
                      height: 4, borderRadius: 999,
                      background: i <= activeStepIndex + 1 ? 'var(--fb-primary)' : '#F0F0F0',
                    }} />
                    <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 3, fontWeight: 600 }}>{step}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                {activeOrder.status !== 'on-the-way' && (
                  <Pressable
                    onClick={() => updateStatus('on-the-way')}
                    style={{
                      flex: 1, height: 46, borderRadius: 12,
                      background: 'var(--fb-primary)', color: '#fff',
                      fontSize: 13, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <Icons.Bike size={14} />On The Way
                  </Pressable>
                )}
                <Pressable
                  onClick={() => updateStatus('delivered')}
                  style={{
                    flex: 1, height: 46, borderRadius: 12,
                    background: '#10b981', color: '#fff',
                    fontSize: 13, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                  }}
                >
                  <Icons.Check size={14} sw={3} />Delivered
                </Pressable>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <StatTile icon={<Icons.Tag size={16} stroke="var(--fb-primary)" />} label="Weekly" value={PKR(earnings.week)} color="var(--fb-primary)" />
          <StatTile icon={<Icons.Bike size={16} stroke="#3b82f6" />} label="Total Trips" value={earnings.trips} color="#3b82f6" />
        </div>

        {/* Available orders header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#111' }}>
            Available Orders
          </div>
          <div style={{
            padding: '4px 10px', borderRadius: 8,
            background: availableOrders.length > 0 ? 'rgba(229,57,53,0.1)' : '#F5F5F5',
            color: availableOrders.length > 0 ? 'var(--fb-primary)' : '#9CA3AF',
            fontSize: 12, fontWeight: 700,
          }}>
            {availableOrders.length} new
          </div>
        </div>

        {/* Orders list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Icons.Bike size={32} />
            </motion.div>
          </div>
        ) : availableOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              background: '#fff', borderRadius: 20, padding: 32,
              textAlign: 'center', border: '1px dashed #E5E5E5',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>🛵</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Waiting for orders…</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
              New orders will appear here automatically
            </div>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AnimatePresence>
              {availableOrders.map(order => (
                <OrderCard key={order.id} order={order} onAccept={() => acceptOrder(order.id)} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
      <span style={{ opacity: 0.75 }}>{label}</span>
      <span style={{ fontWeight: 800 }}>{value}</span>
    </div>
  );
}

function StatTile({ icon, label, value, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '14px 16px',
      border: '1px solid #F0F0F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>{value}</div>
    </div>
  );
}

function RouteRow({ icon, color, title, sub, tag }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
      <div style={{
        width: 36, height: 36, borderRadius: 12, flexShrink: 0,
        background: `${color === 'var(--fb-primary)' ? '#E5393515' : '#FF704315'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{title}</div>
        <div style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
      <div style={{
        fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
        background: color === 'var(--fb-primary)' ? 'rgba(229,57,53,0.1)' : 'rgba(255,112,67,0.1)',
        color,
      }}>
        {tag}
      </div>
    </div>
  );
}

function OrderCard({ order, onAccept }) {
  const [countdown, setCountdown] = useState(30);
  useEffect(() => {
    const t = setInterval(() => setCountdown(c => {
      if (c <= 1) { clearInterval(t); return 0; }
      return c - 1;
    }), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      style={{
        background: '#fff', borderRadius: 20, padding: 16,
        border: '1px solid #F0F0F0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      }}
    >
      {/* Order header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 8,
            background: 'rgba(229,57,53,0.08)', color: 'var(--fb-primary)',
            fontSize: 11, fontWeight: 800, letterSpacing: 0.4 }}>
            <motion.span
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--fb-primary)' }}
            />
            NEW ORDER
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
            #{order.orderNumber} · {(order.items || []).length} item(s)
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>
            {PKR(order.pricing?.total || 0)}
          </div>
          {/* countdown ring */}
          <svg width="36" height="36" style={{ marginTop: 4 }}>
            <circle cx="18" cy="18" r="14" fill="none" stroke="#F0F0F0" strokeWidth="3" />
            <motion.circle
              cx="18" cy="18" r="14" fill="none"
              stroke={countdown > 10 ? 'var(--fb-primary)' : '#f59e0b'}
              strokeWidth="3" strokeLinecap="round"
              animate={{ pathLength: countdown / 30 }}
              style={{ rotate: -90, transformOrigin: '50% 50%' }}
            />
            <text x="18" y="23" textAnchor="middle" fontSize="10" fontWeight="800" fill="#111">{countdown}</text>
          </svg>
        </div>
      </div>

      {/* Route */}
      <div style={{ background: '#F8F8F8', borderRadius: 14, padding: '12px 14px', marginBottom: 12 }}>
        <RouteRow
          icon="🍴"
          color="var(--fb-primary)"
          title={order.restaurant?.name || 'Restaurant'}
          sub={order.restaurant?.address?.street || ''}
          tag="Pickup"
        />
        <div style={{ marginLeft: 18, height: 12, borderLeft: '2px dashed #E0E0E0', margin: '6px 0 6px 18px' }} />
        <RouteRow
          icon="🏠"
          color="var(--fb-accent)"
          title={order.deliveryAddress?.city || 'Customer'}
          sub={order.deliveryAddress?.street || ''}
          tag="Drop"
        />
      </div>

      {/* Meta info */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap',
        padding: '8px 12px', borderRadius: 10, background: '#F8F8F8',
        fontSize: 12,
      }}>
        <span><b>~4 km</b> total</span>
        <span style={{ color: '#D1D5DB' }}>·</span>
        <span><b>~18 min</b></span>
        <span style={{ color: '#D1D5DB' }}>·</span>
        <span style={{ color: '#10b981', fontWeight: 700 }}>+Rs. 40 surge</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Pressable style={{
          flex: 1, height: 46, borderRadius: 12,
          border: '1px solid #E5E5E5', background: '#fff',
          color: '#374151', fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          Decline
        </Pressable>
        <Pressable
          onClick={onAccept}
          style={{
            flex: 2, height: 46, borderRadius: 12,
            background: 'var(--fb-primary)', color: '#fff',
            fontSize: 14, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: '0 4px 16px rgba(229,57,53,0.32)',
          }}
        >
          <Icons.Check size={15} sw={3} />Accept Order
        </Pressable>
      </div>
    </motion.div>
  );
}
