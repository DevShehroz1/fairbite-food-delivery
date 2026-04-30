import React, { useState, useEffect, useRef } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, Button, Switch, Chip, Divider, LinearProgress } from '@mui/material';
import { AttachMoney, CheckCircle, LocationOn, MyLocation, TwoWheeler } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import socket from '../../services/socket';
import api from '../../services/api';

// ─── Mini route map ────────────────────────────────────────────────────────────
const MiniMap = ({ phase }) => {
  // phase: 'waiting' (rider at restaurant) | 'riding' (en route)
  const riderX = phase === 'riding' ? 50 : 18;

  return (
    <Box sx={{ height:140, borderRadius:3, bgcolor:'#F2EFE9', position:'relative', overflow:'hidden' }}>
      <svg viewBox="0 0 100 55" preserveAspectRatio="none" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
        <rect width="100" height="55" fill="#F2EFE9"/>
        <rect x="0"  y="24" width="42" height="7" fill="#EAE7E0"/>
        <rect x="40" y="24" width="7"  height="7" fill="white"/>
        <rect x="45" y="0"  width="7"  height="55" fill="#EAE7E0"/>
        <rect x="45" y="24" width="42" height="7" fill="white"/>

        {/* Route highlight */}
        <rect x="18" y="25.5" width={phase === 'riding' ? 62 : 0} height="4" fill="#E53935" opacity="0.7"
          style={{ transition:'width 0.8s ease' }}/>

        {/* Dashes */}
        <line x1="0" y1="27.5" x2="100" y2="27.5" stroke="white" strokeWidth="0.8" strokeDasharray="5,4" opacity="0.6"/>
        <line x1="48.5" y1="0" x2="48.5" y2="55" stroke="white" strokeWidth="0.8" strokeDasharray="5,4" opacity="0.6"/>

        {/* Restaurant pin */}
        <circle cx="18" cy="27.5" r="4" fill="#E53935"/>
        <text x="18" y="28.8" fontSize="4.5" textAnchor="middle" dominantBaseline="middle">🍽️</text>

        {/* Destination pin */}
        <circle cx="80" cy="27.5" r="4" fill="#1976D2"/>
        <text x="80" y="28.8" fontSize="4.5" textAnchor="middle" dominantBaseline="middle">🏠</text>

        {/* Rider */}
        <motion.g animate={{ x: riderX === 18 ? 0 : 32 }} transition={{ duration: 0.8, ease:'easeInOut' }}>
          <circle cx={18} cy={22} r="5" fill="white" stroke="#E53935" strokeWidth="1.2"/>
          <text x={18} y={23.5} fontSize="6" textAnchor="middle" dominantBaseline="middle">🏍️</text>
          {phase === 'waiting' && (
            <motion.circle cx={18} cy={22} r="6" fill="none" stroke="#9C27B0" strokeWidth="0.8"
              animate={{ r:[5,9], opacity:[0.8,0] }} transition={{ duration:1.2, repeat:Infinity }}/>
          )}
        </motion.g>
      </svg>

      <Chip
        label={phase === 'waiting' ? '⏳ At Restaurant' : '🔴 En Route'}
        size="small"
        sx={{
          position:'absolute', bottom:8, left:10,
          bgcolor: phase === 'waiting' ? '#7B1FA2' : '#E53935',
          color:'white', fontWeight:700, fontSize:10,
        }}
      />
    </Box>
  );
};

