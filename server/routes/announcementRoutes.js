const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    createAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
    markAsRead,
    getReadReceipts
} = require('../controllers/announcementController');

router.route('/')
    .get(protect, getAnnouncements)
    .post(protect, admin, createAnnouncement);

router.route('/:id')
    .put(protect, admin, updateAnnouncement)
    .delete(protect, admin, deleteAnnouncement);

router.post('/:id/read', protect, markAsRead);
router.get('/:id/reads', protect, admin, getReadReceipts);

module.exports = router;
