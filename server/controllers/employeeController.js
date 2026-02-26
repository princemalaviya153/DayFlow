const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Admin
const getEmployees = async (req, res) => {
    try {
        const employees = await prisma.user.findMany({
            where: { role: 'Employee' },
            select: {
                id: true, employeeId: true, email: true, role: true, firstName: true,
                lastName: true, designation: true, department: true, dob: true,
                gender: true, phone: true, address: true, profilePicture: true,
                salaryStructure: true, documents: true, joinedDate: true
            }
        });

        // Append _id for compatibility
        const mappedEmployees = employees.map(emp => ({ ...emp, _id: emp.id }));
        res.json(mappedEmployees);
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

        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                employeeId,
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: 'Employee',
                designation,
                department,
                phone,
                address
            }
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
