const express = require('express');
const router = express.Router();
const { register, login, googleAuth, googleTokenAuth, getMe, updateProfile, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/google-token', googleTokenAuth);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.post('/logout', protect, logout);

module.exports = router;
