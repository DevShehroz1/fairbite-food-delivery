import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Icons, Pressable, BrandButton } from './ui';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Two-step OTP modal: (1) phone entry → /auth/otp/send,
// (2) code entry → /auth/otp/verify. On success calls onVerified()
// and refreshes the auth-context user (which now exposes phoneVerified).
//
// Backend is in OTP_DEMO_MODE — instead of sending a real SMS it returns
// the generated code in `demoOtp`. We surface it here as a tinted banner
// so the demo can complete the loop without an SMS provider.
export default function PhoneVerifyModal({ open, onClose, onVerified, initialPhone }) {
  const { refreshUser } = useAuth();
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

  const sendCode = async () => {
    if (!phone || phone.replace(/[^0-9]/g, '').length < 8) {
      return toast.error('Enter a valid phone number');
    }
    setSending(true);
    try {
      const { data } = await api.post('/auth/otp/send', { phone });
      if (data.verified) {
        toast.success('Phone already verified');
        await refreshUser();
        onVerified?.(); onClose?.();
        return;
      }
      setDemoOtp(data.demoOtp || null);
      setSecondsLeft(data.expiresInSeconds || 300);
      setStep('code');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send OTP');
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    if (!/^\d{6}$/.test(code)) return toast.error('Enter the 6-digit code');
    setVerifying(true);
    try {
      await api.post('/auth/otp/verify', { code });
      toast.success('Phone verified');
      await refreshUser();
      onVerified?.(); onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Wrong code');
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
                    ? 'We need to verify your phone number before you can place an order.'
                    : `Code sent for ${phone}. Expires in ${Math.max(0, secondsLeft)}s.`}
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
                  {sending ? 'Sending…' : 'Send OTP'}
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
                      Demo mode (no SMS provider wired):
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
                <Pressable onClick={() => { setStep('phone'); setCode(''); setDemoOtp(null); }}
                  style={{
                    width: '100%', marginTop: 10, padding: 8,
                    color: '#6b7280', fontSize: 12, fontWeight: 600, textAlign: 'center',
                  }}>
                  Use a different number
                </Pressable>
              </>
            )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
