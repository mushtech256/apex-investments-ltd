const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetLoop = `currentUser.rigs.forEach((r, index) => {`;
const deduplicatedLoop = `// Deduplicate rigs on render to prevent visual stacking
    const seenRigs = new Set();
    const uniqueActiveRigs = currentUser.rigs.filter(r => {
        const sig = \`\${r.rigId || r.name}_\${r.payout || 5000}_\${r.rentedAt || 'def'}\`;
        if (seenRigs.has(sig)) return false;
        seenRigs.add(sig);
        return true;
    });
    
    uniqueActiveRigs.forEach((r, index) => {`;

if (html.includes(targetLoop)) {
    html = html.replace(targetLoop, deduplicatedLoop);
    fs.writeFileSync('index.html', html);
    console.log('Successfully added client-side deduplication to index.html!');
} else {
    console.log('Target loop not found precisely.');
}
