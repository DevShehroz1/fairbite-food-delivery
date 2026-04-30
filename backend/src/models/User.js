const supabase = require('../config/supabase');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const fmt = (row) => row ? { ...row, _id: row.id } : null;

exports.findByEmail = async (email, includePassword = false) => {
  const cols = includePassword ? '*' : 'id,name,email,role,phone,avatar,is_active,created_at';
  const { data } = await supabase.from('users').select(cols).eq('email', email.toLowerCase()).single();
  return fmt(data);
};

exports.findById = async (id) => {
  const { data } = await supabase.from('users').select('id,name,email,role,phone,avatar,is_active').eq('id', id).single();
  return fmt(data);
};

exports.create = async ({ name, email, password, role, phone }) => {
  const hashed = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from('users').insert({
    name,
    email: email.toLowerCase(),
    password: hashed,
    role: role || 'customer',
    phone,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E53935&color=fff&bold=true`,
  }).select().single();
  if (error) throw new Error(error.message);
  return fmt(data);
};

exports.update = async (id, fields) => {
  const { data, error } = await supabase.from('users').update({ ...fields, updated_at: new Date() }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return fmt(data);
};

exports.matchPassword = async (entered, hashed) => bcrypt.compare(entered, hashed);

exports.generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
