import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  Send:     (p) => <Ico {...p}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z"/></Ico>,
  Message:  (p) => <Ico {...p}><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></Ico>,
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
      padding: '8px 14px', borderRadius: 5, fontSize: 13, fontWeight: 600,
      background: active ? 'var(--qb-primary)' : '#F5F5F5',
      color: active ? '#fff' : '#1f1f1f',
      whiteSpace: 'nowrap', flexShrink: 0,
      border: active ? '1px solid var(--qb-primary)' : '1px solid #ECECEC',
      ...style,
    }}>{children}</Pressable>
  );
}

// ─── Ribbon ──────────────────────────────────────────────────────────────────
export function Ribbon({ kind }) {
  const palette = {
    Trending:    { bg: 'var(--qb-primary)', fg: '#fff', icon: <Icons.Flame size={11}/> },
    'Top Rated': { bg: '#111', fg: '#fff', icon: <Icons.Star size={11}/> },
    New:         { bg: '#10b981', fg: '#fff', icon: <Icons.Sparkle size={11} sw={2.5}/> },
  };
  const p = palette[kind] || palette.Trending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 8px', borderRadius: 5,
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
      height: 54, borderRadius: 5,
      background: disabled ? '#ccc' : 'var(--qb-primary)',
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
        width: 28, height: 28, borderRadius: 999, color: 'var(--qb-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Icons.Minus size={14} sw={2.5}/></Pressable>
      <span style={{ minWidth: 22, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>{value}</span>
      <Pressable onClick={() => onChange(Math.min(max, value + 1))} style={{
        width: 28, height: 28, borderRadius: 999, color: 'var(--qb-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Icons.Plus size={14} sw={2.5}/></Pressable>
    </div>
  );
}

// ─── Image URL optimizer ─────────────────────────────────────────────────────
function optimizeImg(url, width = 600) {
  if (!url) return url;
  // Supabase storage: swap /object/ for /render/image/ to get server-side resize
  if (url.includes('supabase.co/storage/v1/object/')) {
    const base = url.split('?')[0].replace('/storage/v1/object/', '/storage/v1/render/image/');
    return `${base}?width=${width}&quality=80&resize=cover`;
  }
  // Unsplash: fix width and add quality param
  if (url.includes('unsplash.com')) {
    return `${url.split('?')[0]}?w=${width}&auto=format&fit=crop&q=80`;
  }
  return url;
}

// ─── SmartImg ────────────────────────────────────────────────────────────────
// `priority` opt-in is for the very first card above the fold; everything
// else lazy-loads + low-priority so the home page paints fast and below-
// the-fold cards only fetch when scrolled into view.
export function SmartImg({
  src, alt = '', style, radius = 0, fallback = '🍽️', width = 600,
  priority = false,
}) {
  const [status, setStatus] = useState('loading'); // loading | done | error
  const optimized = optimizeImg(src, width);
  useEffect(() => { setStatus('loading'); }, [src]);
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: radius, ...style }}>
      {status === 'loading' && (
        <div style={{
          position: 'absolute', inset: 0, background: '#EEE',
          backgroundImage: 'linear-gradient(90deg, #EEE 0%, #F8F8F8 50%, #EEE 100%)',
          backgroundSize: '200% 100%',
          animation: 'qb-shimmer 1.2s linear infinite',
        }}/>
      )}
      {(status === 'error' || !src) ? (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #FFF1E6 0%, #FFE5E5 100%)',
          fontSize: 'clamp(28px, 6vw, 56px)',
        }}>{fallback}</div>
      ) : (
        <img
          src={optimized}
          alt={alt}
          decoding="async"
          loading={priority ? 'eager' : 'lazy'}
          fetchpriority={priority ? 'high' : 'low'}
          onLoad={() => setStatus('done')}
          onError={() => setStatus('error')}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            opacity: status === 'done' ? 1 : 0, transition: 'opacity .3s',
          }}
        />
      )}
    </div>
  );
}

