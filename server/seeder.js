const prisma = require('./config/prisma');
const bcrypt = require('bcryptjs');

const importDataSafe = async () => {
    try {
        // Clear existing data
        await prisma.attendance.deleteMany();
        await prisma.leave.deleteMany();
        await prisma.payroll.deleteMany();
        await prisma.user.deleteMany();

        console.log('Existing data cleared.');

        const salt = await bcrypt.genSalt(10);
        // Using passwords from the old README: admin123
        const adminPassword = await bcrypt.hash('admin123', salt);
        const employeePassword = await bcrypt.hash('employee123', salt);

        const users = [
            {
                employeeId: 'ADMIN001',
                email: 'admin@dayflow.com',
                password: adminPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'Admin',
                department: 'HR',
                designation: 'HR Manager'
            },
            {
                employeeId: 'EMP001',
                email: 'employee@dayflow.com',
                password: employeePassword,
                firstName: 'John',
                lastName: 'Doe',
                role: 'Employee',
                department: 'Engineering',
                designation: 'Software Engineer'
            }
        ];

        for (const user of users) {
            await prisma.user.create({ data: user });
        }

        console.log('Data Imported successfully into Supabase!');
        process.exit(0);
    } catch (error) {
        console.error(`Error during seeding: ${error}`);
        process.exit(1);
    }
}

importDataSafe();
