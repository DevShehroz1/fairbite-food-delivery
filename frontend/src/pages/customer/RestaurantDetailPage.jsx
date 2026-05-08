import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../services/api';
import useCart from '../../hooks/useCart';
import {
  Icons, PKR, Pressable, SmartImg, Stars, Ribbon, Stepper, BrandButton,
} from '../../components/ui';

const CAT_LABELS = {
  'main-course': 'Main Course',
  appetizer:     'Starters',
  dessert:       'Desserts',
  beverage:      'Drinks',
};

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items: cartItems, itemCount, subtotal, addItem, updateQuantity, restaurantId } = useCart();
  const scrollRef = useRef(null);

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('Menu');
  const [scrollY, setScrollY]       = useState(0);
  const [openCat, setOpenCat]       = useState(null);

  useEffect(() => {
    api.get(`/restaurants/${id}`)
      .then(r => {
        setRestaurant(r.data.data);
        const cats = groupByCategory(r.data.data?.menu || []);
        if (cats.length) setOpenCat(cats[0].cat);
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

  return (
    <div ref={scrollRef} style={{ height: '100vh', overflow: 'auto', background: '#fff' }}>
      {/* hero + sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{
          position: 'absolute', inset: 0, height: 60,
          background: `rgba(255,255,255,${headerBg})`,
          backdropFilter: headerBg > 0.5 ? 'blur(10px)' : 'none',
          borderBottom: headerBg > 0.7 ? '1px solid rgba(0,0,0,0.06)' : 'none',
          transition: 'all .2s',
        }}/>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center',
          padding: '12px 16px', gap: 10, height: 60 }}>
          <Pressable onClick={() => navigate(-1)} style={{
            width: 38, height: 38, borderRadius: 999,
            background: headerBg > 0.5 ? '#F5F5F5' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}><Icons.ChevronL size={20} stroke="#111" sw={2.5}/></Pressable>
          {headerBg > 0.6 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ flex: 1, fontSize: 16, fontWeight: 800, color: '#111', letterSpacing: -0.3 }}>
              {restaurant.name}
            </motion.div>
          )}
        </div>
      </div>

      {/* hero image (scrolls under sticky header) */}
      <div style={{ position: 'relative', height: 220, marginTop: -60 }}>
        <SmartImg src={img} style={{ position: 'absolute', inset: 0 }}/>
        <div style={{ position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55))' }}/>
        <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.4 }}>
            {restaurant.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
            fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
            <Stars rating={restaurant.rating?.average || 0} size={12}/>
            <span>({restaurant.rating?.count || 0} reviews)</span>
            <span>•</span>
            <Icons.Clock size={13} stroke="rgba(255,255,255,0.85)"/>
            <span>{restaurant.delivery?.estimatedTime || 30} min</span>
          </div>
        </div>
      </div>

      {/* restaurant info bar */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #F5F5F5' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(restaurant.cuisine || []).map(c => (
            <span key={c} style={{
              padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: '#F5F5F5', color: '#374151',
            }}>{c}</span>
          ))}
          {restaurant.status?.isVerified && (
            <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: 'rgba(16,185,129,0.1)', color: '#10b981',
              display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icons.Check size={12} stroke="#10b981" sw={3}/> Verified
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 13, color: '#374151' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icons.Bike size={15} stroke="var(--fb-primary)"/>
            {PKR(restaurant.delivery?.fee || 50)} delivery
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icons.Tag size={14} stroke="#111"/>
            Min. {PKR(restaurant.pricing?.minimumOrder || 200)}
          </span>
        </div>
      </div>

      {/* tab bar */}
      <div style={{ display: 'flex', padding: '0 16px', borderBottom: '1px solid #F5F5F5',
        position: 'sticky', top: 60, background: '#fff', zIndex: 20 }}>
        {['Menu', 'Reviews', 'Info'].map(t => (
          <Pressable key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '14px 0', fontSize: 14, fontWeight: tab === t ? 800 : 600,
            color: tab === t ? 'var(--fb-primary)' : '#6b7280',
            borderBottom: tab === t ? '2.5px solid var(--fb-primary)' : '2.5px solid transparent',
          }}>{t}</Pressable>
        ))}
      </div>

      {/* menu */}
      {tab === 'Menu' && (
        <div style={{ padding: '12px 16px', paddingBottom: totalCartQty > 0 ? 120 : 40 }}>
          {menu.map(({ cat, items }) => (
            <div key={cat} style={{ marginBottom: 4 }}>
              {/* category accordion header */}
              <Pressable onClick={() => setOpenCat(openCat === cat ? null : cat)} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', borderBottom: '1px solid #F5F5F5',
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>
                  {CAT_LABELS[cat] || cat}
                  <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, marginLeft: 6 }}>
                    ({items.length})
                  </span>
                </div>
                <motion.div animate={{ rotate: openCat === cat ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <Icons.ChevronD size={18} stroke="#9CA3AF"/>
                </motion.div>
              </Pressable>

              <AnimatePresence initial={false}>
                {openCat === cat && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}>
                    {items.map(item => {
                      const qty = getQty(item.id || item._id);
                      return (
                        <div key={item.id || item._id} style={{
                          display: 'flex', gap: 12, padding: '14px 0',
                          borderBottom: '1px solid #F9F9F9',
                        }}>
                          {item.image && (
                            <SmartImg src={item.image} radius={10}
                              style={{ width: 80, height: 80, flexShrink: 0 }}/>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#111', flex: 1 }}>
                                {item.name}
                                {item.isPopular && (
                                  <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700,
                                    color: 'var(--fb-primary)', background: 'rgba(229,57,53,0.08)',
                                    padding: '2px 6px', borderRadius: 6 }}>POPULAR</span>
                                )}
                              </div>
                            </div>
                            {item.description && (
                              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, lineHeight: 1.4 }}>
                                {item.description}
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                              <span style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>
                                {PKR(item.price)}
                              </span>
                              {qty > 0 ? (
                                <Stepper value={qty}
                                  onChange={(v) => updateQuantity(item.id || item._id, v)}
                                  min={0}/>
                              ) : (
                                <Pressable onClick={() => handleAdd(item)} style={{
                                  width: 34, height: 34, borderRadius: 10,
                                  background: 'var(--fb-primary)', color: '#fff',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  boxShadow: '0 4px 12px rgba(229,57,53,0.3)',
                                }}>
                                  <Icons.Plus size={18} sw={2.5}/>
                                </Pressable>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {tab === 'Reviews' && (
        <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>
          <Icons.Star size={40}/><br/>Reviews coming soon
        </div>
      )}

      {tab === 'Info' && (
        <div style={{ padding: '16px 16px' }}>
          <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{restaurant.description}</div>
          {restaurant.address && (
            <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Icons.MapPin size={18} stroke="var(--fb-primary)"/>
              <span style={{ fontSize: 13, color: '#374151' }}>
                {restaurant.address.street}, {restaurant.address.city}
              </span>
            </div>
          )}
        </div>
      )}

      {/* floating cart bar */}
      {totalCartQty > 0 && (
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }}
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
            padding: '12px 16px 28px',
            background: 'linear-gradient(180deg, transparent, #fff 20%)',
          }}>
          <Pressable onClick={() => navigate('/cart')} style={{
            width: '100%', height: 54, borderRadius: 24,
            background: 'var(--fb-primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 20px',
            boxShadow: '0 8px 24px rgba(229,57,53,0.35)',
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800 }}>{totalCartQty}</div>
            <span style={{ fontSize: 16, fontWeight: 700 }}>View Cart</span>
            <span style={{ fontSize: 15, fontWeight: 800 }}>{PKR(subtotal)}</span>
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
