const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();

        const users = [
            {
                employeeId: 'ADMIN001',
                email: 'admin@dayflow.com',
                password: 'adminpassword',
                firstName: 'Admin',
                lastName: 'User',
                role: 'Admin',
                department: 'HR',
                designation: 'HR Manager'
            },
            {
                employeeId: 'EMP001',
                email: 'employee@dayflow.com',
                password: 'employeepassword',
                firstName: 'John',
                lastName: 'Doe',
                role: 'Employee',
                department: 'Engineering',
                designation: 'Software Engineer'
            },
        ];

        await User.insertMany(users); // Passwords will be hashed by pre-save hook?
        // Wait, insertMany DOES trigger middleware if we set options, but by default it might NOT. 
        // Actually Mongoose 5.x+ insertMany validates but might skip hooks depending on config.
        // It's safer to create one by one loop to ensure pre-save hook runs for password hashing.
        
        // Let's redo with create
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const importDataSafe = async () => {
     try {
        await User.deleteMany();

        const users = [
             {
                employeeId: 'ADMIN001',
                email: 'admin@dayflow.com',
                password: 'adminpassword',
                firstName: 'Admin',
                lastName: 'User',
                role: 'Admin',
                department: 'HR',
                designation: 'HR Manager'
            },
            {
                employeeId: 'EMP001',
                email: 'employee@dayflow.com',
                password: 'employeepassword',
                firstName: 'John',
                lastName: 'Doe',
                role: 'Employee',
                department: 'Engineering',
                designation: 'Software Engineer'
            }
        ];

        for (const user of users) {
            await User.create(user);
        }

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
}

importDataSafe();
