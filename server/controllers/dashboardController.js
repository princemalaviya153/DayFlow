const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');

// @desc    Get Admin Dashboard Summary Stats
// @route   GET /api/dashboard/summary
// @access  Private/Admin
const getDashboardSummary = async (req, res) => {
    try {
        // 1. Total Employees
        const totalEmployees = await User.countDocuments({ role: 'Employee' });

        // 2. Present Today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const presentToday = await Attendance.countDocuments({
            date: { $gte: today, $lt: tomorrow },
            status: 'Present'
        });

        // 3. On Leave Today (Approved leaves covering today)
        const onLeaveToday = await Leave.countDocuments({
            status: 'Approved',
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date().setHours(0,0,0,0) } // Be careful with time comparison
        });

        // 4. Payroll Value (Sum of Pending Net Salaries)
        const pendingPayrolls = await Payroll.aggregate([
            { $match: { status: 'Pending' } },
            { $group: { _id: null, totalPending: { $sum: '$netSalary' } } }
        ]);
        
        const totalPayrollPending = pendingPayrolls.length > 0 ? pendingPayrolls[0].totalPending : 0;

        res.json({
            totalEmployees,
            presentToday,
            onLeaveToday,
            totalPayrollPending
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getDashboardSummary };
