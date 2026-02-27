const cron = require('node-cron');
const NotificationService = require('../services/NotificationService');

const initCronJobs = () => {
    // Run every day at 09:00 AM server time
    cron.schedule('0 9 * * *', async () => {
        console.log('[Cron] Running daily Birthday/Anniversary checks...');
        await NotificationService.notifyBirthdays();
        await NotificationService.notifyWorkAnniversaries();
    });

    console.log('[Cron] Jobs initialized successfully.');
};

module.exports = initCronJobs;
