const express = require('express');
const router = express.Router();
const { register, login, googleAuth, googleTokenAuth, getMe, updateProfile, logout } = require('../controllers/authController');
const otp = require('../controllers/otpController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/google-token', googleTokenAuth);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.post('/logout', protect, logout);

router.post('/otp/send',   protect, otp.requestOtp);
router.post('/otp/verify', protect, otp.verifyOtp);
router.get('/otp/status',  protect, otp.getStatus);

module.exports = router;
