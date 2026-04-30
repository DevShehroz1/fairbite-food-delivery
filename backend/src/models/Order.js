const supabase = require('../config/supabase');

const genOrderNumber = () => {
  const d = new Date();
  const r = Math.floor(1000 + Math.random() * 9000);
  return `FB${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${r}`;
};

const fmt = (row) => {
  if (!row) return null;
  return {
    ...row,
    _id:            row.id,
    orderNumber:    row.order_number,
    deliveryAddress:row.delivery_address,
    statusHistory:  row.status_history || [],
    customer: row.customer ? { ...row.customer, _id: row.customer.id } : row.customer_id,
    restaurant: row.restaurant ? { ...row.restaurant, _id: row.restaurant.id } : row.restaurant_id,
    rider: row.rider ? { ...row.rider, _id: row.rider.id } : row.rider_id,
  };
};

const JOINS = `
  *,
  customer:users!customer_id(id,name,email,phone),
  restaurant:restaurants(id,name,address,contact,images),
  rider:users!rider_id(id,name,phone)
`;

exports.create = async (fields) => {
  const { deliveryAddress, statusHistory, ...rest } = fields;
  const { data, error } = await supabase.from('orders').insert({
    ...rest,
    order_number:     genOrderNumber(),
    delivery_address: deliveryAddress || rest.delivery_address,
    status_history:   statusHistory || rest.status_history || [{ status: 'pending', note: 'Order placed', time: new Date() }],
  }).select(JOINS).single();
  if (error) throw new Error(error.message);
  return fmt(data);
};

exports.findById = async (id) => {
  const { data, error } = await supabase.from('orders').select(JOINS).eq('id', id).single();
  if (error || !data) return null;
  return fmt(data);
};

exports.findByUser = async ({ role, userId, restaurantId }) => {
  let q = supabase.from('orders').select(JOINS);
  if (role === 'customer')   q = q.eq('customer_id', userId);
  else if (role === 'rider') q = q.eq('rider_id', userId);
  else if (restaurantId)     q = q.eq('restaurant_id', restaurantId);
  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(fmt);
};

exports.updateStatus = async (id, status, note) => {
  const { data: current } = await supabase.from('orders').select('status_history').eq('id', id).single();
  const history = [...(current?.status_history || []), { status, note, time: new Date() }];
  const { data, error } = await supabase.from('orders').update({
    status,
    status_history: history,
    updated_at: new Date(),
  }).eq('id', id).select(JOINS).single();
  if (error) throw new Error(error.message);
  return fmt(data);
};

exports.acceptOrder = async (id, riderId) => {
  const { data: current } = await supabase.from('orders').select('status_history,rider_id').eq('id', id).single();
  if (current?.rider_id) throw new Error('Order already taken');
  const history = [...(current?.status_history || []), { status: 'picked-up', note: 'Rider accepted', time: new Date() }];
  const { data, error } = await supabase.from('orders').update({
    rider_id:       riderId,
    status:         'picked-up',
    status_history: history,
    updated_at:     new Date(),
  }).eq('id', id).select(JOINS).single();
  if (error) throw new Error(error.message);
  return fmt(data);
};
