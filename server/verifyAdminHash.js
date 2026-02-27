const prisma = require('./config/prisma');
const bcrypt = require('bcryptjs');

async function test() {
    const user = await prisma.user.findUnique({ where: { email: 'admin@dayflow.com' } });
    if (user) {
        const isMatch = await bcrypt.compare('admin123', user.password);
        console.log(`Password matches admin123: ${isMatch}`);
        const isMatch2 = await bcrypt.compare('password', user.password);
        console.log(`Password matches password: ${isMatch2}`);
    } else {
        console.log('User not found');
    }
    process.exit();
}
test();
