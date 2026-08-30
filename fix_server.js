const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

const newServerRoute = `
// Admin Route: Update Withdrawal Status by Phone and Amount
app.post('/api/admin/withdrawals/action', async (req, res) => {
  try {
    const { phone, amount, action } = req.body;
    
    // Find user by phone number
    const user = await User.findOne({ 
      $or: [
        { phone_number: phone },
        { phone: phone }
      ]
    });

    if (!user || !user.withdrawals) {
      return res.status(404).json({ error: "User or withdrawals not found." });
    }

    // Find the pending withdrawal matching the amount
    const withdrawal = user.withdrawals.find(w => String(w.amount) === String(amount) && (!w.status || w.status === 'Pending'));

    if (!withdrawal) {
      // Fallback: just grab the first pending one if exact amount match is tricky
      const fallback = user.withdrawals.find(w => !w.status || w.status === 'Pending');
      if (!fallback) {
        return res.status(404).json({ error: "No pending withdrawal found for this user." });
      }
      fallback.status = action === "approve" ? "Approved" : "Rejected";
      await user.save();
      return res.json({ success: true, message: "Withdrawal " + fallback.status });
    }

    withdrawal.status = action === "approve" ? "Approved" : "Rejected";
    await user.save();

    res.json({ success: true, message: "Withdrawal " + withdrawal.status });
  } catch (err) {
    console.error("Error processing withdrawal action:", err);
    res.status(500).json({ error: "Server error processing withdrawal action" });
  }
});
`;

// Append or replace route in server.js
if (server.includes("/api/admin/withdrawals/action")) {
  server = server.replace(/\/\/ Admin Route: Update Withdrawal Status by Phone[\s\S]*?\}\);\s*\}\);\s*/, newServerRoute);
} else {
  server += newServerRoute;
}

fs.writeFileSync('server.js', server);
console.log('server.js updated with phone/amount action route!');
