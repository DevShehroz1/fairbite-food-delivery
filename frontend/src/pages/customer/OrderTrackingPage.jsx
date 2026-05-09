import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import socket from '../../services/socket';
import { Icons, Pressable, SmartImg, BrandButton } from '../../components/ui';

const STATUS_STEPS = [
  { key: 'pending',    label: 'Order Placed',  sub: 'We received your order' },
  { key: 'confirmed',  label: 'Confirmed',     sub: 'Restaurant accepted' },
  { key: 'preparing',  label: 'Preparing',     sub: 'Chefs are on it' },
  { key: 'ready',      label: 'Ready',         sub: 'Awaiting pickup' },
  { key: 'picked-up',  label: 'Picked Up',     sub: 'Rider has your food' },
  { key: 'on-the-way', label: 'On The Way',    sub: '1.2 km away' },
  { key: 'delivered',  label: 'Delivered',     sub: 'Enjoy your meal!' },
];

const ROUTE_PATH = "M50,360 C90,320 130,300 165,280 S220,240 250,200 S290,140 340,120";

export default function OrderTrackingPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const pathRef   = useRef(null);

  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep]     = useState(0);
  const [eta, setEta]       = useState(28 * 60);
  const [riderPos, setRiderPos] = useState({ x: 50, y: 360 });

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => {
        const o = r.data.data;
        setOrder(o);
        const idx = STATUS_STEPS.findIndex(s => s.key === o.status);
        setStep(Math.max(0, idx));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Socket.io real-time updates
  useEffect(() => {
    socket.emit('join_order', id);
    socket.on(`order_${id}_status`, ({ status, rider }) => {
      const idx = STATUS_STEPS.findIndex(s => s.key === status);
      if (idx >= 0) setStep(idx);
      if (rider) setOrder(prev => prev ? { ...prev, rider } : prev);
    });
    return () => { socket.off(`order_${id}_status`); };
  }, [id]);

  // ETA countdown
  useEffect(() => {
    const t = setInterval(() => setEta(e => Math.max(0, e - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Demo: auto-advance step every 9s
  useEffect(() => {
    if (step >= STATUS_STEPS.length - 1) return;
    const t = setTimeout(() => setStep(s => Math.min(STATUS_STEPS.length - 1, s + 1)), 9000);
    return () => clearTimeout(t);
  }, [step]);

  // Rider dot position along path
  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    try {
      const total = el.getTotalLength();
      const progress = Math.min(1, step / (STATUS_STEPS.length - 1));
      const pt = el.getPointAtLength(progress * total);
      setRiderPos({ x: pt.x, y: pt.y });
    } catch (_) {}
  }, [step]);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const progress = Math.min(1, step / (STATUS_STEPS.length - 1));

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <Icons.Bike size={36} stroke="var(--fb-primary)"/>
      </motion.div>
    </div>
  );

  const currentStep = STATUS_STEPS[step];
  const rider = order?.rider;

  return (
    <div style={{ height: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* map — top 60% */}
      <div style={{ position: 'relative', flex: '0 0 60%', overflow: 'hidden' }}>
        <CityMap progress={progress} pathRef={pathRef} riderPos={riderPos}/>

        {/* back btn */}
        <Pressable onClick={() => navigate(-1)} style={{
          position: 'absolute', top: 52, left: 16, zIndex: 5,
          width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        }}><Icons.ChevronL size={20} stroke="#111" sw={2.5}/></Pressable>

        {/* ETA pill */}
        <div style={{
          position: 'absolute', top: 52, right: 16, zIndex: 5,
          padding: '8px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(10px)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: 999, background: '#10b981' }}/>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>
            Arriving in <span style={{ color: 'var(--fb-primary)' }}>{fmt(eta)}</span>
          </span>
        </div>

        {/* distance pill */}
        <div style={{
          position: 'absolute', top: 106, right: 16, zIndex: 5,
          padding: '6px 10px', borderRadius: 12, background: 'rgba(17,17,17,0.85)',
          backdropFilter: 'blur(8px)', color: '#fff',
          fontSize: 11, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <Icons.Bike size={12} stroke="var(--fb-accent)" sw={2.5}/>
          1.2 km away
        </div>

        {/* social proof */}
        <div style={{
          position: 'absolute', bottom: 14, left: 16, zIndex: 5,
          padding: '6px 10px', borderRadius: 12, background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(8px)',
          fontSize: 11, fontWeight: 600, color: '#374151',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          12 people ordering from here now
        </div>
      </div>

      {/* status panel — bottom 40% */}
      <div style={{
        flex: 1, background: '#fff', overflow: 'auto',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        marginTop: -28, position: 'relative', zIndex: 4,
        boxShadow: '0 -10px 30px rgba(0,0,0,0.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: '#E5E5E5' }}/>
        </div>

        <div style={{ padding: '6px 18px 18px' }}>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
              Order #{order?.orderNumber || '—'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: -0.3, marginTop: 2 }}>
              {currentStep.label}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{currentStep.sub}</div>
          </div>

          {/* rider card (shows after pickup) */}
          <AnimatePresence>
            {step >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: 14, padding: 12, borderRadius: 16,
                  background: 'linear-gradient(135deg, #111 0%, #1f1f1f 100%)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                {rider?.avatar
                  ? <SmartImg src={rider.avatar} style={{ width: 48, height: 48, flexShrink: 0 }} radius={999}/>
                  : <div style={{ width: 48, height: 48, borderRadius: 999, background: '#333',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icons.User size={24} stroke="#fff"/>
                    </div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
                    {rider?.name || 'Your Rider'}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>
                    Honda CD 70 · On the way
                  </div>
                </div>
                <Pressable style={{
                  width: 40, height: 40, borderRadius: 999, background: '#10b981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
                }}><Icons.Phone size={16}/></Pressable>
              </motion.div>
            )}
          </AnimatePresence>

          {/* vertical stepper */}
          <div style={{ marginTop: 18 }}>
            {STATUS_STEPS.map((s, i) => {
              const reached  = i <= step;
              const current  = i === step;
              return (
                <div key={s.key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <motion.div
                      initial={false}
                      animate={{
                        scale: current ? [1, 1.18, 1] : 1,
                        backgroundColor: reached ? '#10b981' : '#F5F5F5',
                        boxShadow: current ? '0 0 0 6px rgba(16,185,129,0.18)' : '0 0 0 0 rgba(0,0,0,0)',
                      }}
                      transition={{ scale: { duration: 1.4, repeat: current ? Infinity : 0, ease: 'easeInOut' } }}
                      style={{
                        width: 26, height: 26, borderRadius: 999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      {reached
                        ? <Icons.Check size={13} sw={3} stroke="#fff"/>
                        : <span style={{ width: 8, height: 8, borderRadius: 999, background: '#D1D5DB', display: 'block' }}/>}
                    </motion.div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 22,
                        background: i < step ? '#10b981' : '#F0F0F0' }}/>
                    )}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: reached ? 700 : 500,
                      color: reached ? '#111' : '#9CA3AF' }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: reached ? '#6b7280' : '#D1D5DB', marginTop: 2 }}>
                      {s.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {step >= STATUS_STEPS.length - 1 && (
            <div style={{ marginTop: 8 }}>
              <BrandButton onClick={() => navigate('/orders')}>View Order History</BrandButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CityMap({ progress, pathRef, riderPos }) {
  return (
    <div style={{ position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #E8F4F1 0%, #F0F4ED 100%)' }}>
      <svg viewBox="0 0 400 440" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="1"/>
          </pattern>
          <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#A6D5E8"/>
            <stop offset="1" stopColor="#7EBED4"/>
          </linearGradient>
          <filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/></filter>
        </defs>

        {/* parks */}
        <ellipse cx="80" cy="100" rx="65" ry="38" fill="#C8E5BF" opacity="0.8"/>
        <ellipse cx="320" cy="320" rx="80" ry="50" fill="#C8E5BF" opacity="0.7"/>

        {/* water */}
        <path d="M340 0 L400 0 L400 440 L355 440 C360 380 370 280 360 200 C350 100 345 40 340 0 Z"
          fill="url(#water)" opacity="0.7"/>

        <rect width="400" height="440" fill="url(#grid)"/>

        {/* roads */}
        <g stroke="#fff" strokeLinecap="round" fill="none">
          <path d="M0 200 L400 240" strokeWidth="14"/>
          <path d="M0 200 L400 240" strokeWidth="11" stroke="#F4ECDC"/>
          <path d="M120 0 L160 440" strokeWidth="10"/>
          <path d="M120 0 L160 440" strokeWidth="7" stroke="#F4ECDC"/>
          <path d="M260 0 L290 440" strokeWidth="8"/>
          <path d="M260 0 L290 440" strokeWidth="5" stroke="#F4ECDC"/>
          <path d="M0 360 Q200 340 400 380" strokeWidth="9"/>
          <path d="M0 360 Q200 340 400 380" strokeWidth="6" stroke="#F4ECDC"/>
        </g>

        {/* buildings */}
        <g fill="#E5E5E5">
          <rect x="40" y="160" width="22" height="22" rx="2"/>
          <rect x="68" y="155" width="18" height="28" rx="2"/>
          <rect x="195" y="170" width="24" height="22" rx="2"/>
          <rect x="225" y="160" width="20" height="32" rx="2"/>
          <rect x="60" y="260" width="22" height="22" rx="2"/>
        </g>

        {/* dotted route */}
        <path d={ROUTE_PATH} stroke="rgba(229,57,53,0.3)" strokeWidth="4"
          strokeDasharray="2 8" strokeLinecap="round" fill="none"/>

        {/* traveled route — animated */}
        <motion.path d={ROUTE_PATH}
          stroke="var(--fb-primary)" strokeWidth="4" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}/>

        {/* hidden path — only for getTotalLength() */}
        <path ref={pathRef} d={ROUTE_PATH} fill="none" stroke="none"/>

        {/* restaurant pin */}
        <g transform="translate(50 360)">
          <circle r="14" fill="var(--fb-primary)" filter="url(#shadow)"/>
          <circle r="20" fill="var(--fb-primary)" opacity="0.18"/>
          <g transform="translate(-6 -7)" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none">
            <path d="M3 1v6a3 3 0 0 0 6 0V1M6 7v6M10 1c-1 0-2 1.5-2 3.5s.5 3.5 2 3.5v5"/>
          </g>
        </g>

        {/* destination pin */}
        <g transform="translate(340 120)">
          <circle r="14" fill="var(--fb-accent)" filter="url(#shadow)"/>
          <motion.circle r="14" fill="none" stroke="var(--fb-accent)" strokeWidth="2"
            animate={{ r: [14, 26], opacity: [0.6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}/>
          <g transform="translate(-6 -7)" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M2 8 L6 3 L11 8 V12 H2 Z"/>
          </g>
        </g>

        {/* rider dot — follows path via JS */}
        <motion.g
          animate={{ x: riderPos.x, y: riderPos.y }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={{ x: 50, y: 360 }}>
          <circle r="20" fill="var(--fb-primary)" opacity="0.18"/>
          <circle r="12" fill="#fff" filter="url(#shadow)"/>
          <g transform="translate(-6 -6)" stroke="var(--fb-primary)" strokeWidth="1.8" fill="none" strokeLinecap="round">
            <circle cx="4" cy="11" r="2"/>
            <circle cx="11" cy="11" r="2"/>
            <path d="M4 11 L7 6 H10 L11.5 9"/>
          </g>
        </motion.g>
      </svg>
    </div>
  );
}
