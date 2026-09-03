const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the hardcoded 30 fallback with proper dynamic fallback from rig properties
const oldBlock = `currentUser.rigs.forEach((r, index) => {
    r.cycle = r.cycle || 30;`;

const newBlock = `currentUser.rigs.forEach((r, index) => {
    r.cycle = r.cycle || r.duration || 30;`;

if (html.includes(oldBlock)) {
    html = html.replace(oldBlock, newBlock);
    fs.writeFileSync('index.html', html);
    console.log('Successfully updated rig cycle fallback!');
} else {
    console.log('Target block not found precisely, let\'s check line 1078.');
}
