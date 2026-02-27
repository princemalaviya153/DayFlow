const prisma = require('../config/prisma');
const NotificationService = require('../services/NotificationService');

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Admin
const createAnnouncement = async (req, res) => {
    try {
        const { title, content, category, priority, expiresAt, isPinned, targetRole } = req.body;

        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                category: category || 'General',
                priority: priority || 'Normal',
                authorId: req.user.id,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                isPinned: Boolean(isPinned),
                targetRole: targetRole || 'All'
            },
            include: {
                author: { select: { firstName: true, lastName: true } }
            }
        });

        // Notify users
        const whereClause = announcement.targetRole === 'All' ? {} : { role: announcement.targetRole };
        const usersToNotify = await prisma.user.findMany({
            where: {
                ...whereClause,
                id: { not: req.user.id } // Don't notify the author
            },
            select: { id: true }
        });

        for (const user of usersToNotify) {
            await NotificationService.createNotification({
                recipientId: user.id,
                type: 'ANNOUNCEMENT',
                title: `New Announcement: ${announcement.title}`,
                message: announcement.category === 'Urgent' ? '⚠️ Urgent Update posted on the noticeboard.' : 'A new announcement has been posted on the noticeboard.',
                actionUrl: '/noticeboard',
                metadata: { announcementId: announcement.id }
            });
        }

        res.status(201).json(announcement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active announcements
// @route   GET /api/announcements
// @access  Private (All)
const getAnnouncements = async (req, res) => {
    try {
        const { category } = req.query;
        const userRole = req.user.role;

        // Build where clause
        const where = {
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
            ]
        };

        if (category && category !== 'All') {
            where.category = category;
        }

        // Role filtering
        if (userRole !== 'Admin') {
            where.targetRole = { in: ['All', userRole] };
        }

        const announcements = await prisma.announcement.findMany({
            where,
            orderBy: [
                { isPinned: 'desc' },
                { publishedAt: 'desc' }
            ],
            include: {
                author: { select: { firstName: true, lastName: true, employeeId: true } },
                reads: {
                    where: { userId: req.user.id },
                    select: { id: true }
                },
                _count: { select: { reads: true } } // Total read count
            }
        });

        // Add a helper boolean for ease of use in frontend
        const formatted = announcements.map(ann => ({
            ...ann,
            isReadByMe: ann.reads.length > 0
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Admin
const updateAnnouncement = async (req, res) => {
    try {
        const { title, content, category, priority, expiresAt, isPinned, targetRole } = req.body;
        const announcementId = req.params.id;

        const announcement = await prisma.announcement.update({
            where: { id: announcementId },
            data: {
                title,
                content,
                category,
                priority,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                isPinned: Boolean(isPinned),
                targetRole
            },
            include: { author: { select: { firstName: true, lastName: true } } }
        });

        res.json(announcement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Admin
const deleteAnnouncement = async (req, res) => {
    try {
        await prisma.announcement.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Announcement removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark announcement as read
// @route   POST /api/announcements/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const announcementId = req.params.id;
        const userId = req.user.id;

        // Use upsert to prevent duplicate reads
        const readRecord = await prisma.announcementRead.upsert({
            where: {
                announcementId_userId: {
                    announcementId,
                    userId
                }
            },
            update: {},
            create: {
                announcementId,
                userId
            }
        });

        res.json({ message: 'Marked as read', readRecord });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get read receipts for an announcement
// @route   GET /api/announcements/:id/reads
// @access  Admin
const getReadReceipts = async (req, res) => {
    try {
        const announcementId = req.params.id;

        const reads = await prisma.announcementRead.findMany({
            where: { announcementId },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, employeeId: true } }
            },
            orderBy: { readAt: 'desc' }
        });

        res.json(reads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
    markAsRead,
    getReadReceipts
};
