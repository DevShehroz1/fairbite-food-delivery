const supabase = require('../config/supabase');

// All endpoints in this file are mounted behind `protect` + `authorize('admin')`,
// so we can read the full user table including sensitive-ish fields like
// referral linkage. We never return the password column.

const stripPassword = (row) => {
  if (!row) return row;
  const { password, ...safe } = row;
  return safe;
};

exports.getOverview = async (req, res, next) => {
  try {
    const [usersRes, restosRes, ordersRes] = await Promise.all([
      supabase.from('users').select('role', { count: 'exact' }),
      supabase.from('restaurants').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id,status,pricing,created_at'),
    ]);

    if (usersRes.error)  throw new Error(usersRes.error.message);
    if (restosRes.error) throw new Error(restosRes.error.message);
    if (ordersRes.error) throw new Error(ordersRes.error.message);

    const roleCounts = { customer: 0, restaurant: 0, rider: 0, admin: 0 };
    (usersRes.data || []).forEach(u => { if (roleCounts[u.role] !== undefined) roleCounts[u.role]++; });

    const orders = ordersRes.data || [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const ordersToday = orders.filter(o => new Date(o.created_at) >= today).length;
    const delivered  = orders.filter(o => o.status === 'delivered');
    const revenue    = delivered.reduce((s, o) => s + Number(o?.pricing?.total || 0), 0);

    // 7-day daily series (oldest → newest). Buckets are local-day boundaries.
    const series = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const inBucket = orders.filter(o => {
        const t = new Date(o.created_at);
        return t >= d && t < next;
      });
      const dayRevenue = inBucket
        .filter(o => o.status === 'delivered')
        .reduce((s, o) => s + Number(o?.pricing?.total || 0), 0);
      series.push({
        date:    d.toISOString().slice(0, 10),
        label:   d.toLocaleDateString('en-US', { weekday: 'short' }),
        orders:  inBucket.length,
        revenue: dayRevenue,
      });
    }

    res.json({
      success: true,
      data: {
        users:        roleCounts,
        userTotal:    Object.values(roleCounts).reduce((a, b) => a + b, 0),
        restaurants:  restosRes.count || 0,
        orders: {
          total:     orders.length,
          today:     ordersToday,
          delivered: delivered.length,
          revenue,
        },
        series,
      },
    });
  } catch (err) { next(err); }
};

exports.getCustomers = async (req, res, next) => {
  try {
    const { data: users, error } = await supabase
      .from('users').select('*').eq('role', 'customer')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    const { data: orders } = await supabase
      .from('orders').select('id,customer_id,status,pricing');

    const byCustomer = {};
    (orders || []).forEach(o => {
      const k = o.customer_id;
      if (!k) return;
      if (!byCustomer[k]) byCustomer[k] = { total: 0, delivered: 0, spent: 0 };
      byCustomer[k].total++;
      if (o.status === 'delivered') {
        byCustomer[k].delivered++;
        byCustomer[k].spent += Number(o?.pricing?.total || 0);
      }
    });

    const data = (users || []).map(u => {
      const stats = byCustomer[u.id] || { total: 0, delivered: 0, spent: 0 };
      return {
        ...stripPassword(u),
        _id: u.id,
        referralCode: u.referral_code,
        referredBy:   u.referred_by,
        rewardsCount: Array.isArray(u.rewards) ? u.rewards.length : 0,
        stats,
      };
    });

    res.json({ success: true, count: data.length, data });
  } catch (err) { next(err); }
};

exports.getRestaurants = async (req, res, next) => {
  try {
    const { data: restos, error } = await supabase
      .from('restaurants')
      .select('*, owner:users!owner_id(id,name,email,phone)')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    const { data: orders } = await supabase
      .from('orders').select('restaurant_id,status,pricing');

    const byResto = {};
    (orders || []).forEach(o => {
      const k = o.restaurant_id;
      if (!k) return;
      if (!byResto[k]) byResto[k] = { total: 0, delivered: 0, revenue: 0 };
      byResto[k].total++;
      if (o.status === 'delivered') {
        byResto[k].delivered++;
        byResto[k].revenue += Number(o?.pricing?.subtotal || 0);
      }
    });

    const data = (restos || []).map(r => ({
      _id:      r.id,
      id:       r.id,
      name:     r.name,
      cuisine:  r.cuisine,
      address:  r.address,
      contact:  r.contact,
      images:   r.images,
      rating:   r.rating,
      status:   r.status,
      pricing:  r.pricing,
      menuCount: Array.isArray(r.menu) ? r.menu.length : 0,
      owner:    r.owner ? { _id: r.owner.id, ...r.owner } : null,
      stats:    byResto[r.id] || { total: 0, delivered: 0, revenue: 0 },
      createdAt: r.created_at,
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) { next(err); }
};

exports.getRiders = async (req, res, next) => {
  try {
    const { data: riders, error } = await supabase
      .from('users').select('*').eq('role', 'rider')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    const { data: orders } = await supabase
      .from('orders').select('id,rider_id,status,pricing,created_at,order_number');

    const byRider = {};
    (orders || []).forEach(o => {
      const k = o.rider_id;
      if (!k) return;
      if (!byRider[k]) byRider[k] = { assigned: 0, delivered: 0, earnings: 0, active: null };
      byRider[k].assigned++;
      if (o.status === 'delivered') {
        byRider[k].delivered++;
        byRider[k].earnings += Number(o?.pricing?.deliveryFee || 0);
      } else if (['ready', 'picked-up', 'on-the-way'].includes(o.status)) {
        // Pick the most-recent active order
        if (!byRider[k].active || new Date(o.created_at) > new Date(byRider[k].active.created_at)) {
          byRider[k].active = { id: o.id, order_number: o.order_number, status: o.status, created_at: o.created_at };
        }
      }
    });

    const data = (riders || []).map(u => ({
      ...stripPassword(u),
      _id: u.id,
      referralCode: u.referral_code,
      stats: byRider[u.id] || { assigned: 0, delivered: 0, earnings: 0, active: null },
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) { next(err); }
};
