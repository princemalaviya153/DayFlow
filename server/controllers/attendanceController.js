const prisma = require('../config/prisma');

// @desc    Check In
// @route   POST /api/attendance/checkin
// @access  Private (Employee)
const checkIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already checked in today
        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                userId: userId,
                date: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        if (existingAttendance) {
            return res.status(400).json({ message: 'Already checked in today' });
        }

        const attendance = await prisma.attendance.create({
            data: {
                userId,
                date: today,
                checkIn: new Date(),
                status: 'Present' // from enum
            }
        });

        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check Out
// @route   PUT /api/attendance/checkout
// @access  Private (Employee)
const checkOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await prisma.attendance.findFirst({
            where: {
                userId: userId,
                date: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        if (!attendance) {
            return res.status(400).json({ message: 'Not checked in today' });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: 'Already checked out today' });
        }

        const checkOutTime = new Date();
        const diff = checkOutTime - new Date(attendance.checkIn);
        const hours = diff / (1000 * 60 * 60);

        let status = attendance.status;
        if (hours < 4) {
            status = 'Half_day';
        }

        const updatedAttendance = await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                checkOut: checkOutTime,
                workHours: parseFloat(hours.toFixed(2)),
                status
            }
        });

        res.json(updatedAttendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Attendance History
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
    try {
        const userId = req.user.id;
        const attendances = await prisma.attendance.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        });
        res.json(attendances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Attendance (Admin)
// @route   GET /api/attendance/all
// @access  Admin
const getAllAttendance = async (req, res) => {
    try {
        const attendances = await prisma.attendance.findMany({
            include: {
                user: {
                    select: { firstName: true, lastName: true, email: true, employeeId: true }
                }
            },
            orderBy: { date: 'desc' }
        });

        // Map so user.firstName matches what frontend expects for mongoose populate
        res.json(attendances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { checkIn, checkOut, getAttendance, getAllAttendance };
