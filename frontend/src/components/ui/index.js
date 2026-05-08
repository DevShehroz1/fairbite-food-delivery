import React, { useState } from 'react';
import { motion } from 'framer-motion';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ico = ({ d, size = 20, stroke = 'currentColor', sw = 2, fill = 'none', children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d ? <path d={d} /> : children}
  </svg>
);

export const Icons = {
  Search:   (p) => <Ico {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Ico>,
  MapPin:   (p) => <Ico {...p}><path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/></Ico>,
  Cart:     (p) => <Ico {...p}><path d="M3 3h2l2.5 12.5a2 2 0 0 0 2 1.5h8a2 2 0 0 0 2-1.5L21 7H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></Ico>,
  Home:     (p) => <Ico {...p}><path d="M3 11 12 3l9 8v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2v-9Z"/></Ico>,
  Compass:  (p) => <Ico {...p}><circle cx="12" cy="12" r="9"/><path d="m15 9-2 6-6 2 2-6 6-2Z"/></Ico>,
  Receipt:  (p) => <Ico {...p}><path d="M5 3v18l2-1.5 2 1.5 2-1.5 2 1.5 2-1.5 2 1.5 2-1.5V3H5Z"/><path d="M8 8h8M8 12h8M8 16h5"/></Ico>,
  User:     (p) => <Ico {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Ico>,
  Star:     (p) => <Ico fill="currentColor" stroke="none" {...p}><path d="m12 2 3 7 7 .5-5.5 4.5L18 21l-6-3.5L6 21l1.5-7L2 9.5 9 9l3-7Z"/></Ico>,
  Clock:    (p) => <Ico {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Ico>,
  Plus:     (p) => <Ico {...p}><path d="M12 5v14M5 12h14"/></Ico>,
  Minus:    (p) => <Ico {...p}><path d="M5 12h14"/></Ico>,
  Mic:      (p) => <Ico {...p}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></Ico>,
  Filter:   (p) => <Ico {...p}><path d="M3 5h18M6 12h12M10 19h4"/></Ico>,
  ChevronR: (p) => <Ico {...p}><path d="m9 6 6 6-6 6"/></Ico>,
  ChevronL: (p) => <Ico {...p}><path d="m15 6-6 6 6 6"/></Ico>,
  ChevronD: (p) => <Ico {...p}><path d="m6 9 6 6 6-6"/></Ico>,
  Bike:     (p) => <Ico {...p}><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="m6 17 5-9h4l3 5"/><path d="M11 8h4"/></Ico>,
  Phone:    (p) => <Ico fill="currentColor" stroke="none" {...p}><path d="M3 5a2 2 0 0 1 2-2h2.5a1 1 0 0 1 1 .8L9 7.5a1 1 0 0 1-.3 1L7 10a13 13 0 0 0 7 7l1.5-1.7a1 1 0 0 1 1-.3l3.7.5a1 1 0 0 1 .8 1V19a2 2 0 0 1-2 2A18 18 0 0 1 3 5Z"/></Ico>,
  Heart:    (p) => <Ico {...p}><path d="M12 21s-7-4.5-9-9.5C1.5 7 5 4 8 5.5 10 6.5 12 9 12 9s2-2.5 4-3.5C19 4 22.5 7 21 11.5c-2 5-9 9.5-9 9.5Z"/></Ico>,
  Check:    (p) => <Ico {...p}><path d="m5 13 4 4L19 7"/></Ico>,
  X:        (p) => <Ico {...p}><path d="M6 6l12 12M18 6 6 18"/></Ico>,
  Trash:    (p) => <Ico {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/></Ico>,
  Wallet:   (p) => <Ico {...p}><path d="M3 7a2 2 0 0 1 2-2h13l1 4H5a2 2 0 0 1-2-2Z"/><path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V9H5a2 2 0 0 1-2-2Z"/><circle cx="17" cy="14" r="1.3" fill="currentColor"/></Ico>,
  Card:     (p) => <Ico {...p}><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/><path d="M6 15h4"/></Ico>,
  Cash:     (p) => <Ico {...p}><rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M5 9.5v5M19 9.5v5"/></Ico>,
  Google:   (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 1 1-3.4-13l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5Z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12a12 12 0 0 1 7.6 2.7l5.7-5.7A20 20 0 0 0 6.3 14.7Z"/>
      <path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.5-5.2l-6.2-5.3A12 12 0 0 1 12.7 28l-6.6 5A20 20 0 0 0 24 44Z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.5l6.2 5.3A20 20 0 0 0 44 24c0-1.2-.1-2.4-.4-3.5Z"/>
    </svg>
  ),
  Bell:     (p) => <Ico {...p}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7Z"/><path d="M10 21a2 2 0 0 0 4 0"/></Ico>,
  Settings: (p) => <Ico {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8L4.2 7a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.7 7l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></Ico>,
  Gift:     (p) => <Ico {...p}><path d="M3 12v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8M2 8h20v4H2zM12 22V8M12 8H7.5a2.5 2.5 0 1 1 0-5C11 3 12 8 12 8ZM12 8h4.5a2.5 2.5 0 1 0 0-5C13 3 12 8 12 8Z"/></Ico>,
  LogOut:   (p) => <Ico {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></Ico>,
  Help:     (p) => <Ico {...p}><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4M12 17h.01"/></Ico>,
  Edit:     (p) => <Ico {...p}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></Ico>,
  Eye:      (p) => <Ico {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></Ico>,
  EyeOff:   (p) => <Ico {...p}><path d="M3 3l18 18M10.6 6.1A10 10 0 0 1 22 12s-1 2-3 4M6.5 6.5C3.5 8.5 2 12 2 12s3.5 7 10 7c2 0 3.7-.6 5-1.4M9.9 9.9a3 3 0 0 0 4.2 4.2"/></Ico>,
  Tag:      (p) => <Ico {...p}><path d="M3 12V3h9l9 9-9 9-9-9Z"/><circle cx="7.5" cy="7.5" r="1.3" fill="currentColor"/></Ico>,
  Sparkle:  (p) => <Ico {...p}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M5.6 18.4l4.2-4.2M14.2 9.8l4.2-4.2"/></Ico>,
  Flame:    (p) => <Ico fill="currentColor" stroke="none" {...p}><path d="M12 2s4 4 4 9-2 7-4 7-4-2-4-7 4-9 4-9Zm0 11a3 3 0 0 0-3 3c0 2 1 4 3 4s3-2 3-4a3 3 0 0 0-3-3Z"/></Ico>,
  Power:    (p) => <Ico {...p}><path d="M12 2v10M5.6 7.5a8 8 0 1 0 12.8 0"/></Ico>,
  Truck:    (p) => <Ico {...p}><path d="M3 17V6h11v11M14 11h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></Ico>,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const PKR = (n) => `Rs. ${Math.round(n).toLocaleString('en-PK')}`;

// ─── Pressable ───────────────────────────────────────────────────────────────
export function Pressable({ children, onClick, style, scale = 0.97, hover = 1.0, ...rest }) {
  return (
    <motion.button
      whileTap={{ scale }}
      whileHover={{ scale: hover }}
      onClick={onClick}
      style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer', ...style }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

// ─── Stars ───────────────────────────────────────────────────────────────────
export function Stars({ rating, size = 12, color = '#F5A524' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color }}>
      <Icons.Star size={size} />
      <span style={{ color: '#111', fontWeight: 600, fontSize: size + 1 }}>{Number(rating).toFixed(1)}</span>
    </span>
  );
}

// ─── Chip ────────────────────────────────────────────────────────────────────
export function Chip({ children, active, onClick, style }) {
  return (
    <Pressable onClick={onClick} style={{
      padding: '8px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600,
      background: active ? 'var(--fb-primary)' : '#F5F5F5',
      color: active ? '#fff' : '#1f1f1f',
      whiteSpace: 'nowrap', flexShrink: 0,
      border: active ? '1px solid var(--fb-primary)' : '1px solid #ECECEC',
      ...style,
    }}>{children}</Pressable>
  );
}

// ─── Ribbon ──────────────────────────────────────────────────────────────────
export function Ribbon({ kind }) {
  const palette = {
    Trending:    { bg: 'var(--fb-primary)', fg: '#fff', icon: <Icons.Flame size={11}/> },
    'Top Rated': { bg: '#111', fg: '#fff', icon: <Icons.Star size={11}/> },
    New:         { bg: '#10b981', fg: '#fff', icon: <Icons.Sparkle size={11} sw={2.5}/> },
  };
  const p = palette[kind] || palette.Trending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 8px', borderRadius: 8,
      fontSize: 11, fontWeight: 700, letterSpacing: 0.2,
      background: p.bg, color: p.fg,
      boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
    }}>{p.icon}{kind.toUpperCase()}</span>
  );
}

// ─── BrandButton ─────────────────────────────────────────────────────────────
export function BrandButton({ children, onClick, full = true, disabled, style }) {
  return (
    <Pressable onClick={onClick} scale={disabled ? 1 : 0.97} style={{
      width: full ? '100%' : undefined,
      height: 54, borderRadius: 24,
      background: disabled ? '#ccc' : 'var(--fb-primary)',
      color: '#fff',
      fontSize: 16, fontWeight: 700, letterSpacing: 0.1,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      boxShadow: disabled ? 'none' : '0 8px 20px rgba(229,57,53,0.32)',
      pointerEvents: disabled ? 'none' : 'auto',
      ...style,
    }}>{children}</Pressable>
  );
}

// ─── Stepper ─────────────────────────────────────────────────────────────────
export function Stepper({ value, onChange, min = 0, max = 99 }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      background: '#fff', border: '1px solid #ECECEC',
      borderRadius: 999, padding: 2,
    }}>
      <Pressable onClick={() => onChange(Math.max(min, value - 1))} style={{
        width: 28, height: 28, borderRadius: 999, color: 'var(--fb-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Icons.Minus size={14} sw={2.5}/></Pressable>
      <span style={{ minWidth: 22, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>{value}</span>
      <Pressable onClick={() => onChange(Math.min(max, value + 1))} style={{
        width: 28, height: 28, borderRadius: 999, color: 'var(--fb-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Icons.Plus size={14} sw={2.5}/></Pressable>
    </div>
  );
}

// ─── SmartImg ────────────────────────────────────────────────────────────────
export function SmartImg({ src, alt = '', style, radius = 0 }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: radius, ...style }}>
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0, background: '#EEE',
          backgroundImage: 'linear-gradient(90deg, #EEE 0%, #F8F8F8 50%, #EEE 100%)',
          backgroundSize: '200% 100%',
          animation: 'fb-shimmer 1.2s linear infinite',
        }}/>
      )}
      <img src={src} alt={alt} loading="lazy" onLoad={() => setLoaded(true)}
        style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          opacity: loaded ? 1 : 0, transition: 'opacity .3s',
        }}/>
    </div>
  );
}

