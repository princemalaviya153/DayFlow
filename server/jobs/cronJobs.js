const cron = require('node-cron');
const NotificationService = require('../services/NotificationService');
const prisma = require('../config/prisma');

const initCronJobs = () => {
    // Run every day at 09:00 AM server time — Birthday/Anniversary notifications
    cron.schedule('0 9 * * *', async () => {
        console.log('[Cron] Running daily Birthday/Anniversary checks...');
        await NotificationService.notifyBirthdays();
        await NotificationService.notifyWorkAnniversaries();
    });

    // Auto-checkout at 7:00 PM daily (Mon–Fri)
    cron.schedule('0 19 * * 1-5', async () => {
        console.log('[Cron] Running auto-checkout for forgotten check-outs...');
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Find all attendance records for today that have a checkIn but no checkOut
            const uncheckedOut = await prisma.attendance.findMany({
                where: {
                    date: {
                        gte: today,
                        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                    },
                    checkIn: { not: null },
                    checkOut: null
                }
            });

            const checkOutTime = new Date();
            checkOutTime.setHours(19, 0, 0, 0); // 7:00 PM

            for (const record of uncheckedOut) {
                const diff = checkOutTime - new Date(record.checkIn);
                const hours = diff / (1000 * 60 * 60);

                let status = record.status;
                if (hours < 4) {
                    status = 'Half_day';
                }

                await prisma.attendance.update({
                    where: { id: record.id },
                    data: {
                        checkOut: checkOutTime,
                        workHours: parseFloat(hours.toFixed(2)),
                        status
                    }
                });
            }

            console.log(`[Cron] Auto-checkout completed for ${uncheckedOut.length} record(s).`);
        } catch (error) {
            console.error('[Cron] Auto-checkout error:', error.message);
        }
    });

    // Daily absent marking at 11:59 PM (Mon–Fri)
    cron.schedule('59 23 * * 1-5', async () => {
        console.log('[Cron] Running daily absent marking...');
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Get all employees
            const employees = await prisma.user.findMany({
                where: { role: 'Employee' },
                select: { id: true }
            });

            // Get IDs of users who already have an attendance record today
            const presentToday = await prisma.attendance.findMany({
                where: {
                    date: {
                        gte: today,
                        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                    }
                },
                select: { userId: true }
            });

            const presentUserIds = new Set(presentToday.map(r => r.userId));

            // Create absent records for employees who didn't check in
            const absentRecords = employees
                .filter(emp => !presentUserIds.has(emp.id))
                .map(emp => ({
                    userId: emp.id,
                    date: today,
                    status: 'Absent',
                    isLate: false,
                    workHours: 0
                }));

            if (absentRecords.length > 0) {
                await prisma.attendance.createMany({ data: absentRecords });
            }

            console.log(`[Cron] Marked ${absentRecords.length} employee(s) as Absent.`);
        } catch (error) {
            console.error('[Cron] Absent marking error:', error.message);
        }
    });

    console.log('[Cron] Jobs initialized successfully.');
};

module.exports = initCronJobs;

