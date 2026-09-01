const fs = require('fs');
let serverCode = fs.readFileSync('server.js', 'utf8');

const purchaseRoute = `
app.post('/api/rigs/purchase', async (req, res) => {
    try {
        const { phone_number, rigId, rigName, price, daily_return, payout, cycle } = req.body;
        
        if (!phone_number || !price) {
            return res.status(400).json({ success: false, error: "Phone number and price are required" });
        }

        // Find user by phone
        let user = await User.findOne({ $or: [{ phone: { $regex: phone_number.replace('+', ''), $options: 'i' } }, { phone_number: { $regex: phone_number.replace('+', ''), $options: 'i' } }] });
        
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        if ((user.balance || 0) < price) {
            return res.status(400).json({ success: false, error: "Insufficient balance" });
        }

        // Deduct balance and save
        user.balance -= price;
        await user.save();

        // Create purchased machine record
        const newMachine = new Machine({
            userId: user._id,
            phone: user.phone || phone_number,
            rigId: rigId,
            rigName: rigName,
            price: price,
            daily_return: daily_return,
            payout: payout,
            cycle: cycle || 30,
            status: 'active',
            createdAt: new Date()
        });
        await newMachine.save();

        res.json({ success: true, message: "Machine rented successfully!", balance: user.balance, machine: newMachine });
    } catch (err) {
        console.error("Purchase error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});
`;

if (serverCode.includes('/api/rigs/purchase')) {
    console.log("Purchase route already exists.");
} else if (serverCode.includes('app.listen')) {
    const parts = serverCode.split('app.listen');
    serverCode = parts[0] + purchaseRoute + '\n\napp.listen' + parts.slice(1).join('app.listen');
    fs.writeFileSync('server.js', serverCode);
    console.log("Purchase route injected successfully!");
} else {
    serverCode += '\n' + purchaseRoute;
    fs.writeFileSync('server.js', serverCode);
    console.log("Purchase route appended!");
}
