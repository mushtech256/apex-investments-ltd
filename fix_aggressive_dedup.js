const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find where user rigs are processed or rendered and wrap the array itself
const target = `let htmlContent = \`<div class="card"><h3 style="color:#38bdf8; margin-bottom:10px;">Active Rigs & Progress</h3>\`;`;

const replacement = `
    // Aggressive deduplication of active rigs by name/rigId
    if (currentUser && currentUser.rigs && Array.isArray(currentUser.rigs)) {
        const uniqueMap = new Map();
        currentUser.rigs.forEach(r => {
            const key = (r.rigId || r.name || 'rig').trim().toLowerCase();
            // Keep the one with the highest progress/accumulated earnings or first seen
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, r);
            }
        });
        currentUser.rigs = Array.from(uniqueMap.values());
    }

    let htmlContent = \`<div class="card"><h3 style="color:#38bdf8; margin-bottom:10px;">Active Rigs & Progress</h3>\`;
`;

if (html.includes(target)) {
    html = html.replace(target, replacement);
    fs.writeFileSync('index.html', html);
    console.log('Successfully added aggressive rig array deduplication!');
} else {
    console.log('Target string for aggressive dedup not found.');
}
