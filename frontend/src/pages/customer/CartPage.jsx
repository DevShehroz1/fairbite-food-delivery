import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import useCart from '../../hooks/useCart';
import api from '../../services/api';
import { Icons, PKR, Pressable, SmartImg, Stepper, BrandButton } from '../../components/ui';

export default function CartPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const { items, restaurantId, restaurantName, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [pay, setPay]         = useState('cash');
  const [placing, setPlacing] = useState(false);

  const delivery     = items.length ? 49 : 0;
  const fairFee      = 0;
  const competitorFee = items.length ? 80 : 0;
  const tax          = Math.round(subtotal * 0.05);
  const total        = subtotal + delivery + fairFee + tax;
  const savings      = competitorFee + Math.round(subtotal * 0.07);

  const handlePlace = async () => {
    if (!items.length) return;
    if (!user) { navigate('/'); return; }
    setPlacing(true);
    try {
      const orderItems = items.map(i => ({
        menuItemId: i._id || i.id,
        quantity:   i.quantity,
      }));
      const { data } = await api.post('/orders', {
        restaurantId,
        items: orderItems,
        deliveryAddress: {
          street: 'Flat 4B, Sea Breeze Plaza',
          city:   'Karachi',
          state:  'Sindh',
          zipCode: '75600',
        },
        payment: { method: pay, status: 'pending' },
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
        <CartHeader onBack={() => navigate(-1)}/>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30, textAlign: 'center' }}>
          <div style={{ width: 88, height: 88, borderRadius: 999, background: '#F5F5F5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Icons.Cart size={36} stroke="#9CA3AF"/>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>Your cart is empty</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6, maxWidth: 240 }}>
            Browse restaurants and add items — checkout is fast and fair.
          </div>
          <Pressable onClick={() => navigate('/restaurants')} style={{
            marginTop: 20, padding: '12px 28px', borderRadius: 16,
            background: 'var(--fb-primary)', color: '#fff',
            fontSize: 14, fontWeight: 700,
          }}>Browse Restaurants</Pressable>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', paddingBottom: 110 }}>
      <CartHeader onBack={() => navigate(-1)} subtitle={restaurantName}/>

      {/* items */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence>
          {items.map(it => (
            <SwipeRow key={it._id} onDelete={() => removeItem(it._id)}>
              <div style={{ display: 'flex', gap: 12, padding: 12, background: '#fff',
                border: '1px solid #F0F0F0', borderRadius: 16 }}>
                {it.image && <SmartImg src={it.image} radius={12} style={{ width: 64, height: 64, flexShrink: 0 }}/>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>No special requests</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{PKR(it.price * it.quantity)}</div>
                    <Stepper value={it.quantity}
                      onChange={(v) => v === 0 ? removeItem(it._id) : updateQuantity(it._id, v)}
                      min={0}/>
                  </div>
                </div>
              </div>
            </SwipeRow>
          ))}
        </AnimatePresence>
      </div>

      {/* delivery address */}
      <div style={{ padding: '8px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280',
          textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Delivery to</div>
        <div style={{
          width: '100%', display: 'flex', gap: 12, alignItems: 'center',
          padding: '12px 14px', borderRadius: 14, border: '1px solid #F0F0F0',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(229,57,53,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Home size={18} stroke="var(--fb-primary)" sw={2.5}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Home</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
              Flat 4B, Sea Breeze Plaza, Clifton, Karachi
            </div>
          </div>
          <Icons.ChevronR size={18} stroke="#9CA3AF"/>
        </div>
      </div>

      {/* payment */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280',
          textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Payment</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { id: 'cash',   label: 'Cash',   Icon: Icons.Cash },
            { id: 'card',   label: 'Card',   Icon: Icons.Card },
            { id: 'wallet', label: 'Wallet', Icon: Icons.Wallet },
          ].map(p => {
            const a = pay === p.id;
            return (
              <Pressable key={p.id} onClick={() => setPay(p.id)} style={{
                padding: '12px 8px', borderRadius: 14,
                background: a ? 'rgba(229,57,53,0.06)' : '#fff',
                border: a ? '1.5px solid var(--fb-primary)' : '1px solid #F0F0F0',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                color: a ? 'var(--fb-primary)' : '#374151',
              }}>
                <p.Icon size={20} sw={2}/>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{p.label}</span>
              </Pressable>
            );
          })}
        </div>
      </div>

      {/* price breakdown */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ background: '#F8F8F8', borderRadius: 16, padding: 14,
          display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
          <BreakRow label="Subtotal"     value={PKR(subtotal)}/>
          <BreakRow label="Delivery fee" value={PKR(delivery)}/>
          <BreakRow label={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              FairBite fee
              <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 5,
                background: '#10b981', color: '#fff', letterSpacing: 0.3 }}>FREE</span>
            </span>
          } value={<span style={{ color: '#10b981', fontWeight: 800 }}>Rs. 0</span>}/>
          <BreakRow label="Tax (5%)" value={PKR(tax)}/>
          <div style={{ height: 1, background: '#E5E5E5', margin: '4px 0' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>{PKR(total)}</span>
          </div>
        </div>

        {/* savings callout */}
        {savings > 0 && (
          <div style={{
            marginTop: 10, padding: '10px 12px', borderRadius: 12,
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: '#10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.Tag size={14} stroke="#fff" sw={2.5}/>
            </div>
            <div style={{ flex: 1, fontSize: 12, color: '#065F46' }}>
              You're saving <b>{PKR(savings)}</b> vs FoodPanda on this order
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12,
          fontSize: 11, color: '#6b7280' }}>
          <span>Secure payment</span>
          <span>·</span>
          <span>Free cancellation</span>
          <span>·</span>
          <span>Live tracking</span>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
        padding: '12px 16px 28px',
        background: 'linear-gradient(180deg, transparent, #fff 30%)',
      }}>
        <motion.div animate={{ scale: [1, 1.015, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <BrandButton onClick={handlePlace} disabled={placing}>
            {placing ? 'Placing order…' : `Place Order · ${PKR(total)}`}
          </BrandButton>
        </motion.div>
      </div>
    </div>
  );
}

function CartHeader({ onBack, subtitle }) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 30, background: '#fff',
      padding: '52px 16px 12px', borderBottom: '1px solid rgba(0,0,0,0.04)',
      display: 'flex', alignItems: 'center', gap: 10 }}>
      <Pressable onClick={onBack} style={{
        width: 38, height: 38, borderRadius: 12, background: '#F5F5F5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Icons.ChevronL size={20} stroke="#111" sw={2.5}/></Pressable>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#111', letterSpacing: -0.3 }}>Your Cart</div>
        {subtitle && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>from {subtitle}</div>}
      </div>
    </div>
  );
}

function BreakRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151' }}>
      <span>{label}</span>
      <span style={{ fontWeight: 600, color: '#111' }}>{value}</span>
    </div>
  );
}

function SwipeRow({ children, onDelete }) {
  const [removed, setRemoved] = useState(false);
  const handleEnd = (_, info) => {
    if (info.offset.x < -90) {
      setRemoved(true);
      setTimeout(onDelete, 180);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 1, height: 'auto' }}
      animate={removed ? { opacity: 0, height: 0, marginBottom: -10 } : { opacity: 1 }}
      transition={{ duration: 0.18 }}
      style={{ position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 16,
        background: 'var(--fb-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        paddingRight: 22, color: '#fff', fontWeight: 700, fontSize: 13, gap: 6,
      }}>
        <Icons.Trash size={16}/> Delete
      </div>
      <motion.div drag="x"
        style={{ position: 'relative', zIndex: 1, background: '#fff', borderRadius: 16 }}
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleEnd}>
        {children}
      </motion.div>
    </motion.div>
  );
}
