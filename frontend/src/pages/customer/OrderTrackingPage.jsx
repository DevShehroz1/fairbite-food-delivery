import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Card, CardContent, Avatar, Chip, Divider, Button, LinearProgress } from '@mui/material';
import { CheckCircle, Phone, Star } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { runDemoOrder, DEMO_RIDER_INFO, isDemoMode } from '../../services/demoService';
import socket from '../../services/socket';
import api from '../../services/api';

// ─── Order stages ─────────────────────────────────────────────────────────────
const STAGES = [
  { key: 'pending',           label: 'Order Placed',      icon: '🧾' },
  { key: 'confirmed',         label: 'Confirmed',         icon: '✅' },
  { key: 'preparing',         label: 'Preparing',         icon: '👨‍🍳' },
  { key: 'ready-for-pickup',  label: 'Ready for Pickup',  icon: '📦' },
  { key: 'picked-up',         label: 'Rider at Restaurant', icon: '🏍️' },
  { key: 'on-the-way',        label: 'On The Way',        icon: '🚀' },
  { key: 'delivered',         label: 'Delivered',         icon: '🎉' },
];

const STATUS_COLORS = {
  pending:           '#9E9E9E',
  confirmed:         '#FF7043',
  preparing:         '#FF9800',
  'ready-for-pickup':'#2196F3',
  'picked-up':       '#9C27B0',
  'on-the-way':      '#E53935',
  delivered:         '#2E7D32',
};

// ─── SVG City Map ─────────────────────────────────────────────────────────────
// Route: Restaurant(10,20) → (42,20) → (42,52) → (67,52) → (67,70) → Dest(84,70)
const ROUTE = [[10,20],[42,20],[42,52],[67,52],[67,70],[84,70]];

// Cumulative segment distances for rider position along path
const SEG_LENS = ROUTE.slice(1).map(([x,y],i) => {
  const [px,py] = ROUTE[i];
  return Math.sqrt((x-px)**2 + (y-py)**2);
});
const TOTAL_LEN = SEG_LENS.reduce((a,b)=>a+b,0);
const CUM_LENS  = SEG_LENS.reduce((acc,d)=>[...acc, (acc[acc.length-1]||0)+d],[]).slice(1);

const getRiderPos = (t) => {
  const dist = Math.min(t,1) * TOTAL_LEN;
  for (let i=0; i<CUM_LENS.length; i++) {
    const prevD = i===0 ? 0 : CUM_LENS[i-1];
    if (dist <= CUM_LENS[i]) {
      const segT = (dist - prevD) / SEG_LENS[i];
      const [x1,y1] = ROUTE[i];
      const [x2,y2] = ROUTE[i+1];
      return { x: x1+(x2-x1)*segT, y: y1+(y2-y1)*segT };
    }
  }
  return { x: ROUTE[ROUTE.length-1][0], y: ROUTE[ROUTE.length-1][1] };
};

