const prisma = require('../config/prisma');
const NotificationService = require('../services/NotificationService');

// @desc    Apply for Leave
// @route   POST /api/leaves
// @access  Private
const applyLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return res.status(400).json({ message: 'End date cannot be before start date' });
        }

        // Check for overlapping leaves
        const existingLeave = await prisma.leave.findFirst({
            where: {
                userId: req.user.id,
                status: { not: 'Rejected' },
                OR: [
                    {
                        startDate: { lte: start },
                        endDate: { gte: start }
                    },
                    {
                        startDate: { lte: end },
                        endDate: { gte: end }
                    },
                    {
                        startDate: { gte: start },
                        endDate: { lte: end }
                    }
                ]
            }
        });

        if (existingLeave) {
            return res.status(400).json({ message: 'You already have a pending or approved leave for this period' });
        }

        const leave = await prisma.leave.create({
            data: {
                userId: req.user.id,
                leaveType,
                startDate: start,
                endDate: end,
                reason,
                status: 'Pending'
            }
        });

        res.status(201).json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get My Leaves
// @route   GET /api/leaves
// @access  Private
const getMyLeaves = async (req, res) => {
    try {
        const leaves = await prisma.leave.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });

        // Provide compatibility with mongoose _id
        res.json(leaves.map(l => ({ ...l, _id: l.id })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Leaves (Admin)
// @route   GET /api/leaves/all
// @access  Admin
const getAllLeaves = async (req, res) => {
    try {
        const leaves = await prisma.leave.findMany({
            include: {
                user: {
                    select: { firstName: true, lastName: true, employeeId: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(leaves.map(l => ({ ...l, _id: l.id })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Leave Status
// @route   PUT /api/leaves/:id
// @access  Admin
const updateLeaveStatus = async (req, res) => {
    try {
        const { status, adminComments } = req.body;

        const existingLeave = await prisma.leave.findUnique({ where: { id: req.params.id } });

        if (!existingLeave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        const updatedLeave = await prisma.leave.update({
            where: { id: req.params.id },
            data: {
                status,
                adminComments: adminComments || existingLeave.adminComments
            }
        });

        // Trigger notification
        if (status !== existingLeave.status) {
            await NotificationService.notifyLeaveUpdate(updatedLeave, status);
        }

        res.json({ ...updatedLeave, _id: updatedLeave.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus };
