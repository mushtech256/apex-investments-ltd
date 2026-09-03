const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

const cleanupCode = `
// Auto-clean duplicate rigs on server startup
setTimeout(async () => {
    try {
        const users = await User.find({});
        for (let user of users) {
            if (user.rigs && Array.isArray(user.rigs)) {
                const seen = new Set();
                const cleaned = [];
                for (let r of user.rigs) {
                    const sig = (r.rigId || r.name || 'rig') + '_' + (r.payout || r.daily_return || 0);
                    if (!seen.has(sig)) {
                        seen.add(sig);
                        cleaned.push(r);
                    }
                }
                if (cleaned.length !== user.rigs.length) {
                    user.rigs = cleaned;
                    user.markModified('rigs');
                    await user.save();
                    console.log('Auto-cleaned duplicate rigs for user: ' + user.phone_number);
                }
            }
        }
    } catch(e) { console.error('Startup rig cleanup error:', e); }
}, 3000);
`;

// Insert it right after mongoose connection or app initialization
if (!server.includes('Auto-clean duplicate rigs')) {
    server = server + '\n' + cleanupCode;
    fs.writeFileSync('server.js', server);
    console.log('Added startup rig cleanup to server.js!');
}
