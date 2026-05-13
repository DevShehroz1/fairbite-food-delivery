import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { Icons, Pressable, SmartImg, BrandButton } from '../../components/ui';
import LeafletMap, { DEFAULT_RESTAURANT, DEFAULT_CUSTOMER } from '../../components/LeafletMap';

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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function OrderTrackingPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep]       = useState(0);
  const [cancelled, setCancelled] = useState(false);
  const [eta, setEta]         = useState(28 * 60);
  const [animProgress, setAnimProgress] = useState(0);

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

  // Rider progress along the route — eased animation toward the target progress.
  // step 2 = picked up (just left restaurant) → 0.05
  // step 3 = delivered → 1
  const targetProgress = step >= 3 ? 1 : step >= 2 ? 0.55 : 0;
  useEffect(() => {
    let raf;
    const tick = () => {
      setAnimProgress(p => {
        const next = p + (targetProgress - p) * 0.06;
        if (Math.abs(targetProgress - next) < 0.002) return targetProgress;
        raf = requestAnimationFrame(tick);
        return next;
      });
    };
    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
  }, [targetProgress]);

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <Icons.Bike size={36} stroke="var(--qb-primary)"/>
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
        <LeafletMap
          restaurant={
            order?.restaurant?.address?.coordinates
              ? [order.restaurant.address.coordinates.lat, order.restaurant.address.coordinates.lng]
              : DEFAULT_RESTAURANT
          }
          customer={
            order?.deliveryAddress?.coordinates
              ? [order.deliveryAddress.coordinates.lat, order.deliveryAddress.coordinates.lng]
              : DEFAULT_CUSTOMER
          }
          progress={animProgress}
          showRider={step >= 2}
        />

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
            Arriving in <span style={{ color: 'var(--qb-primary)' }}>{fmt(eta)}</span>
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
              <Icons.Bike size={12} stroke="var(--qb-accent)" sw={2.5}/>
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
                <Pressable
                  onClick={() => {
                    if (rider?.phone) window.location.href = `tel:${rider.phone}`;
                  }}
                  style={{
                    width: 40, height: 40, borderRadius: 999, background: '#10b981',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
                    opacity: rider?.phone ? 1 : 0.4, cursor: rider?.phone ? 'pointer' : 'default',
                  }}
                  disabled={!rider?.phone}
                >
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
                    background: 'var(--qb-primary)',
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
                color: isCurrent ? 'var(--qb-primary)' : isFuture ? '#9CA3AF' : '#374151',
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

