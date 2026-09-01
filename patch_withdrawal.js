const fs = require('fs');
let serverCode = fs.readFileSync('server.js', 'utf8');

// The robust withdrawal route
const robustWithdrawalRoute = `
app.post('/api/admin/withdrawals/update', async (req, res) => {
    try {
        const { id, action, phone } = req.body;
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        
        let query = {};
        if (id) {
            query = { $or: [{ _id: id }, { id: id }] };
        } else if (phone) {
            query = { phone: { $regex: phone.replace('+', ''), $options: 'i' } };
        }

        const updatedWithdrawal = await Withdrawal.findOneAndUpdate(
            query, 
            { $set: { status: newStatus, updatedAt: new Date() } }, 
            { new: true }
        );

        if (!updatedWithdrawal) {
            return res.status(404).json({ success: false, error: "Withdrawal request not found" });
        }

        res.json({ success: true, message: "Withdrawal successfully updated", data: updatedWithdrawal });
    } catch (err) {
        console.error("Withdrawal update error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});
`;

// If an old route exists, replace it, otherwise append it
if (serverCode.includes('/api/admin/withdrawals/update')) {
    console.log("Route already exists, skipping duplicate injection.");
} else if (serverCode.includes('app.listen')) {
    const parts = serverCode.split('app.listen');
    serverCode = parts[0] + robustWithdrawalRoute + '\n\napp.listen' + parts.slice(1).join('app.listen');
    fs.writeFileSync('server.js', serverCode);
    console.log("Withdrawal route added successfully!");
} else {
    serverCode += '\n' + robustWithdrawalRoute;
    fs.writeFileSync('server.js', serverCode);
    console.log("Withdrawal route appended!");
}
