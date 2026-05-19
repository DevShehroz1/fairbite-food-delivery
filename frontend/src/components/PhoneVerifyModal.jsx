import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { Icons, Pressable, BrandButton } from './ui';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { auth, FIREBASE_ENABLED } from '../services/firebase';

// Two-step OTP modal.
//   - If Firebase is configured (REACT_APP_FIREBASE_* env vars set), uses
//     Firebase Phone Auth to send a real SMS, verifies the code client-side,
//     then hands the resulting ID token to the backend at /auth/otp/firebase
//     which uses firebase-admin to verify the token and flip phone_verified.
//   - Otherwise falls back to the demo flow (/auth/otp/send + /auth/otp/verify)
//     so dev/preview environments keep working without Firebase setup.
export default function PhoneVerifyModal({ open, onClose, onVerified, initialPhone }) {
  const { refreshUser } = useAuth();
  const recaptchaRef    = useRef(null);
  const verifierRef     = useRef(null);
  const confirmationRef = useRef(null);

  const [step, setStep]       = useState('phone');
  const [phone, setPhone]     = useState(initialPhone || '');
  const [code, setCode]       = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [demoOtp, setDemoOtp] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!open) {
      setStep('phone'); setCode(''); setDemoOtp(null); setSecondsLeft(0);
      confirmationRef.current = null;
      teardownRecaptcha();
    } else if (initialPhone && !phone) {
      setPhone(initialPhone);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  // Convert a Pakistani local number ("0312…") into E.164 ("+92312…")
  // so Firebase / international SMS routes know the country.
  const toE164 = (raw) => {
    let p = (raw || '').replace(/[\s-]/g, '');
    if (!p) return p;
    if (p.startsWith('+')) return p;
    if (p.startsWith('00')) return '+' + p.slice(2);
    if (p.startsWith('0'))  return '+92' + p.slice(1); // default PK
    return '+' + p;
  };

  const teardownRecaptcha = () => {
    if (verifierRef.current) {
      try { verifierRef.current.clear(); } catch (_) {}
      verifierRef.current = null;
    }
    // clear() doesn't always purge the DOM (especially after a failed init),
    // so blow the host element away ourselves so the next mount is clean.
    if (recaptchaRef.current) {
      try { recaptchaRef.current.innerHTML = ''; } catch (_) {}
    }
  };

  const ensureRecaptcha = () => {
    if (!FIREBASE_ENABLED || !auth) return null;
    if (!verifierRef.current && recaptchaRef.current) {
      // Always start from a virgin DOM node — if a previous attempt half-mounted,
      // Firebase will throw "reCAPTCHA has already been rendered in this element"
      // when we try to mount again into the same div.
      recaptchaRef.current.innerHTML = '';
      verifierRef.current = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: 'invisible',
      });
    }
    return verifierRef.current;
  };

  const sendCode = async () => {
    const e164 = toE164(phone);
    if (!e164 || e164.replace(/[^0-9]/g, '').length < 8) {
      return toast.error('Enter a valid phone number');
    }
    setSending(true);
    try {
      if (FIREBASE_ENABLED && auth) {
        const verifier = ensureRecaptcha();
        if (!verifier) throw new Error('reCAPTCHA could not initialize');
        const confirmation = await signInWithPhoneNumber(auth, e164, verifier);
        confirmationRef.current = confirmation;
        setDemoOtp(null);
        setSecondsLeft(180);
        setStep('code');
        toast.success(`SMS sent to ${e164}`);
      } else {
        // Demo fallback — backend returns the code in the response.
        const { data } = await api.post('/auth/otp/send', { phone: e164 });
        if (data.verified) {
          toast.success('Phone already verified');
          await refreshUser();
          onVerified?.(); onClose?.();
          return;
        }
        setDemoOtp(data.demoOtp || null);
        setSecondsLeft(data.expiresInSeconds || 300);
        setStep('code');
      }
    } catch (err) {
      const code = err.code || '';
      let msg = err.response?.data?.message || err.message || 'Could not send OTP';
      if (code === 'auth/invalid-phone-number') msg = 'Invalid phone number';
      if (code === 'auth/too-many-requests')   msg = 'Too many attempts. Try again later.';
      if (code === 'auth/captcha-check-failed') msg = 'reCAPTCHA check failed — refresh and retry';
      if (/reCAPTCHA has already been rendered/i.test(err.message || '')) {
        msg = 'reCAPTCHA reset — please tap "Send SMS code" again';
      }
      // Whatever failed, fully tear down the verifier + the DOM host so the
      // next click rebuilds it from scratch.
      teardownRecaptcha();
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    if (!/^\d{6}$/.test(code)) return toast.error('Enter the 6-digit code');
    setVerifying(true);
    try {
      if (FIREBASE_ENABLED && auth) {
        if (!confirmationRef.current) throw new Error('Request an OTP first');
        const cred = await confirmationRef.current.confirm(code);
        const idToken = await cred.user.getIdToken();
        await api.post('/auth/otp/firebase', { idToken, phone: toE164(phone) });
      } else {
        await api.post('/auth/otp/verify', { code });
      }
      toast.success('Phone verified');
      await refreshUser();
      onVerified?.(); onClose?.();
    } catch (err) {
      const code = err.code || '';
      let msg = err.response?.data?.message || err.message || 'Wrong code';
      if (code === 'auth/invalid-verification-code') msg = 'Wrong code';
      if (code === 'auth/code-expired')              msg = 'Code expired — request a new one';
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}>
          <motion.div
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 380,
              background: '#fff', borderRadius: 12,
              padding: '22px 22px 20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>
                  {step === 'phone' ? 'Verify your phone' : 'Enter the 6-digit code'}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, maxWidth: 280 }}>
                  {step === 'phone'
                    ? (FIREBASE_ENABLED
                        ? 'We\'ll text you a 6-digit code to confirm your number.'
                        : 'We need to verify your phone number before you can place an order.')
                    : `Code sent for ${toE164(phone)}. Expires in ${Math.max(0, secondsLeft)}s.`}
                </div>
              </div>
              <Pressable onClick={onClose} style={{ padding: 6, color: '#6b7280' }}>
                <Icons.X size={18}/>
              </Pressable>
            </div>

            {step === 'phone' && (
              <>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="03xx xxxxxxx"
                  inputMode="tel"
                  autoFocus
                  style={{
                    width: '100%', height: 48, borderRadius: 8,
                    border: '1px solid #E5E7EB', padding: '0 14px',
                    fontSize: 15, fontWeight: 600, color: '#111',
                    outline: 'none', marginBottom: 14, background: '#F9FAFB',
                  }}/>
                <BrandButton onClick={sendCode} disabled={sending}>
                  {sending ? 'Sending…' : (FIREBASE_ENABLED ? 'Send SMS code' : 'Send OTP')}
                </BrandButton>
              </>
            )}

            {step === 'code' && (
              <>
                {demoOtp && (
                  <div style={{
                    background: '#FEF3C7', border: '1px dashed #F59E0B',
                    padding: '10px 12px', borderRadius: 8, marginBottom: 12,
                    fontSize: 12, color: '#92400E', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <Icons.Gift size={14} stroke="#92400E"/>
                    <div>
                      Demo mode (Firebase not configured):
                      <span style={{ marginLeft: 6, fontWeight: 800, letterSpacing: 2 }}>{demoOtp}</span>
                    </div>
                  </div>
                )}
                <input
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="123456"
                  inputMode="numeric"
                  autoFocus
                  style={{
                    width: '100%', height: 54, borderRadius: 8,
                    border: '1px solid #E5E7EB', padding: '0 14px',
                    fontSize: 22, fontWeight: 800, color: '#111',
                    outline: 'none', marginBottom: 14, background: '#F9FAFB',
                    textAlign: 'center', letterSpacing: 6,
                  }}/>
                <BrandButton onClick={verifyCode} disabled={verifying || code.length !== 6}>
                  {verifying ? 'Verifying…' : 'Verify & Continue'}
                </BrandButton>
                <Pressable onClick={() => { setStep('phone'); setCode(''); setDemoOtp(null); confirmationRef.current = null; }}
                  style={{
                    width: '100%', marginTop: 10, padding: 8,
                    color: '#6b7280', fontSize: 12, fontWeight: 600, textAlign: 'center',
                  }}>
                  Use a different number
                </Pressable>
              </>
            )}

            {/* Invisible reCAPTCHA host — Firebase mounts the widget here. */}
            <div ref={recaptchaRef}/>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
