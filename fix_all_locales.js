const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace standard variable.toLocaleString() patterns safely
html = html.replace(/([a-zA-Z0-9_\.\?\-\[\]\(\)]+)\.toLocaleString\(\)/g, '($1 || 0).toLocaleString()');

// Fix double parentheses if any were created like ((val || 0))
html = html.replace(/\(\(([^\)]+\|\| 0)\)\)\.toLocaleString\(\)/g, '($1).toLocaleString()');

fs.writeFileSync('index.html', html);
console.log('Successfully patched all toLocaleString calls to be safe from undefined errors!');
