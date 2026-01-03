const Attendance = require('../models/Attendance');

// @desc    Check In
// @route   POST /api/attendance/checkin
// @access  Private (Employee)
const checkIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingAttendance = await Attendance.findOne({ 
            user: userId, 
            date: today 
        });

        if (existingAttendance) {
            return res.status(400).json({ message: 'Already checked in today' });
        }

        const attendance = await Attendance.create({
            user: userId,
            date: today,
            checkIn: new Date(),
            status: 'Present'
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

        const attendance = await Attendance.findOne({ 
            user: userId, 
            date: today 
        });

        if (!attendance) {
            return res.status(400).json({ message: 'Not checked in today' });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: 'Already checked out today' });
        }

        attendance.checkOut = new Date();
        
        // Calculate work hours
        const diff = attendance.checkOut - attendance.checkIn;
        const hours = diff / (1000 * 60 * 60);
        attendance.workHours = hours.toFixed(2);

        if (hours < 4) {
            attendance.status = 'Half-day';
        }

        await attendance.save();

        res.json(attendance);
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
        const attendance = await Attendance.find({ user: userId }).sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Attendance (Admin)
// @route   GET /api/attendance/all
// @access  Admin
const getAllAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find()
            .populate('user', 'firstName lastName email employeeId')
            .sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { checkIn, checkOut, getAttendance, getAllAttendance };
