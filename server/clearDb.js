const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const Payroll = require('./models/Payroll');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const clearData = async () => {
    try {
        await User.deleteMany();
        await Attendance.deleteMany();
        await Leave.deleteMany();
        await Payroll.deleteMany();

        console.log('Data Cleared Successfully!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

clearData();
