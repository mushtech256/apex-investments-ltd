const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

// Find the push block using a flexible regex
const regex = /user\.rigs\.push\(\s*\{\s*rigId,\s*name:\s*rigName[^}]+\}\s*\);/s;

if (regex.test(server)) {
    const replacement = `
    const existingRig = user.rigs.find(r => r.rigId === rigId && (new Date() - new Date(r.rentedAt || 0) < 60000));
    if (!existingRig) {
        user.rigs.push({
            rigId,
            name: rigName,
            price: Number(price),
            daily_return: Number(daily_return),
            payout: Number(payout),
            cycle: Number(cycle) || 30,
            rentedAt: new Date()
        });
    }
    `;
    server = server.replace(regex, replacement);
    fs.writeFileSync('server.js', server);
    console.log('Successfully patched purchase route with duplicate prevention!');
} else {
    console.log('Target push block not matched by regex.');
}
