import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import useCart from '../../hooks/useCart';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { fallbackBrandLogo } from '../../utils/categoryMap';
import {
  Icons, Pressable, SmartImg,
  BigRestaurantCard, BottomNav, WelcomeBanner,
} from '../../components/ui';

const copyDealCode = (e, code) => {
  if (e && e.stopPropagation) e.stopPropagation();
  if (!code) return;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(code).then(
      () => toast.success(`Code "${code}" copied!`, { autoClose: 1500 }),
      () => toast.error('Could not copy')
    );
  } else {
    toast.info(`Copy code: ${code}`);
  }
};

function BrandLogo({ brand }) {
  const [errored, setErrored] = useState(false);
  const src = (errored || !brand.isLogo) ? fallbackBrandLogo(brand.name) : brand.logo;
  return (
    <img src={src} alt={brand.name} onError={() => setErrored(true)}
      style={{ width: '100%', height: '100%', objectFit: brand.isLogo && !errored ? 'contain' : 'cover', padding: brand.isLogo && !errored ? 8 : 0 }}/>
  );
}

const FOOD_CATEGORIES = [
  { id: 'fast-food',  label: 'Fast Food',   img: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=300&auto=format&fit=crop' },
  { id: 'biryani',    label: 'Biryani',     img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop' },
  { id: 'pizza',      label: 'Pizza',       img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop' },
  { id: 'pakistani',  label: 'Pakistani',   img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&auto=format&fit=crop' },
  { id: 'burgers',    label: 'Burgers',     img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop' },
  { id: 'ice-cream',  label: 'Ice Cream',   img: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&auto=format&fit=crop' },
  { id: 'paratha',    label: 'Paratha',     img: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=300&auto=format&fit=crop' },
  { id: 'halwa-puri', label: 'Halwa Puri',  img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&auto=format&fit=crop' },
  { id: 'chinese',    label: 'Chinese',     img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&auto=format&fit=crop' },
  { id: 'desserts',   label: 'Desserts',    img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&auto=format&fit=crop' },
  { id: 'pasta',      label: 'Pasta',       img: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=300&auto=format&fit=crop' },
  { id: 'pulao',      label: 'Pulao',       img: 'https://images.unsplash.com/photo-1604908554007-1ec5d4f1f8b3?w=300&auto=format&fit=crop' },
  { id: 'shawarma',   label: 'Shawarma',    img: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=300&auto=format&fit=crop' },
  { id: 'haleem',     label: 'Haleem',      img: 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=300&auto=format&fit=crop' },
];

const TOP_BRANDS = [
  { id: 'kfc',        name: 'KFC',            sub: 'From 25 min', logo: 'https://logo.clearbit.com/kfc.com',         isLogo: true  },
  { id: 'burgerking', name: 'Burger King',    sub: 'From 30 min', logo: 'https://logo.clearbit.com/burgerking.com',  isLogo: true  },
  { id: 'mcdonalds',  name: "McDonald's",     sub: 'From 20 min', logo: 'https://logo.clearbit.com/mcdonalds.com',   isLogo: true  },
  { id: 'dominos',    name: "Domino's",       sub: 'From 40 min', logo: 'https://logo.clearbit.com/dominos.com',     isLogo: true  },
  { id: 'pizzahut',   name: 'Pizza Hut',      sub: 'From 35 min', logo: 'https://logo.clearbit.com/pizzahut.com',    isLogo: true  },
  { id: 'subway',     name: 'Subway',         sub: 'From 20 min', logo: 'https://logo.clearbit.com/subway.com',      isLogo: true  },
  { id: 'cheezious',  name: 'Cheezious',      sub: 'From 20 min', logo: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300&auto=format&fit=crop', isLogo: false },
  { id: 'burgerlab',  name: 'Burger Lab',     sub: 'From 15 min', logo: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=300&auto=format&fit=crop',    isLogo: false },
];

const DEAL_BANNERS = [
  { id: 'd1', title: '50% off + free delivery', sub: 'On your first order! Code:', code: 'QUICKBITE50', bg: 'linear-gradient(135deg, var(--qb-primary) 0%, #b91c1c 100%)', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&auto=format&fit=crop' },
  { id: 'd2', title: 'Up to 30% off',           sub: 'On weekend orders. Code:',   code: 'WEEKEND30',  bg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',              img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop' },
  { id: 'd3', title: 'Save Rs. 100',            sub: 'On orders above Rs. 800. Code:', code: 'SAVE100', bg: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',            img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState('home');
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    api.get('/restaurants')
      .then(r => setRestaurants(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('qb_just_logged_in') === '1') {
        sessionStorage.removeItem('qb_just_logged_in');
        setShowWelcome(true);
      }
    } catch (_) {}
  }, []);

  const handleTab = (t) => {
    setTab(t);
    if (t === 'search')  navigate('/restaurants');
    if (t === 'orders')  navigate('/orders');
    if (t === 'profile') navigate('/profile');
  };

  const topRated = [...restaurants]
    .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
    .slice(0, 5);

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', paddingBottom: 100 }}>

      {showWelcome && (
        <WelcomeBanner
          name={user?.name}
          avatar={user?.avatar}
          onClose={() => setShowWelcome(false)}
        />
      )}

      {/* ── Pink hero section (not sticky, scrolls away) ── */}
      <div style={{
        background: 'var(--qb-primary)',
        paddingTop: 52,
        paddingBottom: 36,
        paddingLeft: 16,
        paddingRight: 16,
      }}>
        {/* Row: deliver to + cart */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: 0.5 }}>Deliver to</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Icons.MapPin size={16} stroke="#fff" sw={2.5}/>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Lahore, UOL</span>
            </div>
          </div>
          <Pressable onClick={() => navigate('/cart')} style={{
            width: 40, height: 40, borderRadius: 14,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          }}>
            <Icons.Cart size={20} stroke="#fff"/>
            {itemCount > 0 && (
              <motion.div key={itemCount}
                initial={{ scale: 1 }} animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.4 }}
                style={{
                  position: 'absolute', top: -4, right: -4,
                  minWidth: 18, height: 18, padding: '0 4px',
                  borderRadius: 999, background: '#fff',
                  color: 'var(--qb-primary)', fontSize: 10, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--qb-primary)',
                }}>{itemCount}</motion.div>
            )}
          </Pressable>
        </div>

        {/* White pill search bar */}
        <Pressable onClick={() => navigate('/restaurants')} style={{
          width: '100%', height: 46, borderRadius: 23,
          background: '#fff',
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 16px', marginBottom: 18,
          boxSizing: 'border-box',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <Icons.Search size={18} stroke="#9CA3AF"/>
          <span style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}>
            Search for restaurants and dishes
          </span>
        </Pressable>

        {/* Hero text row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.2,
              letterSpacing: -0.4, marginBottom: 14 }}>
              Here&apos;s 50% off &amp; free delivery on your first order!
            </div>
            <Pressable onClick={() => navigate('/restaurants')} style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#fff', borderRadius: 999,
              padding: '8px 18px',
              fontSize: 13, fontWeight: 700, color: 'var(--qb-primary)',
            }}>
              Start ordering &rsaquo;
            </Pressable>
          </div>
          <div style={{ flexShrink: 0, width: 110, height: 110, borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
            <img
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&auto=format&fit=crop"
              alt="pizza"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>

      {/* ── White rounded card overlapping pink section ── */}
      <div style={{
        background: '#fff',
        borderRadius: '20px 20px 0 0',
        marginTop: -20,
        minHeight: '100vh',
      }}>

        {/* Section 1 — Shortcuts row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          padding: '16px 16px',
          borderBottom: '1px solid #F5F5F5',
        }}>
          {[
            { id: 'offers',   label: 'Offers',   emoji: '🏷️' },
            { id: 'pickup',   label: 'Pick-up',  emoji: '📦' },
            { id: 'homechef', label: 'HomeChef', emoji: '🍳' },
          ].map(s => (
            <Pressable key={s.id} onClick={() => navigate('/restaurants')} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              flex: 1,
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: 16,
                background: '#FFF0F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26,
              }}>
                {s.emoji}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{s.label}</span>
            </Pressable>
          ))}
        </div>

        {/* Section 2 — What are you craving? */}
        <section style={{ marginTop: 20 }}>
          <SectionHeader title="What are you craving?" onSeeAll={() => navigate('/restaurants')}/>
          <div
            className="qb-no-scrollbar"
            style={{
              display: 'flex', gap: 10, padding: '0 16px',
              overflowX: 'auto', scrollbarWidth: 'none',
            }}
          >
            {FOOD_CATEGORIES.map(c => (
              <Pressable key={c.id} onClick={() => navigate(`/restaurants?category=${c.id}`)} style={{
                width: 76, flexShrink: 0, textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <div style={{
                  width: 76, height: 76, borderRadius: 18, overflow: 'hidden',
                  background: '#F5F5F5',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                }}>
                  <SmartImg src={c.img} style={{ width: '100%', height: '100%' }}/>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#111' }}>{c.label}</div>
              </Pressable>
            ))}
          </div>
        </section>

        {/* Section 3 — Today's Deals */}
        <section style={{ marginTop: 24 }}>
          <SectionHeader title="Today's Deals" onSeeAll={() => navigate('/restaurants')}/>
          <div
            className="qb-no-scrollbar"
            style={{
              display: 'flex', gap: 12, padding: '0 16px',
              overflowX: 'auto', scrollbarWidth: 'none',
            }}
          >
            {DEAL_BANNERS.map(d => (
              <motion.div key={d.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/restaurants')}
                style={{
                  width: 200, height: 120, flexShrink: 0,
                  borderRadius: 16, overflow: 'hidden',
                  background: d.bg,
                  position: 'relative',
                  cursor: 'pointer',
                  padding: '14px 14px',
                  boxSizing: 'border-box',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                }}
              >
                {/* Food image — decorative background */}
                <img
                  src={d.img}
                  alt=""
                  style={{
                    position: 'absolute', right: -10, top: '50%',
                    transform: 'translateY(-50%)',
                    width: 90, height: 90,
                    objectFit: 'cover', borderRadius: 12,
                    opacity: 0.25,
                    pointerEvents: 'none',
                  }}
                />
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff',
                  lineHeight: 1.2, position: 'relative' }}>
                  {d.title}
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)',
                    fontWeight: 500, marginBottom: 4 }}>
                    {d.sub}
                  </div>
                  <Pressable onClick={(e) => copyDealCode(e, d.code)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,0.25)',
                    borderRadius: 6, padding: '3px 8px',
                    fontSize: 11, fontWeight: 800, color: '#fff',
                    letterSpacing: 0.4,
                  }}>
                    <span>{d.code}</span>
                    <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.3)', letterSpacing: 0.5 }}>COPY</span>
                  </Pressable>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 4 — Top Brands */}
        <section style={{ marginTop: 24 }}>
          <SectionHeader title="Top Brands" onSeeAll={() => navigate('/restaurants')}/>
          <div
            className="qb-no-scrollbar"
            style={{
              display: 'flex', gap: 12, padding: '0 16px',
              overflowX: 'auto', scrollbarWidth: 'none',
            }}
          >
            {TOP_BRANDS.map(b => (
              <Pressable key={b.id} onClick={() => navigate(`/restaurants?brand=${b.id}`)} style={{
                width: 86, flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <div style={{
                  width: 86, height: 86, borderRadius: 20, overflow: 'hidden',
                  border: '1px solid #F0F0F0', background: b.isLogo ? '#fff' : '#F5F5F5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <BrandLogo brand={b}/>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#111', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.name}
                </div>
                <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: -4 }}>{b.sub}</div>
              </Pressable>
            ))}
          </div>
        </section>

        {/* Section 5 — Popular Restaurants */}
        <section style={{ marginTop: 24, padding: '0 16px' }}>
          <SectionHeader title="Popular Restaurants" onSeeAll={() => navigate('/restaurants')}/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i}/>)
              : topRated.map(r => (
                <BigRestaurantCard key={r.id} r={r} onClick={() => navigate(`/restaurants/${r.id}`)}/>
              ))
            }
          </div>
        </section>

      </div>{/* end white card */}

      <BottomNav tab={tab} onTab={handleTab}/>
    </div>
  );
}

function SectionHeader({ title, subtitle, onSeeAll }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      padding: '0 16px', marginBottom: 10,
    }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#111', letterSpacing: -0.3 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {onSeeAll && (
        <Pressable onClick={onSeeAll} style={{ fontSize: 12, fontWeight: 700, color: 'var(--qb-primary)' }}>
          See all
        </Pressable>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #F0F0F0' }}>
      <div style={{
        height: 152, background: '#EEE',
        backgroundImage: 'linear-gradient(90deg, #EEE 0%, #F8F8F8 50%, #EEE 100%)',
        backgroundSize: '200% 100%', animation: 'qb-shimmer 1.2s linear infinite',
      }}/>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{
          width: '60%', height: 14, borderRadius: 6, background: '#EEE',
          backgroundImage: 'linear-gradient(90deg, #EEE 0%, #F8F8F8 50%, #EEE 100%)',
          backgroundSize: '200% 100%', animation: 'qb-shimmer 1.2s linear infinite',
        }}/>
        <div style={{
          width: '40%', height: 10, borderRadius: 6, background: '#EEE',
          backgroundImage: 'linear-gradient(90deg, #EEE 0%, #F8F8F8 50%, #EEE 100%)',
          backgroundSize: '200% 100%', animation: 'qb-shimmer 1.2s linear infinite',
        }}/>
      </div>
    </div>
  );
}

