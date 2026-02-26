const prisma = require('../config/prisma');

// @desc    Get Admin Dashboard Summary Stats
// @route   GET /api/dashboard/summary
// @access  Private/Admin
const getDashboardSummary = async (req, res) => {
    try {
        // 1. Total Employees
        const totalEmployees = await prisma.user.count({ where: { role: 'Employee' } });

        // 2. Present Today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const presentToday = await prisma.attendance.count({
            where: {
                date: { gte: today, lt: tomorrow },
                status: 'Present'
            }
        });

        // 3. On Leave Today (Approved leaves covering today)
        const onLeaveToday = await prisma.leave.count({
            where: {
                status: 'Approved',
                startDate: { lte: new Date() },
                endDate: { gte: today }
            }
        });

        // 4. Payroll Value (Sum of Pending Net Salaries)
        const pendingPayrolls = await prisma.payroll.aggregate({
            _sum: { netSalary: true },
            where: { status: 'Pending' }
        });

        const totalPayrollPending = pendingPayrolls._sum.netSalary || 0;

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
