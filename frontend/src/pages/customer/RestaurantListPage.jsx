import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Icons, Pressable, Chip, BigRestaurantCard, BottomNav } from '../../components/ui';
import {
  CATEGORY_LABEL, BRAND_LABEL, matchesCategory, matchesBrand,
} from '../../utils/categoryMap';

const SORT_FILTERS = ['Rating', 'Price', 'Distance'];

export default function RestaurantListPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const categoryParam = params.get('category') || '';
  const brandParam    = params.get('brand') || '';

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [sortBy, setSortBy]           = useState('Rating');
  const [search, setSearch]           = useState('');
  const [cuisinePicked, setCuisine]   = useState('');
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

  const allCuisines = useMemo(() => {
    const set = new Set();
    restaurants.forEach(r => (r.cuisine || []).forEach(c => set.add(c)));
    return [...set].sort();
  }, [restaurants]);

  const clearCategory = () => { params.delete('category'); setParams(params); };
  const clearBrand    = () => { params.delete('brand'); setParams(params); };

  const filtered = restaurants
    .filter(r => matchesCategory(r, categoryParam))
    .filter(r => matchesBrand(r, brandParam))
    .filter(r => !cuisinePicked || (r.cuisine || []).map(c => c.toLowerCase()).includes(cuisinePicked.toLowerCase()))
    .filter(r =>
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.cuisine || []).some(c => c.toLowerCase().includes(search.toLowerCase()))
    );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'Rating')   return (b.rating?.average || 0) - (a.rating?.average || 0);
    if (sortBy === 'Price')    return (a.delivery?.fee || 0) - (b.delivery?.fee || 0);
    if (sortBy === 'Distance') return (a.delivery?.estimatedTime || 0) - (b.delivery?.estimatedTime || 0);
    return 0;
  });

  const headerTitle = brandParam
    ? (BRAND_LABEL[brandParam] || brandParam)
    : categoryParam
      ? CATEGORY_LABEL[categoryParam] || categoryParam
      : null;

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
              autoFocus
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

        {/* Active category / brand chip */}
        {headerTitle && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Showing</span>
            <Pressable onClick={brandParam ? clearBrand : clearCategory} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 999,
              background: 'var(--qb-primary)', color: '#fff',
              fontSize: 12, fontWeight: 700,
            }}>
              {headerTitle}
              <Icons.X size={12} stroke="#fff" sw={2.5}/>
            </Pressable>
          </div>
        )}

        {/* Sort chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 12, paddingBottom: 2 }}
          className="qb-no-scrollbar">
          {SORT_FILTERS.map(f => (
            <Chip key={f} active={sortBy === f} onClick={() => setSortBy(f)}>{f}</Chip>
          ))}
        </div>

        {/* Cuisine filter row — only visible when there are cuisines + no category lock */}
        {allCuisines.length > 0 && !categoryParam && !brandParam && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginTop: 8, paddingBottom: 2 }}
            className="qb-no-scrollbar">
            <Chip active={!cuisinePicked} onClick={() => setCuisine('')}>All</Chip>
            {allCuisines.map(c => (
              <Chip key={c} active={cuisinePicked === c} onClick={() => setCuisine(c === cuisinePicked ? '' : c)}>{c}</Chip>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i}/>)
        ) : sorted.length === 0 ? (
          search
            ? <EmptySearch query={search} onClear={() => setSearch('')}/>
            : (brandParam || categoryParam)
              ? <EmptyFiltered title={headerTitle} onClear={brandParam ? clearBrand : clearCategory}/>
              : (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Icons.Compass size={48} stroke="#D1D5DB"/>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#111', marginTop: 16 }}>
                    No restaurants available
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
                    Check back soon — new restaurants are joining!
                  </div>
                </div>
              )
        ) : (
          <>
            {!search && (
              <div style={{
                fontSize: 13, fontWeight: 700, color: '#9CA3AF',
                textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
              }}>
                {headerTitle ? `${headerTitle} (${sorted.length})` : `All Restaurants (${sorted.length})`}
              </div>
            )}
            {sorted.map((r, i) => (
              <motion.div key={r.id}
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}>
                <BigRestaurantCard r={r} onClick={() => navigate(`/restaurants/${r.id}`)}/>
              </motion.div>
            ))}
          </>
        )}
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
        backgroundSize: '200% 100%', animation: 'qb-shimmer 1.2s linear infinite' }}/>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ width: '60%', height: 14, borderRadius: 6, background: '#EEE',
          backgroundImage: 'linear-gradient(90deg, #EEE 0%, #F8F8F8 50%, #EEE 100%)',
          backgroundSize: '200% 100%', animation: 'qb-shimmer 1.2s linear infinite' }}/>
        <div style={{ width: '40%', height: 10, borderRadius: 6, background: '#EEE',
          backgroundImage: 'linear-gradient(90deg, #EEE 0%, #F8F8F8 50%, #EEE 100%)',
          backgroundSize: '200% 100%', animation: 'qb-shimmer 1.2s linear infinite' }}/>
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
        background: 'var(--qb-primary)', color: '#fff',
        fontSize: 14, fontWeight: 700,
      }}>Clear search</Pressable>
    </div>
  );
}

function EmptyFiltered({ title, onClear }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <Icons.Compass size={48} stroke="#D1D5DB"/>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#111', marginTop: 16 }}>
        No {title} restaurants in your area yet
      </div>
      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
        Try clearing the filter or pick another category.
      </div>
      <Pressable onClick={onClear} style={{
        marginTop: 16, padding: '10px 20px', borderRadius: 12,
        background: 'var(--qb-primary)', color: '#fff',
        fontSize: 14, fontWeight: 700,
      }}>Show all restaurants</Pressable>
    </div>
  );
}
