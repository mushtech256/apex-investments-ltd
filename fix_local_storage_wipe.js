const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const target = `window.onload = function() {`;
const replacement = `
window.onload = function() {
    // Clear out stale cached rigs with duplicates on load
    try {
        const cached = localStorage.getItem('hut9_active_user');
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.rigs) {
                const uniqueMap = new Map();
                parsed.rigs.forEach(r => {
                    const key = (r.rigId || r.name || 'rig').trim().toLowerCase();
                    if (!uniqueMap.has(key)) uniqueMap.set(key, r);
                });
                parsed.rigs = Array.from(uniqueMap.values());
                localStorage.setItem('hut9_active_user', JSON.stringify(parsed));
            }
        }
    } catch(e) {}
`;

if (html.includes(target)) {
    html = html.replace(target, replacement);
    fs.writeFileSync('index.html', html);
    console.log('Added local storage auto-wipe script!');
} else {
    console.log('Window onload target not found.');
}
