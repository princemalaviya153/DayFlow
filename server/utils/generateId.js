const prisma = require('../config/prisma');

/**
 * Generates an employee ID in the format EMP-YYYY-XXX (e.g., EMP-2026-001)
 * XXX starts at 001 and increments based on existing records for the given year.
 */
const generateEmployeeId = async () => {
    const currentYear = new Date().getFullYear();
    const prefix = `EMP-${currentYear}-`;

    // Find all users with an employeeId that starts with the current year's prefix
    const users = await prisma.user.findMany({
        where: {
            employeeId: {
                startsWith: prefix
            }
        },
        select: {
            employeeId: true
        }
    });

    if (users.length === 0) {
        return `${prefix}001`;
    }

    // Extract the sequence parts and find the maximum
    const sequenceNumbers = users
        .map(user => {
            const parts = user.employeeId.split('-');
            if (parts.length === 3) {
                const num = parseInt(parts[2], 10);
                return isNaN(num) ? 0 : num;
            }
            return 0;
        })
        .filter(num => num > 0);

    const maxSequence = sequenceNumbers.length > 0 ? Math.max(...sequenceNumbers) : 0;
    const nextSequence = maxSequence + 1;

    // Pad with leading zeros to ensure 3 digits
    const paddedSequence = String(nextSequence).padStart(3, '0');

    return `${prefix}${paddedSequence}`;
};

module.exports = { generateEmployeeId };
