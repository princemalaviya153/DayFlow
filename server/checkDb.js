const prisma = require('./config/prisma');

async function check() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:", users);
  process.exit();
}
check();
