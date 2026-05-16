const User = require('../models/User');
const supabase = require('../config/supabase');

// Public promo codes — anyone can claim these once.
const PUBLIC_COUPONS = {
  QUICKBITE50: { type: 'percent',       value: 50,  minOrder: 500, maxDiscount: 300, label: '50% off first order',     source: 'welcome' },
  WEEKEND30:   { type: 'percent',       value: 30,  minOrder: 400, maxDiscount: 200, label: '30% off weekend orders',  source: 'public' },
  SAVE100:     { type: 'flat',          value: 100, minOrder: 800, label: 'Rs. 100 off orders above Rs. 800',          source: 'public' },
  FREEBITE:    { type: 'free_delivery', value: 0,   minOrder: 0,   label: 'Free delivery on next order',               source: 'public' },
};

// Auto-grant rules — triggered when an order is delivered.
const MILESTONE_RULES = [
  { test: (count) => count === 1, coupon: { type: 'percent',       value: 25, minOrder: 300, maxDiscount: 150, label: '25% off your next order',  source: 'welcome' } },
  { test: (count) => count === 5, coupon: { type: 'flat',          value: 150, minOrder: 600,                  label: '5-order streak — Rs. 150', source: 'milestone' } },
  { test: (count) => count === 10, coupon:{ type: 'percent',       value: 40, minOrder: 500, maxDiscount: 400, label: '10 orders! 40% off',       source: 'milestone' } },
  { test: (count) => count > 0 && count % 20 === 0, coupon: { type: 'free_delivery', value: 0, minOrder: 0,    label: 'Free delivery — loyal customer', source: 'milestone' } },
];

const makeCoupon = (template) => ({
  id:          `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  code:        `${(template.source || 'CPN').toUpperCase()}${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
  type:        template.type,
  value:       template.value,
  minOrder:    template.minOrder || 0,
  maxDiscount: template.maxDiscount || null,
  label:       template.label,
  source:      template.source || 'manual',
  redeemed:    false,
  redeemed_at: null,
  created_at:  new Date().toISOString(),
});

const computeDiscount = (coupon, subtotal, deliveryFee = 0) => {
  if (!coupon) return 0;
  if (subtotal < (coupon.minOrder || 0)) return 0;
  if (coupon.type === 'percent') {
    const raw = Math.round((subtotal * coupon.value) / 100);
    return coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
  }
  if (coupon.type === 'flat') return Math.min(coupon.value, subtotal);
  if (coupon.type === 'free_delivery') return deliveryFee;
  return 0;
};

exports.getMyCoupons = async (req, res, next) => {
  try {
    const me = await User.findById(req.user.id);
    const rewards = me?.rewards || [];
    const available = rewards.filter(r => !r.redeemed);
    const used = rewards.filter(r => r.redeemed);
    res.status(200).json({
      success: true,
      data: {
        available,
        used,
        publicCodes: Object.entries(PUBLIC_COUPONS).map(([code, c]) => ({ code, ...c })),
      },
    });
  } catch (err) { next(err); }
};

exports.validateCoupon = async (req, res, next) => {
  try {
    const code = String(req.query.code || req.body?.code || '').toUpperCase();
    const subtotal    = Number(req.query.subtotal || req.body?.subtotal || 0);
    const deliveryFee = Number(req.query.deliveryFee || req.body?.deliveryFee || 0);

    if (!code) return res.status(400).json({ success: false, message: 'No code provided' });

    const me = await User.findById(req.user.id);
    const own = (me?.rewards || []).find(r => r.code === code && !r.redeemed);
    const alreadyUsed = (me?.rewards || []).some(r => r.code === code && r.redeemed);
    const publicTpl = PUBLIC_COUPONS[code];

    if (alreadyUsed && !own) {
      return res.status(400).json({ success: false, message: 'This code has already been used' });
    }

    const coupon = own || (publicTpl ? { code, ...publicTpl } : null);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or already used code' });
    }
    if (subtotal < (coupon.minOrder || 0)) {
      return res.status(400).json({
        success: false,
        message: `Add Rs. ${coupon.minOrder - subtotal} more to use this code (min Rs. ${coupon.minOrder})`,
      });
    }

    const discount = computeDiscount(coupon, subtotal, deliveryFee);
    res.status(200).json({
      success: true,
      data: { code: coupon.code, label: coupon.label, type: coupon.type, value: coupon.value, discount, isPublic: !own },
    });
  } catch (err) { next(err); }
};

// Mark a coupon redeemed on the user's rewards array. If it was a public code
// not yet on the user, add it as redeemed (audit trail).
exports.redeemCoupon = async ({ userId, code }) => {
  if (!userId || !code) return null;
  const upper = code.toUpperCase();
  const { data: row } = await supabase.from('users').select('rewards').eq('id', userId).single();
  const rewards = row?.rewards || [];

  const idx = rewards.findIndex(r => r.code === upper && !r.redeemed);
  if (idx >= 0) {
    rewards[idx] = { ...rewards[idx], redeemed: true, redeemed_at: new Date().toISOString() };
  } else if (PUBLIC_COUPONS[upper]) {
    rewards.push({
      ...makeCoupon({ ...PUBLIC_COUPONS[upper], source: PUBLIC_COUPONS[upper].source || 'public' }),
      code: upper,
      redeemed: true,
      redeemed_at: new Date().toISOString(),
    });
  } else {
    return null;
  }

  await supabase.from('users').update({ rewards, updated_at: new Date() }).eq('id', userId);
  return rewards[idx >= 0 ? idx : rewards.length - 1];
};

// Auto-grant milestone coupons on order delivery.
exports.grantMilestoneOnDelivery = async ({ userId, deliveredCount }) => {
  if (!userId) return;
  const rule = MILESTONE_RULES.find(r => r.test(deliveredCount));
  if (!rule) return;
  const coupon = makeCoupon(rule.coupon);
  await User.addReward(userId, coupon);
};

// Compute coupon effect given a code + cart context. Used by order create.
exports.applyCouponToOrder = async ({ userId, code, subtotal, deliveryFee }) => {
  if (!code) return { discount: 0, coupon: null };
  const upper = code.toUpperCase();
  const me = await User.findById(userId);
  const own = (me?.rewards || []).find(r => r.code === upper && !r.redeemed);
  const alreadyUsed = (me?.rewards || []).some(r => r.code === upper && r.redeemed);
  const publicTpl = PUBLIC_COUPONS[upper];

  if (alreadyUsed && !own) throw new Error('This code has already been used');
  const coupon = own || (publicTpl ? { code: upper, ...publicTpl } : null);
  if (!coupon) throw new Error('Invalid or already used coupon code');
  if (subtotal < (coupon.minOrder || 0)) {
    throw new Error(`Minimum order for this coupon is Rs. ${coupon.minOrder}`);
  }
  return { discount: computeDiscount(coupon, subtotal, deliveryFee), coupon };
};

exports._internals = { PUBLIC_COUPONS, MILESTONE_RULES, computeDiscount, makeCoupon };
