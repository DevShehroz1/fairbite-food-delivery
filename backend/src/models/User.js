const supabase = require('../config/supabase');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

// Select * so we still work if the referral migration hasn't run yet —
// Supabase just omits the missing columns.
const PUBLIC_COLS = '*';

const fmt = (row) => {
  if (!row) return null;
  const { password, otp_hash, ...safe } = row;
  return {
    ...safe,
    _id: row.id,
    referralCode:  row.referral_code,
    referredBy:    row.referred_by,
    phoneVerified: Boolean(row.phone_verified),
  };
};

const randomCode = (len = 8) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
};

exports.generateUniqueReferralCode = async () => {
  for (let i = 0; i < 6; i++) {
    const code = randomCode(8);
    const { data } = await supabase.from('users').select('id').eq('referral_code', code).maybeSingle();
    if (!data) return code;
  }
  throw new Error('Could not generate a unique referral code');
};

exports.findByReferralCode = async (code) => {
  if (!code) return null;
  const { data } = await supabase.from('users').select('id,name,referral_code')
    .eq('referral_code', code.toUpperCase()).maybeSingle();
  return fmt(data);
};

exports.findByEmail = async (email, includePassword = false) => {
  const cols = includePassword ? '*' : PUBLIC_COLS;
  const { data } = await supabase.from('users').select(cols).eq('email', email.toLowerCase()).single();
  return fmt(data);
};

exports.findById = async (id) => {
  const { data } = await supabase.from('users').select(PUBLIC_COLS).eq('id', id).single();
  return fmt(data);
};

exports.create = async ({ name, email, password, role, phone, referredBy }) => {
  const hashed = await bcrypt.hash(password, 10);
  const referral_code = await exports.generateUniqueReferralCode();
  const { data, error } = await supabase.from('users').insert({
    name,
    email: email.toLowerCase(),
    password: hashed,
    role: role || 'customer',
    phone,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E53935&color=fff&bold=true`,
    referral_code,
    referred_by: referredBy || null,
    rewards: [],
  }).select().single();
  if (error) throw new Error(error.message);
  return fmt(data);
};

exports.createGoogleUser = async ({ name, email, avatar, googleId, role, referredBy }) => {
  const referral_code = await exports.generateUniqueReferralCode();
  const { data, error } = await supabase.from('users').insert({
    name,
    email: email.toLowerCase(),
    password: `google_${googleId}`,
    role: role || 'customer',
    avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E53935&color=fff&bold=true`,
    google_id: googleId,
    referral_code,
    referred_by: referredBy || null,
    rewards: [],
  }).select().single();
  if (error) throw new Error(error.message);
  return fmt(data);
};

exports.update = async (id, fields) => {
  const { data, error } = await supabase.from('users').update({ ...fields, updated_at: new Date() }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return fmt(data);
};

exports.addReward = async (id, reward) => {
  const { data: row } = await supabase.from('users').select('rewards').eq('id', id).single();
  const rewards = [...(row?.rewards || []), reward];
  const { data, error } = await supabase.from('users').update({ rewards, updated_at: new Date() }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return fmt(data);
};

exports.findReferees = async (referrerId) => {
  const { data } = await supabase.from('users').select('id,name,email,avatar,created_at')
    .eq('referred_by', referrerId).order('created_at', { ascending: false });
  return (data || []).map(fmt);
};

exports.matchPassword = async (entered, hashed) => bcrypt.compare(entered, hashed);

exports.generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
