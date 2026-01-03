const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const createAdmin = async () => {
    try {
        // Check if admin exists to avoid duplicate error if run multiple times (though we just wiped)
        const userExists = await User.findOne({ email: 'admin@dayflow.com' });
        
        if (userExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        const adminUser = {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@dayflow.com',
            password: 'admin123',
            employeeId: 'ADMIN001',
            role: 'Admin',
            designation: 'System Administrator',
            department: 'IT',
            joinedDate: new Date()
        };

        await User.create(adminUser);

        console.log('Admin User Created Successfully!');
        console.log('Email: admin@dayflow.com');
        console.log('Password: admin123');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