// ─── QuickBite logo ───────────────────────────────────────────────────────────
// Wordmark-only identity: "quick" in near-black + "bite" in brand red, set
// in heavy lowercase Inter with tight negative tracking. No glyph, no
// roundel — type carries the brand. The `inverted` prop swaps the two
// colours so the mark stays readable on the brand-red hero background.
//
// Some surfaces only have square space (favicon, PWA icon, app icon on the
// suspense splash). For those, callers pass `compact` to render the short
// "qb." variant — same typeface, same letter-spacing, fits in a square.
export function QBLogoMark({
  size = 32,
  inverted = false,
  compact = false,
}) {
  // `size` historically meant "icon edge in px". For the wordmark we treat
  // it as the cap height of the type and scale the word accordingly. The
  // tracking ratio is calibrated so "quickbite." reads tight at every size.
  const fontPx = compact ? size * 0.78 : size * 0.74;
  const baseColor = inverted ? '#fff' : '#111';
  const accentColor = inverted ? '#FFE5DD' : 'var(--qb-primary)';
  return (
    <span style={{
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
      fontWeight: 900,
      fontSize: fontPx,
      lineHeight: 1,
      letterSpacing: '-0.05em',
      color: baseColor,
      whiteSpace: 'nowrap',
      display: 'inline-block',
    }}>
      {compact
        ? <>qb<span style={{ color: accentColor }}>.</span></>
        : <>quick<span style={{ color: accentColor }}>bite</span><span style={{ color: accentColor }}>.</span></>
      }
    </span>
  );
}