const LiveMap = ({ progress, status }) => {
  const atRestaurant = status === 'picked-up';
  const isMoving     = status === 'on-the-way';
  const delivered    = status === 'delivered';
  const riderVisible = ['picked-up','on-the-way','delivered'].includes(status);

  const riderPos = riderVisible
    ? (atRestaurant ? { x: ROUTE[0][0], y: ROUTE[0][1] } : getRiderPos(progress))
    : null;

  const routePts = ROUTE.map(([x,y])=>`${x},${y}`).join(' ');

  return (
    <Box sx={{ position:'relative', width:'100%', height: 300, overflow:'hidden', bgcolor:'#F2EFE9' }}>
      <svg
        viewBox="0 0 100 80"
        preserveAspectRatio="none"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}
      >
        {/* Background */}
        <rect x="0" y="0" width="100" height="80" fill="#F2EFE9"/>

        {/* Parks */}
        <rect x="0"  y="26" width="8"  height="20" fill="#C8DFB0" rx="1"/>
        <rect x="44" y="0"  width="17" height="13" fill="#C8DFB0" rx="1"/>
        <rect x="70" y="55" width="12" height="12" fill="#C8DFB0" rx="1"/>
        <rect x="87" y="30" width="13" height="18" fill="#C8DFB0" rx="1"/>

        {/* Park trees (circles) */}
        {[[3,31],[5,38],[49,5],[54,9],[60,5],[74,59],[79,63],[91,34],[95,42]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="1.5" fill="#8BC34A" opacity="0.7"/>
        ))}

        {/* Main horizontal roads */}
        <rect x="0" y="16.5" width="100" height="7"  fill="white"   opacity="0.95"/>
        <rect x="0" y="48.5" width="100" height="5.5" fill="#EAE7E0" opacity="0.9"/>
        <rect x="0" y="66.5" width="100" height="5.5" fill="#EAE7E0" opacity="0.9"/>
        <rect x="0" y="35"   width="100" height="3.5" fill="#EAE7E0" opacity="0.75"/>

        {/* Main vertical roads */}
        <rect x="7.5"  y="0" width="5.5" height="80" fill="white"   opacity="0.95"/>
        <rect x="39.5" y="0" width="5.5" height="80" fill="white"   opacity="0.95"/>
        <rect x="64.5" y="0" width="5"   height="80" fill="#EAE7E0" opacity="0.9"/>
        <rect x="82"   y="0" width="4"   height="80" fill="#EAE7E0" opacity="0.9"/>
        <rect x="23"   y="0" width="3.5" height="80" fill="#EAE7E0" opacity="0.8"/>
        <rect x="53"   y="0" width="3.5" height="80" fill="#EAE7E0" opacity="0.8"/>

        {/* Road centre dashes */}
        <line x1="0" y1="20" x2="100" y2="20" stroke="white" strokeWidth="0.6" strokeDasharray="4,3" opacity="0.7"/>
        <line x1="10" y1="0" x2="10"  y2="80" stroke="white" strokeWidth="0.6" strokeDasharray="4,3" opacity="0.7"/>
        <line x1="42" y1="0" x2="42"  y2="80" stroke="white" strokeWidth="0.6" strokeDasharray="4,3" opacity="0.7"/>

        {/* City blocks (buildings) */}
        {[
          [13,0,8,15],[22.5,0,15.5,15],[27.5,20,10,13],[38,20,0.5,13],
          [13,23,9,10],[13,37,9,10],[27.5,37,10,10],[27.5,24,5,10],
          [13,55,9,10],[27.5,55,10,10],[45,0,7,15],[57.5,0,6,15],
          [45,24,7,10],[57.5,24,6,10],[45,37,7,10],[57.5,37,6,10],
          [45,55,7,10],[57.5,55,6,10],[70,0,10,15],[81,14,0.5,20],
          [70,24,10,9],[70,37,10,10],[87,14,13,8],[87,24,13,10],
          [70,55,0.5,9],[87,50,13,15],[87,67,13,11],
        ].map(([x,y,w,h],i)=>(
          <rect key={i} x={x} y={y} width={w} height={h} fill="#E4E0D8" rx="0.8" opacity="0.8"/>
        ))}

        {/* Street labels */}
        {[
          { x:20, y:19.5, text:'Burns Road', anchor:'middle' },
          { x:70, y:51.5, text:'Clifton Blvd', anchor:'middle' },
          { x:10.2, y:45,  text:'Main St', anchor:'start', rotate:-90, rx:10, ry:45 },
          { x:42.2, y:45,  text:'Park Ave', anchor:'start', rotate:-90, rx:42, ry:45 },
        ].map((l,i)=>(
          <text key={i} x={l.x} y={l.y} fontSize="2.2" fill="#9E9E9E" textAnchor={l.anchor}
            transform={l.rotate ? `rotate(${l.rotate},${l.rx},${l.ry})` : undefined}>
            {l.text}
          </text>
        ))}

        {/* Dashed grey route (full path — always visible) */}
        <polyline
          points={routePts}
          fill="none" stroke="#BDBDBD" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="3,2"
        />

        {/* Animated red route highlight */}
        {(isMoving || delivered) && (
          <motion.polyline
            points={routePts}
            fill="none"
            stroke="#E53935"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: Math.min(progress, 1) }}
            transition={{ duration: 0.6, ease: 'linear' }}
          />
        )}

        {/* Restaurant pin */}
        <g transform={`translate(${ROUTE[0][0]}, ${ROUTE[0][1]})`}>
          <circle r="4.5" fill="#E53935" opacity="0.15"/>
          <circle r="3"   fill="#E53935"/>
          <text x="0" y="1" fontSize="2.8" textAnchor="middle" dominantBaseline="middle">🍽️</text>
        </g>
        <rect x={ROUTE[0][0]-6.5} y={ROUTE[0][1]+4} width="13" height="4.5" fill="white" rx="2.2" opacity="0.95"/>
        <text x={ROUTE[0][0]} y={ROUTE[0][1]+6.8} fontSize="2.2" fill="#E53935" textAnchor="middle" fontWeight="bold">Restaurant</text>

        {/* Destination pin */}
        <g transform={`translate(${ROUTE[ROUTE.length-1][0]}, ${ROUTE[ROUTE.length-1][1]})`}>
          <circle r="4.5" fill={delivered ? '#2E7D32' : '#1976D2'} opacity="0.15"/>
          <circle r="3"   fill={delivered ? '#2E7D32' : '#1976D2'}/>
          <text x="0" y="1" fontSize="2.8" textAnchor="middle" dominantBaseline="middle">🏠</text>
        </g>
        <rect x={ROUTE[ROUTE.length-1][0]-5.5} y={ROUTE[ROUTE.length-1][1]+4} width="11" height="4.5" fill="white" rx="2.2" opacity="0.95"/>
        <text x={ROUTE[ROUTE.length-1][0]} y={ROUTE[ROUTE.length-1][1]+6.8} fontSize="2.2"
          fill={delivered ? '#2E7D32' : '#1976D2'} textAnchor="middle" fontWeight="bold">Your Home</text>

        {/* Rider bubble */}
        {riderVisible && riderPos && (
          <motion.g
            animate={{ x: riderPos.x, y: riderPos.y }}
            transition={{ duration: 0.55, ease: 'linear' }}
          >
            {/* Pulse ring when waiting */}
            {atRestaurant && (
              <motion.circle
                r="6" fill="none" stroke="#9C27B0" strokeWidth="1"
                animate={{ r: [5, 9], opacity: [0.8, 0] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
            )}
            <circle r="4.5" fill="white" stroke={atRestaurant ? '#9C27B0' : '#E53935'} strokeWidth="1.5"/>
            <text x="0" y="1" fontSize="4" textAnchor="middle" dominantBaseline="middle">
              {delivered ? '✅' : '🏍️'}
            </text>
          </motion.g>
        )}
      </svg>

      {/* ETA chip */}
      {isMoving && !delivered && (
        <Chip
          label={`ETA ~${Math.max(1, Math.round((1 - progress) * 12))} min`}
          sx={{ position:'absolute', top:12, right:12, bgcolor:'white', fontWeight:700, boxShadow:'0 2px 10px rgba(0,0,0,0.15)', fontSize:12 }}
        />
      )}

      {/* LIVE / WAITING badge */}
      {riderVisible && (
        <Chip
          label={atRestaurant ? '🟣 WAITING' : isMoving ? '🔴 LIVE' : '✅ DONE'}
          size="small"
          sx={{
            position:'absolute', bottom:12, left:12,
            bgcolor: atRestaurant ? '#9C27B0' : isMoving ? '#E53935' : '#2E7D32',
            color:'white', fontWeight:700, fontSize:11,
            boxShadow:'0 2px 10px rgba(0,0,0,0.2)',
          }}
        />
      )}

      {/* Distance label */}
      <Box sx={{ position:'absolute', bottom:12, right:12, bgcolor:'rgba(255,255,255,0.9)', px:1.5, py:0.5, borderRadius:2, boxShadow:1 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary">2.4 km</Typography>
      </Box>
    </Box>
  );
};

// ─── Beautiful floating notification ─────────────────────────────────────────
const showToast = (msg, type = 'info') => {
  const colors = { success:'#2E7D32', error:'#C62828', info:'#1565C0', primary:'#E53935' };
  toast(msg, {
    position: 'bottom-center',
    autoClose: 3500,
    hideProgressBar: false,
    style: {
      borderRadius: 16,
      background: colors[type] || '#1A1A1A',
      color: 'white',
      fontWeight: 600,
      fontSize: 14,
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      padding: '14px 20px',
    },
  });
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const OrderTrackingPage = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [status, setStatus]               = useState('pending');
  const [riderProgress, setRiderProgress] = useState(0);
  const [order, setOrder]                 = useState(null);
  const cancelDemoRef                     = useRef(null);
  const prevStatusRef                     = useRef('pending');

  const stageIdx    = STAGES.findIndex(s => s.key === status);
  const delivered   = status === 'delivered';
  const riderVisible = ['picked-up','on-the-way','delivered'].includes(status);
  const waiting     = status === 'picked-up';
  const activeColor = STATUS_COLORS[status] || '#E53935';
  const currentStage = STAGES[stageIdx] || STAGES[0];

  // Fire important toasts only on key status changes
  useEffect(() => {
    if (prevStatusRef.current === status) return;
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    if (status === 'confirmed')        showToast('✅ Restaurant confirmed your order!', 'success');
    if (status === 'picked-up')        showToast('🏍️ Rider Ali arrived at the restaurant!', 'primary');
    if (status === 'on-the-way')       showToast('🚀 Ali is on his way to you!', 'primary');
    if (status === 'delivered')        showToast('🎉 Delivered! Enjoy your meal!', 'success');
    void prev;
  }, [status]);

  // Only advance status — never go backwards (demo + real socket coexist safely)
  const advanceStatus = (newStatus) => {
    setStatus(prev => {
      const prevIdx = STAGES.findIndex(s => s.key === prev);
      const newIdx  = STAGES.findIndex(s => s.key === newStatus);
      return newIdx > prevIdx ? newStatus : prev;
    });
  };

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => {
        setOrder(r.data.data);
        // Only set status from API if it hasn't been advanced already by demo
        setStatus(prev => {
          const apiIdx  = STAGES.findIndex(s => s.key === r.data.data.status);
          const prevIdx = STAGES.findIndex(s => s.key === prev);
          return apiIdx > prevIdx ? r.data.data.status : prev;
        });
      })
      .catch(() => setOrder({
        orderNumber: 'FB202604DEMO',
        pricing: { subtotal: 1450, deliveryFee: 50, platformFee: 218, total: 1718 },
      }));

    socket.emit('join_order', id);
    socket.on(`order_${id}_status`, ({ status: s }) => advanceStatus(s));
    socket.on('rider_location', ({ lat, lng, delivered: done }) => {
      if (done) { advanceStatus('delivered'); setRiderProgress(1); return; }
      setRiderProgress(p => Math.min(p + 0.035, 1));
    });

    // Demo mode: auto-progress through all stages on a timer (class presentation)
    if (isDemoMode()) {
      cancelDemoRef.current = runDemoOrder({
        onStatusChange: (s) => advanceStatus(s),
        onRiderLocationChange: () => setRiderProgress(p => Math.min(p + 0.028, 1)),
        restaurantCoords: { lat: 24.8607, lng: 67.0011 },
        deliveryCoords:   { lat: 24.8900, lng: 67.0200 },
      });
    } else {
      // Real mode: poll order status every 5s so rider/restaurant updates show up
      const pollStatus = async () => {
        try {
          const r = await api.get(`/orders/${id}`);
          advanceStatus(r.data.data.status);
        } catch {}
      };
      const pollInterval = setInterval(pollStatus, 5000);
      const origCancel = cancelDemoRef.current;
      cancelDemoRef.current = () => { clearInterval(pollInterval); origCancel?.(); };
    }

    return () => {
      cancelDemoRef.current?.();
      socket.off(`order_${id}_status`);
      socket.off('rider_location');
    };
  }, [id]); // eslint-disable-line

  return (
    <Box sx={{ minHeight:'100vh', bgcolor:'#F7F3F0' }}>

      {/* ── Map ── */}
      <LiveMap progress={riderProgress} status={status} />

      {/* ── Status pill — overlaps map bottom ── */}
      <Box sx={{ maxWidth:640, mx:'auto', px:2 }}>
        <motion.div
          key={status}
          initial={{ y: -18, opacity:0, scale:0.97 }}
          animate={{ y: 0,   opacity:1, scale:1    }}
          transition={{ type:'spring', stiffness:300, damping:24 }}
        >
          <Box sx={{
            mt: -2.5, borderRadius: 4,
            background: `linear-gradient(135deg, ${activeColor} 0%, ${activeColor}DD 100%)`,
            color: 'white', px: 3, py: 2,
            boxShadow: `0 8px 32px ${activeColor}55`,
            display:'flex', alignItems:'center', gap:2,
            zIndex: 20, position:'relative',
          }}>
            <Typography sx={{ fontSize:40, lineHeight:1, filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
              {currentStage.icon}
            </Typography>
            <Box sx={{ flex:1 }}>
              <Typography variant="h6" fontWeight={800} lineHeight={1.2} letterSpacing={-0.3}>
                {currentStage.label}
              </Typography>
              <Typography variant="body2" sx={{ opacity:0.88, mt:0.3 }}>
                {status === 'picked-up'
                  ? 'Rider is at restaurant waiting for your food to be packed'
                  : status === 'on-the-way'
                  ? 'Your rider collected the food and is heading your way!'
                  : STAGES.find(s=>s.key===status)
                    ? `Step ${stageIdx+1} of ${STAGES.length}`
                    : ''}
              </Typography>
            </Box>
            {order && (
              <Chip
                label={`#${order.orderNumber || 'DEMO'}`}
                size="small"
                sx={{ bgcolor:'rgba(255,255,255,0.22)', color:'white', fontWeight:700, fontSize:11 }}
              />
            )}
          </Box>
        </motion.div>

        {/* ── Rider info card ── */}
        <AnimatePresence>
          {riderVisible && (
            <motion.div
              initial={{ opacity:0, y:20, scale:0.95 }}
              animate={{ opacity:1, y:0,  scale:1    }}
              exit={{    opacity:0, y:10, scale:0.97 }}
              transition={{ type:'spring', stiffness:260, damping:22, delay:0.1 }}
            >
              <Card sx={{ mt:2, overflow:'visible' }}>
                <CardContent sx={{ pb:'16px !important' }}>
                  <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing={1.5} fontSize={10}>
                    YOUR RIDER
                  </Typography>
                  <Box sx={{ display:'flex', alignItems:'center', gap:2, mt:1 }}>
                    <Box sx={{ position:'relative' }}>
                      <Avatar
                        src={DEMO_RIDER_INFO.avatar}
                        sx={{ width:60, height:60, border:'3px solid #E53935', boxShadow:'0 4px 16px rgba(229,57,53,0.3)' }}
                      />
                      {/* Online dot */}
                      <Box sx={{ position:'absolute', bottom:2, right:2, width:12, height:12, borderRadius:'50%', bgcolor:'#4CAF50', border:'2px solid white' }}/>
                    </Box>
                    <Box sx={{ flex:1 }}>
                      <Typography variant="subtitle1" fontWeight={700}>{DEMO_RIDER_INFO.name}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">{DEMO_RIDER_INFO.vehicle}</Typography>
                      <Box sx={{ display:'flex', gap:0.75, mt:0.75, flexWrap:'wrap' }}>
                        <Chip
                          icon={<Star sx={{ fontSize:'12px !important', color:'#FF9800 !important' }}/>}
                          label={DEMO_RIDER_INFO.rating}
                          size="small"
                          sx={{ bgcolor:'#FFF8E1', color:'#E65100', fontWeight:700, fontSize:11, height:22 }}
                        />
                        <Chip
                          label={`${DEMO_RIDER_INFO.totalDeliveries.toLocaleString()} rides`}
                          size="small"
                          sx={{ bgcolor:'#F5F5F5', fontWeight:600, fontSize:11, height:22 }}
                        />
                        {waiting && (
                          <Chip
                            label="⏳ At Restaurant"
                            size="small"
                            sx={{ bgcolor:'#F3E5F5', color:'#7B1FA2', fontWeight:700, fontSize:11, height:22 }}
                          />
                        )}
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Phone sx={{ fontSize:16 }}/>}
                      sx={{
                        borderRadius:12, borderColor:'#E53935', color:'#E53935',
                        '&:hover':{ bgcolor:'#FFEBEE', borderColor:'#C62828' },
                        fontSize:12, px:2, py:0.75,
                      }}
                    >
                      Call
                    </Button>
                  </Box>

                  {/* Waiting progress bar */}
                  {waiting && (
                    <Box sx={{ mt:2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Food being packed • Rider waiting at restaurant...
                      </Typography>
                      <LinearProgress
                        variant="indeterminate"
                        sx={{
                          mt:0.75, height:4, borderRadius:4,
                          bgcolor:'#F3E5F5',
                          '& .MuiLinearProgress-bar':{ bgcolor:'#9C27B0' },
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stage timeline ── */}
        <Card sx={{ mt:2 }}>
          <CardContent sx={{ pb:'16px !important' }}>
            <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing={1.5} fontSize={10} display="block" mb={1.5}>
              ORDER PROGRESS
            </Typography>
            {STAGES.map((stage, idx) => {
              const done   = idx < stageIdx;
              const active = idx === stageIdx;
              const future = idx > stageIdx;
              return (
                <Box key={stage.key} sx={{ display:'flex', alignItems:'flex-start' }}>
                  <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', mr:2, width:28 }}>
                    <motion.div animate={{ scale: active ? 1.2 : 1 }} transition={{ duration:0.25 }}>
                      <Box sx={{
                        width:28, height:28, borderRadius:'50%',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        bgcolor: done ? '#E53935' : active ? activeColor : '#F0EDE8',
                        color: done||active ? 'white' : '#BDBDBD',
                        fontSize: done ? 12 : 15,
                        boxShadow: active ? `0 0 0 4px ${activeColor}30` : 'none',
                        transition: 'all 0.35s',
                      }}>
                        {done ? <CheckCircle sx={{ fontSize:16 }}/> : stage.icon}
                      </Box>
                    </motion.div>
                    {idx < STAGES.length-1 && (
                      <motion.div
                        style={{ width:2, minHeight:20, marginTop:3, marginBottom:3, borderRadius:2, overflow:'hidden' }}
                        animate={{ backgroundColor: done ? '#E53935' : '#EEEBE6' }}
                        transition={{ duration:0.4 }}
                      >
                        <Box sx={{ width:2, height:'100%', bgcolor: done ? '#E53935' : '#EEEBE6', transition:'background 0.4s' }}/>
                      </motion.div>
                    )}
                  </Box>
                  <Box sx={{ pb: idx < STAGES.length-1 ? 1.5 : 0, pt:0.3, flex:1 }}>
                    <Typography
                      variant="body2"
                      fontWeight={active ? 800 : done ? 500 : 400}
                      color={future ? 'text.disabled' : active ? activeColor : 'text.primary'}
                      lineHeight={1.3}
                    >
                      {stage.label}
                    </Typography>
                    {active && (
                      <Typography variant="caption" color="text.secondary" sx={{ opacity:0.75 }}>
                        In progress...
                      </Typography>
                    )}
                  </Box>
                  {active && (
                    <motion.div
                      animate={{ opacity:[1,0.2,1] }}
                      transition={{ duration:1, repeat:Infinity }}
                    >
                      <Box sx={{ width:8, height:8, borderRadius:'50%', bgcolor:activeColor, mt:1, mr:0.5 }}/>
                    </motion.div>
                  )}
                </Box>
              );
            })}
          </CardContent>
        </Card>

        {/* ── Pricing ── */}
        {order && (
          <Card sx={{ mt:2 }}>
            <CardContent sx={{ pb:'16px !important' }}>
              <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing={1.5} fontSize={10} display="block" mb={1.5}>
                BILL SUMMARY
              </Typography>
              {[
                ['Food Subtotal',         order.pricing?.subtotal],
                ['Delivery Fee',          order.pricing?.deliveryFee],
                ['Platform Fee (15%)',    order.pricing?.platformFee],
              ].map(([label, val]) => (
                <Box key={label} sx={{ display:'flex', justifyContent:'space-between', mb:1 }}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={500}>PKR {val}</Typography>
                </Box>
              ))}
              <Divider sx={{ my:1.5, borderColor:'#F0EDE8' }}/>
              <Box sx={{ display:'flex', justifyContent:'space-between' }}>
                <Typography variant="subtitle1" fontWeight={800}>Total</Typography>
                <Typography variant="subtitle1" fontWeight={800} color="primary">PKR {order.pricing?.total}</Typography>
              </Box>
              <Box sx={{ mt:1.5, p:1.5, bgcolor:'#FFF8F8', borderRadius:3, border:'1px solid #FFCDD2' }}>
                <Typography variant="caption" color="#C62828" fontWeight={600}>
                  💚 You saved ~PKR {Math.round((order.pricing?.subtotal||0)*0.15)} vs platforms charging 30% commission
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* ── Rate button after delivery ── */}
        {delivered && (
          <motion.div
            initial={{ opacity:0, y:16 }}
            animate={{ opacity:1, y:0  }}
            transition={{ delay:0.3, type:'spring' }}
          >
            <Button
              fullWidth variant="contained" size="large"
              sx={{ mt:3, mb:4, py:1.8, borderRadius:4, fontSize:16,
                background:'linear-gradient(135deg,#E53935,#FF5722)',
                boxShadow:'0 8px 32px rgba(229,57,53,0.45)',
              }}
              onClick={() => navigate('/restaurants')}
            >
              🌟 Rate Your Experience
            </Button>
          </motion.div>
        )}
      </Box>
    </Box>
  );
};

export default OrderTrackingPage;
