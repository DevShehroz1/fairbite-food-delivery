const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const referralCtrl = require('../controllers/referralController');

router.get('/me', protect, referralCtrl.getMyReferralInfo);

module.exports = router;
