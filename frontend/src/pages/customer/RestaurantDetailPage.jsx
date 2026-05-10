import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../services/api';
import useCart from '../../hooks/useCart';
import {
  Icons, PKR, Pressable, SmartImg, Stars, Stepper,
} from '../../components/ui';

const CAT_LABELS = {
  'main-course': 'Main Course',
  appetizer:     'Starters',
  dessert:       'Desserts',
  beverage:      'Drinks',
};

const DEMO_REVIEWS = [
  { id: 1, text: 'Amazing food! The karahi was perfectly spiced and naan was fresh out of the tandoor.', rating: 5, author: 'Usman K.', ago: '2 days ago' },
  { id: 2, text: 'Good portions and fast delivery. The biryani was fragrant and well-seasoned. Will order again!', rating: 4, author: 'Ayesha R.', ago: '1 week ago' },
  { id: 3, text: 'Best food near UOL. Generous portions, great taste and rider was on time.', rating: 5, author: 'Bilal M.', ago: '3 days ago' },
];

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items: cartItems, subtotal, addItem, updateQuantity, restaurantId } = useCart();
  const scrollRef = useRef(null);

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [scrollY, setScrollY]       = useState(0);
  const [activeTab, setActiveTab]   = useState('popular');
  const [menuSearch, setMenuSearch] = useState('');

  useEffect(() => {
    api.get(`/restaurants/${id}`)
      .then(r => {
        setRestaurant(r.data.data);
      })
      .catch(() => toast.error('Could not load restaurant'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrollY(el.scrollTop);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) return <LoadingState/>;
  if (!restaurant) return null;

  const img     = restaurant.images?.cover || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900';
  const menu    = groupByCategory(restaurant.menu || []);
  const thisCartItems = cartItems.filter(i => i.restaurantId === id);
  const totalCartQty  = thisCartItems.reduce((s, i) => s + i.quantity, 0);

  const getQty = (itemId) => {
    const ci = cartItems.find(i => i._id === itemId);
    return ci ? ci.quantity : 0;
  };

  const handleAdd = (menuItem) => {
    if (restaurantId && restaurantId !== id) {
      if (!window.confirm('Your cart has items from another restaurant. Clear it?')) return;
    }
    addItem({ ...menuItem, _id: menuItem.id || menuItem._id }, id, restaurant.name);
    toast.success(`${menuItem.name} added!`, { autoClose: 1200 });
  };

  const headerBg = Math.min(1, scrollY / 100);

  const allMenuItems = restaurant.menu || [];
  const popularItems = allMenuItems.slice(0, 4);

  const menuCatTabs = menu.map(({ cat }) => ({ key: cat, label: CAT_LABELS[cat] || cat }));
  const allTabs = [{ key: 'popular', label: 'Popular' }, ...menuCatTabs];

  const displayMenu = menuSearch
    ? menu.map(m => ({ ...m, items: m.items.filter(i => i.name.toLowerCase().includes(menuSearch.toLowerCase())) })).filter(m => m.items.length > 0)
    : activeTab === 'popular'
      ? menu
      : menu.filter(m => m.cat === activeTab);

  const showPopularGrid = !menuSearch && activeTab === 'popular';

  return (
    <div ref={scrollRef} style={{ height: '100vh', overflowY: 'auto', background: '#fff' }}>

      {/* Sticky header with fade */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ position: 'absolute', inset: 0, height: 60, background: `rgba(255,255,255,${headerBg})`, backdropFilter: headerBg > 0.5 ? 'blur(10px)' : 'none', borderBottom: headerBg > 0.7 ? '1px solid rgba(0,0,0,0.06)' : 'none', transition: 'all .2s' }}/>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 10, height: 60 }}>
          <Pressable onClick={() => navigate(-1)} style={{ width: 38, height: 38, borderRadius: 999, background: headerBg > 0.5 ? '#F5F5F5' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Icons.ChevronL size={20} stroke="#111" sw={2.5}/>
          </Pressable>
          {headerBg > 0.6 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, fontSize: 16, fontWeight: 800, color: '#111', letterSpacing: -0.3 }}>
              {restaurant.name}
            </motion.div>
          )}
        </div>
      </div>

      {/* Hero image */}
      <div style={{ position: 'relative', height: 220, marginTop: -60 }}>
        <SmartImg src={img} style={{ position: 'absolute', inset: 0 }}/>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.4))' }}/>
      </div>

      {/* Restaurant name + rating */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: -0.4 }}>{restaurant.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <Stars rating={restaurant.rating?.average || 0} size={14}/>
          <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>
            {(restaurant.rating?.average || 0).toFixed(1)} ({restaurant.rating?.count || 0}+ ratings)
          </span>
        </div>
        {/* Cuisine tags */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {(restaurant.cuisine || []).map(c => (
            <span key={c} style={{ padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#F5F5F5', color: '#374151' }}>{c}</span>
          ))}
        </div>
      </div>

      {/* Delivery info row */}
      <div style={{ margin: '14px 16px 0', padding: '14px', borderRadius: 14, border: '1px solid #F0F0F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#111' }}>
            <span>🏍️</span>
            <span>Delivery {restaurant.delivery?.estimatedTime || 25}–{(restaurant.delivery?.estimatedTime || 25) + 10} min</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fb-primary)' }}>Change</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--fb-primary)', marginTop: 5, fontWeight: 600 }}>
          Free delivery · Min. order {PKR(restaurant.pricing?.minimumOrder || 200)}
        </div>
      </div>

      {/* Discount voucher cards - 2 side by side */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 16px 0' }}>
        <div style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(229,57,53,0.06)', border: '1px solid rgba(229,57,53,0.15)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -12, top: -12, width: 56, height: 56, borderRadius: '50%', background: 'rgba(229,57,53,0.08)' }}/>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--fb-primary)' }}>10% off</div>
          <div style={{ fontSize: 10, color: '#374151', marginTop: 3, lineHeight: 1.5 }}>minimum Rs. 0. Valid for all items. Auto-applied.</div>
        </div>
        <div style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#F9F9F9', border: '1px solid #F0F0F0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -12, top: -12, width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,0,0,0.04)' }}/>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>50% off:</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#111' }}>PEHLAORDER</div>
          <div style={{ fontSize: 10, color: '#374151', marginTop: 3, lineHeight: 1.5 }}>minimum Rs. 499. Valid for first order.</div>
        </div>
      </div>

      {/* Search menu input */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: '#F5F5F5' }}>
          <Icons.Search size={16} stroke="#9CA3AF"/>
          <input value={menuSearch} onChange={e => setMenuSearch(e.target.value)} placeholder="Search menu" style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, color: '#111', outline: 'none' }}/>
        </div>
      </div>

      {/* Category tabs — horizontal scroll, sticky below header */}
      <div className="fb-no-scrollbar" style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid #F0F0F0', marginTop: 12, position: 'sticky', top: 60, background: '#fff', zIndex: 20 }}>
        {allTabs.map(t => (
          <Pressable key={t.key} onClick={() => { setActiveTab(t.key); setMenuSearch(''); }} style={{ padding: '12px 18px', fontSize: 14, fontWeight: activeTab === t.key ? 800 : 600, flexShrink: 0, color: activeTab === t.key ? 'var(--fb-primary)' : '#6b7280', borderBottom: activeTab === t.key ? '2.5px solid var(--fb-primary)' : '2.5px solid transparent', whiteSpace: 'nowrap' }}>
            {t.label}
          </Pressable>
        ))}
      </div>

      {/* Content */}
      <div style={{ paddingBottom: totalCartQty > 0 ? 120 : 40 }}>

        {/* Popular 2-col grid — only on popular tab when no search */}
        {showPopularGrid && popularItems.length > 0 && (
          <div style={{ padding: '16px 16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>🔥</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>Popular</span>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>Most ordered right now.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {popularItems.map(item => {
                const qty = getQty(item.id || item._id);
                return (
                  <div key={item.id || item._id} style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #F0F0F0' }}>
                    <div style={{ height: 110, background: '#F5F5F5', position: 'relative', overflow: 'hidden' }}>
                      {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}
                      {qty === 0 ? (
                        <Pressable onClick={() => handleAdd(item)} style={{ position: 'absolute', bottom: 8, right: 8, width: 30, height: 30, borderRadius: 999, background: '#fff', border: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                          <Icons.Plus size={15} stroke="#111" sw={2.5}/>
                        </Pressable>
                      ) : (
                        <div style={{ position: 'absolute', bottom: 6, right: 6 }}>
                          <Stepper value={qty} onChange={v => updateQuantity(item.id || item._id, v)} min={0}/>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--fb-primary)', marginTop: 3 }}>{PKR(item.price)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fellow foodies say — reviews, only on popular tab when no search */}
        {showPopularGrid && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>Fellow foodies say</span>
              <Pressable style={{ fontSize: 12, fontWeight: 700, color: 'var(--fb-primary)' }}>See all</Pressable>
            </div>
            <div className="fb-no-scrollbar" style={{ display: 'flex', gap: 10, padding: '0 16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {DEMO_REVIEWS.map(rev => (
                <div key={rev.id} style={{ width: 240, flexShrink: 0, padding: '14px', borderRadius: 14, border: '1px solid #F0F0F0', background: '#fff' }}>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.55, marginBottom: 12 }}>{rev.text}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Stars rating={rev.rating} size={12}/>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>· {rev.author} · {rev.ago}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu sections list view */}
        {displayMenu.map(({ cat, items }) => (
          <div key={cat} style={{ marginTop: 20, padding: '0 16px' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 4, paddingBottom: 10, borderBottom: '1px solid #F5F5F5' }}>
              {CAT_LABELS[cat] || cat}
              <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, marginLeft: 6 }}>({items.length})</span>
            </div>
            {items.map(item => {
              const qty = getQty(item.id || item._id);
              return (
                <div key={item.id || item._id} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid #F9F9F9', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{item.name}</div>
                    {item.description && (
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.description}</div>
                    )}
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--fb-primary)', marginTop: 6 }}>{PKR(item.price)}</div>
                    {qty > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Stepper value={qty} onChange={v => updateQuantity(item.id || item._id, v)} min={0}/>
                      </div>
                    )}
                  </div>
                  <div style={{ width: 88, height: 88, borderRadius: 12, background: '#F5F5F5', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                    {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}
                    {qty === 0 && (
                      <Pressable onClick={() => handleAdd(item)} style={{ position: 'absolute', bottom: 6, right: 6, width: 28, height: 28, borderRadius: 999, background: '#fff', border: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                        <Icons.Plus size={14} stroke="#111" sw={2.5}/>
                      </Pressable>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Empty search state */}
        {menuSearch && displayMenu.length === 0 && (
          <div style={{ padding: '60px 16px', textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ fontSize: 40 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginTop: 12 }}>No results for "{menuSearch}"</div>
          </div>
        )}
      </div>

      {/* FoodPanda-style cart CTA */}
      {totalCartQty > 0 && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, padding: '12px 16px 28px', background: 'linear-gradient(180deg, transparent, #fff 25%)' }}>
          <Pressable onClick={() => navigate('/cart')} style={{ width: '100%', height: 58, borderRadius: 14, background: 'var(--fb-primary)', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 14, boxShadow: '0 8px 24px rgba(229,57,53,0.35)' }}>
            <div style={{ width: 34, height: 34, borderRadius: 999, border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, flexShrink: 0 }}>{totalCartQty}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>View your cart</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 }}>{restaurant.name}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{PKR(subtotal)}</div>
            </div>
          </Pressable>
        </motion.div>
      )}

    </div>
  );
}

function groupByCategory(menu) {
  const cats = {};
  (menu || []).forEach(item => {
    const c = item.category || 'other';
    if (!cats[c]) cats[c] = [];
    cats[c].push(item);
  });
  return Object.entries(cats).map(([cat, items]) => ({ cat, items }));
}

function LoadingState() {
  return (
    <div style={{ padding: '80px 16px 0' }}>
      <div style={{ height: 220, borderRadius: 0, background: '#EEE',
        backgroundImage: 'linear-gradient(90deg, #EEE 0%, #F8F8F8 50%, #EEE 100%)',
        backgroundSize: '200% 100%', animation: 'fb-shimmer 1.2s linear infinite' }}/>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ height: 16, borderRadius: 8, background: '#EEE',
            backgroundImage: 'linear-gradient(90deg, #EEE 0%, #F8F8F8 50%, #EEE 100%)',
            backgroundSize: '200% 100%', animation: 'fb-shimmer 1.2s linear infinite',
            width: i % 2 === 0 ? '80%' : '50%' }}/>
        ))}
      </div>
    </div>
  );
}
