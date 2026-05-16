import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Icons, PKR, Pressable } from '../../components/ui';

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

const ROLE_COLORS = {
  customer:   '#3b82f6',
  restaurant: '#f59e0b',
  rider:      '#10b981',
  admin:      '#ef4444',
};

const STAT_CARDS = [
  { Icon: Icons.User,    label: 'Total Users',       value: '1,240',    accent: '#3b82f6' },
  { Icon: Icons.Truck,   label: 'Restaurants',        value: '156',      accent: '#10b981' },
  { Icon: Icons.Receipt, label: 'Orders Today',       value: '842',      accent: '#f59e0b' },
  { Icon: Icons.Tag,     label: 'Platform Revenue',   value: 'PKR 89K',  accent: '#ef4444' },
];

const IMPACT_STATS = [
  { value: 'PKR 2.4M', label: 'Saved for restaurants with 15% commission' },
  { value: '156',      label: 'Restaurants onboarded' },
  { value: 'PKR 156',  label: 'Avg rider earning per delivery' },
  { value: '0',        label: 'Hidden fees charged' },
];

const cardStyle = {
  background: '#F5F5F5',
  borderRadius: 5,
  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
  overflow: 'hidden',
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'inherit' }}>

      {/* ── Sticky Header ─────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: '#fff',
        borderBottom: '1px solid #F0F0F0',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#111', lineHeight: 1.2 }}>
            Admin Dashboard
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
            Welcome back, {user?.name || 'Admin'}
          </div>
        </div>

        <Pressable
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 5,
            background: '#fff1f1', color: '#ef4444',
            fontSize: 13, fontWeight: 600,
            border: '1px solid #fecaca',
          }}
        >
          <Icons.LogOut size={15} stroke="#ef4444" />
          Logout
        </Pressable>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div style={{ padding: '20px 16px 40px', maxWidth: 600, margin: '0 auto' }}>

        {/* ── 2×2 Stat Grid ───────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 12, marginBottom: 16,
        }}>
          {STAT_CARDS.map(({ Icon, label, value, accent }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ ...cardStyle, padding: '16px 14px' }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 5,
                background: accent + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10, color: accent,
              }}>
                <Icon size={18} stroke={accent} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111', lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                {label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Red Gradient Impact Banner ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{
            borderRadius: 5,
            background: 'linear-gradient(135deg, var(--qb-primary) 0%, #b91c1c 100%)',
            padding: '20px 18px',
            marginBottom: 20,
            boxShadow: '0 8px 24px rgba(229,57,53,0.28)',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 14 }}>
            QuickBite Impact This Month
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}>
            {IMPACT_STATS.map(({ value, label }) => (
              <div key={label}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                  {value}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 3, lineHeight: 1.4 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Tab Bar ─────────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: 6,
          background: '#F5F5F5', borderRadius: 5,
          padding: 4, marginBottom: 16,
        }}>
          {['Users', 'Restaurants'].map((label, i) => (
            <Pressable
              key={label}
              onClick={() => setTab(i)}
              style={{
                flex: 1, padding: '9px 0',
                borderRadius: 5, fontSize: 13, fontWeight: 700,
                background: tab === i ? '#fff' : 'transparent',
                color: tab === i ? '#111' : '#6b7280',
                boxShadow: tab === i ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                textAlign: 'center',
              }}
            >
              {label}
            </Pressable>
          ))}
        </div>

        {/* ── Users Tab ───────────────────────────────────────── */}
        {tab === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DEMO_USERS.map((u, i) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                style={{
                  ...cardStyle,
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: 5,
                  background: (ROLE_COLORS[u.role] || '#6b7280') + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  color: ROLE_COLORS[u.role] || '#6b7280',
                }}>
                  <Icons.User size={18} stroke={ROLE_COLORS[u.role] || '#6b7280'} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{u.name}</span>
                    {/* Role badge */}
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      padding: '2px 7px', borderRadius: 999,
                      background: (ROLE_COLORS[u.role] || '#6b7280') + '18',
                      color: ROLE_COLORS[u.role] || '#6b7280',
                      textTransform: 'capitalize',
                    }}>
                      {u.role}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{u.email}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
                    Joined {u.createdAt}
                  </div>
                </div>

                {/* Active dot */}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 4, flexShrink: 0,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: u.isActive ? '#10b981' : '#d1d5db',
                  }} />
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: u.isActive ? '#10b981' : '#9ca3af',
                  }}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Restaurants Tab ─────────────────────────────────── */}
        {tab === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DEMO_RESTAURANTS.map((r, i) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                style={{ ...cardStyle, padding: '14px 16px' }}
              >
                {/* Top row: name + badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 5, flexShrink: 0,
                      background: '#fef3c7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                    }}>
                      🍽️
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>Owner: {r.owner}</div>
                    </div>
                  </div>

                  {/* Verified / Pending pill */}
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    padding: '3px 9px', borderRadius: 999,
                    background: r.status.isVerified ? '#d1fae5' : '#fef3c7',
                    color:      r.status.isVerified ? '#059669' : '#d97706',
                  }}>
                    {r.status.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>

                {/* Stats row */}
                <div style={{
                  display: 'flex', gap: 0,
                  borderTop: '1px dashed #E5E7EB', paddingTop: 10, marginTop: 4,
                }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>
                      {r.stats.totalOrders}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>Orders</div>
                  </div>
                  <div style={{ width: 1, background: '#E5E7EB' }} />
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>
                      {PKR(r.stats.totalRevenue)}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>Revenue</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
