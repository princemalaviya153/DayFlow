const prisma = require('../config/prisma');

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { recipientId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to recent 50
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
    try {
        const count = await prisma.notification.count({
            where: {
                recipientId: req.user.id,
                isRead: false
            }
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await prisma.notification.updateMany({
            where: {
                id: req.params.id,
                recipientId: req.user.id
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });
        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all unread notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: {
                recipientId: req.user.id,
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });
        res.json({ message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
const getPreferences = async (req, res) => {
    try {
        const preferences = await prisma.notificationPreference.findMany({
            where: { employeeId: req.user.id }
        });

        // Return defaults for any missing types handled by frontend
        res.json(preferences);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user notification preference
// @route   PUT /api/notifications/preferences
// @access  Private
const updatePreference = async (req, res) => {
    try {
        const { notificationType, inAppEnabled, emailEnabled } = req.body;

        const preference = await prisma.notificationPreference.upsert({
            where: {
                employeeId_notificationType: {
                    employeeId: req.user.id,
                    notificationType
                }
            },
            update: {
                inAppEnabled,
                emailEnabled
            },
            create: {
                employeeId: req.user.id,
                notificationType,
                inAppEnabled,
                emailEnabled
            }
        });

        res.json(preference);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    getPreferences,
    updatePreference
};
