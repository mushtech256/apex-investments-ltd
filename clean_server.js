const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// We will rewrite the withdrawal routes cleanly
const cleanWithdrawalRoutes = `
// ==========================================
// CLEAN WITHDRAWAL ROUTES (Deduplicated)
// ==========================================

// Get All Withdrawals
app.get('/api/admin/withdrawals', async (req, res) => {
  try {
    let allWithdrawals = [];
    if (typeof Withdrawal !== 'undefined') {
      allWithdrawals = await Withdrawal.find().sort({ _id: -1 }).limit(50);
    }
    res.json({ success: true, withdrawals: allWithdrawals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Pending Withdrawals
app.get('/api/admin/withdrawals/pending', async (req, res) => {
  try {
    let pending = [];
    if (typeof Withdrawal !== 'undefined') {
      pending = await Withdrawal.find({ 
        $or: [
          { status: 'pending' },
          { status: { $exists: false } },
          { status: '' },
          { approved: false }
        ]
      }).sort({ _id: -1 });
    }
    res.json({ success: true, withdrawals: pending });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Approve or Reject Withdrawal with Permanent DB Save
app.post('/api/admin/withdrawals/action', async (req, res) => {
  try {
    const { phone, amount, action } = req.body;
    console.log("WITHDRAWAL ACTION HIT:", { phone, amount, action });

    if (!phone || !action) {
      return res.status(400).json({ success: false, error: "Phone and action are required" });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const isApproved = action === 'approve';

    if (typeof Withdrawal !== 'undefined') {
      let query = { phone: { $regex: phone.replace('+', '') } };
      if (amount) {
        query.amount = Number(amount);
      }

      // Find and update the document permanently in MongoDB
      let updated = await Withdrawal.findOneAndUpdate(
        query,
        { status: newStatus, approved: isApproved },
        { sort: { _id: -1 }, new: true }
      );

      if (!updated) {
        // Fallback search by phone only
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
    console.error("Error in withdrawal action:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
`;

// Remove old duplicate blocks if possible or append cleanly before app.listen
// Let's strip out conflicting routes using regex or slice
code = code.replace(/app\.get\(['"]\/api\/admin\/withdrawals['"][\s\S]*?\}\);\s*\}\);/g, '');
code = code.replace(/app\.get\(['"]\/api\/admin\/withdrawals\/pending['"][\s\S]*?\}\);\s*\}\);/g, '');
code = code.replace(/app\.post\(['"]\/api\/admin\/withdrawals\/action['"][\s\S]*?\}\);\s*\}\);/g, '');

// Insert clean routes right before app.listen
code = code.replace('app.listen', cleanWithdrawalRoutes + '\n\napp.listen');

fs.writeFileSync('server.js', code);
console.log('server.js cleaned and deduplicated successfully!');
