const User = require('../models/User');

// @desc    Get User Profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            res.json(user);
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
        const user = await User.findById(req.user.id);

        if (user) {
            // Employee can edit: Name, DOB, Gender, Address, Phone, Profile Picture
            if (req.body.firstName) user.firstName = req.body.firstName;
            if (req.body.lastName) user.lastName = req.body.lastName;
            if (req.body.dob) user.dob = req.body.dob;
            if (req.body.gender) user.gender = req.body.gender;
            if (req.body.address) user.address = req.body.address;
            if (req.body.phone) user.phone = req.body.phone;
            if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;

            // Admin can edit all (handled via different route usually, but flexible here)
            // But requirement says "Admin can edit all fields" -> likely via "Edit Employee" modal in Admin view.
            // This endpoint is for "My Profile" mostly.
            
            // Password change logic (Optional/Basic)
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                employeeId: updatedUser.employeeId,
                email: updatedUser.email,
                role: updatedUser.role,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                phone: updatedUser.phone,
                address: updatedUser.address,
                profilePicture: updatedUser.profilePicture
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
};

// @desc    Get User By ID (Admin View)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
     try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
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
        const user = await User.findById(req.params.id);

        if (user) {
            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            user.designation = req.body.designation || user.designation;
            user.department = req.body.department || user.department;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            user.salaryStructure = req.body.salaryStructure || user.salaryStructure;

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserProfile, updateUserProfile, getUserById, updateUserById };
