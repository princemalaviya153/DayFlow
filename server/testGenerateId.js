const { generateEmployeeId } = require('./utils/generateId');

async function test() {
    console.log("Testing generation...");
    const nextId = await generateEmployeeId();
    console.log("Next Employee ID:", nextId);
    process.exit();
}
test();
