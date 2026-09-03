const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

const oldRoute = `    user.balance = Number(user.balance) - Number(price);
    user.rigs = user.rigs || [];
    user.rigs.push({
        rigId,
        name: rigName,
        price: Number(price),
        daily_return: Number(daily_return),
        payout: Number(payout),
        cycle: Number(cycle),
        rentedAt: new Date()
    });
    user.markModified('rigs');`;

const newRoute = `    user.balance = Number(user.balance) - Number(price);
    
    const machineData = {
        rigId,
        name: rigName,
        price: Number(price),
        daily_return: Number(daily_return),
        payout: Number(payout),
        cycle: Number(cycle),
        rentedAt: new Date()
    };

    user.rigs = user.rigs || [];
    user.rigs.push(machineData);
    user.markModified('rigs');

    user.machines = user.machines || [];
    user.machines.push(machineData);
    user.markModified('machines');`;

if (server.includes('user.rigs.push')) {
    server = server.replace(oldRoute, newRoute);
    fs.writeFileSync('server.js', server);
    console.log('Successfully updated purchase route to push to both rigs and machines!');
} else {
    console.log('Could not match exact route text, checking alternative...');
}
