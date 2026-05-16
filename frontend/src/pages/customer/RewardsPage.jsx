import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Icons, PKR, Pressable, BottomNav } from '../../components/ui';

const SOURCE_META = {
  welcome:   { emoji: '👋', tint: '#10b981', label: 'Welcome bonus' },
  referee:   { emoji: '🎁', tint: 'var(--qb-primary)', label: 'Friend referral' },
  referrer:  { emoji: '🎁', tint: 'var(--qb-primary)', label: 'Your invite worked!' },
  milestone: { emoji: '🏆', tint: '#7C3AED', label: 'Order milestone' },
  public:    { emoji: '🎟️', tint: '#2563EB', label: 'Public promo' },
  manual:    { emoji: '🎫', tint: '#374151', label: 'Bonus' },
};

const formatValue = (c) => {
  if (c.type === 'percent')       return `${c.value}% OFF`;
  if (c.type === 'flat')          return PKR(c.value);
  if (c.type === 'free_delivery') return 'FREE DELIVERY';
  return '';
};

export default function RewardsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('available');

  useEffect(() => {
    api.get('/coupons/me')
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Could not load rewards'))
      .finally(() => setLoading(false));
  }, []);

  const copy = (code) => {
    navigator.clipboard?.writeText(code).then(
      () => toast.success(`Code "${code}" copied! Paste it at checkout.`, { autoClose: 2000 }),
      () => toast.info(`Copy code: ${code}`)
    );
  };

  const available = data?.available || [];
  const used      = data?.used || [];
  const publicCodes = data?.publicCodes || [];

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--qb-primary) 0%, #b91c1c 100%)',
        color: '#fff', padding: '52px 16px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pressable onClick={() => navigate('/profile')} style={{
            width: 38, height: 38, borderRadius: 5, background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icons.ChevronL size={20} stroke="#fff" sw={2.5}/></Pressable>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.3 }}>My Rewards</div>
        </div>
        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 8 }}>
          {available.length} active · {used.length} used
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, padding: '14px 16px 6px', background: '#F5F5F5', position: 'sticky', top: 0, zIndex: 10 }}>
        {[
          { id: 'available', label: `Active (${available.length})` },
          { id: 'public',    label: `Promo codes (${publicCodes.length})` },
          { id: 'used',      label: `Used (${used.length})` },
        ].map(t => (
          <Pressable key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 14px', borderRadius: 999,
            background: tab === t.id ? 'var(--qb-primary)' : '#fff',
            color: tab === t.id ? '#fff' : '#374151',
            fontSize: 12, fontWeight: 700,
            border: tab === t.id ? '1px solid var(--qb-primary)' : '1px solid #F0F0F0',
          }}>{t.label}</Pressable>
        ))}
      </div>

      <div style={{ padding: '6px 16px' }}>
        {loading ? (
          <Skel/>
        ) : tab === 'available' ? (
          available.length === 0 ? <Empty title="No active rewards" hint="Order food, refer friends, or claim a promo code to earn coupons."/>
            : available.map(c => <CouponCard key={c.id} coupon={c} onCopy={() => copy(c.code)}/>)
        ) : tab === 'public' ? (
          publicCodes.map(c => <CouponCard key={c.code} coupon={c} isPublic onCopy={() => copy(c.code)}/>)
        ) : (
          used.length === 0 ? <Empty title="Nothing used yet" hint="Coupons you redeem will appear here."/>
            : used.map(c => <CouponCard key={c.id} coupon={c} dim onCopy={null}/>)
        )}
      </div>

      <BottomNav tab="profile" onTab={(t) => {
        if (t === 'home')    navigate('/home');
        if (t === 'search')  navigate('/restaurants');
        if (t === 'orders')  navigate('/orders');
        if (t === 'profile') navigate('/profile');
      }}/>
    </div>
  );
}

function CouponCard({ coupon, isPublic, dim, onCopy }) {
  const meta = SOURCE_META[coupon.source] || SOURCE_META.manual;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff', borderRadius: 5, marginTop: 10,
        border: '1px solid #F0F0F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex', overflow: 'hidden',
        opacity: dim ? 0.55 : 1,
      }}>
      <div style={{
        width: 84, flexShrink: 0,
        background: `${meta.tint}15`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 4, padding: '14px 0',
        borderRight: `2px dashed ${meta.tint}33`,
      }}>
        <div style={{ fontSize: 26 }}>{meta.emoji}</div>
        <div style={{ fontSize: 11, fontWeight: 800, color: meta.tint, textAlign: 'center', lineHeight: 1.2 }}>
          {formatValue(coupon)}
        </div>
      </div>

      <div style={{ flex: 1, padding: '14px 14px 12px', minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: meta.tint, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {meta.label}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginTop: 3, lineHeight: 1.3 }}>
          {coupon.label}
        </div>
        {coupon.minOrder > 0 && (
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
            Min order Rs. {coupon.minOrder}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <div style={{
            flex: 1, padding: '6px 10px', borderRadius: 5,
            background: '#F5F5F5', fontSize: 12, fontWeight: 800, color: '#111',
            letterSpacing: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {coupon.code}
          </div>
          {onCopy && (
            <Pressable onClick={onCopy} style={{
              padding: '7px 12px', borderRadius: 5,
              background: meta.tint, color: '#fff',
              fontSize: 11, fontWeight: 800, letterSpacing: 0.5,
            }}>COPY</Pressable>
          )}
          {dim && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 5, background: '#F5F5F5', color: '#9CA3AF', letterSpacing: 0.4 }}>USED</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Empty({ title, hint }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 16px', color: '#6b7280' }}>
      <div style={{ fontSize: 42, marginBottom: 8 }}>🎟️</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>{title}</div>
      <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5, maxWidth: 260, marginLeft: 'auto', marginRight: 'auto' }}>
        {hint}
      </div>
    </div>
  );
}

function Skel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{
          height: 92, borderRadius: 5, background: '#EEE',
          backgroundImage: 'linear-gradient(90deg, #EEE 0%, #F8F8F8 50%, #EEE 100%)',
          backgroundSize: '200% 100%', animation: 'qb-shimmer 1.2s linear infinite',
        }}/>
      ))}
    </div>
  );
}
