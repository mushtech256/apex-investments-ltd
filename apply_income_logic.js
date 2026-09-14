const fs = require('fs');

// 1. Add the /api/user/claim-income endpoint to server.js if not already present
let serverCode = fs.readFileSync('server.js', 'utf8');
const claimRoute = `
// Claim income endpoint
app.post('/api/user/claim-income', async (req, res) => {
    try {
        const { phone, rigIndex } = req.body;
        let user = await User.findOne({ phone_number: phone });
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        if (!user.rigs || !user.rigs[rigIndex]) return res.status(400).json({ success: false, error: 'Rig not found' });

        const rig = user.rigs[rigIndex];
        const totalEarnings = (rig.payout || 0) * (rig.cycle || 0);

        user.balance = Number(user.balance || 0) + totalEarnings;
        user.rigs.splice(rigIndex, 1);
        user.markModified('rigs');
        user.markModified('balance');
        await user.save();

        res.json({ success: true, newBalance: user.balance });
    } catch (err) {
        console.error('Claim error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});
`;

if (!serverCode.includes('/api/user/claim-income')) {
    serverCode += claimRoute;
    fs.writeFileSync('server.js', serverCode);
    console.log("Added claim endpoint to server.js");
}

console.log("Backend check complete.");
