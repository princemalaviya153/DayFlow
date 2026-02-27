const express = require('express');
const router = express.Router();
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    getPreferences,
    updatePreference
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getNotifications);

router.route('/unread-count')
    .get(getUnreadCount);

router.route('/:id/read')
    .patch(markAsRead);

router.route('/read-all')
    .patch(markAllAsRead);

router.route('/preferences')
    .get(getPreferences)
    .put(updatePreference);

module.exports = router;
