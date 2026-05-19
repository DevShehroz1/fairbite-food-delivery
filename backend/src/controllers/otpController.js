const bcrypt   = require('bcryptjs');
const supabase = require('../config/supabase');

// Demo-mode: the generated OTP is returned in the API response so the customer
// can copy it from the in-app banner. To swap to real SMS, set OTP_DEMO_MODE=false
// and plug in a provider in `sendSms` below.
const OTP_DEMO_MODE = (process.env.OTP_DEMO_MODE ?? 'true').toLowerCase() !== 'false';
const OTP_TTL_MIN   = 5;
const MAX_ATTEMPTS  = 5;

const normalizePhone = (raw) => (raw || '').replace(/[^\d+]/g, '');
const genOtp = () => String(Math.floor(100000 + Math.random() * 900000));

// Real-SMS escape hatch. Returns true if delivery succeeded.
async function sendSms(/* phone, code */) {
  // Plug a provider in here later (Firebase Phone Auth, Twilio, Vonage…).
  // For now we don't pretend to send — demo mode surfaces the code in the API
  // response and we return false so the caller knows nothing was dispatched.
  return false;
}

exports.requestOtp = async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    if (!phone || phone.replace(/[^0-9]/g, '').length < 8) {
      return res.status(400).json({ success: false, message: 'Enter a valid phone number' });
    }

    // Already verified? Skip the dance and just refresh the phone on the user row.
    const me = await supabase.from('users').select('id,phone,phone_verified').eq('id', req.user.id).single();
    if (me.error) throw new Error(me.error.message);
    if (me.data?.phone_verified && me.data.phone === phone) {
      return res.json({ success: true, message: 'Phone already verified', verified: true });
    }

    const code = genOtp();
    const hash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60_000).toISOString();

    const { error } = await supabase.from('users').update({
      phone,
      otp_hash:        hash,
      otp_expires_at:  expiresAt,
      otp_attempts:    0,
      // Changing phone resets verification.
      phone_verified:  false,
      updated_at:      new Date(),
    }).eq('id', req.user.id);
    if (error) throw new Error(error.message);

    const sent = await sendSms(phone, code);

    res.json({
      success: true,
      message: sent
        ? `OTP sent to ${phone}`
        : `OTP generated. ${OTP_DEMO_MODE ? 'Demo mode: code shown in app.' : 'SMS delivery disabled.'}`,
      expiresInSeconds: OTP_TTL_MIN * 60,
      demoOtp: OTP_DEMO_MODE && !sent ? code : undefined,
      demoMode: OTP_DEMO_MODE && !sent,
    });
  } catch (err) { next(err); }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const code = String(req.body?.code || '').trim();
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ success: false, message: 'Enter the 6-digit code' });
    }

    const { data: row, error } = await supabase
      .from('users').select('id,phone,phone_verified,otp_hash,otp_expires_at,otp_attempts')
      .eq('id', req.user.id).single();
    if (error) throw new Error(error.message);
    if (!row?.otp_hash || !row?.otp_expires_at) {
      return res.status(400).json({ success: false, message: 'Request an OTP first' });
    }
    if (new Date(row.otp_expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
    }
    if ((row.otp_attempts || 0) >= MAX_ATTEMPTS) {
      return res.status(429).json({ success: false, message: 'Too many attempts. Request a new OTP.' });
    }

    const ok = await bcrypt.compare(code, row.otp_hash);
    if (!ok) {
      await supabase.from('users').update({
        otp_attempts: (row.otp_attempts || 0) + 1,
        updated_at:   new Date(),
      }).eq('id', req.user.id);
      return res.status(400).json({ success: false, message: 'Wrong code' });
    }

    const { error: upErr } = await supabase.from('users').update({
      phone_verified: true,
      otp_hash:       null,
      otp_expires_at: null,
      otp_attempts:   0,
      updated_at:     new Date(),
    }).eq('id', req.user.id);
    if (upErr) throw new Error(upErr.message);

    res.json({ success: true, verified: true, phone: row.phone });
  } catch (err) { next(err); }
};

exports.getStatus = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users').select('phone,phone_verified').eq('id', req.user.id).single();
    if (error) throw new Error(error.message);
    res.json({
      success: true,
      data: {
        phone: data?.phone || null,
        verified: Boolean(data?.phone_verified),
      },
    });
  } catch (err) { next(err); }
};
