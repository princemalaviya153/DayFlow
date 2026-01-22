const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1) Create a transporter
    // For Dev: Use ethereal or just log if no creds
    // For Prod: Use real service (SendGrid, Mailgun, or Gmail)
    
    // Using a basic setup. User needs to provide env vars for this to work fully.
    // If no env vars, we'll just log the message for dev purposes.
    
    if (!process.env.EMAIL_HOST) {
        console.log("Mock Email Sent:");
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: 'Dayflow HRMS <no-reply@dayflow.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html 
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