// ─── Incoming order card map ───────────────────────────────────────────────────
const IncomingMap = () => (
  <Box sx={{ height:110, borderRadius:3, bgcolor:'#F2EFE9', position:'relative', overflow:'hidden', mt:1.5 }}>
    <svg viewBox="0 0 100 45" preserveAspectRatio="none" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
      <rect width="100" height="45" fill="#F2EFE9"/>
      <rect x="0"  y="18" width="100" height="7"  fill="white"/>
      <rect x="60" y="0"  width="7"   height="45" fill="#EAE7E0"/>
      <line x1="0" y1="21.5" x2="100" y2="21.5" stroke="white" strokeWidth="0.8" strokeDasharray="5,4" opacity="0.5"/>
      <line x1="63.5" y1="0" x2="63.5" y2="45" stroke="white" strokeWidth="0.8" strokeDasharray="5,4" opacity="0.5"/>
      {/* Dashed route */}
      <polyline points="15,21.5 63.5,21.5 63.5,35" fill="none" stroke="#E53935" strokeWidth="1.5" strokeDasharray="4,3" strokeLinecap="round"/>
      {/* Pins */}
      <circle cx="15" cy="21.5" r="4" fill="#E53935"/>
      <text x="15" y="22.8" fontSize="4.5" textAnchor="middle" dominantBaseline="middle">🍽️</text>
      <circle cx="63.5" cy="35" r="4" fill="#1976D2"/>
      <text x="63.5" y="36.3" fontSize="4.5" textAnchor="middle" dominantBaseline="middle">🏠</text>
      {/* Animated rider */}
      <motion.g animate={{ x:[0,8,16,8,0] }} transition={{ duration:2.5, repeat:Infinity, ease:'easeInOut' }}>
        <circle cx="35" cy="16" r="4.5" fill="white" stroke="#E53935" strokeWidth="1.2"/>
        <text x="35" y="17.5" fontSize="5.5" textAnchor="middle" dominantBaseline="middle">🏍️</text>
      </motion.g>
    </svg>
  </Box>
);

