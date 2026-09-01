const fs = require('fs');
let serverCode = fs.readFileSync('server.js', 'utf8');

// Ensure the pending withdrawals API filters out approved/rejected ones
const pendingRouteCode = `
app.get('/api/admin/withdrawals/pending', async (req, res) => {
  try {
    let pending = [];
    if (typeof Withdrawal !== 'undefined') {
      pending = await Withdrawal.find({ 
        $or: [
          { status: { $exists: false } },
          { status: 'pending' },
          { status: '' },
          { approved: false }
        ]
      }).sort({ _id: -1 });
    }
    res.json({ success: true, withdrawals: pending });
  } catch (err) {
    console.error("Error fetching pending withdrawals:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
`;

if (!serverCode.includes('/api/admin/withdrawals/pending')) {
  serverCode = serverCode.replace('app.listen', pendingRouteCode + '\n\napp.listen');
} else {
  // Replace existing pending fetch route to ensure it filters correctly
  serverCode = serverCode.replace(/app\.get\(['"]\/api\/admin\/withdrawals\/pending['"][\s\S]*?\}\);\s*\}/g, pendingRouteCode.trim());
}

fs.writeFileSync('server.js', serverCode);
console.log('Pending withdrawals query route secured!');
