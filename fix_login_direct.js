const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

// Let's find the exact login response and replace it cleanly
const oldLoginRes = `res.json({ message: 'Login successful', user: { id: user._id, phone_number: user.phone_number, balance: user.balance, machines: user.machines || [ ] } });`;

const newLoginRes = `res.json({ message: 'Login successful', user: { id: user._id, phone_number: user.phone_number, balance: user.balance, machines: user.machines || [], rigs: user.rigs || [] } });`;

if (server.includes(oldLoginRes)) {
    server = server.replace(oldLoginRes, newLoginRes);
    fs.writeFileSync('server.js', server);
    console.log('Successfully replaced login response with explicit rigs array!');
} else {
    console.log('Exact string match not found, checking alternative pattern...');
    // Fallback: let's replace any res.json login response
    server = server.replace(
        /res\.json\(\{\s*message:\s*'Login successful',\s*user:\s*\{([^}]+)\}\s*\}\);/,
        "res.json({ message: 'Login successful', user: { id: user._id, phone_number: user.phone_number, balance: user.balance, machines: user.machines || [], rigs: user.rigs || [] } });"
    );
    fs.writeFileSync('server.js', server);
    console.log('Fallback replacement applied.');
}
