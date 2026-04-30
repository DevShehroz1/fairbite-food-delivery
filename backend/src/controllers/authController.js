const User = require('../models/User');

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
    const { name, email, password, role, phone } = req.body;
    const existing = await User.findByEmail(email);
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, role, phone });
    sendToken(user, 201, res);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findByEmail(email, true); // includePassword=true
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await User.matchPassword(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    await User.update(user.id, { last_login: new Date() });
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