// ─── FBLogo ───────────────────────────────────────────────────────────────────
export function FBLogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="var(--fb-primary)"/>
      <path d="M9 10h10a4 4 0 0 1 0 8H9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M9 14h8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="12" cy="22" r="2" fill="#fff"/>
      <circle cx="20" cy="22" r="2" fill="#fff"/>
    </svg>
  );
}

// ─── BottomNav ───────────────────────────────────────────────────────────────
export function BottomNav({ tab, onTab }) {
  const items = [
    { id: 'home',    label: 'Home',    icon: Icons.Home },
    { id: 'search',  label: 'Search',  icon: Icons.Compass },
    { id: 'orders',  label: 'Orders',  icon: Icons.Receipt },
    { id: 'profile', label: 'Profile', icon: Icons.User },
  ];
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
      paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      background: 'linear-gradient(180deg, transparent, #fff 30%)',
      pointerEvents: 'none',
    }}>
      <div style={{
        margin: '0 16px 8px', height: 64, borderRadius: 22,
        background: '#fff', border: '1px solid #F0F0F0',
        boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        pointerEvents: 'auto',
      }}>
        {items.map(it => {
          const active = tab === it.id;
          const Ic = it.icon;
          return (
            <Pressable key={it.id} onClick={() => onTab(it.id)} style={{
              flex: 1, height: '100%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 3, color: active ? 'var(--fb-primary)' : '#9CA3AF',
            }}>
              <Ic size={22} sw={active ? 2.5 : 2}/>
              <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 600 }}>{it.label}</span>
            </Pressable>
          );
        })}
      </div>
    </div>
  );
}

