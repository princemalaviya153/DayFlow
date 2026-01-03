const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getUserById, updateUserById } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/:id', protect, admin, getUserById);
router.put('/:id', protect, admin, updateUserById);

module.exports = router;
