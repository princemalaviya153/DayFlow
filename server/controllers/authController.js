const prisma = require('../config/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/email');
const { generateEmployeeId } = require('../utils/generateId');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user (admin only or initial setup)
// @route   POST /api/auth/register
// @access  Public (for now) / Admin
const registerUser = async (req, res) => {
    try {
        const { email, password, firstName, lastName, role } = req.body;

        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newEmployeeId = await generateEmployeeId();

        const user = await prisma.user.create({
            data: {
                employeeId: newEmployeeId,
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: role || 'Employee'
            }
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                employeeId: user.employeeId,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                employeeId: user.employeeId,
                email: user.email,
                role: user.role,
                name: `${user.firstName} ${user.lastName}`,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Token
// @route   GET /api/auth/verify
// @access  Private
const verifyUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, employeeId: true, email: true, role: true, firstName: true, lastName: true }
        });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Return object with _id to maintain frontend compatibility
        res.json({ ...user, _id: user.id });
    } catch (error) {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { email: req.body.email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set it
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 Minutes

        await prisma.user.update({
            where: { email: user.email },
            data: { resetPasswordToken, resetPasswordExpire }
        });

        const frontendUrl = `http://localhost:5173/reset-password/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${frontendUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (error) {
            await prisma.user.update({
                where: { email: user.email },
                data: { resetPasswordToken: null, resetPasswordExpire: null }
            });

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken,
                resetPasswordExpire: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpire: null
            }
        });

        res.status(200).json({
            _id: updatedUser.id,
            employeeId: updatedUser.employeeId,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser.id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, verifyUser, forgotPassword, resetPassword };
