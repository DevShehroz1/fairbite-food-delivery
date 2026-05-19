import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Icons, Pressable, BrandButton, QBLogoMark } from '../../components/ui';

const HAS_GOOGLE = Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID);

// Google sign-in is extracted into its own component so the
// `useGoogleLogin` hook (which initialises Google's SDK on mount)
// never runs when REACT_APP_GOOGLE_CLIENT_ID is missing.
function GoogleSignInBlock({ selectedRole, referralCode, onSuccess, selectedRoleLabel }) {
  const [loading, setLoading] = useState(false);
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        if (!profileRes.ok) throw new Error('Could not fetch Google profile');
        const profile = await profileRes.json();
        if (!profile.email) throw new Error('No email returned from Google');
        const { data } = await api.post('/auth/google-token', {
          email: profile.email,
          name:  profile.name,
          avatar: profile.picture,
          googleId: profile.sub,
          role: selectedRole,
          referralCode: referralCode || undefined,
        });
        onSuccess(data);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Google sign-in failed. Try email login.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error('Google sign-in was cancelled'),
  });
  return (
    <Pressable onClick={() => googleLogin()} disabled={loading} style={{
      width: '100%', height: 52, borderRadius: 5,
      background: '#fff', color: '#111',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      fontSize: 15, fontWeight: 700,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      opacity: loading ? 0.7 : 1,
    }}>
      {loading
        ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Icons.Settings size={18} stroke="#666"/></motion.div>
        : <Icons.Google size={20}/>
      }
      {loading ? 'Signing in…' : `Continue with Google as ${selectedRoleLabel}`}
    </Pressable>
  );
}

const ROLE_ROUTES = {
  customer:   '/home',
  rider:      '/dashboard/rider',
  restaurant: '/dashboard/restaurant',
  admin:      '/dashboard/admin',
};

