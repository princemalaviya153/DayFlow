const prisma = require('../config/prisma');

// @desc    Check In
// @route   POST /api/attendance/checkin
// @access  Private (Employee)
const checkIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if a record already exists for today
        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                userId: userId,
                date: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        // If already genuinely checked in (has a checkIn timestamp), block
        if (existingAttendance && existingAttendance.checkIn) {
            return res.status(400).json({ message: 'Already checked in today' });
        }

        const now = new Date();

        // Late marking: shift starts at 9:30 AM, grace period of 10 mins
        // So if check-in is after 9:40 AM → mark as Late
        const shiftStart = new Date(today);
        shiftStart.setHours(9, 30, 0, 0); // 9:30 AM
        const graceMinutes = 10;
        const lateThreshold = new Date(shiftStart.getTime() + graceMinutes * 60 * 1000); // 9:40 AM

        const isLate = now > lateThreshold;
        const status = isLate ? 'Late' : 'Present';

        let attendance;

        if (existingAttendance) {
            // An Absent record was created by the daily cron — update it
            attendance = await prisma.attendance.update({
                where: { id: existingAttendance.id },
                data: {
                    checkIn: now,
                    status,
                    isLate
                }
            });
        } else {
            // No record yet — create a new one
            attendance = await prisma.attendance.create({
                data: {
                    userId,
                    date: today,
                    checkIn: now,
                    status,
                    isLate
                }
            });
        }

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
