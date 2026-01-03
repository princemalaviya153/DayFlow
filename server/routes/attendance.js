const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getAttendance, getAllAttendance } = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/checkin', protect, checkIn);
router.put('/checkout', protect, checkOut);
router.get('/', protect, getAttendance);
router.get('/all', protect, admin, getAllAttendance);

module.exports = router;
