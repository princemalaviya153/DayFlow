const express = require('express');
const { registerUser, loginUser, verifyUser, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', protect, admin, registerUser);
router.post('/login', loginUser);
router.get('/verify', protect, verifyUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;
