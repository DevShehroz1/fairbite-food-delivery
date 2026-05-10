import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { Icons, Pressable, SmartImg, BrandButton } from '../../components/ui';

// ─── 4-step customer UI mapping ──────────────────────────────────────────────
const UI_STEPS = [
  { label: 'Order Placed',  sub: 'We received your order' },
  { label: 'Preparing',     sub: 'Restaurant is cooking your order' },
  { label: 'On the Way',    sub: 'Rider is heading to you' },
  { label: 'Delivered',     sub: 'Enjoy your meal! 🎉' },
];

function backendToStep(status) {
  switch (status) {
    case 'pending':    return 0;
    case 'confirmed':
    case 'preparing':
    case 'ready':      return 1;
    case 'picked-up':
    case 'on-the-way': return 2;
    case 'delivered':  return 3;
    default:           return 0;
  }
}

const ROUTE_PATH = "M50,360 C90,320 130,300 165,280 S220,240 250,200 S290,140 340,120";

// ─── Main page ────────────────────────────────────────────────────────────────
export default function OrderTrackingPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const pathRef  = useRef(null);

  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep]       = useState(0);
  const [cancelled, setCancelled] = useState(false);
  const [eta, setEta]         = useState(28 * 60);
  const [riderPos, setRiderPos] = useState({ x: 50, y: 360 });

  // Initial fetch
  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => {
        const o = r.data.data;
        setOrder(o);
        if (o.status === 'cancelled') { setCancelled(true); return; }
        setStep(backendToStep(o.status));
        const mins = o.restaurant?.delivery?.estimatedTime;
        if (mins) setEta(mins * 60);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Poll every 3 seconds
  useEffect(() => {
    const poll = setInterval(() => {
      api.get(`/orders/${id}`)
        .then(r => {
          const o = r.data.data;
          setOrder(o);
          if (o.status === 'cancelled') { setCancelled(true); return; }
          setStep(backendToStep(o.status));
        })
        .catch(() => {});
    }, 3000);
    return () => clearInterval(poll);
  }, [id]);

  // ETA countdown
  useEffect(() => {
    const t = setInterval(() => setEta(e => Math.max(0, e - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Rider dot — only moves when step >= 2
  const mapProgress = step >= 2 ? Math.min(1, (step - 1) / 2) : 0;

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    try {
      const total = el.getTotalLength();
      const pt = el.getPointAtLength(mapProgress * total);
      setRiderPos({ x: pt.x, y: pt.y });
    } catch (_) {}
  }, [mapProgress]);

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <Icons.Bike size={36} stroke="var(--fb-primary)"/>
      </motion.div>
    </div>
  );

  if (cancelled) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <div style={{ fontSize: 48 }}>😔</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>Order Cancelled</div>
      <div style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
        Your order #{order?.orderNumber} has been cancelled.
      </div>
      <BrandButton onClick={() => navigate('/restaurants')}>Order Again</BrandButton>
    </div>
  );

  const currentUIStep = UI_STEPS[step];
  const rider = order?.rider;

  return (
    <div style={{ height: '100vh', background: '#fff', display: 'flex',
      flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Map – top 60% ── */}
      <div style={{ position: 'relative', flex: '0 0 60%', overflow: 'hidden' }}>
        <CityMap progress={mapProgress} pathRef={pathRef} riderPos={riderPos} riderMoving={step >= 2}/>

        {/* Back button */}
        <Pressable onClick={() => navigate(-1)} style={{
          position: 'absolute', top: 52, left: 16, zIndex: 5,
          width: 40, height: 40, borderRadius: 999,
          background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        }}>
          <Icons.ChevronL size={20} stroke="#111" sw={2.5}/>
        </Pressable>

        {/* ETA pill */}
        <div style={{
          position: 'absolute', top: 52, right: 16, zIndex: 5,
          padding: '8px 14px', borderRadius: 999,
          background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: 999, background: '#10b981' }}/>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>
            Arriving in <span style={{ color: 'var(--fb-primary)' }}>{fmt(eta)}</span>
          </span>
        </div>

        {/* Distance pill — only show when rider is on the way */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{
                position: 'absolute', top: 106, right: 16, zIndex: 5,
                padding: '6px 10px', borderRadius: 12,
                background: 'rgba(17,17,17,0.85)', backdropFilter: 'blur(8px)',
                color: '#fff', fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
              <Icons.Bike size={12} stroke="var(--fb-accent)" sw={2.5}/>
              1.2 km away
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social proof */}
        <div style={{
          position: 'absolute', bottom: 14, left: 16, zIndex: 5,
          padding: '6px 10px', borderRadius: 12,
          background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)',
          fontSize: 11, fontWeight: 600, color: '#374151',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          12 people ordering from here now
        </div>
      </div>

      {/* ── Bottom panel – bottom 40% ── */}
      <div style={{
        flex: 1, background: '#fff', overflow: 'auto',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        marginTop: -28, position: 'relative', zIndex: 4,
        boxShadow: '0 -10px 30px rgba(0,0,0,0.08)',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: '#E5E5E5' }}/>
        </div>

        <div style={{ padding: '6px 18px 24px' }}>

          {/* Order number + current status label */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
              Order #{order?.orderNumber || '—'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: -0.3, marginTop: 2 }}>
              {currentUIStep.label}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
              {currentUIStep.sub}
            </div>
          </div>

          {/* ── Horizontal 4-step stepper ── */}
          <HorizontalStepper step={step}/>

          {/* Rider card — shows when rider is moving (step >= 2) */}
          <AnimatePresence>
            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }}
                style={{
                  marginTop: 16, padding: 12, borderRadius: 16,
                  background: 'linear-gradient(135deg, #111 0%, #1f1f1f 100%)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                {rider?.avatar
                  ? <SmartImg src={rider.avatar} style={{ width: 48, height: 48, flexShrink: 0 }} radius={999}/>
                  : (
                    <div style={{ width: 48, height: 48, borderRadius: 999, background: '#333',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icons.User size={24} stroke="#fff"/>
                    </div>
                  )
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
                }}>
                  <Icons.Phone size={16}/>
                </Pressable>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA when delivered */}
          {step >= 3 && (
            <div style={{ marginTop: 16 }}>
              <BrandButton onClick={() => navigate('/orders')}>View Order History</BrandButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Horizontal 4-step stepper ───────────────────────────────────────────────
function HorizontalStepper({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      padding: '4px 0 8px', position: 'relative' }}>
      {UI_STEPS.map((s, i) => {
        const isPast    = i < step;
        const isCurrent = i === step;
        const isFuture  = i > step;

        return (
          <React.Fragment key={i}>
            {/* connector line (before each step except the first) */}
            {i > 0 && (
              <div style={{
                flex: 1,
                height: 3,
                marginTop: isCurrent || (i - 1 < step) ? 12 : 10,
                borderRadius: 999,
                background: i <= step ? '#10b981' : '#E5E5E5',
                alignSelf: 'flex-start',
                flexShrink: 0,
              }}/>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 5, flexShrink: 0 }}>

              {/* Circle */}
              {isCurrent ? (
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 0 0px rgba(229,57,53,0.18)',
                      '0 0 0 6px rgba(229,57,53,0.18)',
                      '0 0 0 0px rgba(229,57,53,0.0)',
                    ],
                  }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: 28, height: 28, borderRadius: 999,
                    background: 'var(--fb-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  <div style={{ width: 10, height: 10, borderRadius: 999, background: '#fff' }}/>
                </motion.div>
              ) : isPast ? (
                <div style={{
                  width: 22, height: 22, borderRadius: 999, background: '#10b981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icons.Check size={11} sw={3} stroke="#fff"/>
                </div>
              ) : (
                /* future */
                <div style={{
                  width: 22, height: 22, borderRadius: 999,
                  border: '2px solid #D1D5DB', background: '#fff',
                }}/>
              )}

              {/* Label */}
              <div style={{
                fontSize: 10, fontWeight: isCurrent ? 700 : isFuture ? 400 : 600,
                color: isCurrent ? 'var(--fb-primary)' : isFuture ? '#9CA3AF' : '#374151',
                textAlign: 'center', maxWidth: 60, lineHeight: 1.2,
              }}>
                {s.label}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── City map SVG ─────────────────────────────────────────────────────────────
function CityMap({ progress, pathRef, riderPos, riderMoving }) {
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

        {/* traveled route — only animates when rider is moving */}
        <motion.path d={ROUTE_PATH}
          stroke="var(--fb-primary)" strokeWidth="4" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: riderMoving ? progress : 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}/>

        {/* hidden path for getTotalLength() */}
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
          <g transform="translate(-6 -7)" stroke="#fff" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M2 8 L6 3 L11 8 V12 H2 Z"/>
          </g>
        </g>

        {/* rider dot */}
        <motion.g
          animate={{ x: riderPos.x, y: riderPos.y }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={{ x: 50, y: 360 }}>
          <circle r="20" fill="var(--fb-primary)" opacity="0.18"/>
          <circle r="12" fill="#fff" filter="url(#shadow)"/>
          <g transform="translate(-6 -6)" stroke="var(--fb-primary)" strokeWidth="1.8"
            fill="none" strokeLinecap="round">
            <circle cx="4" cy="11" r="2"/>
            <circle cx="11" cy="11" r="2"/>
            <path d="M4 11 L7 6 H10 L11.5 9"/>
          </g>
        </motion.g>
      </svg>
    </div>
  );
}
