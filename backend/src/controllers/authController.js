const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const referralCtrl = require('./referralController');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Anyone signing in with an email in this allowlist is promoted to admin —
// account is created with role='admin' if new, or upgraded to admin on the
// next sign-in if it already exists. Extendable via ADMIN_EMAILS env var
// (comma-separated list).
const ADMIN_EMAILS = new Set([
  'shopifydevelopment0@gmail.com',
  'admin@demo.com',
  ...((process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean)),
].map(e => e.toLowerCase()));

const isAdminEmail = (email) => ADMIN_EMAILS.has((email || '').toLowerCase());

const creditReferralBestEffort = async (user) => {
  if (!user?.referredBy) return;
  try { await referralCtrl.creditReferralCoupons({ refereeId: user.id }); }
  catch (e) { console.error('Referral signup credit failed:', e.message); }
};

const sendToken = (user, statusCode, res) => {
  const token = User.generateToken(user);
  res.status(statusCode).json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar },
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, referralCode } = req.body;
    const existing = await User.findByEmail(email);
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findByReferralCode(referralCode);
      if (!referrer) return res.status(400).json({ success: false, message: 'Invalid referral code' });
      referredBy = referrer.id;
    }

    const user = await User.create({ name, email, password, role, phone, referredBy });
    await creditReferralBestEffort(user);
    sendToken(user, 201, res);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findByEmail(email, true);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await User.matchPassword(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    sendToken(user, 200, res);
  } catch (err) { next(err); }
};

// Google OAuth — ID token flow (used with GoogleLogin button)
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ success: false, message: 'No Google credential provided' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;
    if (!email) return res.status(400).json({ success: false, message: 'Could not get email from Google' });

    let user = await User.findByEmail(email);
    if (!user) {
      const role = isAdminEmail(email) ? 'admin' : 'customer';
      user = await User.createGoogleUser({ name, email, avatar: picture, googleId, role });
    } else {
      const updates = { avatar: picture || user.avatar };
      if (isAdminEmail(email) && user.role !== 'admin') updates.role = 'admin';
      const updated = await User.update(user.id, updates);
      user = { ...user, ...updates, ...(updated || {}) };
    }

    sendToken(user, 200, res);
  } catch (err) {
    if (err.message?.includes('Token used too late') || err.message?.includes('Invalid token')) {
      return res.status(401).json({ success: false, message: 'Google sign-in expired, please try again' });
    }
    next(err);
  }
};

// Google OAuth — access token flow (used with useGoogleLogin hook).
// The frontend distinguishes two flows via the `intent` field:
//   - intent === 'admin'   → admin allowlist applies; the email-allowlisted
//                            account is created or upgraded to role='admin'.
//   - anything else        → public LandingPage; the selected role wins,
//                            even if the email is in the admin allowlist.
//                            This lets the admin email also sign in as a
//                            customer/rider/restaurant for testing.
exports.googleTokenAuth = async (req, res, next) => {
  try {
    const { email, name, avatar, googleId, role, referralCode, intent } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'No email provided' });

    const adminIntent = intent === 'admin';
    const allowAdmin  = adminIntent && isAdminEmail(email);

    let user = await User.findByEmail(email);
    const allowed = ['customer', 'restaurant', 'rider'];
    if (!user) {
      const assignedRole = allowAdmin
        ? 'admin'
        : (allowed.includes(role) ? role : 'customer');
      let referredBy = null;
      if (referralCode) {
        const referrer = await User.findByReferralCode(referralCode);
        if (referrer) referredBy = referrer.id;
      }
      user = await User.createGoogleUser({ name, email, avatar, googleId, role: assignedRole, referredBy });
      await creditReferralBestEffort(user);
    } else {
      const updates = {};
      if (avatar) updates.avatar = avatar;
      if (allowAdmin) {
        // AdminLoginPage flow — promote (or keep) admin.
        if (user.role !== 'admin') updates.role = 'admin';
      } else if (allowed.includes(role)) {
        // Public LandingPage — flip role to whatever was selected, even
        // if the user is currently admin. This is the "let me test as a
        // customer using my admin email" case.
        if (role !== user.role) updates.role = role;
      }
      if (Object.keys(updates).length) {
        const updated = await User.update(user.id, updates);
        user = { ...user, ...updates, ...(updated || {}) };
      }
    }

    sendToken(user, 200, res);
  } catch (err) { next(err); }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.update(req.user.id, { name: req.body.name, phone: req.body.phone });
    res.status(200).json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.logout = (req, res) =>
  res.status(200).json({ success: true, message: 'Logged out successfully' });
