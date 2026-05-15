const supabase = require('../config/supabase');

const fmt = (row) => {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    owner: row.owner ? { ...row.owner, _id: row.owner.id } : row.owner_id,
  };
};

exports.findAll = async ({ city, cuisine, minRating } = {}) => {
  let q = supabase
    .from('restaurants')
    .select('id,name,description,cuisine,address,images,rating,pricing,delivery,status,owner_id')
    .eq('status->>isActive', 'true');

  if (city)      q = q.ilike('address->>city', `%${city}%`);
  if (cuisine)   q = q.contains('cuisine', [cuisine]);
  if (minRating) q = q.gte('rating->>average', parseFloat(minRating));

  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(fmt);
};

exports.findById = async (id) => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*, owner:users!owner_id(id,name,email,phone)')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return fmt(data);
};

exports.findByOwner = async (ownerId) => {
  // An owner may have multiple historical rows (deactivated stragglers from
  // prior seeds). Prefer an active one; fall back to whatever exists.
  const { data: rows } = await supabase.from('restaurants').select('*').eq('owner_id', ownerId);
  if (!rows || rows.length === 0) return null;
  const active = rows.find(r => r.status?.isActive !== false);
  return fmt(active || rows[0]);
};

exports.create = async (fields) => {
  const { data, error } = await supabase.from('restaurants').insert(fields).select().single();
  if (error) throw new Error(error.message);
  return fmt(data);
};

exports.update = async (id, fields) => {
  const { data, error } = await supabase.from('restaurants').update({ ...fields, updated_at: new Date() }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return fmt(data);
};

exports.incrementViews = async (id, currentStats) => {
  const stats = { ...(currentStats || {}), views: ((currentStats || {}).views || 0) + 1 };
  await supabase.from('restaurants').update({ stats }).eq('id', id);
};

exports.deleteById = async (id) => {
  const { error } = await supabase.from('restaurants').delete().eq('id', id);
  if (error) throw new Error(error.message);
};
