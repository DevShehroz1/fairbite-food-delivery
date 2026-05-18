const supabase = require('../config/supabase');

const fmt = (row) => row ? {
  ...row,
  _id: row.id,
  sender: row.sender ? { ...row.sender, _id: row.sender.id } : row.sender_id,
} : null;

const JOINS = `*, sender:users!sender_id(id,name,role)`;

exports.listForOrder = async (orderId) => {
  const { data, error } = await supabase
    .from('messages')
    .select(JOINS)
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map(fmt);
};

exports.create = async ({ orderId, senderId, senderRole, text }) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      order_id:    orderId,
      sender_id:   senderId,
      sender_role: senderRole,
      text:        text.trim().slice(0, 2000),
    })
    .select(JOINS)
    .single();
  if (error) throw new Error(error.message);
  return fmt(data);
};
