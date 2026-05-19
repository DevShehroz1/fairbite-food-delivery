import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Icons, Pressable, BrandButton, QBLogoMark } from '../../components/ui';

const HAS_GOOGLE = Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID);

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

function GoogleAdminLogin({ onSuccess }) {
  const [busy, setBusy] = useState(false);
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setBusy(true);
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
        });
        onSuccess(data);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Google sign-in failed.');
      } finally {
        setBusy(false);
      }
    },
    onError: () => toast.error('Google sign-in was cancelled'),
  });
  return (
    <Pressable onClick={() => googleLogin()} disabled={busy} style={{
      width: '100%', height: 52, borderRadius: 5,
      background: '#fff', color: '#111',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      fontSize: 15, fontWeight: 700,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      opacity: busy ? 0.7 : 1,
    }}>
      {busy
        ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Icons.Settings size={18} stroke="#666"/></motion.div>
        : <Icons.Google size={20}/>
      }
      {busy ? 'Signing in…' : 'Continue with Google'}
    </Pressable>
  );
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const isDesktop = useMatchMedia('(min-width: 900px)');
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // Admin-only acceptance check. The backend doesn't have a dedicated
  // admin-login endpoint, but every account has a role on it — so the
  // policy is enforced client-side: only role === 'admin' is allowed
  // through this URL.
  const acceptIfAdmin = (data) => {
    if (data?.user?.role !== 'admin') {
      toast.error('This sign-in is for admins only.');
      return;
    }
    login(data.token, data.user);
    navigate('/dashboard/admin', { replace: true });
  };

  const handleSubmit = async () => {
    if (!email || !password) return toast.error('Enter email and password');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      acceptIfAdmin(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const formColumn = (
    <div style={{
      width: '100%', maxWidth: 420,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ marginBottom: 24, lineHeight: 1 }}>
        <QBLogoMark size={40} inverted/>
        <div style={{
          fontSize: 11, color: 'rgba(255,255,255,0.7)',
          letterSpacing: 0.6, textTransform: 'uppercase',
          fontWeight: 700, marginTop: 6,
        }}>
          Admin Console
        </div>
      </div>

      <h1 style={{ fontSize: isDesktop ? 32 : 26, fontWeight: 800, letterSpacing: -0.5, margin: '0 0 4px', lineHeight: 1.15 }}>
        Sign in to the <span style={{ color: 'var(--qb-accent)' }}>admin panel</span>.
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '0 0 28px' }}>
        Restricted access. Sign in with an admin account.
      </p>

      {HAS_GOOGLE && (
        <>
          <div style={{ marginBottom: 14 }}>
            <GoogleAdminLogin onSuccess={acceptIfAdmin}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }}/>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }}/>
          </div>
        </>
      )}

      <div style={{ marginBottom: 10 }}>
        <FloatField label="Admin email" value={email} onChange={setEmail} type="email"/>
      </div>
      <div style={{ marginBottom: 18 }}>
        <FloatField label="Password" value={password} onChange={setPass}
          type={showPw ? 'text' : 'password'}
          trailing={
            <Pressable onClick={() => setShowPw(!showPw)} style={{ color: 'rgba(255,255,255,0.6)', padding: 6 }}>
              {showPw ? <Icons.EyeOff size={18}/> : <Icons.Eye size={18}/>}
            </Pressable>
          }/>
      </div>

      <BrandButton onClick={handleSubmit} disabled={loading}>
        {loading ? 'Please wait…' : 'Sign in to admin'}
      </BrandButton>
    </div>
  );

  return (
    <div style={{
      position: 'relative', minHeight: '100vh',
      background: 'radial-gradient(circle at 20% 0%, #2b0a0a 0%, #0b0b0b 70%)',
      color: '#fff',
      display: 'flex',
    }}>
      {/* small back link */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 5 }}>
        <Pressable onClick={() => navigate('/')} style={{
          color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <Icons.ChevronL size={14}/> Back
        </Pressable>
      </div>

      {isDesktop && (
        <div style={{
          flex: '1 1 0', minHeight: '100vh',
          position: 'relative', overflow: 'hidden',
          background:
            'radial-gradient(circle at 30% 30%, rgba(229,57,53,0.35), transparent 60%),' +
            'radial-gradient(circle at 70% 80%, rgba(180,30,40,0.45), transparent 55%),' +
            '#150707',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 56px',
        }}>
          <div>
            <QBLogoMark size={32} inverted/>
            <div style={{
              fontSize: 11, color: 'rgba(255,255,255,0.5)',
              letterSpacing: 0.6, textTransform: 'uppercase',
              fontWeight: 700, marginTop: 6,
            }}>
              QuickBite control room
            </div>
          </div>
          <div>
            <div style={{ fontSize: 40, fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: -1, maxWidth: 460 }}>
              Run the platform from one place.
            </div>
            <ul style={{
              listStyle: 'none', padding: 0, margin: '24px 0 0',
              color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500, lineHeight: 1.8,
            }}>
              <li>· Live customer, restaurant and rider rosters</li>
              <li>· Order totals + delivered revenue at a glance</li>
              <li>· Referral linkage and per-account rewards count</li>
            </ul>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
            Restricted to QuickBite admins only.
          </div>
        </div>
      )}

      <div style={{
        flex: '1 1 0', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isDesktop ? '40px 56px' : '80px 24px 40px',
      }}>
        {formColumn}
      </div>
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
