const Leave = require('../models/Leave');

// @desc    Apply for Leave
// @route   POST /api/leaves
// @access  Private
const applyLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        // 1. Validate Dates
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ message: 'End date cannot be before start date' });
        }

        // 2. Check for Overlapping Leaves
        const existingLeave = await Leave.findOne({
            user: req.user.id,
            $or: [
                {
                    // Case 1: New start date falls within an existing leave
                    startDate: { $lte: new Date(startDate) },
                    endDate: { $gte: new Date(startDate) }
                },
                {
                    // Case 2: New end date falls within an existing leave
                    startDate: { $lte: new Date(endDate) },
                    endDate: { $gte: new Date(endDate) }
                },
                {
                    // Case 3: New leave completely encompasses an existing leave
                    startDate: { $gte: new Date(startDate) },
                    endDate: { $lte: new Date(endDate) }
                }
            ],
            status: { $ne: 'Rejected' } // Ignore rejected leaves
        });

        if (existingLeave) {
            return res.status(400).json({ message: 'You already have a pending or approved leave for this period' });
        }
        
        const leave = await Leave.create({
            user: req.user.id,
            leaveType,
            startDate,
            endDate,
            reason
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
        const leaves = await Leave.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Leaves (Admin)
// @route   GET /api/leaves/all
// @access  Admin
const getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate('user', 'firstName lastName employeeId')
            .sort({ createdAt: -1 });
        res.json(leaves);
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
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        leave.status = status;
        if (adminComments) leave.adminComments = adminComments;

        await leave.save();
        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus };
