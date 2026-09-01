const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// The new robust withdrawal action handler supporting both ID and phone lookup
const robustActionRoute = `
app.post('/api/admin/withdrawals/action', async (req, res) => {
  try {
    const { id, phone, amount, action } = req.body;
    console.log("WITHDRAWAL ACTION HIT:", { id, phone, amount, action });

    if (!action) {
      return res.status(400).json({ success: false, error: "Action is required" });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const isApproved = action === 'approve';

    let updated = null;
    if (typeof Withdrawal !== 'undefined') {
      // 1. Try finding by unique ID if provided
      if (id) {
        updated = await Withdrawal.findByIdAndUpdate(
          id,
          { status: newStatus, approved: isApproved },
          { new: true }
        );
      }

      // 2. Fallback to phone and amount query
      if (!updated && phone) {
        let query = { phone: { $regex: phone.replace('+', '') } };
        if (amount) query.amount = Number(amount);
        updated = await Withdrawal.findOneAndUpdate(
          query,
          { status: newStatus, approved: isApproved },
          { sort: { _id: -1 }, new: true }
        );
      }

      // 3. Fallback to phone-only query
      if (!updated && phone) {
        updated = await Withdrawal.findOneAndUpdate(
          { phone: { $regex: phone.replace('+', '') } },
          { status: newStatus, approved: isApproved },
          { sort: { _id: -1 }, new: true }
        );
      }
    }

    if (updated) {
      console.log("SUCCESS: Withdrawal permanently updated to", newStatus);
      return res.json({ success: true, message: \`Withdrawal successfully \${newStatus}\` });
    }

    res.json({ success: false, error: "Withdrawal record not found in database" });
  } catch (err) {
    console.error("Error processing withdrawal action:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
`;

// Replace existing routes or append before app.listen
code = code.replace(/app\.post\(['"]\/api\/admin\/withdrawals\/action['"][\s\S]*?\}\);\s*\}\);/g, '');
code = code.replace(/app\.post\(['"]\/api\/admin\/withdrawals\/action-permanent['"][\s\S]*?\}\);\s*\}\);/g, '');

code = code.replace('app.listen', robustActionRoute + '\n\napp.listen');

fs.writeFileSync('server.js', code);
console.log('server.js updated successfully with robust withdrawal logic!');
