const bcrypt = require('bcryptjs');
const hash = '$2b$10$t3uY79j/L8tqYvK6.1KjPeE6XUu4oH9YlT/8YlQp9X3v6K/B3j3m6';
async function test() {
    const result = await bcrypt.compare('admin123', hash);
    console.log('admin123 matches:', result);
    const result2 = await bcrypt.compare('password', hash);
    console.log('password matches:', result2);
}
test();
