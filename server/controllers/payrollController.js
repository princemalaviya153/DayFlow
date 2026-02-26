const prisma = require('../config/prisma');

// @desc    Generate Payslip
// @route   POST /api/payroll
// @access  Admin
const generatePayslip = async (req, res) => {
    try {
        const { employeeId, month, basicSalary, allowances, deductions } = req.body;

        const user = await prisma.user.findUnique({ where: { employeeId } });
        if (!user) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const netSalary = Number(basicSalary) + Number(allowances || 0) - Number(deductions || 0);

        const payroll = await prisma.payroll.create({
            data: {
                userId: user.id,
                month,
                basicSalary: Number(basicSalary),
                allowances: Number(allowances || 0),
                deductions: Number(deductions || 0),
                netSalary
            }
        });

        res.status(201).json(payroll);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get My Payslips
// @route   GET /api/payroll
// @access  Private
const getMyPayslips = async (req, res) => {
    try {
        const payslips = await prisma.payroll.findMany({
            where: { userId: req.user.id },
            include: { user: { select: { firstName: true, lastName: true, employeeId: true, role: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(payslips.map(p => ({ ...p, _id: p.id })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Payrolls (Admin)
// @route   GET /api/payroll/all
// @access  Admin
const getAllPayrolls = async (req, res) => {
    try {
        const payrolls = await prisma.payroll.findMany({
            include: { user: { select: { firstName: true, lastName: true, employeeId: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(payrolls.map(p => ({ ...p, _id: p.id })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Payroll Status
// @route   PUT /api/payroll/:id
// @access  Admin
const updatePayrollStatus = async (req, res) => {
    try {
        const existingPayroll = await prisma.payroll.findUnique({ where: { id: req.params.id } });

        if (existingPayroll) {
            const status = req.body.status || existingPayroll.status;
            let paidDate = existingPayroll.paidDate;

            if (req.body.status === 'Paid' && existingPayroll.status !== 'Paid') {
                paidDate = new Date();
            }

            const updatedPayroll = await prisma.payroll.update({
                where: { id: req.params.id },
                data: { status, paidDate }
            });

            res.json({ ...updatedPayroll, _id: updatedPayroll.id });
        } else {
            res.status(404).json({ message: 'Payroll record not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Payroll
// @route   DELETE /api/payroll/:id
// @access  Admin
const deletePayroll = async (req, res) => {
    try {
        const payroll = await prisma.payroll.findUnique({ where: { id: req.params.id } });

        if (payroll) {
            await prisma.payroll.delete({ where: { id: req.params.id } });
            res.json({ message: 'Payroll record removed' });
        } else {
            res.status(404).json({ message: 'Payroll record not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generatePayslip, getMyPayslips, getAllPayrolls, updatePayrollStatus, deletePayroll };
