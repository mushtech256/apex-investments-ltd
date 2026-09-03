const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

const target = `user.rigs.push({`;
const replacement = `user.rigs.push({
    rigId,
    name: rigName,
    price: Number(price),
    dailyIncome: Number(daily_return),
    payout: Number(payout),
    cycle: Number(cycle),
    startDate: new Date(),
    status: 'active'
});

user.machines = user.machines || [];
user.machines.push({`;

if (server.includes(target) && !server.includes("user.machines.push")) {
    // Let's replace the push block cleanly
    // Wait, let's look at the exact block in server.js from the image
    console.log('Ready to patch server.js');
}
