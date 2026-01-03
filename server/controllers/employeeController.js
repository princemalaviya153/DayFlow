const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Admin
const getEmployees = async (req, res) => {
    try {
        const employees = await User.find({ role: 'Employee' }).select('-password');
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new employee
// @route   POST /api/employees
// @access  Admin
const addEmployee = async (req, res) => {
    try {
        const { employeeId, email, password, firstName, lastName, designation, department, phone, address } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            employeeId,
            email,
            password,
            firstName,
            lastName,
            role: 'Employee',
            designation,
            department,
            phone,
            address
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                employeeId: user.employeeId,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getEmployees, addEmployee };