// ─── BigRestaurantCard ───────────────────────────────────────────────────────
export function BigRestaurantCard({ r, onClick }) {
  const ribbon = r.status?.isFeatured ? 'Trending' : null;
  const img = r.images?.cover || `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop`;
  return (
    <motion.div whileHover={{ y: -2, boxShadow: '0 12px 30px rgba(0,0,0,0.10)' }}
      whileTap={{ scale: 0.98 }} onClick={onClick}
      transition={{ duration: 0.2 }}
      style={{
        background: '#fff', borderRadius: 16, overflow: 'hidden',
        border: '1px solid #F0F0F0', cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
      }}>
      <div style={{ position: 'relative', height: 152 }}>
        <SmartImg src={img} style={{ position: 'absolute', inset: 0 }}/>
        {ribbon && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <Ribbon kind={ribbon}/>
          </div>
        )}
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          padding: '4px 9px', borderRadius: 8,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          color: '#fff', fontSize: 11, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 4,
        }}><Icons.Clock size={11} sw={2.5}/>{r.delivery?.estimatedTime || 30} min</div>
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>{r.name}</div>
          <Stars rating={r.rating?.average || 0} size={12}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 12, color: '#6b7280' }}>
          <span>{(r.cuisine || []).join(' · ')}</span>
          <span>•</span>
          <span>{r.rating?.count || 0} reviews</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 10, paddingTop: 10, borderTop: '1px dashed #ECECEC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
            <Icons.Bike size={14} stroke="var(--fb-primary)" sw={2.5}/>
            <span style={{ color: '#111', fontWeight: 600 }}>{PKR(r.delivery?.fee || 50)}</span>
            <span>delivery</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
