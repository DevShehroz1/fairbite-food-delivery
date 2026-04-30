const supabase = require('../config/supabase');

const JOINS = `*, customer:users!customer_id(id,name), restaurant:restaurants!restaurant_id(id,name)`;

const fmt = (row) => row ? {
  ...row,
  _id: row.id,
  customer: row.customer ? { ...row.customer, _id: row.customer.id } : row.customer_id,
  restaurant: row.restaurant ? { ...row.restaurant, _id: row.restaurant.id } : row.restaurant_id,
  order: row.order_id,
} : null;

exports.create = async ({ order_id, customer_id, restaurant_id, rating, comment, images }) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert({ order_id, customer_id, restaurant_id, rating, comment, images: images || [] })
    .select(JOINS)
    .single();
  if (error) throw new Error(error.message);
  return fmt(data);
};

exports.findByOrder = async (orderId) => {
  const { data } = await supabase.from('reviews').select('id').eq('order_id', orderId).maybeSingle();
  return data;
};

exports.findByRestaurant = async (restaurantId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(JOINS)
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(fmt);
};

exports.findById = async (id) => {
  const { data } = await supabase.from('reviews').select(JOINS).eq('id', id).maybeSingle();
  return fmt(data);
};

exports.update = async (id, fields) => {
  const { data, error } = await supabase.from('reviews').update(fields).eq('id', id).select(JOINS).single();
  if (error) throw new Error(error.message);
  return fmt(data);
};

exports.avgForRestaurant = async (restaurantId) => {
  const { data } = await supabase
    .from('reviews')
    .select('rating')
    .eq('restaurant_id', restaurantId);
  if (!data || data.length === 0) return { avg: 0, count: 0 };
  const avg = data.reduce((sum, r) => sum + (r.rating?.overall || 0), 0) / data.length;
  return { avg: Math.round(avg * 10) / 10, count: data.length };
};
