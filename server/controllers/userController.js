const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

// @desc    Get User Profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true, employeeId: true, email: true, role: true, firstName: true,
                lastName: true, designation: true, department: true, dob: true,
                gender: true, phone: true, address: true, profilePicture: true,
                salaryStructure: true, documents: true, joinedDate: true
            }
        });
        if (user) {
            // Keep Mongoose compatibility for frontend
            res.json({ ...user, _id: user.id });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update User Profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const existingUser = await prisma.user.findUnique({ where: { id: req.user.id } });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const dataToUpdate = {};
        if (req.body.firstName) dataToUpdate.firstName = req.body.firstName;
        if (req.body.lastName) dataToUpdate.lastName = req.body.lastName;
        if (req.body.dob) dataToUpdate.dob = new Date(req.body.dob);
        if (req.body.gender) dataToUpdate.gender = req.body.gender;
        if (req.body.address) dataToUpdate.address = req.body.address;
        if (req.body.phone) dataToUpdate.phone = req.body.phone;
        if (req.body.profilePicture) dataToUpdate.profilePicture = req.body.profilePicture;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            dataToUpdate.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: dataToUpdate
        });

        res.json({
            _id: updatedUser.id,
            employeeId: updatedUser.employeeId,
            email: updatedUser.email,
            role: updatedUser.role,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            phone: updatedUser.phone,
            address: updatedUser.address,
            profilePicture: updatedUser.profilePicture
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get User By ID (Admin View)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true, employeeId: true, email: true, role: true, firstName: true,
                lastName: true, designation: true, department: true, dob: true,
                gender: true, phone: true, address: true, profilePicture: true,
                salaryStructure: true, documents: true, joinedDate: true
            }
        });
        if (user) {
            res.json({ ...user, _id: user.id });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Update User By ID (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUserById = async (req, res) => {
    try {
        const existingUser = await prisma.user.findUnique({ where: { id: req.params.id } });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const dataToUpdate = {};
        if (req.body.firstName) dataToUpdate.firstName = req.body.firstName;
        if (req.body.lastName) dataToUpdate.lastName = req.body.lastName;
        if (req.body.email) dataToUpdate.email = req.body.email;
        if (req.body.role) dataToUpdate.role = req.body.role;
        if (req.body.designation) dataToUpdate.designation = req.body.designation;
        if (req.body.department) dataToUpdate.department = req.body.department;
        if (req.body.phone) dataToUpdate.phone = req.body.phone;
        if (req.body.address) dataToUpdate.address = req.body.address;

        // Handle salaryStructure json dynamically
        if (req.body.salaryStructure) {
            // Merge with existing JSON or overwrite
            dataToUpdate.salaryStructure = req.body.salaryStructure;
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.params.id },
            data: dataToUpdate
        });

        res.json({ ...updatedUser, _id: updatedUser.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserProfile, updateUserProfile, getUserById, updateUserById };
