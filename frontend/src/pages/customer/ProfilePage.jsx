import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { Icons, Pressable, BrandButton, BottomNav } from '../../components/ui';

const ROLE_BADGE = {
  customer:   { label: 'Customer',   bg: '#EFF6FF', color: '#2563EB' },
  restaurant: { label: 'Restaurant', bg: '#FFF7ED', color: '#EA580C' },
  rider:      { label: 'Rider',      bg: '#F0FDF4', color: '#16A34A' },
};

function getInitial(name) {
  return (name || 'U').trim().charAt(0).toUpperCase();
}

function getAvatarBg(name) {
  const colors = ['#E53E3E', '#D97706', '#059669', '#2563EB', '#7C3AED', '#DB2777'];
  let idx = 0;
  for (let i = 0; i < (name || '').length; i++) idx += name.charCodeAt(i);
  return colors[idx % colors.length];
}

function joinYear(dateStr) {
  if (!dateStr) return new Date().getFullYear();
  return new Date(dateStr).getFullYear();
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tab, setTab] = React.useState('profile');

  const handleTab = (t) => {
    setTab(t);
    if (t === 'home')   navigate('/home');
    if (t === 'search') navigate('/restaurants');
    if (t === 'orders') navigate('/orders');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const soon = (label) => toast(`${label} — Coming soon!`, { position: 'bottom-center' });

  const role = user?.role || 'customer';
  const badge = ROLE_BADGE[role] || ROLE_BADGE.customer;
  const name = user?.name || user?.email || 'User';
  const email = user?.email || '';
  const avatarBg = getAvatarBg(name);
  const initial = getInitial(name);

  const menuItems = [
    {
      icon: Icons.Edit,
      label: 'Edit Profile',
      action: () => soon('Edit Profile'),
    },
    {
      icon: Icons.Receipt,
      label: 'Order History',
      action: () => navigate('/orders'),
    },
    {
      icon: Icons.Help,
      label: 'Help & Support',
      action: () => soon('Help & Support'),
    },
    {
      icon: Icons.Eye,
      label: 'Privacy Policy',
      action: () => soon('Privacy Policy'),
    },
  ];

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header / Avatar area */}
      <div style={{
        background: '#fff', padding: '60px 24px 28px',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      }}>
        {/* Avatar */}
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={name}
            style={{
              width: 86, height: 86, borderRadius: '50%',
              objectFit: 'cover', border: '3px solid #fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }}
          />
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              width: 86, height: 86, borderRadius: '50%',
              background: avatarBg, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 34, fontWeight: 800,
              boxShadow: '0 4px 16px rgba(0,0,0,0.16)',
            }}
          >
            {initial}
          </motion.div>
        )}

        {/* Name */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>{name}</div>
          {email && (
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{email}</div>
          )}
        </div>

        {/* Role badge */}
        <span style={{
          padding: '5px 14px', borderRadius: 20,
          background: badge.bg, color: badge.color,
          fontSize: 12, fontWeight: 700,
        }}>
          {badge.label}
        </span>

        {/* Stats row */}
        <div style={{
          marginTop: 4, padding: '10px 20px', borderRadius: 14,
          background: '#F5F5F5', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Icons.Gift size={15} stroke="#9CA3AF" sw={2}/>
          <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
            Member since <strong style={{ color: '#111' }}>{joinYear(user?.createdAt || user?.created_at)}</strong>
          </span>
        </div>
      </div>

      {/* Menu list */}
      <div style={{ margin: '16px 16px 0', background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid #F0F0F0' }}>
        {menuItems.map((item, i) => {
          const Ic = item.icon;
          return (
            <React.Fragment key={item.label}>
              {i > 0 && (
                <div style={{ height: 1, background: '#F5F5F5', marginLeft: 56 }}/>
              )}
              <Pressable onClick={item.action} style={{
                width: '100%', padding: '15px 16px',
                display: 'flex', alignItems: 'center', gap: 14,
                textAlign: 'left',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: '#F5F5F5', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ic size={18} stroke="#374151" sw={2}/>
                </div>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#111' }}>
                  {item.label}
                </span>
                <Icons.ChevronR size={18} stroke="#D1D5DB" sw={2}/>
              </Pressable>
            </React.Fragment>
          );
        })}
      </div>

      {/* Logout button */}
      <div style={{ padding: '20px 16px 0' }}>
        <BrandButton
          onClick={handleLogout}
          style={{
            background: '#FEF2F2',
            color: '#EF4444',
            boxShadow: 'none',
            border: '1px solid #FECACA',
          }}
        >
          <Icons.LogOut size={18} stroke="#EF4444" sw={2.5}/>
          Log Out
        </BrandButton>
      </div>

      <BottomNav tab={tab} onTab={handleTab}/>
    </div>
  );
}