// ─── Dashboard ─────────────────────────────────────────────────────────────────
const RiderDashboard = () => {
  const [online, setOnline]         = useState(false);
  const [pendingOrders, setPending] = useState([]);
  const [activeOrder, setActive]    = useState(null);
  const [deliveryPhase, setPhase]   = useState('idle'); // idle | heading | waiting | riding
  const [waitSeconds, setWaitSecs]  = useState(6);
  const [earnings, setEarnings]     = useState(0);
  const [delivered, setDelivered]   = useState(0);
  const watchRef                    = useRef(null);
  const phaseTimerRef               = useRef(null);
  const countdownRef                = useRef(null);

  // Join rider room once; listen for order_taken (another rider grabbed it)
  useEffect(() => {
    socket.emit('join_rider');
    socket.on('order_taken', ({ orderId }) => {
      setPending(prev => prev.filter(o => o.orderId !== orderId));
    });
    return () => { socket.off('order_taken'); };
  }, []);

  // Poll /orders/available every 5s when online — works across all devices/deployments
  useEffect(() => {
    if (!online) { setPending([]); return; }
    const fetchAvailable = async () => {
      try {
        const { data } = await api.get('/orders/available');
        setPending((data.data || []).map(o => ({
          orderId:         o.id,
          orderNumber:     o.orderNumber,
          restaurantName:  o.restaurant?.name || 'Restaurant',
          deliveryAddress: o.deliveryAddress,
          items:           o.items,
          pricing:         o.pricing,
        })));
      } catch {}
    };
    fetchAvailable();
    const interval = setInterval(fetchAvailable, 5000);
    return () => clearInterval(interval);
  }, [online]);

  const goOnline = (val) => {
    setOnline(val);
    if (!val) setPending([]);
    toast(val ? '🟢 You are now Online!' : '⚫ You are Offline', {
      position:'bottom-center', autoClose:2500,
      style:{ borderRadius:14, background: val ? '#2E7D32' : '#424242', color:'white', fontWeight:700 },
    });
  };

  const acceptOrder = async (order) => {
    try {
      setPending(prev => prev.filter(o=>o.orderId!==order.orderId));
      setActive(order);
      setPhase('heading');
      await api.put(`/orders/${order.orderId}/accept`).catch(()=>{});

      toast('🏍️ Order accepted! Head to the restaurant.', {
        position:'bottom-center', autoClose:3000,
        style:{ borderRadius:14, background:'#E53935', color:'white', fontWeight:700 },
      });

      // After 6s → "at restaurant waiting"
      phaseTimerRef.current = setTimeout(() => {
        setPhase('waiting');
        setWaitSecs(6);
        let s = 6;
        countdownRef.current = setInterval(() => {
          s--;
          setWaitSecs(s);
          if (s <= 0) {
            clearInterval(countdownRef.current);
            setPhase('riding');
            toast('🚀 Start riding! Customer is waiting.', {
              position:'bottom-center', autoClose:3000,
              style:{ borderRadius:14, background:'#E53935', color:'white', fontWeight:700 },
            });
          }
        }, 1000);
      }, 6000);
    } catch {
      toast.error('Could not accept order');
    }
  };

  const startBroadcastingLocation = () => {
    if (!activeOrder || !navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => socket.emit('rider_location', {
        orderId: activeOrder.orderId,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      }),
      null,
      { enableHighAccuracy:true, maximumAge:2000 }
    );
    toast('📍 Live location sharing started!', {
      position:'bottom-center', autoClose:2500,
      style:{ borderRadius:14, background:'#1565C0', color:'white', fontWeight:700 },
    });
  };

  const markDelivered = () => {
    if (watchRef.current)   navigator.geolocation.clearWatch(watchRef.current);
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    if (countdownRef.current)  clearInterval(countdownRef.current);

    socket.emit('rider_location', { orderId: activeOrder.orderId, delivered: true });
    api.put(`/orders/${activeOrder.orderId}/status`, { status:'delivered' }).catch(()=>{});

    setEarnings(e => e + Math.round((activeOrder.pricing?.deliveryFee || 50) * 0.8));
    setDelivered(d => d + 1);
    setActive(null);
    setPhase('idle');

    toast('🎉 Delivery complete! Great job!', {
      position:'bottom-center', autoClose:3500,
      style:{ borderRadius:14, background:'#2E7D32', color:'white', fontWeight:700 },
    });
  };

  const phaseLabel = {
    heading: '🏍️ Heading to Restaurant',
    waiting: `🍽️ At Restaurant — food being packed`,
    riding:  '🚀 Riding to Customer',
  };

  return (
    <Container sx={{ py:3, pb:10, maxWidth:480 }}>
      <Typography variant="h5" fontWeight={800} gutterBottom>Rider Dashboard</Typography>

      {/* ── Online toggle ── */}
      <Card sx={{
        p:2.5, mb:3,
        background: online
          ? 'linear-gradient(135deg,#2E7D32,#388E3C)'
          : 'linear-gradient(135deg,#F5F5F5,#EEEEEE)',
        transition:'background 0.5s',
      }}>
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Box>
            <Typography variant="h6" fontWeight={800} color={online ? 'white' : 'text.primary'}>
              {online ? '🟢 Online' : '⚫ Offline'}
            </Typography>
            <Typography variant="body2" sx={{ color: online ? 'rgba(255,255,255,0.8)' : 'text.secondary', mt:0.3 }}>
              {online ? 'Ready to receive delivery requests' : 'Toggle ON to start earning'}
            </Typography>
          </Box>
          <Switch
            checked={online}
            onChange={e => goOnline(e.target.checked)}
            sx={{
              '& .MuiSwitch-thumb':{ bgcolor:'white' },
              '& .MuiSwitch-track':{ bgcolor: online ? 'rgba(255,255,255,0.35) !important' : undefined },
            }}
          />
        </Box>
      </Card>

      {/* ── Stats ── */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6}>
          <Card sx={{ p:2 }}>
            <AttachMoney sx={{ color:'#E53935', mb:0.5 }}/>
            <Typography variant="h5" fontWeight={800}>PKR {earnings}</Typography>
            <Typography variant="caption" color="text.secondary">Today's Earnings</Typography>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card sx={{ p:2 }}>
            <CheckCircle sx={{ color:'#2E7D32', mb:0.5 }}/>
            <Typography variant="h5" fontWeight={800}>{delivered}</Typography>
            <Typography variant="caption" color="text.secondary">Deliveries Today</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* ── Active delivery ── */}
      <AnimatePresence>
        {activeOrder && (
          <motion.div
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0  }}
            exit={{    opacity:0, y:-10 }}
            transition={{ type:'spring', stiffness:280, damping:22 }}
          >
            <Card sx={{ mb:3, border:'2px solid #E53935', boxShadow:'0 4px 24px rgba(229,57,53,0.2)' }}>
              <CardContent>
                {/* Phase header */}
                <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1.5 }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={700} fontSize={10}>
                      ACTIVE DELIVERY
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={800} color="primary">
                      #{activeOrder.orderNumber}
                    </Typography>
                  </Box>
                  <Chip
                    label={phaseLabel[deliveryPhase] || '🏍️ Accepted'}
                    size="small"
                    sx={{
                      bgcolor: deliveryPhase==='waiting' ? '#F3E5F5' : deliveryPhase==='riding' ? '#FFEBEE' : '#E8F5E9',
                      color: deliveryPhase==='waiting' ? '#7B1FA2' : deliveryPhase==='riding' ? '#C62828' : '#2E7D32',
                      fontWeight:700, fontSize:10,
                    }}
                  />
                </Box>

                {/* Mini map */}
                <MiniMap phase={deliveryPhase === 'riding' ? 'riding' : 'waiting'}/>

                {/* Countdown when waiting */}
                {deliveryPhase === 'waiting' && (
                  <Box sx={{ mt:1.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Rider starts in {waitSeconds}s...
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={((6 - waitSeconds) / 6) * 100}
                      sx={{ mt:0.5, height:5, borderRadius:4,
                        bgcolor:'#F3E5F5',
                        '& .MuiLinearProgress-bar':{ bgcolor:'#9C27B0' },
                      }}
                    />
                  </Box>
                )}

                {/* Addresses */}
                <Box sx={{ mt:2 }}>
                  <Box sx={{ display:'flex', gap:1.5, mb:0.75, alignItems:'center' }}>
                    <LocationOn sx={{ color:'#E53935', fontSize:18 }}/>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>PICKUP</Typography>
                      <Typography variant="body2" fontWeight={600}>{activeOrder.restaurantName}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display:'flex', gap:1.5, alignItems:'center' }}>
                    <LocationOn sx={{ color:'#2E7D32', fontSize:18 }}/>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>DELIVER TO</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {activeOrder.deliveryAddress?.street}, {activeOrder.deliveryAddress?.city}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mt:1.5, p:1.5, bgcolor:'#FFF8F8', borderRadius:3, border:'1px solid #FFCDD2' }}>
                  <Typography variant="body2" color="primary" fontWeight={700}>
                    💰 Your earnings: PKR {Math.round((activeOrder.pricing?.deliveryFee || 50) * 0.8)}
                  </Typography>
                </Box>

                <Divider sx={{ my:2, borderColor:'#FFF0EE' }}/>

                <Box sx={{ display:'flex', gap:1.5 }}>
                  <Button
                    variant="outlined" startIcon={<MyLocation/>}
                    onClick={startBroadcastingLocation} fullWidth
                    sx={{ borderRadius:12, borderColor:'#E53935', color:'#E53935', fontSize:12 }}
                  >
                    Share GPS
                  </Button>
                  <Button
                    variant="contained" color="success"
                    onClick={markDelivered} fullWidth
                    disabled={deliveryPhase !== 'riding'}
                    sx={{ borderRadius:12, fontSize:12,
                      background: deliveryPhase==='riding' ? 'linear-gradient(135deg,#2E7D32,#388E3C)' : undefined,
                    }}
                  >
                    Mark Delivered ✅
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Incoming orders ── */}
      {online && !activeOrder && (
        <>
          {pendingOrders.length === 0 ? (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
              <Card sx={{ p:4, textAlign:'center', bgcolor:'#FFF8F8' }}>
                <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:2, repeat:Infinity }}>
                  <TwoWheeler sx={{ fontSize:64, color:'#E53935', opacity:0.5 }}/>
                </motion.div>
                <Typography variant="h6" fontWeight={700} mt={1}>Waiting for orders...</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  New orders will appear here instantly
                </Typography>
              </Card>
            </motion.div>
          ) : (
            <Box sx={{ mb:1.5, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <Typography variant="subtitle1" fontWeight={800}>
                📦 {pendingOrders.length} order{pendingOrders.length>1?'s':''} nearby
              </Typography>
              <Chip label="NEW" size="small" sx={{ bgcolor:'#E53935', color:'white', fontWeight:700, fontSize:10, animation:'pulse 1.5s infinite' }}/>
            </Box>
          )}

          <AnimatePresence>
            {pendingOrders.map(order => (
              <motion.div
                key={order.orderId}
                initial={{ opacity:0, x:60, scale:0.95 }}
                animate={{ opacity:1, x:0,  scale:1    }}
                exit={{    opacity:0, x:-60, scale:0.95 }}
                transition={{ type:'spring', stiffness:300, damping:24 }}
              >
                <Card sx={{ mb:2, border:'1.5px solid #FFCDD2', boxShadow:'0 4px 24px rgba(229,57,53,0.12)' }}>
                  <CardContent>
                    <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:1 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={800}>#{order.orderNumber}</Typography>
                        <Typography variant="caption" color="text.secondary">{order.items?.length || 1} item(s)</Typography>
                      </Box>
                      <Chip
                        label={`+PKR ${Math.round((order.pricing?.deliveryFee||50)*0.8)}`}
                        sx={{ bgcolor:'#E53935', color:'white', fontWeight:800, fontSize:13 }}
                      />
                    </Box>

                    <IncomingMap/>

                    <Box sx={{ mt:2 }}>
                      <Box sx={{ display:'flex', gap:1.5, mb:0.75, alignItems:'center' }}>
                        <LocationOn sx={{ color:'#E53935', fontSize:16 }}/>
                        <Typography variant="body2"><strong>From:</strong> {order.restaurantName}</Typography>
                      </Box>
                      <Box sx={{ display:'flex', gap:1.5, alignItems:'center' }}>
                        <LocationOn sx={{ color:'#2E7D32', fontSize:16 }}/>
                        <Typography variant="body2"><strong>To:</strong> {order.deliveryAddress?.street}, {order.deliveryAddress?.city}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display:'flex', gap:1.5, mt:2 }}>
                      <Button
                        variant="outlined" color="inherit" fullWidth
                        onClick={() => setPending(p=>p.filter(o=>o.orderId!==order.orderId))}
                        sx={{ borderRadius:12, color:'text.secondary', borderColor:'#E0E0E0', fontSize:13 }}
                      >
                        Decline
                      </Button>
                      <Button
                        variant="contained" fullWidth
                        onClick={() => acceptOrder(order)}
                        sx={{ borderRadius:12, fontSize:13,
                          background:'linear-gradient(135deg,#E53935,#FF5722)',
                          boxShadow:'0 4px 16px rgba(229,57,53,0.4)',
                        }}
                      >
                        Accept 🏍️
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </>
      )}

      {/* ── Fair wage note ── */}
      <Card sx={{ mt:3, p:2.5, background:'linear-gradient(135deg,#E8F5E9,#F1F8E9)', border:'1px solid #C8E6C9' }}>
        <Typography variant="subtitle2" fontWeight={800} color="#1B5E20" gutterBottom>
          FairBite Rider Promise 🤝
        </Typography>
        <Typography variant="caption" color="#2E7D32">
          You keep <strong>80% of every delivery fee</strong>. Platform takes only 20% — no hidden deductions, ever.
        </Typography>
      </Card>

      <style>{`@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(229,57,53,0.4)}50%{box-shadow:0 0 0 6px rgba(229,57,53,0)}}`}</style>
    </Container>
  );
};

export default RiderDashboard;
