import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Icons, Pressable, BrandButton, FBLogoMark } from '../../components/ui';

const DEMO_ROLES = [
  { label: 'Customer',   email: 'customer@demo.com',   password: 'demo123' },
  { label: 'Rider',      email: 'rider@demo.com',       password: 'demo123' },
  { label: 'Restaurant', email: 'restaurant@demo.com', password: 'demo123' },
  { label: 'Admin',      email: 'admin@demo.com',       password: 'demo123' },
];

const ROLE_ROUTES = {
  customer:   '/home',
  rider:      '/dashboard/rider',
  restaurant: '/dashboard/restaurant',
  admin:      '/dashboard/admin',
};

const FOOD_IMGS = [
  'photo-1568901346375-23c9450c58cd',
  'photo-1565299624946-b28f40a0ae38',
  'photo-1604908554007-1ec5d4f1f8b3',
  'photo-1544025162-d76694265947',
  'photo-1601050690597-df0568f70950',
  'photo-1565557623262-b51c2513a641',
  'photo-1488477181946-6428a0291777',
  'photo-1633237308525-cd587cf71926',
  'photo-1579871494447-9811cf80d66c',
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tab, setTab]       = useState('login');
  const [role, setRole]     = useState('Customer');
  const [email, setEmail]   = useState('customer@demo.com');
  const [password, setPass] = useState('demo123');
  const [name, setName]     = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectDemo = (r) => {
    setRole(r.label);
    setEmail(r.email);
    setPass(r.password);
  };

  const handleSubmit = async () => {
    if (!email || !password) return toast.error('Enter email and password');
    if (tab === 'register' && !name) return toast.error('Enter your name');
    setLoading(true);
    try {
      const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
      const payload  = tab === 'login'
        ? { email, password }
        : { name, email, password, role: role.toLowerCase() };
      const { data } = await api.post(endpoint, payload);
      login(data.token, data.user);
      toast.success(`Welcome${data.user.name ? ', ' + data.user.name.split(' ')[0] : ''}!`);
      navigate(ROLE_ROUTES[data.user.role] || '/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.2, 0, 0, 1] } },
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: '#0b0b0b' }}>
      {/* food collage bg */}
      <div style={{
        position: 'fixed', inset: 0,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)',
      }}>
        {FOOD_IMGS.map((id, i) => (
          <img key={i} src={`https://images.unsplash.com/${id}?w=400&auto=format&fit=crop`}
            alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        ))}
      </div>
      {/* blur overlay */}
      <div style={{
        position: 'fixed', inset: 0,
        backdropFilter: 'blur(28px) saturate(140%)',
        WebkitBackdropFilter: 'blur(28px) saturate(140%)',
        background: 'linear-gradient(180deg, rgba(15,10,10,0.55), rgba(20,10,10,0.78))',
      }}/>

      <motion.div variants={stagger} initial="hidden" animate="show"
        style={{
          position: 'relative', zIndex: 1,
          minHeight: '100vh', maxWidth: 430, margin: '0 auto',
          padding: '60px 24px 40px',
          display: 'flex', flexDirection: 'column', color: '#fff',
        }}>

        {/* logo */}
        <motion.div variants={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FBLogoMark size={28}/>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.3 }}>FairBite</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Fair prices. No hidden fees.</div>
          </div>
        </motion.div>

        <motion.h1 variants={item} style={{
          fontSize: 32, fontWeight: 800, letterSpacing: -0.6,
          margin: '20px 0 6px', lineHeight: 1.1,
        }}>
          Welcome back to a <span style={{ color: 'var(--fb-accent)' }}>fair</span> deal.
        </motion.h1>
        <motion.p variants={item} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: '0 0 22px' }}>
          Sign in or create an account in seconds.
        </motion.p>

        {/* tab switcher */}
        <motion.div variants={item} style={{
          display: 'flex', background: 'rgba(255,255,255,0.12)', borderRadius: 16,
          padding: 4, marginBottom: 16,
        }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '11px 0', borderRadius: 12,
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? '#111' : 'rgba(255,255,255,0.85)',
              border: 0, fontSize: 14, fontWeight: 700, cursor: 'pointer',
              textTransform: 'capitalize', transition: 'all .25s',
            }}>{t}</button>
          ))}
        </motion.div>

        <AnimatePresence>
          {tab === 'register' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 12 }}>
              <FloatField label="Full Name" value={name} onChange={setName}/>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={item} style={{ marginBottom: 12 }}>
          <FloatField label="Email" value={email} onChange={setEmail} type="email"/>
        </motion.div>
        <motion.div variants={item} style={{ marginBottom: 14 }}>
          <FloatField label="Password" value={password} onChange={setPass}
            type={showPw ? 'text' : 'password'}
            trailing={
              <Pressable onClick={() => setShowPw(!showPw)}
                style={{ color: 'rgba(255,255,255,0.7)', padding: 6 }}>
                {showPw ? <Icons.EyeOff size={18}/> : <Icons.Eye size={18}/>}
              </Pressable>
            }/>
        </motion.div>

        {/* demo role picker */}
        <motion.div variants={item}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 8,
            textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600 }}>
            Quick demo — sign in as
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {DEMO_ROLES.map(r => (
              <Pressable key={r.label} onClick={() => selectDemo(r)} style={{
                padding: '10px 12px', borderRadius: 12,
                background: role === r.label ? 'var(--fb-primary)' : 'rgba(255,255,255,0.1)',
                border: role === r.label ? '1px solid var(--fb-primary)' : '1px solid rgba(255,255,255,0.18)',
                color: '#fff', fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                {r.label}
                {role === r.label && <Icons.Check size={14} sw={3}/>}
              </Pressable>
            ))}
          </div>
        </motion.div>

        <div style={{ flex: 1, minHeight: 24 }}/>

        <motion.div variants={item} style={{ marginTop: 18 }}>
          <BrandButton onClick={handleSubmit} disabled={loading}>
            {loading ? 'Signing in…' : (tab === 'login' ? `Sign In as ${role}` : 'Create Account')}
          </BrandButton>
        </motion.div>
        <motion.div variants={item} style={{
          textAlign: 'center', marginTop: 12, fontSize: 11.5, color: 'rgba(255,255,255,0.55)',
        }}>
          Secure payment · Free cancellation
        </motion.div>
      </motion.div>
    </div>
  );
}

function FloatField({ label, value, onChange, type = 'text', trailing }) {
  const [focus, setFocus] = useState(false);
  const float = focus || value;
  return (
    <div style={{
      position: 'relative', height: 56, borderRadius: 16,
      background: 'rgba(255,255,255,0.08)',
      border: `1px solid ${focus ? 'rgba(255,112,67,0.6)' : 'rgba(255,255,255,0.15)'}`,
      transition: 'border .2s',
    }}>
      <label style={{
        position: 'absolute', left: 16, pointerEvents: 'none',
        top: float ? 8 : 18, fontSize: float ? 11 : 14,
        color: float ? 'var(--fb-accent)' : 'rgba(255,255,255,0.55)',
        fontWeight: float ? 600 : 500, transition: 'all .2s',
      }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: '100%', height: '100%', background: 'transparent',
          border: 0, outline: 0, padding: '20px 50px 6px 16px',
          color: '#fff', fontSize: 15, fontWeight: 500,
        }}/>
      {trailing && (
        <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
          {trailing}
        </div>
      )}
    </div>
  );
}
