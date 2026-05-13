import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import useCart from '../../hooks/useCart';
import api from '../../services/api';
import { Icons, PKR, Pressable } from '../../components/ui';

const STEPS = [
  { n: 1, label: 'Menu' },
  { n: 2, label: 'Cart' },
  { n: 3, label: 'Checkout' },
];

export default function CartPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const { items, restaurantId, restaurantName, subtotal, updateQuantity, removeItem, clearCart, addItem } = useCart();
  const [placing, setPlacing]         = useState(false);
  const [deliveryMode, setDeliveryMode] = useState('delivery');
  const [cutlery, setCutlery]         = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!restaurantId) return;
    api.get(`/restaurants/${restaurantId}`)
      .then(r => {
        const menu = r.data.data?.menu || [];
        const inCart = new Set(items.map(i => i._id || i.id));
        setSuggestions(menu.filter(m => !inCart.has(m.id)).slice(0, 6));
      })
      .catch(() => {});
  }, [restaurantId, items]);

  const tax   = Math.round(subtotal * 0.05);
  const total = subtotal + tax;
  const discountedTotal = Math.round(total * 0.9);

  const handlePlace = async () => {
    if (!items.length) return;
    if (!user) { navigate('/'); return; }
    setPlacing(true);
    try {
      const orderItems = items.map(i => ({ menuItemId: i._id || i.id, quantity: i.quantity }));
      const { data } = await api.post('/orders', {
        restaurantId,
        items: orderItems,
        deliveryAddress: {
          street: '1-KM Raiwind Road, Thokar Niaz Baig',
          city:   'Lahore',
          state:  'Punjab',
          zipCode: '54000',
        },
        payment: { method: 'cash', status: 'pending' },
      });
      clearCart();
      toast.success('Order placed!');
      navigate(`/orders/${data.data.id}/track`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (!items.length) {
    return (
      <div style={{ height: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <CartHeader onBack={() => navigate(-1)} subtitle={restaurantName}/>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30, textAlign: 'center' }}>
          <div style={{ width: 88, height: 88, borderRadius: 999, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Icons.Cart size={36} stroke="#9CA3AF"/>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>Your cart is empty</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6, maxWidth: 240 }}>
            Browse restaurants and add items — checkout is fast and fair.
          </div>
          <Pressable onClick={() => navigate('/restaurants')} style={{ marginTop: 20, padding: '12px 28px', borderRadius: 16, background: 'var(--qb-primary)', color: '#fff', fontSize: 14, fontWeight: 700 }}>
            Browse Restaurants
          </Pressable>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', paddingBottom: 110 }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <CartHeader onBack={() => navigate(-1)} subtitle={restaurantName}/>

      {/* ── 3-step progress ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', padding: '14px 20px 6px' }}>
        {STEPS.map((step, i) => (
          <React.Fragment key={step.n}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 999,
                background: step.n <= 2 ? '#1f2937' : '#E5E5E5',
                color: step.n <= 2 ? '#fff' : '#9CA3AF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800,
              }}>{step.n}</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: step.n <= 2 ? '#111' : '#9CA3AF' }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i === 0 ? '#1f2937' : '#E5E5E5', marginTop: 13, marginBottom: 16 }}/>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── Delivery / Pick-up toggle ─────────────────────────── */}
      <div style={{ margin: '8px 16px', display: 'flex', background: '#F5F5F5', borderRadius: 30, padding: 3, gap: 0 }}>
        {[
          { id: 'delivery', label: '🏍️  Delivery' },
          { id: 'pickup',   label: '🚶  Pick-up' },
        ].map(opt => (
          <Pressable key={opt.id} onClick={() => setDeliveryMode(opt.id)} style={{
            flex: 1, padding: '10px 0', borderRadius: 28,
            background: deliveryMode === opt.id ? '#fff' : 'transparent',
            textAlign: 'center', fontSize: 14, fontWeight: 700,
            color: deliveryMode === opt.id ? '#111' : '#6b7280',
            boxShadow: deliveryMode === opt.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}>
            {opt.label}
          </Pressable>
        ))}
      </div>

      {/* ── Delivery time row ────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 14px' }}>
        <span style={{ fontSize: 14, color: '#374151' }}>
          Delivery: <strong>25–40 min</strong>
        </span>
        <Pressable style={{ fontSize: 13, fontWeight: 700, color: '#111', textDecoration: 'underline' }}>
          Change
        </Pressable>
      </div>

      {/* ── Cart items ───────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #F5F5F5', padding: '10px 16px' }}>
        {items.map(it => {
          const lineOriginal    = it.price * it.quantity;
          const lineDiscounted  = Math.round(lineOriginal * 0.9);
          return (
            <div key={it._id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #F5F5F5', alignItems: 'center' }}>
              {/* Thumbnail */}
              <div style={{ width: 64, height: 64, borderRadius: 10, background: '#F5F5F5', flexShrink: 0, overflow: 'hidden' }}>
                {it.image
                  ? <img src={it.image} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🍛</div>
                }
              </div>
              {/* Name + controls */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {it.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 8, border: '1.5px solid #E5E5E5', borderRadius: 20, width: 'fit-content', padding: '2px 4px' }}>
                  <Pressable onClick={() => removeItem(it._id)} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icons.Trash size={14} stroke="#374151"/>
                  </Pressable>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#111', minWidth: 22, textAlign: 'center' }}>
                    {it.quantity}
                  </span>
                  <Pressable onClick={() => updateQuantity(it._id, it.quantity + 1)} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icons.Plus size={16} stroke="#374151" sw={2}/>
                  </Pressable>
                </div>
              </div>
              {/* Price */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--qb-primary)' }}>
                  {PKR(lineDiscounted)}
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF', textDecoration: 'line-through', marginTop: 2 }}>
                  {PKR(lineOriginal)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add more items */}
        <Pressable onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0', color: '#374151', fontSize: 14, fontWeight: 700 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
          <span>Add more items</span>
        </Pressable>
      </div>

      {/* ── Popular with your order ───────────────────────────── */}
      {suggestions.length > 0 && (
        <div style={{ borderTop: '8px solid #F5F5F5', paddingTop: 16 }}>
          <div style={{ padding: '0 16px', marginBottom: 4 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>Popular with your order</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>Other customers also bought these</div>
          </div>
          <div className="qb-no-scrollbar" style={{ display: 'flex', gap: 10, padding: '12px 16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {suggestions.map(item => (
              <div key={item.id} style={{ width: 170, flexShrink: 0 }}>
                <div style={{ height: 140, borderRadius: 12, background: '#F5F5F5', overflow: 'hidden', position: 'relative', marginBottom: 8 }}>
                  {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}
                  <Pressable onClick={() => addItem && addItem({ ...item, _id: item.id }, restaurantId, restaurantName)} style={{ position: 'absolute', bottom: 8, right: 8, width: 30, height: 30, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                    <Icons.Plus size={14} stroke="#111" sw={2.5}/>
                  </Pressable>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--qb-primary)', marginTop: 2 }}>
                  {PKR(Math.round(item.price * 0.9))}
                  <span style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', textDecoration: 'line-through', marginLeft: 5 }}>
                    {PKR(item.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Price breakdown ───────────────────────────────────── */}
      <div style={{ borderTop: '8px solid #F5F5F5', padding: '16px 16px 0' }}>
        <PriceRow label="Subtotal" value={PKR(subtotal)}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
          <span style={{ fontSize: 14, color: '#374151' }}>Standard delivery</span>
          <span style={{ fontSize: 14, color: '#374151' }}>
            <span style={{ textDecoration: 'line-through', color: '#9CA3AF', marginRight: 6 }}>Rs. 79</span>
            <span style={{ fontWeight: 700, color: 'var(--qb-primary)' }}>Free</span>
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: -4, marginBottom: 8 }}>
          You've got free delivery for your first order 🏷️
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, color: '#374151' }}>
            QuickBite Fee
            <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 5px', borderRadius: 4, background: '#10b981', color: '#fff' }}>FREE</span>
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#10b981' }}>Rs. 0</span>
        </div>
        <PriceRow label={`Tax (5%)`} value={PKR(tax)}/>
      </div>

      {/* ── Apply voucher ─────────────────────────────────────── */}
      <div style={{ margin: '12px 16px', padding: '14px', borderRadius: 12, border: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20 }}>🎟️</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Apply a voucher</span>
        <Icons.ChevronR size={16} stroke="#9CA3AF" style={{ marginLeft: 'auto' }}/>
      </div>

      {/* ── Cutlery toggle ────────────────────────────────────── */}
      <div style={{ margin: '0 16px 14px', padding: '14px', borderRadius: 12, border: '1px solid #F0F0F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🍴</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Cutlery</span>
          </div>
          {/* Toggle */}
          <Pressable onClick={() => setCutlery(v => !v)} style={{
            width: 48, height: 26, borderRadius: 13,
            background: cutlery ? 'var(--qb-primary)' : '#D1D5DB',
            position: 'relative', transition: 'background 0.2s',
          }}>
            <motion.div
              animate={{ x: cutlery ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{ position: 'absolute', top: 2, width: 22, height: 22, borderRadius: 999, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
            />
          </Pressable>
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
          {cutlery ? 'Cutlery included.' : 'No cutlery provided. Thanks for reducing waste!'}
        </div>
      </div>

      {/* ── Total summary ─────────────────────────────────────── */}
      <div style={{ margin: '0 16px 16px', padding: '14px', borderRadius: 12, border: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>Total <span style={{ fontWeight: 400, fontSize: 12, color: '#6b7280' }}>(incl. fees and tax)</span></div>
          <Pressable style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginTop: 2, textDecoration: 'underline' }}>
            See summary
          </Pressable>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--qb-primary)' }}>{PKR(discountedTotal)}</div>
          <div style={{ fontSize: 12, color: '#9CA3AF', textDecoration: 'line-through', marginTop: 2 }}>{PKR(total)}</div>
        </div>
      </div>

      {/* ── Fixed CTA ────────────────────────────────────────── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px 28px', background: '#fff', borderTop: '1px solid #F0F0F0' }}>
        <motion.div whileTap={{ scale: 0.98 }}>
          <Pressable onClick={handlePlace} style={{
            width: '100%', height: 52, borderRadius: 26,
            background: placing ? '#ccc' : 'var(--qb-primary)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700,
            boxShadow: '0 6px 20px rgba(229,57,53,0.3)',
          }}>
            {placing ? 'Placing order…' : 'Confirm payment and address'}
          </Pressable>
        </motion.div>
      </div>

    </div>
  );
}

function CartHeader({ onBack, subtitle }) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 30, background: '#fff', padding: '52px 16px 12px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 12 }}>
      <Pressable onClick={onBack} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#111', fontWeight: 300 }}>
        ×
      </Pressable>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#111', letterSpacing: -0.3 }}>Cart</div>
        {subtitle && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

function PriceRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
      <span style={{ fontSize: 14, color: '#374151' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{value}</span>
    </div>
  );
}
