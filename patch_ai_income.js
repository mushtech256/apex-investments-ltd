const fs = require('fs');
let serverCode = fs.readFileSync('server.js', 'utf8');

const aiIncomeRoute = `
app.get('/api/user/machines', async (req, res) => {
    try {
        const userId = req.query.userId || req.headers['user-id'];
        let query = {};
        if (userId) {
            query = { $or: [{ userId: userId }, { phone: userId }] };
        }
        const machines = await Machine.find(query).sort({ _id: -1 });
        res.json({ success: true, machines: machines || [] });
    } catch (err) {
        console.error("Fetch machines error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/metrics/ai_income', async (req, res) => {
    try {
        const userId = req.query.userId || req.headers['user-id'];
        let query = {};
        if (userId) {
            query = { $or: [{ userId: userId }, { phone: userId }] };
        }
        const machines = await Machine.find(query);
        const totalEarnings = machines.reduce((sum, m) => sum + (m.earnings || m.dailyReturn || 0), 0);
        
        res.json({
            success: true,
            breakdown: {
                machines: totalEarnings,
                count: machines.length,
                items: machines
            }
        });
    } catch (err) {
        console.error("AI income metrics error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});
`;

if (serverCode.includes('/api/metrics/ai_income')) {
    console.log("AI income route already exists.");
} else if (serverCode.includes('app.listen')) {
    const parts = serverCode.split('app.listen');
    serverCode = parts[0] + aiIncomeRoute + '\n\napp.listen' + parts.slice(1).join('app.listen');
    fs.writeFileSync('server.js', serverCode);
    console.log("AI income and machines routes injected successfully!");
} else {
    serverCode += '\n' + aiIncomeRoute;
    fs.writeFileSync('server.js', serverCode);
    console.log("AI income routes appended!");
}
