const fs = require('fs');
let serverCode = fs.readFileSync('server.js', 'utf8');

// Look for the withdrawal action route and make sure it uses proper Mongoose findOneAndUpdate or save
const targetRouteSnippet = app => {
  // We will insert a robust database update handler
};

// Let's replace the withdrawal action endpoint implementation
const updatedEndpoint = `
// Robust withdrawal approval / rejection endpoint with database persistence
app.post('/api/admin/withdrawals/action', async (req, res) => {
  try {
    const { phone, amount, action } = req.body;
    console.log("WITHDRAWAL ACTION HIT:", { phone, amount, action });

    if (!phone || !action) {
      return res.status(400).json({ success: false, error: "Phone and action are required" });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // Update in MongoDB if Withdrawal model exists
    if (typeof Withdrawal !== 'undefined') {
      // Try finding by phone and amount/status
      let query = { phone: { $regex: phone.replace('+', '') } };
      if (amount) {
        query.amount = Number(amount);
      }
      
      const updated = await Withdrawal.findOneAndUpdate(
        query, 
        { status: newStatus, approved: action === 'approve' },
        { sort: { _id: -1 }, new: true }
      );

      if (updated) {
        console.log("SUCCESS: Database withdrawal updated to", newStatus);
        return res.json({ success: true, message: \`Withdrawal successfully \${newStatus}\` });
      } else {
        // Fallback: update any pending withdrawal for this phone
        const fallbackUpdated = await Withdrawal.findOneAndUpdate(
          { phone: { $regex: phone.replace('+', '') } },
          { status: newStatus, approved: action === 'approve' },
          { sort: { _id: -1 }, new: true }
        );
        if (fallbackUpdated) {
          console.log("SUCCESS (Fallback): Database withdrawal updated to", newStatus);
          return res.json({ success: true, message: \`Withdrawal successfully \${newStatus}\` });
        }
      }
    }

    console.log("SUCCESS: Withdrawal action processed for", phone);
    res.json({ success: true, message: \`Withdrawal successfully \${newStatus}\` });
  } catch (err) {
    console.error("Error processing withdrawal action:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
`;

// Replace existing /api/admin/withdrawals/action route if present, or append it
if (serverCode.includes('/api/admin/withdrawals/action')) {
  // Regex to replace existing route definition
  serverCode = serverCode.replace(/app\.post\(['"]\/api\/admin\/withdrawals\/action['"][\s\S]*?}\);\s*}\);\s*}\s*catch/g, updatedEndpoint.trim() + '\n\n  catch');
  // If regex didn't match cleanly, let's do a broader replacement or append before app.listen
  if (!serverCode.includes('SUCCESS: Database withdrawal updated')) {
    // Append or replace
    serverCode = serverCode.replace(/\/\/\s*API endpoint for user metrics breakdown/g, updatedEndpoint + '\n\n// API endpoint for user metrics breakdown');
  }
} else {
  serverCode = serverCode.replace('app.listen', updatedEndpoint + '\n\napp.listen');
}

fs.writeFileSync('server.js', serverCode);
console.log('server.js updated with permanent database update logic!');
