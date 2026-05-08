import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Icons, Pressable, Chip, BigRestaurantCard, BottomNav } from '../../components/ui';

const FILTERS = ['Rating', 'Price', 'Distance', 'Cuisine'];

export default function RestaurantListPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('Rating');
  const [search, setSearch]           = useState('');
  const [tab, setTab]                 = useState('search');

  useEffect(() => {
    api.get('/restaurants')
      .then(r => setRestaurants(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleTab = (t) => {
    setTab(t);
    if (t === 'home')    navigate('/home');
    if (t === 'orders')  navigate('/orders');
    if (t === 'profile') navigate('/profile');
  };

  const filtered = restaurants.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.cuisine || []).some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    if (filter === 'Rating')   return (b.rating?.average || 0) - (a.rating?.average || 0);
    if (filter === 'Price')    return (a.delivery?.fee || 0) - (b.delivery?.fee || 0);
    if (filter === 'Distance') return (a.delivery?.estimatedTime || 0) - (b.delivery?.estimatedTime || 0);
    return 0;
  });

  return (
    <div style={{ background: '#fff', minHeight: '100vh', paddingBottom: 100 }}>
      {/* sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30, background: '#fff',
        padding: '52px 16px 12px', borderBottom: '1px solid rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pressable onClick={() => navigate('/home')} style={{
            width: 38, height: 38, borderRadius: 12, background: '#F5F5F5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icons.ChevronL size={20} stroke="#111" sw={2.5}/></Pressable>
          <div style={{
            flex: 1, height: 44, borderRadius: 14, background: '#F5F5F5',
            display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
          }}>
            <Icons.Search size={18} stroke="#9CA3AF"/>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search restaurants, dishes…"
              style={{
                flex: 1, border: 0, background: 'transparent', outline: 0,
                fontSize: 14, fontWeight: 500, color: '#111',
              }}/>
            {search && (
              <Pressable onClick={() => setSearch('')} style={{ color: '#9CA3AF' }}>
                <Icons.X size={16}/>
              </Pressable>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 12, paddingBottom: 2 }}
          className="fb-no-scrollbar">
          {FILTERS.map(f => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Chip>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i}/>)
          : sorted.length === 0
            ? <EmptySearch query={search} onClear={() => setSearch('')}/>
            : sorted.map((r, i) => (
              <motion.div key={r.id}
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}>
                <BigRestaurantCard r={r} onClick={() => navigate(`/restaurants/${r.id}`)}/>
              </motion.div>
            ))
        }
      </div>

      <BottomNav tab={tab} onTab={handleTab}/>
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

function EmptySearch({ query, onClear }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <Icons.Search size={48} stroke="#D1D5DB"/>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#111', marginTop: 16 }}>
        No results for "{query}"
      </div>
      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
        Try a different search term
      </div>
      <Pressable onClick={onClear} style={{
        marginTop: 16, padding: '10px 20px', borderRadius: 12,
        background: 'var(--fb-primary)', color: '#fff',
        fontSize: 14, fontWeight: 700,
      }}>Clear search</Pressable>
    </div>
  );
}
