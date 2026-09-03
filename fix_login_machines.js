const fs = require('fs');
let serverCode = fs.readFileSync('server.js', 'utf8');

const target = "user: { id: user._id, phone_number: user.phone_number, balance: user.balance }";
const replacement = "user: { id: user._id, phone_number: user.phone_number, balance: user.balance, machines: user.machines || [] }";

if (serverCode.includes(target)) {
    serverCode = serverCode.replace(target, replacement);
    fs.writeFileSync('server.js', serverCode);
    console.log('Successfully updated login response to include machines!');
} else {
    console.log('Target line not found, checking alternative pattern...');
}
