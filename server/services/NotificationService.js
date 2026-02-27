const prisma = require('../config/prisma');
const { Resend } = require('resend');

const resend = new (require('resend').Resend)(process.env.RESEND_API_KEY || 're_dummy_key');

class NotificationService {
    /**
     * Create a new notification (In-app + Email depending on preferences)
     */
    async createNotification({ recipientId, type, title, message, actionUrl, metadata }) {
        try {
            // Check preferences
            let pref = await prisma.notificationPreference.findUnique({
                where: {
                    employeeId_notificationType: {
                        employeeId: recipientId,
                        notificationType: type
                    }
                }
            });

            // Default to true if no preference is explicitly set
            const inAppEnabled = pref ? pref.inAppEnabled : true;
            const emailEnabled = pref ? pref.emailEnabled : true;

            // 1. In-App Notification
            if (inAppEnabled) {
                await prisma.notification.create({
                    data: {
                        recipientId,
                        type,
                        title,
                        message,
                        actionUrl,
                        metadata: metadata || {}
                    }
                });
            }

            // 2. Email Notification
            if (emailEnabled) {
                const user = await prisma.user.findUnique({ where: { id: recipientId } });
                if (user && user.email) {
                    await this.sendEmail(user.email, title, message, actionUrl);
                }
            }
        } catch (error) {
            console.error('[NotificationService.createNotification] Error:', error.message);
        }
    }

    /**
     * Send email using Resend
     */
    async sendEmail(to, subject, text, actionUrl = null) {
        try {
            if (!process.env.RESEND_API_KEY) {
                console.log(`[Email Skipped] Missing RESEND_API_KEY. To: ${to} | Subject: ${subject}`);
                return;
            }

            const html = `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>${subject}</h2>
                    <p>${text}</p>
                    ${actionUrl ? `<a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}${actionUrl}" style="display:inline-block; padding: 10px 15px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Details</a>` : ''}
                </div>
            `;

            await resend.emails.send({
                from: 'Dayflow HRMS <noreply@resend.dev>', // Update this for production
                to,
                subject,
                html
            });
            console.log(`[Email Sent] To: ${to} | Subject: ${subject}`);
        } catch (error) {
            console.error('[NotificationService.sendEmail] Error:', error.message);
        }
    }

    // Specific triggers
    async notifyLeaveUpdate(leave, status) {
        const title = `Leave Request ${status}`;
        const message = `Your leave request for ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been ${status.toLowerCase()}.`;

        await this.createNotification({
            recipientId: leave.userId,
            type: 'LEAVE_UPDATE',
            title,
            message,
            actionUrl: '/leave',
            metadata: { leaveId: leave.id, status }
        });
    }

    // Example methods for cron jobs
    async notifyBirthdays() {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Find users born on this day and month
        const users = await prisma.user.findMany();
        const birthdayUsers = users.filter(user => {
            if (!user.dob) return false;
            const dob = new Date(user.dob);
            return dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();
        });

        for (const user of birthdayUsers) {
            await this.createNotification({
                recipientId: user.id,
                type: 'BIRTHDAY',
                title: 'Happy Birthday!',
                message: `Wishing you a fantastic birthday, ${user.firstName}! 🎉`,
                actionUrl: '/profile'
            });
        }
    }

    async notifyWorkAnniversaries() {
        const today = new Date();
        const users = await prisma.user.findMany();

        const anniversaryUsers = users.filter(user => {
            if (!user.joinedDate) return false;
            const joined = new Date(user.joinedDate);
            return joined.getDate() === today.getDate() &&
                joined.getMonth() === today.getMonth() &&
                joined.getFullYear() < today.getFullYear();
        });

        for (const user of anniversaryUsers) {
            const years = today.getFullYear() - new Date(user.joinedDate).getFullYear();
            await this.createNotification({
                recipientId: user.id,
                type: 'ANNIVERSARY',
                title: 'Happy Work Anniversary!',
                message: `Congratulations on ${years} year(s) with Dayflow, ${user.firstName}! 💼`,
                actionUrl: '/profile'
            });
        }
    }
}

module.exports = new NotificationService();
