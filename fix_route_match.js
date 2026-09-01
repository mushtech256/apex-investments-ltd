const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// Add the exact route format the frontend is calling: /api/admin/withdrawals/:id/action
const exactActionRoute = `
app.post('/api/admin/withdrawals/:id/action', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, phone, amount } = req.body;
    console.log("EXACT ID WITHDRAWAL ACTION HIT:", { id, action, phone });

    if (!action) {
      return res.status(400).json({ success: false, error: "Action is required" });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const isApproved = action === 'approve';

    let updated = null;
    if (typeof Withdrawal !== 'undefined') {
      // 1. Update directly by the unique MongoDB _id from params
      if (id && id !== 'undefined' && id !== 'null') {
        updated = await Withdrawal.findByIdAndUpdate(
          id,
          { status: newStatus, approved: isApproved },
          { new: true }
        );
      }

      // 2. Fallback to phone search if id fails
      if (!updated && phone) {
        let query = { phone: { $regex: phone.replace('+', '') } };
        if (amount) query.amount = Number(amount);
        updated = await Withdrawal.findOneAndUpdate(
          query,
          { status: newStatus, approved: isApproved },
          { sort: { _id: -1 }, new: true }
        );
      }
    }

    if (updated) {
      console.log("SUCCESS: Withdrawal permanently updated to", newStatus);
      return res.json({ success: true, message: \`Withdrawal successfully \${newStatus}\` });
    }

    res.status(404).json({ success: false, error: "Withdrawal record not found in database" });
  } catch (err) {
    console.error("Error processing withdrawal action:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
`;

// Remove older conflicting action routes
code = code.replace(/app\.post\(['"]\/api\/admin\/withdrawals\/action['"][\s\S]*?\}\);\s*\}\);/g, '');
code = code.replace(/app\.post\(['"]\/api\/admin\/withdrawals\/action-permanent['"][\s\S]*?\}\);\s*\}\);/g, '');
code = code.replace(/app\.post\(['"]\/api\/admin\/withdrawals\/:id\/action['"][\s\S]*?\}\);\s*\}\);/g, '');

// Append right before app.listen
code = code.replace('app.listen', exactActionRoute + '\n\napp.listen');

fs.writeFileSync('server.js', code);
console.log('server.js updated with exact route /api/admin/withdrawals/:id/action!');
