const Payroll = require('../models/Payroll');
const User = require('../models/User');

// @desc    Generate Payslip
// @route   POST /api/payroll
// @access  Admin
const generatePayslip = async (req, res) => {
    try {
        const { employeeId, month, basicSalary, allowances, deductions } = req.body;

        const user = await User.findOne({ employeeId });
        if (!user) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const netSalary = Number(basicSalary) + Number(allowances) - Number(deductions);

        const payroll = await Payroll.create({
            user: user._id,
            month,
            basicSalary,
            allowances,
            deductions,
            netSalary
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
        const payslips = await Payroll.find({ user: req.user.id })
            .populate('user', 'firstName lastName employeeId role')
            .sort({ createdAt: -1 });
        res.json(payslips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Payrolls (Admin)
// @route   GET /api/payroll/all
// @access  Admin
const getAllPayrolls = async (req, res) => {
    try {
        const payrolls = await Payroll.find()
            .populate('user', 'firstName lastName employeeId')
            .sort({ createdAt: -1 });
        res.json(payrolls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Payroll Status
// @route   PUT /api/payroll/:id
// @access  Admin
const updatePayrollStatus = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id);
        if (payroll) {
            payroll.status = req.body.status || payroll.status; // e.g. 'Paid'
            if (req.body.status === 'Paid') {
                payroll.paidDate = Date.now();
            }
            const updatedPayroll = await payroll.save();
            res.json(updatedPayroll);
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
        const payroll = await Payroll.findById(req.params.id);
        if (payroll) {
            await payroll.deleteOne();
            res.json({ message: 'Payroll record removed' });
        } else {
            res.status(404).json({ message: 'Payroll record not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generatePayslip, getMyPayslips, getAllPayrolls, updatePayrollStatus, deletePayroll };
