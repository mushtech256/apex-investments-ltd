const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// Instead of risky regex removal, let's just append our clean admin action handler
// under a unique route name or ensure it overrides cleanly.
const newActionRoute = `
// --- PERMANENT WITHDRAWAL ACTION OVERRIDE ---
app.post('/api/admin/withdrawals/action-permanent', async (req, res) => {
  try {
    const { phone, amount, action } = req.body;
    console.log("PERMANENT WITHDRAWAL ACTION HIT:", { phone, amount, action });

    if (!phone || !action) {
      return res.status(400).json({ success: false, error: "Phone and action required" });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const isApproved = action === 'approve';

    if (typeof Withdrawal !== 'undefined') {
      let query = { phone: { $regex: phone.replace('+', '') } };
      if (amount) query.amount = Number(amount);

      let updated = await Withdrawal.findOneAndUpdate(
        query,
        { status: newStatus, approved: isApproved },
        { sort: { _id: -1 }, new: true }
      );

      if (!updated) {
        updated = await Withdrawal.findOneAndUpdate(
          { phone: { $regex: phone.replace('+', '') } },
          { status: newStatus, approved: isApproved },
          { sort: { _id: -1 }, new: true }
        );
      }

      if (updated) {
        console.log("SUCCESS: Withdrawal permanently updated to", newStatus);
        return res.json({ success: true, message: \`Withdrawal successfully \${newStatus}\` });
      }
    }

    res.json({ success: true, message: \`Withdrawal successfully \${newStatus}\` });
  } catch (err) {
    console.error("Permanent withdrawal error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
`;

if (!code.includes('/api/admin/withdrawals/action-permanent')) {
  code = code.replace('app.listen', newActionRoute + '\n\napp.listen');
  fs.writeFileSync('server.js', code);
  console.log('Safe permanent action route appended!');
} else {
  console.log('Route already exists.');
}
