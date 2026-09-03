const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

const target = `    user.rigs.push({
        rigId,
        name: rigName,
        price: Number(price),
        daily_return: Number(daily_return),
        payout: Number(payout),
        cycle: Number(cycle),
        rentedAt: new Date()
    });
    });`;

const replacement = `    user.rigs.push({
        rigId,
        name: rigName,
        price: Number(price),
        daily_return: Number(daily_return),
        payout: Number(payout),
        cycle: Number(cycle),
        rentedAt: new Date()
    });
    user.markModified('rigs');`;

if (server.includes('user.rigs.push')) {
    // Replace by adding markModified right after push
    server = server.replace(
        /user\.rigs\.push\(\{([^}]+)\}\);/,
        `user.rigs.push({$1});\n    user.markModified('rigs');`
    );
    fs.writeFileSync('server.js', server);
    console.log('Successfully added user.markModified("rigs") to server.js!');
} else {
    console.log('Could not find push block precisely.');
}
