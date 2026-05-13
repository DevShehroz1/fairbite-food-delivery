import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Icons, PKR, Pressable } from '../../components/ui';

const CAT_LABELS = {
  'main-course': 'Main Course',
  appetizer:     'Starters',
  dessert:       'Desserts',
  beverage:      'Drinks',
};

const STATUS_META = {
  pending:            { label: 'New',       color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   next: 'confirmed',  nextLabel: 'Confirm Order' },
  confirmed:          { label: 'Confirmed', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',   next: 'preparing',  nextLabel: 'Start Preparing' },
  preparing:          { label: 'Preparing', color: 'var(--qb-primary)', bg: 'rgba(229,57,53,0.08)', next: 'ready', nextLabel: 'Mark Ready — Assign Rider' },
  ready:              { label: 'Ready',     color: '#10b981', bg: 'rgba(16,185,129,0.1)',   next: null,         nextLabel: null },
  'ready-for-pickup': { label: 'Ready',     color: '#10b981', bg: 'rgba(16,185,129,0.1)',   next: null,         nextLabel: null },
  'picked-up':        { label: 'Picked Up', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',   next: null,         nextLabel: null },
  'on-the-way':       { label: 'On the Way', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', next: null,         nextLabel: null },
  delivered:          { label: 'Delivered', color: '#6b7280', bg: '#F5F5F5',               next: null,         nextLabel: null },
  cancelled:          { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   next: null,         nextLabel: null },
};

const ACTIVE_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'ready-for-pickup'];
const TABS = ['Active', 'History', 'Menu'];

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const prevOrderIdsRef = useRef(null);

  const fetchOrders = async () => {
    try {
      const r = await api.get('/orders/restaurant');
      const newOrders = r.data.data || [];
      if (prevOrderIdsRef.current !== null) {
        const prevIds = new Set(prevOrderIdsRef.current);
        const incoming = newOrders.filter(o => !prevIds.has(o.id) && o.status === 'pending');
        if (incoming.length > 0) {
          setNewOrderAlert(incoming[0]);
          toast(`New order #${incoming[0].orderNumber || ''}!`, {
            icon: '🔔',
            style: { background: '#fff', color: '#111', fontWeight: 700 },
          });
        }
      }
      prevOrderIdsRef.current = newOrders.map(o => o.id);
      setOrders(newOrders);
    } catch {}
  };

  useEffect(() => {
    api.get('/restaurants/my')
      .then(r => setRestaurant(r.data.data))
      .catch(() => {});

    fetchOrders().finally(() => setLoading(false));
    const poll = setInterval(fetchOrders, 4000);
    return () => clearInterval(poll);
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (newStatus === 'ready') {
        toast.success('Order ready — rider is being assigned automatically!');
      } else {
        toast.success('Order updated');
      }
    } catch {
      toast.error('Could not update order');
    }
  };

  const activeOrders  = orders.filter(o => ACTIVE_STATUSES.includes(o.status));
  const historyOrders = orders.filter(o => !ACTIVE_STATUSES.includes(o.status));
  const displayOrders = tab === 0 ? activeOrders : historyOrders;

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', paddingBottom: 40 }}>

      {/* Header */}
      <div style={{
        background: '#fff', padding: '52px 18px 0',
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'linear-gradient(135deg, var(--qb-primary), var(--qb-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>🍽️</div>
            <div>
              <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Restaurant Dashboard
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#111', marginTop: 1 }}>
                {restaurant?.name || user?.name || 'Restaurant'}
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

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, paddingBottom: 16 }}>
          <MiniStatCard icon={<Icons.Receipt size={14} stroke="var(--qb-primary)" />} label="Active" value={activeOrders.length} color="var(--qb-primary)" />
          <MiniStatCard icon={<Icons.Tag size={14} stroke="#10b981" />} label="Revenue" value={`${Math.round(historyOrders.reduce((s,o) => s+(o.pricing?.subtotal||0),0)/1000)}K`} color="#10b981" />
          <MiniStatCard icon={<Icons.Star size={14} stroke="#f59e0b" />} label="Rating" value={restaurant?.rating?.average || '—'} color="#f59e0b" />
          <MiniStatCard icon={<Icons.Truck size={14} stroke="#8b5cf6" />} label="Total" value={orders.length} color="#8b5cf6" />
        </div>

        {/* Commission banner */}
        <div style={{
          background: 'linear-gradient(135deg, #E53935 0%, #FF7043 100%)',
          borderRadius: 16, padding: '13px 16px', color: '#fff',
          marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800 }}>Low Commission Rate</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 3 }}>
              Keep more of what you earn — only <b>15% commission</b> on every order
            </div>
          </div>
          <div style={{ padding: '6px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.2)', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>
            15% only
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #F0F0F0' }}>
          {TABS.map((t, i) => (
            <Pressable key={t} onClick={() => setTab(i)} scale={1} style={{
              flex: 1, padding: '12px 0', textAlign: 'center',
              fontSize: 13, fontWeight: 700,
              color: tab === i ? 'var(--qb-primary)' : '#9CA3AF',
              borderBottom: `2px solid ${tab === i ? 'var(--qb-primary)' : 'transparent'}`,
              marginBottom: -2, background: 'transparent',
            }}>
              {t}
              {t === 'Active' && activeOrders.length > 0 && (
                <span style={{
                  marginLeft: 5, padding: '1px 6px', borderRadius: 6,
                  background: 'var(--qb-primary)', color: '#fff', fontSize: 10, fontWeight: 800,
                }}>{activeOrders.length}</span>
              )}
            </Pressable>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 16px 0' }}>

        {/* Incoming order alert */}
        <AnimatePresence>
          {newOrderAlert && tab === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              style={{
                background: '#fff', borderRadius: 16, padding: '14px 16px',
                border: '2px solid var(--qb-primary)', marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(229,57,53,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}
              >🔔</motion.div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--qb-primary)' }}>New order arrived!</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                  {(newOrderAlert.items||[]).length} item(s) · {PKR(newOrderAlert.pricing?.total || 0)}
                </div>
              </div>
              <Pressable onClick={() => setNewOrderAlert(null)} style={{
                width: 28, height: 28, borderRadius: 8, background: '#F5F5F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icons.X size={14} stroke="#6b7280" />
              </Pressable>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {tab === 2 ? (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MenuTab restaurant={restaurant} />
            </motion.div>
          ) : (
            <motion.div key={`orders-${tab}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {loading ? <SkeletonOrders /> : displayOrders.length === 0 ? (
                <EmptyOrders active={tab === 0} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {displayOrders.map(order => (
                    <OrderCard key={order.id} order={order} onUpdateStatus={s => updateOrderStatus(order.id, s)} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MiniStatCard({ icon, label, value, color }) {
  const bgMap = { 'var(--qb-primary)': 'rgba(229,57,53,0.06)', '#10b981': 'rgba(16,185,129,0.06)', '#f59e0b': 'rgba(245,158,11,0.06)', '#8b5cf6': 'rgba(139,92,246,0.06)' };
  const brMap = { 'var(--qb-primary)': 'rgba(229,57,53,0.15)', '#10b981': 'rgba(16,185,129,0.15)', '#f59e0b': 'rgba(245,158,11,0.15)', '#8b5cf6': 'rgba(139,92,246,0.15)' };
  return (
    <div style={{ padding: '10px', borderRadius: 14, background: bgMap[color] || '#F8F8F8', border: `1px solid ${brMap[color] || '#F0F0F0'}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>{icon}<span style={{ fontSize: 10, color: '#6b7280', fontWeight: 600 }}>{label}</span></div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>{value}</div>
    </div>
  );
}

function OrderCard({ order, onUpdateStatus }) {
  const meta = STATUS_META[order.status] || STATUS_META.pending;
  const [expanded, setExpanded] = useState(order.status === 'pending');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff', borderRadius: 18, overflow: 'hidden',
        border: order.status === 'pending' ? '1.5px solid var(--qb-primary)' : '1px solid #F0F0F0',
        boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
      }}
    >
      <Pressable scale={1} onClick={() => setExpanded(!expanded)} style={{
        width: '100%', padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {order.status === 'pending' && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}
              style={{ width: 40, height: 40, borderRadius: 12, background: meta.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}
            >🔔</motion.div>
          )}
          {order.status !== 'pending' && (
            <div style={{ width: 40, height: 40, borderRadius: 12, background: meta.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.Receipt size={16} stroke={meta.color} />
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>#{order.orderNumber}</span>
              <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: meta.bg, color: meta.color }}>{meta.label}</span>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              {order.customer?.name || 'Customer'} · {(order.items || []).length} item(s)
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>{PKR(order.pricing?.total || 0)}</div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <Icons.ChevronD size={16} stroke="#9CA3AF" />
          </motion.div>
        </div>
      </Pressable>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F5F5F5' }}>
              {/* Items */}
              <div style={{ marginTop: 14 }}>
                {(order.items || []).map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                    borderBottom: i < (order.items.length - 1) ? '1px solid #F5F5F5' : 'none',
                  }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{item.name}</span>
                      {item.notes && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Note: {item.notes}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>×{item.quantity}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{PKR((item.price || 0) * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div style={{ background: '#F8F8F8', borderRadius: 12, padding: '10px 12px', marginTop: 12 }}>
                {[
                  { label: 'Subtotal', val: order.pricing?.subtotal },
                  { label: 'Delivery fee', val: order.pricing?.deliveryFee },
                  { label: 'Total', val: order.pricing?.total, bold: true },
                ].filter(r => r.val != null).map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: row.bold ? '#111' : '#6b7280', fontWeight: row.bold ? 700 : 400 }}>{row.label}</span>
                    <span style={{ fontSize: 12, color: '#111', fontWeight: row.bold ? 800 : 600 }}>{PKR(row.val)}</span>
                  </div>
                ))}
              </div>

              {/* Address */}
              {order.deliveryAddress && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <Icons.MapPin size={14} stroke="var(--qb-primary)" />
                  <span style={{ fontSize: 12, color: '#6b7280' }}>
                    {order.deliveryAddress.street}, {order.deliveryAddress.city}
                  </span>
                </div>
              )}

              {/* Rider info (when assigned) */}
              {order.rider && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(139,92,246,0.06)' }}>
                  <Icons.Bike size={14} stroke="#8b5cf6" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6' }}>
                    Rider: {order.rider.name || 'Assigned'}
                  </span>
                </div>
              )}

              {/* CTA */}
              {meta.next && (
                <Pressable
                  onClick={() => onUpdateStatus(meta.next)}
                  style={{
                    width: '100%', height: 46, marginTop: 14, borderRadius: 12,
                    background: meta.next === 'ready' ? '#10b981' : 'var(--qb-primary)', color: '#fff',
                    fontSize: 14, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: meta.next === 'ready' ? '0 4px 14px rgba(16,185,129,0.28)' : '0 4px 14px rgba(229,57,53,0.28)',
                  }}
                >
                  <Icons.Check size={15} sw={3} />
                  {meta.nextLabel}
                </Pressable>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MenuTab({ restaurant }) {
  if (!restaurant?.menu?.length) {
    return (
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, textAlign: 'center', border: '1px dashed #E5E5E5' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🍽️</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Menu not loaded</div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Refresh to load your menu items</div>
      </div>
    );
  }

  const byCategory = restaurant.menu.reduce((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Object.entries(byCategory).map(([category, items]) => (
        <div key={category}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{CAT_LABELS[category] || category}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map(item => (
              <div key={item.id} style={{
                background: '#fff', borderRadius: 14, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #F0F0F0',
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: '#F8F8F8', overflow: 'hidden' }}>
                  {item.image
                    ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🍛</div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{item.name}</div>
                  {item.description && (
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</div>
                  )}
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{PKR(item.price)}</div>
                  <div style={{
                    marginTop: 3, padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                    background: item.isAvailable !== false ? 'rgba(16,185,129,0.1)' : '#F5F5F5',
                    color: item.isAvailable !== false ? '#10b981' : '#9CA3AF',
                  }}>{item.isAvailable !== false ? 'Live' : 'Off'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonOrders() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ background: '#fff', borderRadius: 18, height: 72, border: '1px solid #F0F0F0', animation: 'qb-shimmer 1.5s infinite', backgroundSize: '200% 100%' }} />
      ))}
    </div>
  );
}

function EmptyOrders({ active }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
      background: '#fff', borderRadius: 20, padding: 40, textAlign: 'center', border: '1px dashed #E5E5E5',
    }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>{active ? '⏳' : '📋'}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{active ? 'No active orders' : 'No order history'}</div>
      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>
        {active ? 'New orders will appear here in real-time' : 'Completed orders show here'}
      </div>
    </motion.div>
  );
}
