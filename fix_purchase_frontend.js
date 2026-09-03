const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const target = `    currentUser.balance = data.balance;
    currentUser.rigs = data.rigs;
    saveUserData();`;

const replacement = `    currentUser.balance = data.balance;
    currentUser.rigs = data.rigs || [];
    currentUser.machines = data.machines || data.rigs || [];
    saveUserData();`;

if (html.includes('currentUser.rigs = data.rigs;')) {
    html = html.replace(target, replacement);
    fs.writeFileSync('index.html', html);
    console.log('Successfully updated purchase frontend handler in index.html!');
} else {
    console.log('Could not find exact target block.');
}
