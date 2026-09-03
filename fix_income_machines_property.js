const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the data extraction part in the income route to check user.machines or user.rigs
html = html.replace(/const rigs = data\.user\?\.rigs \|\| currentUser\?\.rigs \|\| \[\];/g, "const rigs = data.user?.machines || data.user?.rigs || currentUser?.machines || currentUser?.rigs || [];");
html = html.replace(/currentUser\.rigs/g, "(currentUser.machines || currentUser.rigs)");

fs.writeFileSync('index.html', html);
console.log("Updated income property check to use machines/rigs!");
