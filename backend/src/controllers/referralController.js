const User = require('../models/User');
const supabase = require('../config/supabase');

const REFERRAL_REWARDS = {
  referrer: { type: 'flat', value: 500, minOrder: 1000, label: 'Rs. 500 off (friend joined!)' },
  referee:  { type: 'flat', value: 250, minOrder: 500,  label: 'Rs. 250 off your first order (welcome!)' },
};

const makeCoupon = (template, source) => ({
  id:          `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  code:        `${source.toUpperCase()}${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
  type:        template.type,
  value:       template.value,
  minOrder:    template.minOrder || 0,
  maxDiscount: template.maxDiscount || null,
  label:       template.label,
  source,
  redeemed:    false,
  redeemed_at: null,
  created_at:  new Date().toISOString(),
});

exports.getMyReferralInfo = async (req, res, next) => {
  try {
    const me = await User.findById(req.user.id);
    if (!me) return res.status(404).json({ success: false, message: 'User not found' });

    const referees = await User.findReferees(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        code: me.referralCode,
        shareUrl: `${process.env.CLIENT_URL || 'https://quickbite.app'}/register?ref=${me.referralCode}`,
        referees: referees.map(r => ({ id: r.id, name: r.name, joined: r.created_at })),
        count: referees.length,
        rewardSummary: {
          youGet: REFERRAL_REWARDS.referrer.label,
          friendGets: REFERRAL_REWARDS.referee.label,
        },
      },
    });
  } catch (err) { next(err); }
};

// Called from order controller when a referred user's first order is delivered.
// Issues coupons to both parties. Safe to call multiple times — checks for prior issuance.
exports.creditReferralOnFirstOrder = async ({ refereeId }) => {
  if (!refereeId) return;
  const referee = await User.findById(refereeId);
  if (!referee?.referredBy) return;

  const already = (referee.rewards || []).some(r => r.source === 'referee');
  if (already) return;

  const refereeCoupon = makeCoupon(REFERRAL_REWARDS.referee, 'referee');
  const referrerCoupon = makeCoupon(REFERRAL_REWARDS.referrer, 'referrer');

  await User.addReward(refereeId, refereeCoupon);
  await User.addReward(referee.referredBy, referrerCoupon);
};

exports._test = { REFERRAL_REWARDS, makeCoupon };
