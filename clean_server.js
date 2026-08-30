const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

// Remove all existing definitions of /api/admin/withdrawals/action and /:id/action to start fresh
server = server.replace(/app\.post\('\/api\/admin\/withdrawals\/([\s\S]*?\}\);\s*\}\);\s*)/g, '');

// Append a single, clean, foolproof route
const cleanRoute = `
// Admin Route: Update Withdrawal Status (Clean & Unified)
app.post('/api/admin/withdrawals/action', async (req, res) => {
  try {
    const { phone, amount, action } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: "Phone number is required." });
    }

    const cleanPhone = String(phone).trim();
    const user = await User.findOne({ 
      $or: [
        { phone_number: cleanPhone },
        { phone: cleanPhone },
        { phone_number: { $regex: cleanPhone.replace('+', '') } }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found for phone: " + cleanPhone });
    }

    if (!user.withdrawals || user.withdrawals.length === 0) {
      return res.status(404).json({ success: false, error: "User has no withdrawal records." });
    }

    // Find matching withdrawal by amount or fallback to the first pending one
    let withdrawal = null;
    if (amount) {
      withdrawal = user.withdrawals.find(w => String(w.amount) === String(amount) && (!w.status || w.status === 'Pending'));
    }
    if (!withdrawal) {
      withdrawal = user.withdrawals.find(w => !w.status || w.status === 'Pending') || user.withdrawals[0];
    }

    withdrawal.status = action === 'approve' ? 'Approved' : 'Rejected';
    await user.save();

    return res.json({ success: true, message: "Withdrawal successfully " + withdrawal.status });
  } catch (err) {
    console.error("Server error in withdrawal action:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});
`;

server += cleanRoute;
fs.writeFileSync('server.js', server);
console.log('server.js cleaned and unified successfully!');
