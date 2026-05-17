import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Icons, Pressable, SmartImg, BrandButton } from '../../components/ui';
import LeafletMap, { DEFAULT_RESTAURANT, DEFAULT_CUSTOMER } from '../../components/LeafletMap';

// 5-step customer UI mapping. We split "On the Way" into a moving phase
// and the "Arriving" phase so the map can show the rider gliding to the door.
const UI_STEPS = [
  { label: 'Order Placed',  sub: 'We received your order' },
  { label: 'Preparing',     sub: 'Restaurant is cooking your order' },
  { label: 'On the Way',    sub: 'Rider is heading to you' },
  { label: 'Arriving',      sub: 'Rider is almost at your door' },
  { label: 'Delivered',     sub: 'Enjoy your meal! 🎉' },
];

function backendToStep(status) {
  switch (status) {
    case 'pending':    return 0;
    case 'confirmed':  return 1;
    case 'preparing':
    case 'ready':      return 2;
    case 'picked-up':
    case 'on-the-way': return 2;     // rider is moving — animation drives 2 → 3
    case 'delivered':  return 4;
    default:           return 0;
  }
}

const RIDE_DURATION_MS = 5500;
const POLL_INTERVAL_MS = 1500;

export default function OrderTrackingPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [step, setStep]         = useState(0);
  const [cancelled, setCancelled] = useState(false);
  const [eta, setEta]           = useState(28 * 60);
  const [animProgress, setAnimProgress] = useState(0);
  const rideStartRef = useRef(null);

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

  // Poll the order — quicker so the rider's status update reaches the customer fast
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
    }, POLL_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [id]);

  useEffect(() => {
    const t = setInterval(() => setEta(e => Math.max(0, e - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Smooth rider animation:
  //   step <  2 → rider sits at the restaurant (progress 0)
  //   step == 2 → ride starts, progress eases 0 → 1 over RIDE_DURATION_MS
  //   step >= 3 → already arrived (progress stays 1)
  useEffect(() => {
    if (step < 2) {
      setAnimProgress(0);
      rideStartRef.current = null;
      return;
    }
    if (step >= 3) {
      setAnimProgress(1);
      rideStartRef.current = null;
      return;
    }
    if (rideStartRef.current == null) rideStartRef.current = performance.now();
    let raf;
    const tick = (now) => {
      const t = (now - rideStartRef.current) / RIDE_DURATION_MS;
      const eased = 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
      setAnimProgress(eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setStep(s => Math.max(s, 3));
    };
    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
  }, [step]);

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const fmtEta = s => { const m = Math.floor(s / 60); return `${m} minute${m !== 1 ? 's' : ''}`; };

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

  const rider    = order?.rider;
  const showRider  = step >= 2;
  const arrived    = step >= 3 && step < 4;
  const delivered  = step >= 4;
  const kmAway     = (1.6 * (1 - animProgress)).toFixed(1);

  return (
    <div style={{ height: '100vh', background: '#fff', display: 'flex',
      flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Orange header bar ── */}
      <div style={{
        background: 'var(--qb-primary)',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        paddingBottom: 14,
        paddingLeft: 16,
        paddingRight: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', flexShrink: 0,
      }}>
        <Pressable onClick={() => navigate(-1)} style={{
          position: 'absolute', left: 16, bottom: 14,
          width: 36, height: 36, borderRadius: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icons.ChevronL size={22} stroke="#fff" sw={2.5}/>
        </Pressable>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#fff',
          letterSpacing: 1.8, textTransform: 'uppercase' }}>
          Track Order
        </span>
      </div>

      {/* ── Estimated time + order number ── */}
      <div style={{
        background: '#fff', padding: '12px 20px 10px',
        display: 'flex', borderBottom: '1px solid #F3F4F6', flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--qb-primary)',
            letterSpacing: 1.2, textTransform: 'uppercase' }}>Estimated Time</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginTop: 2 }}>
            {fmtEta(eta)}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--qb-primary)',
            letterSpacing: 1.2, textTransform: 'uppercase' }}>Order Number</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginTop: 2 }}>
            #{order?.orderNumber || '—'}
          </div>
        </div>
      </div>

      {/* ── Map – top 55% ── */}
      <div style={{ position: 'relative', flex: '0 0 55%', overflow: 'hidden', borderTop: '6px solid #F3F4F6' }}>
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
          showRider={showRider}
        />

        {/* ETA pill */}
        <div style={{
          position: 'absolute', top: 16, right: 16, zIndex: 5,
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
            {arrived || delivered
              ? <span style={{ color: '#10b981' }}>Arrived!</span>
              : <>Arriving in <span style={{ color: 'var(--qb-primary)' }}>{fmt(eta)}</span></>}
          </span>
        </div>

        {/* Distance pill */}
        <AnimatePresence>
          {showRider && !arrived && !delivered && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{
                position: 'absolute', top: 106, right: 16, zIndex: 5,
                padding: '6px 10px', borderRadius: 5,
                background: 'rgba(17,17,17,0.85)', backdropFilter: 'blur(8px)',
                color: '#fff', fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
              <Icons.Bike size={12} stroke="var(--qb-accent)" sw={2.5}/>
              {kmAway} km away
            </motion.div>
          )}
        </AnimatePresence>

        {/* Arrived banner */}
        <AnimatePresence>
          {arrived && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
              style={{
                position: 'absolute', bottom: 14, left: 16, right: 16, zIndex: 5,
                padding: '12px 14px', borderRadius: 5,
                background: 'rgba(16,185,129,0.96)', backdropFilter: 'blur(8px)',
                boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
                display: 'flex', alignItems: 'center', gap: 10, color: '#fff',
              }}>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{
                  width: 28, height: 28, borderRadius: 999,
                  background: 'rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                <span style={{ fontSize: 16 }}>📍</span>
              </motion.div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: -0.2 }}>
                  Rider is at your door
                </div>
                <div style={{ fontSize: 11, opacity: 0.9, marginTop: 1 }}>
                  Please head out and pick up your order.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom panel ── */}
      <div style={{
        flex: 1, background: '#fff', overflow: 'auto',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        marginTop: -28, position: 'relative', zIndex: 4,
        boxShadow: '0 -8px 24px rgba(0,0,0,0.07)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 8px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: '#E5E5E5' }}/>
        </div>

        <div style={{ padding: '4px 20px 24px' }}>

          {/* Rider card */}
          <AnimatePresence>
            {showRider && (
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }}
                style={{
                  marginBottom: 16, padding: 12, borderRadius: 5,
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
                    Honda CD 70 · {arrived ? 'Waiting at your door' : 'On the way'}
                  </div>
                </div>
                <Pressable
                  onClick={() => toast.info('In-app messaging coming soon!', { autoClose: 2000 })}
                  style={{
                    width: 40, height: 40, borderRadius: 999, background: '#3b82f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
                  }}
                  aria-label="Message rider"
                >
                  <Icons.Message size={18} stroke="#fff" sw={2.2}/>
                </Pressable>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vertical timeline */}
          <VerticalTimeline step={step}/>

          {/* CTA when delivered */}
          {delivered && (
            <div style={{ marginTop: 16 }}>
              <BrandButton onClick={() => navigate('/orders')}>View Order History</BrandButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Vertical timeline ────────────────────────────────────────────────────────
function VerticalTimeline({ step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {UI_STEPS.map((s, i) => {
        const isPast    = i < step;
        const isCurrent = i === step;
        const isFuture  = i > step;
        const isLast    = i === UI_STEPS.length - 1;

        const dotColor = isFuture ? '#D1D5DB' : isCurrent ? '#3B82F6' : 'var(--qb-primary)';
        const lineColor = isPast ? '#10b981' : '#E5E7EB';

        return (
          <motion.div
            key={i}
            initial={false}
            animate={{ opacity: isFuture ? 0.45 : 1 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            style={{ display: 'flex', gap: 14 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 16, position: 'relative' }}>
              {isCurrent ? (
                <div style={{ position: 'relative', width: 13, height: 13, marginTop: 2, flexShrink: 0 }}>
                  {/* Outer glow halo — slow, soft pulse like iOS notification dot. */}
                  <motion.div
                    aria-hidden
                    animate={{ scale: [1, 2.4, 1], opacity: [0.35, 0, 0.35] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 999,
                      background: 'rgba(59,130,246,0.45)',
                      willChange: 'transform, opacity',
                    }}
                  />
                  {/* Inner ring — quicker, tighter pulse adds layered depth. */}
                  <motion.div
                    aria-hidden
                    animate={{ scale: [1, 1.7, 1], opacity: [0.55, 0, 0.55] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 999,
                      background: 'rgba(59,130,246,0.6)',
                      willChange: 'transform, opacity',
                    }}
                  />
                  {/* The dot itself breathes scale + brightness. */}
                  <motion.div
                    animate={{
                      scale: [1, 1.12, 1],
                      boxShadow: [
                        '0 0 0 0 rgba(59,130,246,0.55)',
                        '0 0 0 6px rgba(59,130,246,0.0)',
                        '0 0 0 0 rgba(59,130,246,0.0)',
                      ],
                    }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      position: 'relative', zIndex: 1,
                      width: 13, height: 13, borderRadius: 999,
                      background: dotColor,
                      willChange: 'transform',
                    }}
                  />
                </div>
              ) : (
                <motion.div
                  initial={false}
                  animate={{ background: dotColor, scale: isPast ? 1 : 0.95 }}
                  transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                  style={{
                    width: 13, height: 13, borderRadius: 999,
                    flexShrink: 0, marginTop: 2,
                  }}
                />
              )}
              {!isLast && (
                <div style={{
                  width: 2, flex: 1, minHeight: 24,
                  background: lineColor,
                  margin: '3px 0', borderRadius: 999,
                  position: 'relative', overflow: 'hidden',
                }}>
                  {isCurrent && (
                    <motion.div
                      aria-hidden
                      initial={{ y: '-100%' }}
                      animate={{ y: '100%' }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        position: 'absolute', left: 0, right: 0, height: '60%',
                        background: 'linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.7) 50%, transparent 100%)',
                        willChange: 'transform',
                      }}
                    />
                  )}
                </div>
              )}
            </div>
            <div style={{ paddingBottom: isLast ? 0 : 18 }}>
              <motion.div
                initial={false}
                animate={{
                  color: isFuture ? '#9CA3AF' : '#374151',
                  fontWeight: isCurrent ? 800 : 700,
                }}
                transition={{ duration: 0.3 }}
                style={{ fontSize: 14 }}
              >
                {s.label}
              </motion.div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1, lineHeight: 1.45 }}>
                {s.sub}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