const ROLES = [
  { key: 'customer',   label: 'Customer',   sub: 'Order food',      emoji: '🛒' },
  { key: 'restaurant', label: 'Restaurant', sub: 'Manage orders',   emoji: '🍽️' },
  { key: 'rider',      label: 'Rider',      sub: 'Deliver food',    emoji: '🛵' },
];

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
  const [params] = useSearchParams();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('customer');
  const [tab, setTab]         = useState(params.get('ref') ? 'register' : 'login');
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [name, setName]       = useState('');
  const [referralCode, setReferralCode] = useState(params.get('ref') || '');
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = params.get('ref');
    if (ref) setReferralCode(ref.toUpperCase());
  }, [params]);

  const handleSubmit = async () => {
    if (!email || !password) return toast.error('Enter email and password');
    if (tab === 'register' && !name) return toast.error('Enter your name');
    setLoading(true);
    try {
      const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
      const payload  = tab === 'login'
        ? { email, password }
        : { name, email, password, role: selectedRole, referralCode: referralCode || undefined };
      const { data } = await api.post(endpoint, payload);
      login(data.token, data.user);
      if (tab === 'login' && data.user.role !== selectedRole) {
        toast.info(`Signed in as ${data.user.role} (your account's existing role).`);
      }
      navigate(ROLE_ROUTES[data.user.role] || '/home', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (data) => {
    login(data.token, data.user);
    navigate(ROLE_ROUTES[data.user.role] || '/home', { replace: true });
  };

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.2, 0, 0, 1] } } };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: '#0b0b0b' }}>
      {/* food collage bg */}
      <div style={{ position: 'fixed', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)' }}>
        {FOOD_IMGS.map((id, i) => (
          <img key={i} src={`https://images.unsplash.com/${id}?w=400&auto=format&fit=crop`}
            alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        ))}
      </div>
      <div style={{
        position: 'fixed', inset: 0,
        backdropFilter: 'blur(28px) saturate(140%)',
        WebkitBackdropFilter: 'blur(28px) saturate(140%)',
        background: 'linear-gradient(180deg, rgba(15,10,10,0.55), rgba(20,10,10,0.85))',
      }}/>

      {/* Sign In / Register toggle — pinned in the top-right corner */}
      <div style={{
        position: 'fixed', top: 16, right: 16, zIndex: 5,
        display: 'flex', background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderRadius: 999, padding: 3,
        border: '1px solid rgba(255,255,255,0.14)',
      }}>
        {['login', 'register'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 14px', borderRadius: 999,
            background: tab === t ? '#fff' : 'transparent',
            color: tab === t ? '#111' : 'rgba(255,255,255,0.85)',
            border: 0, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            transition: 'all .2s',
          }}>{t === 'login' ? 'Sign In' : 'Sign Up'}</button>
        ))}
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show"
        style={{
          position: 'relative', zIndex: 1,
          minHeight: '100vh', maxWidth: 430, margin: '0 auto',
          padding: '52px 24px 40px',
          display: 'flex', flexDirection: 'column', color: '#fff',
        }}>

        {/* Wordmark on the red hero — type carries the brand, no glyph. */}
        <motion.div variants={item} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, lineHeight: 1 }}>
          <QBLogoMark size={40} inverted/>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700 }}>
            Fast · Fair · Tasty
          </div>
        </motion.div>

        <motion.h1 variants={item} style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, margin: '0 0 4px', lineHeight: 1.15 }}>
          {tab === 'login'
            ? <>Welcome <span style={{ color: 'var(--qb-accent)' }}>back</span>.</>
            : <>Welcome to a <span style={{ color: 'var(--qb-accent)' }}>fair</span> deal.</>}
        </motion.h1>
        <motion.p variants={item} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '0 0 20px' }}>
          {tab === 'login' ? 'Sign in to continue.' : 'Create an account in seconds.'}
        </motion.p>

        {/* Role selector */}
        <motion.div variants={item} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>
            I am a…
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {ROLES.map(r => {
              const active = selectedRole === r.key;
              return (
                <Pressable key={r.key} onClick={() => setSelectedRole(r.key)} style={{
                  padding: '12px 8px', borderRadius: 5, textAlign: 'center',
                  background: active ? 'rgba(229,57,53,0.18)' : 'rgba(255,255,255,0.07)',
                  border: `1.5px solid ${active ? 'var(--qb-primary)' : 'rgba(255,255,255,0.12)'}`,
                  transition: 'all .2s',
                }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{r.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: active ? '#fff' : 'rgba(255,255,255,0.8)' }}>{r.label}</div>
                  <div style={{ fontSize: 10, color: active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)', marginTop: 2 }}>{r.sub}</div>
                </Pressable>
              );
            })}
          </div>
        </motion.div>

        {/* Referral code — always visible so it applies to Google sign-in too */}
        <motion.div variants={item} style={{ marginBottom: 14 }}>
          <FloatField
            label="Referral code (optional)"
            value={referralCode}
            onChange={(v) => setReferralCode((v || '').toUpperCase())}
          />
          {referralCode && (
            <div style={{ fontSize: 11, color: 'var(--qb-accent)', marginTop: 6, paddingLeft: 4 }}>
              ✓ Code applied — new accounts get Rs. 250 off their first order
            </div>
          )}
        </motion.div>

        {/* Google button — only when REACT_APP_GOOGLE_CLIENT_ID is set */}
        {HAS_GOOGLE && (
          <motion.div variants={item} style={{ marginBottom: 14 }}>
            <GoogleSignInBlock
              selectedRole={selectedRole}
              referralCode={referralCode}
              onSuccess={handleGoogleSuccess}
              selectedRoleLabel={ROLES.find(r => r.key === selectedRole)?.label}
            />
          </motion.div>
        )}

        {/* divider — only when there's something above to divide from */}
        {HAS_GOOGLE && (
          <motion.div variants={item} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }}/>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }}/>
          </motion.div>
        )}

        {/* Continue-with-email toggle — collapsed by default */}
        {!emailOpen && (
          <motion.div variants={item}>
            <Pressable onClick={() => setEmailOpen(true)} style={{
              width: '100%', height: 52, borderRadius: 5,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.13)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontSize: 14, fontWeight: 700,
            }}>
              <Icons.Message size={18}/>
              {tab === 'login' ? 'Sign in with email' : 'Sign up with email'}
            </Pressable>
          </motion.div>
        )}

        {/* Email/password form — animated in when user opens it */}
        <AnimatePresence initial={false}>
          {emailOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}>
              <AnimatePresence initial={false}>
                {tab === 'register' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 10 }}>
                    <FloatField label="Full Name" value={name} onChange={setName}/>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ marginBottom: 10 }}>
                <FloatField label="Email" value={email} onChange={setEmail} type="email"/>
              </div>
              <div style={{ marginBottom: 14 }}>
                <FloatField label="Password" value={password} onChange={setPass}
                  type={showPw ? 'text' : 'password'}
                  trailing={
                    <Pressable onClick={() => setShowPw(!showPw)} style={{ color: 'rgba(255,255,255,0.6)', padding: 6 }}>
                      {showPw ? <Icons.EyeOff size={18}/> : <Icons.Eye size={18}/>}
                    </Pressable>
                  }/>
              </div>

              <BrandButton onClick={handleSubmit} disabled={loading}>
                {loading ? 'Please wait…' : (tab === 'login' ? 'Sign In' : `Create ${ROLES.find(r => r.key === selectedRole)?.label} Account`)}
              </BrandButton>

              <Pressable onClick={() => setEmailOpen(false)} style={{
                width: '100%', marginTop: 10, padding: 8,
                background: 'transparent', color: 'rgba(255,255,255,0.55)',
                fontSize: 12, fontWeight: 600, textAlign: 'center',
              }}>
                Hide email form
              </Pressable>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function FloatField({ label, value, onChange, type = 'text', trailing }) {
  const [focus, setFocus] = useState(false);
  const float = focus || value;
  return (
    <div style={{
      position: 'relative', height: 54, borderRadius: 5,
      background: 'rgba(255,255,255,0.07)',
      border: `1px solid ${focus ? 'rgba(255,112,67,0.6)' : 'rgba(255,255,255,0.13)'}`,
      transition: 'border .2s',
    }}>
      <label style={{
        position: 'absolute', left: 16, pointerEvents: 'none',
        top: float ? 7 : 17, fontSize: float ? 10 : 14,
        color: float ? 'var(--qb-accent)' : 'rgba(255,255,255,0.5)',
        fontWeight: float ? 600 : 500, transition: 'all .2s',
      }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: '100%', height: '100%', background: 'transparent',
          border: 0, outline: 0, padding: '18px 46px 6px 16px',
          color: '#fff', fontSize: 14, fontWeight: 500,
        }}/>
      {trailing && (
        <div style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)' }}>
          {trailing}
        </div>
      )}
    </div>
  );
}
