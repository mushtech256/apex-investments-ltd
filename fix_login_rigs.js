const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

const target = `machines: user.machines || [ ]`;
const replacement = `machines: user.machines || [ ], rigs: user.rigs || []`;

if (server.includes(target) && !server.includes("rigs: user.rigs")) {
    server = server.replace(target, replacement);
    fs.writeFileSync('server.js', server);
    console.log('Successfully patched login response to include rigs!');
} else {
    console.log('Target not found or already patched.');
}
