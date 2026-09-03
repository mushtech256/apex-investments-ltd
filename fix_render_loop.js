const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the raw rigs loop with a deduplicated one around line 254
const target = `currentUser.rigs.forEach(r => {`;
const replacement = `
    const seenRigs = new Set();
    const uniqueActiveRigs = currentUser.rigs.filter(r => {
        const sig = \`\${r.rigId || r.name}_\${r.payout || 5000}_\${r.rentedAt || 'def'}\`;
        if (seenRigs.has(sig)) return false;
        seenRigs.add(sig);
        return true;
    });
    uniqueActiveRigs.forEach(r => {
`;

if (html.includes(target)) {
    html = html.replace(target, replacement);
    fs.writeFileSync('index.html', html);
    console.log('Successfully updated render loop to use unique rigs!');
} else {
    console.log('Target render loop not found.');
}
