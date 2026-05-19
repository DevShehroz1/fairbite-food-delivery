import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Icons, PKR, Pressable } from '../../components/ui';

const useMatchMedia = (query) => {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(query);
    const h = (e) => setMatches(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [query]);
  return matches;
};

const ROLE_COLOR = {
  customer:   '#3b82f6',
  restaurant: '#f59e0b',
  rider:      '#10b981',
  admin:      '#ef4444',
};

const cardStyle = {
  background: '#F5F5F5',
  borderRadius: 5,
  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
  overflow: 'hidden',
};

const fmtDate = (s) => {
  if (!s) return '—';
  try { return new Date(s).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch (_) { return s; }
};

const Avatar = ({ name, src, color = '#6b7280', size = 40 }) => (
  src
    ? <img src={src} alt="" style={{ width: size, height: size, borderRadius: 5, objectFit: 'cover', flexShrink: 0 }}/>
    : <div style={{
        width: size, height: size, borderRadius: 5, flexShrink: 0,
        background: color + '22', color, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: size * 0.4,
      }}>
        {(name || '?').trim().charAt(0).toUpperCase()}
      </div>
);

const StatBlock = ({ value, label }) => (
  <div style={{ flex: 1, textAlign: 'center' }}>
    <div style={{ fontSize: 15, fontWeight: 800, color: '#111', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>{label}</div>
  </div>
);

const Divider = () => <div style={{ width: 1, background: '#E5E7EB' }}/>;

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isTabletAuto  = useMatchMedia('(min-width: 720px)');
  const isDesktopAuto = useMatchMedia('(min-width: 1024px)');
  // Manual view-mode override — 'auto' uses the screen width, 'desktop'
  // forces wide layout, 'mobile' forces the phone layout. Stored in
  // localStorage so the choice survives a reload.
  const [viewMode, setViewMode] = useState(() => {
    try { return localStorage.getItem('qb_admin_view') || 'auto'; }
    catch (_) { return 'auto'; }
  });
  useEffect(() => {
    try { localStorage.setItem('qb_admin_view', viewMode); } catch (_) {}
  }, [viewMode]);
  const isTablet  = viewMode === 'desktop' ? true  : viewMode === 'mobile' ? false : isTabletAuto;
  const isDesktop = viewMode === 'desktop' ? true  : viewMode === 'mobile' ? false : isDesktopAuto;

  const [tab, setTab] = useState('customers');
  const [overview, setOverview] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [ov, cu, re, ri] = await Promise.all([
          api.get('/admin/overview'),
          api.get('/admin/customers'),
          api.get('/admin/restaurants'),
          api.get('/admin/riders'),
        ]);
        if (cancelled) return;
        setOverview(ov.data.data);
        setCustomers(cu.data.data || []);
        setRestaurants(re.data.data || []);
        setRiders(ri.data.data || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load admin data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const matchesQuery = (str) => !query || (str || '').toLowerCase().includes(query.toLowerCase());

  const filteredCustomers   = customers.filter(c => matchesQuery(c.name) || matchesQuery(c.email) || matchesQuery(c.referralCode));
  const filteredRestaurants = restaurants.filter(r => matchesQuery(r.name) || matchesQuery(r.owner?.email) || matchesQuery(r.address?.city));
  const filteredRiders      = riders.filter(r => matchesQuery(r.name) || matchesQuery(r.email) || matchesQuery(r.phone));

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'inherit' }}>

      {/* ── Sticky header ───────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20, background: '#fff',
        borderBottom: '1px solid #F0F0F0',
        padding: isDesktop ? '18px 40px' : '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: isDesktop ? 24 : 20, fontWeight: 800, color: '#111', lineHeight: 1.2 }}>Admin Dashboard</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Welcome back, {user?.name || 'Admin'}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ViewModeToggle value={viewMode} onChange={setViewMode}/>
          <Pressable onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 5,
            background: '#fff1f1', color: '#ef4444',
            fontSize: 13, fontWeight: 600, border: '1px solid #fecaca',
          }}>
            <Icons.LogOut size={15} stroke="#ef4444"/>Logout
          </Pressable>
        </div>
      </div>

      <div style={{
        padding: isDesktop ? '28px 40px 60px' : '20px 16px 40px',
        maxWidth: isDesktop ? 1280 : 720,
        margin: '0 auto',
      }}>

        {/* ── Overview cards (real counts) ────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isTablet ? 'repeat(4, 1fr)' : '1fr 1fr',
          gap: 12, marginBottom: 16,
        }}>
          {[
            { Icon: Icons.User,    label: 'Total Users',    value: overview?.userTotal ?? '—',          accent: '#3b82f6' },
            { Icon: Icons.Truck,   label: 'Restaurants',     value: overview?.restaurants ?? '—',        accent: '#10b981' },
            { Icon: Icons.Receipt, label: 'Orders Today',    value: overview?.orders?.today ?? '—',      accent: '#f59e0b' },
            { Icon: Icons.Tag,     label: 'Delivered Revenue', value: overview ? PKR(overview.orders.revenue) : '—', accent: '#ef4444' },
          ].map(({ Icon, label, value, accent }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }} style={{ ...cardStyle, padding: '16px 14px' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 5, background: accent + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10, color: accent,
              }}>
                <Icon size={18} stroke={accent}/>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Role breakdown chip row ─────────────────────────── */}
        {overview?.users && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {Object.entries(overview.users).map(([role, count]) => (
              <div key={role} style={{
                background: ROLE_COLOR[role] + '14', color: ROLE_COLOR[role],
                padding: '6px 12px', borderRadius: 999,
                fontSize: 12, fontWeight: 700, display: 'flex', gap: 6, alignItems: 'center',
              }}>
                <span style={{ textTransform: 'capitalize' }}>{role}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab bar (Customers / Restaurants / Riders) ──────── */}
        <div style={{
          display: 'flex', gap: 6, background: '#F5F5F5', borderRadius: 5,
          padding: 4, marginBottom: 12,
        }}>
          {[
            { k: 'customers',   label: 'Customers',   n: customers.length },
            { k: 'restaurants', label: 'Restaurants', n: restaurants.length },
            { k: 'riders',      label: 'Riders',      n: riders.length },
          ].map(t => (
            <Pressable key={t.k} onClick={() => setTab(t.k)} style={{
              flex: 1, padding: '9px 0', borderRadius: 5, fontSize: 13, fontWeight: 700,
              background: tab === t.k ? '#fff' : 'transparent',
              color:      tab === t.k ? '#111' : '#6b7280',
              boxShadow:  tab === t.k ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              textAlign: 'center',
            }}>
              {t.label} <span style={{ opacity: 0.6, fontWeight: 600 }}>({t.n})</span>
            </Pressable>
          ))}
        </div>

        {/* ── Search ─────────────────────────────────────────── */}
        <div style={{
          marginBottom: 14, position: 'relative',
          background: '#F5F5F5', borderRadius: 5, padding: '10px 14px 10px 38px',
        }}>
          <Icons.Search size={16} stroke="#6b7280"
            {...{ style: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' } }}/>
          <input
            placeholder={`Search ${tab}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%', background: 'transparent', border: 0, outline: 0,
              fontSize: 13, color: '#111',
            }}/>
        </div>

        {loading && <SkeletonList isTablet={isTablet}/>}

        {!loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isTablet ? 'repeat(2, 1fr)' : '1fr',
            gap: 12,
          }}>
            {tab === 'customers' && (
              filteredCustomers.length === 0
                ? <EmptyState label={query ? 'No matches' : 'No customers yet'}/>
                : filteredCustomers.map(c => <CustomerCard key={c._id} c={c}/>)
            )}
            {tab === 'restaurants' && (
              filteredRestaurants.length === 0
                ? <EmptyState label={query ? 'No matches' : 'No restaurants yet'}/>
                : filteredRestaurants.map(r => <RestaurantCard key={r._id} r={r}/>)
            )}
            {tab === 'riders' && (
              filteredRiders.length === 0
                ? <EmptyState label={query ? 'No matches' : 'No riders yet'}/>
                : filteredRiders.map(r => <RiderCard key={r._id} r={r}/>)
            )}
          </div>
        )}

      </div>
    </div>
  );
}

function CustomerCard({ c }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }} style={{ ...cardStyle, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <Avatar name={c.name} src={c.avatar} color={ROLE_COLOR.customer}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{c.name || 'Unnamed'}</div>
          <div style={{ fontSize: 12, color: '#6b7280', wordBreak: 'break-all' }}>{c.email}</div>
          {c.phone && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{c.phone}</div>}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>Joined</div>
          <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{fmtDate(c.created_at)}</div>
        </div>
      </div>
      <div style={{
        display: 'flex', borderTop: '1px dashed #E5E7EB', paddingTop: 10,
      }}>
        <StatBlock value={c.stats.total} label="Orders"/>
        <Divider/>
        <StatBlock value={c.stats.delivered} label="Delivered"/>
        <Divider/>
        <StatBlock value={PKR(c.stats.spent)} label="Spent"/>
        <Divider/>
        <StatBlock value={c.rewardsCount} label="Rewards"/>
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {c.referralCode && (
          <Chip color="#6366f1" icon={<Icons.Tag size={11} stroke="#6366f1"/>}>
            Code: {c.referralCode}
          </Chip>
        )}
        {c.referredBy && (
          <Chip color="#10b981" icon={<Icons.Gift size={11} stroke="#10b981"/>}>
            Referred user
          </Chip>
        )}
      </div>
    </motion.div>
  );
}

function RestaurantCard({ r }) {
  const verified = r.status?.isVerified;
  const active   = r.status?.isActive !== false;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }} style={{ ...cardStyle, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Avatar name={r.name} src={r.images?.cover || r.images?.logo} color={ROLE_COLOR.restaurant}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{r.name}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            {r.address?.city || r.address?.street || '—'}
            {r.cuisine?.length ? ` · ${r.cuisine.slice(0, 2).join(', ')}` : ''}
          </div>
          {r.owner && (
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, wordBreak: 'break-all' }}>
              Owner: {r.owner.name} · {r.owner.email}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
          <Chip color={verified ? '#059669' : '#d97706'}>
            {verified ? 'Verified' : 'Pending'}
          </Chip>
          {!active && <Chip color="#6b7280">Inactive</Chip>}
        </div>
      </div>
      <div style={{
        display: 'flex', borderTop: '1px dashed #E5E7EB', paddingTop: 10,
      }}>
        <StatBlock value={r.stats.total} label="Orders"/>
        <Divider/>
        <StatBlock value={r.stats.delivered} label="Delivered"/>
        <Divider/>
        <StatBlock value={PKR(r.stats.revenue)} label="Revenue"/>
        <Divider/>
        <StatBlock value={r.menuCount} label="Menu"/>
        <Divider/>
        <StatBlock
          value={r.rating?.average ? Number(r.rating.average).toFixed(1) : '—'}
          label="Rating"/>
      </div>
    </motion.div>
  );
}

function RiderCard({ r }) {
  const active = r.stats.active;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }} style={{ ...cardStyle, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <Avatar name={r.name} src={r.avatar} color={ROLE_COLOR.rider}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{r.name || 'Unnamed'}</div>
          <div style={{ fontSize: 12, color: '#6b7280', wordBreak: 'break-all' }}>{r.email}</div>
          {r.phone && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{r.phone}</div>}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>Joined</div>
          <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{fmtDate(r.created_at)}</div>
        </div>
      </div>
      <div style={{
        display: 'flex', borderTop: '1px dashed #E5E7EB', paddingTop: 10,
      }}>
        <StatBlock value={r.stats.assigned} label="Assigned"/>
        <Divider/>
        <StatBlock value={r.stats.delivered} label="Delivered"/>
        <Divider/>
        <StatBlock value={PKR(r.stats.earnings)} label="Earnings"/>
      </div>
      {active && (
        <div style={{
          marginTop: 10, padding: '8px 10px',
          background: '#ecfdf5', borderRadius: 5,
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: '#059669', fontWeight: 600,
        }}>
          <Icons.Bike size={14} stroke="#059669"/>
          On a delivery — #{active.order_number} ({active.status})
        </div>
      )}
    </motion.div>
  );
}

function Chip({ color, icon, children }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
      background: color + '18', color, display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      {icon}{children}
    </span>
  );
}

function EmptyState({ label }) {
  return (
    <div style={{
      ...cardStyle, padding: 30, textAlign: 'center',
      color: '#6b7280', fontSize: 13, fontWeight: 600,
    }}>
      {label}
    </div>
  );
}

function ViewModeToggle({ value, onChange }) {
  const opts = [
    { key: 'auto',    label: 'Auto' },
    { key: 'mobile',  label: 'Mobile' },
    { key: 'desktop', label: 'Desktop' },
  ];
  return (
    <div style={{
      display: 'flex', background: '#F5F5F5',
      borderRadius: 999, padding: 3,
      border: '1px solid #E5E7EB',
    }}>
      {opts.map(o => (
        <button key={o.key} onClick={() => onChange(o.key)} style={{
          padding: '5px 11px', borderRadius: 999,
          background: value === o.key ? '#111' : 'transparent',
          color:      value === o.key ? '#fff' : '#6b7280',
          border: 0, fontSize: 11, fontWeight: 700, cursor: 'pointer',
          transition: 'all .15s',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

function SkeletonList({ isTablet }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isTablet ? 'repeat(2, 1fr)' : '1fr',
      gap: 12,
    }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ ...cardStyle, padding: '14px 16px', minHeight: 110 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: '#E5E7EB', borderRadius: 5 }}/>
            <div style={{ flex: 1 }}>
              <div style={{ height: 12, background: '#E5E7EB', borderRadius: 4, width: '60%' }}/>
              <div style={{ height: 10, background: '#EEE', borderRadius: 4, width: '40%', marginTop: 8 }}/>
            </div>
          </div>
          <div style={{ marginTop: 12, height: 30, background: '#EEE', borderRadius: 4 }}/>
        </div>
      ))}
    </div>
  );
}