// Lockup — backwards-compatible shim. The new identity IS the wordmark,
// so the lockup just renders the wordmark; the `tagline` arg still works
// for the rare surface (e.g. landing hero) that wants the "FAST · FAIR ·
// TASTY" line underneath.
export function QBLogoLockup({ size = 32, color, tagline = true, inverted = false }) {
  const subColor = inverted ? 'rgba(255,255,255,0.7)' : '#9CA3AF';
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1, gap: 6 }}>
      <QBLogoMark size={size} inverted={inverted}/>
      {tagline && (
        <span style={{
          fontSize: Math.max(10, size * 0.28),
          fontWeight: 700,
          color: color || subColor,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
        }}>
          Fast · Fair · Tasty
        </span>
      )}
    </div>
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
      maxWidth: 430, margin: '0 auto',
    }}>
      <div style={{
        margin: '0 16px 8px', height: 64, borderRadius: 5,
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
              gap: 3, color: active ? 'var(--qb-primary)' : '#9CA3AF',
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

// ─── WelcomeBanner ───────────────────────────────────────────────────────────
function avatarBgFromName(name) {
  const palette = ['#E53E3E', '#D97706', '#059669', '#2563EB', '#7C3AED', '#DB2777'];
  let acc = 0;
  for (let i = 0; i < (name || '').length; i++) acc += name.charCodeAt(i);
  return palette[acc % palette.length];
}

const WELCOME_GREETINGS = [
  "Glad to see you back",
  "Let's grab something tasty",
  "Hungry? We've got you",
  "Your favourites are waiting",
];

export function WelcomeBanner({ name, avatar, autoDismissMs = 3500, onClose }) {
  const [open, setOpen] = useState(true);

  const first = (name || 'there').trim().split(/\s+/)[0];
  const greeting = WELCOME_GREETINGS[((first || '').charCodeAt(0) || 0) % WELCOME_GREETINGS.length];
  const initial = (first || 'U').charAt(0).toUpperCase();
  const avBg = avatarBgFromName(first);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), autoDismissMs);
    return () => clearTimeout(t);
  }, [open, autoDismissMs]);

  return (
    <AnimatePresence onExitComplete={() => onClose && onClose()}>
      {open && (
        <div style={{
          position: 'fixed', zIndex: 100,
          top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          left: 12, right: 12,
          maxWidth: 440,
          margin: '0 auto',
          pointerEvents: 'none',
        }}>
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          style={{ pointerEvents: 'auto' }}
          role="status" aria-live="polite"
        >
          <div style={{
            position: 'relative',
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px',
            background: '#fff',
            borderRadius: 5,
            boxShadow: '0 14px 36px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
              background: 'linear-gradient(180deg, var(--qb-primary), var(--qb-accent))',
            }}/>
            {avatar ? (
              <img src={avatar} alt={first}
                style={{ width: 40, height: 40, borderRadius: 999, objectFit: 'cover',
                  flexShrink: 0, border: '2px solid #fff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}/>
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: 999, background: avBg,
                color: '#fff', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, fontWeight: 800,
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              }}>{initial}</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#111',
                letterSpacing: -0.2, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Welcome, {first}!
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {greeting}
              </div>
            </div>
            <Pressable onClick={() => setOpen(false)} aria-label="Dismiss" style={{
              width: 30, height: 30, borderRadius: 999, color: '#9CA3AF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icons.X size={16} sw={2.2}/>
            </Pressable>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── BigRestaurantCard ───────────────────────────────────────────────────────
const CUISINE_EMOJI = {
  pizza:'🍕', italian:'🍝', pasta:'🍝',
  burgers:'🍔', american:'🍔',
  biryani:'🍚', rice:'🍚', pakistani:'🍛', indian:'🍛', bbq:'🍢', desi:'🍛',
  chinese:'🥡', shawarma:'🌯', arabic:'🌯', 'middle eastern':'🌯',
  vegan:'🥗', healthy:'🥗',
  dessert:'🍰', desserts:'🍰', 'ice cream':'🍦',
};

const cuisineFallback = (cuisines = []) => {
  for (const c of cuisines) {
    const e = CUISINE_EMOJI[(c || '').toLowerCase()];
    if (e) return e;
  }
  return '🍽️';
};

const formatReviewCount = (n) => {
  if (!n) return '0';
  if (n >= 1000) return `${Math.floor(n / 1000)}k+`;
  if (n >= 500) return `${Math.floor(n / 100) * 100}+`;
  return String(n);
};

const cuisineLabel = (cuisines = []) => {
  const c = cuisines[0] || '';
  if (/burger|pizza|fried|american|fast/i.test(c)) return 'Fast Food';
  return c || 'Restaurant';
};

export function BigRestaurantCard({ r, onClick }) {
  const ribbon = r.status?.isFeatured ? 'Trending' : null;
  const img = r.images?.cover;
  const time = r.delivery?.estimatedTime || 30;
  const fee  = r.delivery?.fee || 50;
  const discount = r.pricing?.discount?.upTo || r.discount?.upTo || 0;
  const saverFee = r.delivery?.saverFee || Math.max(0, fee - 30);

  return (
    <motion.div whileHover={{ y: -2, boxShadow: '0 12px 30px rgba(0,0,0,0.10)' }}
      whileTap={{ scale: 0.98 }} onClick={onClick}
      transition={{ duration: 0.2 }}
      style={{
        background: '#fff', borderRadius: 5, overflow: 'hidden',
        border: '1px solid #F0F0F0', cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
      }}>
      {/* Cover image */}
      <div style={{ position: 'relative', height: 168 }}>
        <SmartImg src={img} fallback={cuisineFallback(r.cuisine)} style={{ position: 'absolute', inset: 0 }}/>
        {ribbon && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <Ribbon kind={ribbon}/>
          </div>
        )}
      </div>

      {/* Info — name + ⭐ row */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#111', letterSpacing: -0.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {r.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            <Icons.Star size={13} fill="#F5A524" stroke="#F5A524"/>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>
              {(r.rating?.average || 0).toFixed(1)}
            </span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              ({formatReviewCount(r.rating?.count)})
            </span>
          </div>
        </div>

        {/* Meta — time · cuisine */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6,
          fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
          <span>From {time} min</span>
          <span style={{ color: '#D1D5DB' }}>·</span>
          <span>{cuisineLabel(r.cuisine)}</span>
        </div>

        {/* Saver delivery row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6,
          fontSize: 13, color: '#374151' }}>
          <Icons.Bike size={14} stroke="#6b7280" sw={2}/>
          <span>From <strong style={{ color: '#111', fontWeight: 700 }}>Rs.{saverFee}</strong> with Saver</span>
        </div>

        {/* Discount badge */}
        {discount > 0 && (
          <div style={{ marginTop: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 999,
              background: 'rgba(229,57,53,0.1)', color: 'var(--qb-primary)',
              fontSize: 11, fontWeight: 700,
            }}>
              <Icons.Tag size={11} stroke="var(--qb-primary)" sw={2.2}/>
              Up to {discount}% off
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
