const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Target loop and calculations
const oldCalc = `currentUser.rigs.forEach((r, index) => {
    const rentedTime = new Date(r.rentedAt || now).getTime();

    let daysActive = 0;
    let curr = new Date(rentedTime);
    curr.setHours(6, 0, 0, 0);

    while (curr.getTime() <= now && daysActive < r.cycle) {`;

const newCalc = `currentUser.rigs.forEach((r, index) => {
    // Fallbacks for legacy/old rigs
    r.cycle = r.cycle || 30;
    r.payout = r.payout || r.daily_payout || 5000;
    
    const rentedTime = new Date(r.rentedAt || now).getTime();

    let daysActive = 0;
    let curr = new Date(rentedTime);
    curr.setHours(6, 0, 0, 0);

    while (curr.getTime() <= now && daysActive < r.cycle) {`;

if (html.includes(oldCalc)) {
    html = html.replace(oldCalc, newCalc);
    fs.writeFileSync('index.html', html);
    console.log('Successfully patched index.html with rig math fallbacks!');
} else {
    console.log('Exact block not found, trying broader replacement...');
    // Fallback replacement
    html = html.replace(
        /currentUser\.rigs\.forEach\(\(r,\s*index\)\s*=>\s*\{/,
        `currentUser.rigs.forEach((r, index) => {
    r.cycle = r.cycle || 30;
    r.payout = r.payout || r.daily_payout || 5000;`
    );
    fs.writeFileSync('index.html', html);
    console.log('Broad fallback applied to index.html');
}
