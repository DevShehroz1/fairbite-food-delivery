import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import useCart from '../../hooks/useCart';
import api from '../../services/api';
import {
  Icons, PKR, Pressable, SmartImg, Stars, Ribbon, BrandButton,
  BigRestaurantCard, BottomNav,
} from '../../components/ui';

const HERO_BANNERS = [
  {
    id: 'b1',
    title: 'Fair prices,\nzero hidden fees',
    sub: 'Save up to Rs. 200 per order',
    bg: 'linear-gradient(135deg, var(--fb-primary), var(--fb-accent))',
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop',
  },
  {
    id: 'b2',
    title: '50% off\nyour first order',
    sub: 'Use code FAIRBITE50',
    bg: 'linear-gradient(135deg, #1f2937, #4b5563)',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop',
  },
  {
    id: 'b3',
    title: 'Free delivery\nall weekend',
    sub: 'On orders over Rs. 800',
    bg: 'linear-gradient(135deg, #047857, #10b981)',
    img: 'https://images.unsplash.com/photo-1633237308525-cd587cf71926?w=600&auto=format&fit=crop',
  },
];

const CATEGORIES = [
  { id: 'burgers', label: 'Burgers', img: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=300&auto=format&fit=crop' },
  { id: 'pizza',   label: 'Pizza',   img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop' },
  { id: 'desi',    label: 'Desi',    img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&auto=format&fit=crop' },
  { id: 'sushi',   label: 'Sushi',   img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&auto=format&fit=crop' },
  { id: 'sweets',  label: 'Desserts',img: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&auto=format&fit=crop' },
  { id: 'bbq',     label: 'BBQ',     img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop' },
  { id: 'biryani', label: 'Biryani', img: 'https://images.unsplash.com/photo-1604908554007-1ec5d4f1f8b3?w=300&auto=format&fit=crop' },
  { id: 'drinks',  label: 'Drinks',  img: 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=300&auto=format&fit=crop' },
];

export default function HomePage() {
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [bannerIdx, setBannerIdx]     = useState(0);
  const [tab, setTab]                 = useState('home');

  useEffect(() => {
    api.get('/restaurants')
      .then(r => setRestaurants(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % HERO_BANNERS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const handleTab = (t) => {
    setTab(t);
    if (t === 'search')  navigate('/restaurants');
    if (t === 'orders')  navigate('/orders');
    if (t === 'profile') navigate('/profile');
  };

  const topRated = [...restaurants].sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0)).slice(0, 5);

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const item    = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

  return (
    <div style={{ background: '#fff', minHeight: '100vh', paddingBottom: 100 }}>
      {/* sticky top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30, background: '#fff',
        padding: '52px 16px 12px',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: 0.5 }}>Deliver to</div>
            <Pressable style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Icons.MapPin size={16} stroke="var(--fb-primary)" sw={2.5}/>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Karachi, DHA</span>
              <Icons.ChevronD size={16} stroke="#111" sw={2.5}/>
            </Pressable>
          </div>
          <Pressable onClick={() => navigate('/restaurants')} style={{
            width: 40, height: 40, borderRadius: 14, background: '#F5F5F5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icons.Search size={20} stroke="#111"/></Pressable>
          <Pressable onClick={() => navigate('/cart')} style={{
            width: 40, height: 40, borderRadius: 14, background: '#F5F5F5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          }}>
            <Icons.Cart size={20} stroke="#111"/>
            {itemCount > 0 && (
              <motion.div key={itemCount}
                initial={{ scale: 1 }} animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.4 }}
                style={{
                  position: 'absolute', top: -4, right: -4,
                  minWidth: 18, height: 18, padding: '0 4px',
                  borderRadius: 999, background: 'var(--fb-primary)',
                  color: '#fff', fontSize: 10, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #fff',
                }}>{itemCount}</motion.div>
            )}
          </Pressable>
        </div>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" style={{ padding: '14px 0' }}>
        {/* hero banner carousel */}
        <motion.div variants={item} style={{ padding: '0 16px' }}>
          <div style={{ position: 'relative', height: 154, borderRadius: 20, overflow: 'hidden' }}>
            <AnimatePresence mode="wait">
              <motion.div key={bannerIdx}
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute', inset: 0, background: HERO_BANNERS[bannerIdx].bg,
                  display: 'flex', alignItems: 'stretch', overflow: 'hidden',
                }}>
                <div style={{ flex: 1, padding: '20px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{
                      display: 'inline-block', padding: '3px 8px', borderRadius: 6,
                      background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(6px)',
                      fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: 0.4,
                      marginBottom: 8,
                    }}>FAIRBITE EXCLUSIVE</div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', lineHeight: 1.15,
                      whiteSpace: 'pre-line', letterSpacing: -0.3 }}>
                      {HERO_BANNERS[bannerIdx].title}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                    {HERO_BANNERS[bannerIdx].sub} →
                  </div>
                </div>
                <div style={{ width: 130, position: 'relative' }}>
                  <img src={HERO_BANNERS[bannerIdx].img} alt=""
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>
                  <div style={{ position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, rgba(0,0,0,0.3), transparent 60%)' }}/>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}>
            {HERO_BANNERS.map((_, i) => (
              <motion.div key={i}
                animate={{ width: i === bannerIdx ? 18 : 6, opacity: i === bannerIdx ? 1 : 0.3 }}
                style={{ height: 6, borderRadius: 999, background: 'var(--fb-primary)' }}/>
            ))}
          </div>
        </motion.div>

        {/* categories */}
        <motion.section variants={item} style={{ marginTop: 22 }}>
          <SectionHeader title="What are you craving?" onSeeAll={() => navigate('/restaurants')}/>
          <div style={{ display: 'flex', gap: 10, padding: '0 16px', overflowX: 'auto',
            scrollbarWidth: 'none' }} className="fb-no-scrollbar">
            {CATEGORIES.map(c => (
              <Pressable key={c.id} onClick={() => navigate('/restaurants')} style={{
                width: 78, flexShrink: 0, textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <div style={{ width: 70, height: 70, borderRadius: 18, overflow: 'hidden',
                  background: '#F5F5F5', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                  <SmartImg src={c.img} style={{ width: '100%', height: '100%' }}/>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{c.label}</div>
              </Pressable>
            ))}
          </div>
        </motion.section>

        {/* FairBite vs FoodPanda promo */}
        <motion.section variants={item} style={{ padding: '0 16px', marginTop: 22 }}>
          <div style={{
            position: 'relative', overflow: 'hidden',
            borderRadius: 20, padding: 18,
            background: 'linear-gradient(135deg, #111 0%, #1f1f1f 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{
              position: 'absolute', right: -30, top: -30, width: 180, height: 180,
              borderRadius: 999, background: 'radial-gradient(circle, rgba(229,57,53,0.4), transparent 70%)',
            }}/>
            <div style={{ position: 'relative' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 8px', borderRadius: 6, background: 'var(--fb-primary)',
                fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: 0.5, marginBottom: 8,
              }}><Icons.Tag size={10}/>SAVINGS</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>
                FairBite vs FoodPanda
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4, marginBottom: 12 }}>
                Save up to <span style={{ color: 'var(--fb-accent)', fontWeight: 700 }}>15%</span> on every order. No service fees, ever.
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>FoodPanda</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through', marginTop: 2 }}>Rs. 1,180</div>
                </div>
                <Icons.ChevronR size={18} stroke="rgba(255,255,255,0.4)"/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>FairBite</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--fb-accent)', marginTop: 2 }}>Rs. 1,000</div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* top rated restaurants */}
        <motion.section variants={item} style={{ marginTop: 22, padding: '0 16px' }}>
          <SectionHeader title="Top Rated Near You" subtitle="Within 5 km" onSeeAll={() => navigate('/restaurants')}/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i}/>)
              : topRated.map(r => (
                <BigRestaurantCard key={r.id} r={r} onClick={() => navigate(`/restaurants/${r.id}`)}/>
              ))
            }
          </div>
        </motion.section>
      </motion.div>

      <BottomNav tab={tab} onTab={handleTab}/>
    </div>
  );
}

function SectionHeader({ title, subtitle, onSeeAll }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      padding: '0 16px', marginBottom: 10 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#111', letterSpacing: -0.3 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {onSeeAll && (
        <Pressable onClick={onSeeAll} style={{ fontSize: 12, fontWeight: 700, color: 'var(--fb-primary)' }}>
          See all
        </Pressable>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #F0F0F0' }}>
      <div style={{ height: 152, background: '#EEE',
        backgroundImage: 'linear-gradient(90deg, #EEE 0%, #F8F8F8 50%, #EEE 100%)',
        backgroundSize: '200% 100%', animation: 'fb-shimmer 1.2s linear infinite' }}/>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ width: '60%', height: 14, borderRadius: 6, background: '#EEE',
          backgroundImage: 'linear-gradient(90deg, #EEE 0%, #F8F8F8 50%, #EEE 100%)',
          backgroundSize: '200% 100%', animation: 'fb-shimmer 1.2s linear infinite' }}/>
        <div style={{ width: '40%', height: 10, borderRadius: 6, background: '#EEE',
          backgroundImage: 'linear-gradient(90deg, #EEE 0%, #F8F8F8 50%, #EEE 100%)',
          backgroundSize: '200% 100%', animation: 'fb-shimmer 1.2s linear infinite' }}/>
      </div>
    </div>
  );
}
