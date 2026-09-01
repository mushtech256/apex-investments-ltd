const fs = require('fs');
let serverCode = fs.readFileSync('server.js', 'utf8');

const endpointCode = `
// API endpoint for user metrics breakdown modals
app.get('/api/user/metrics-breakdown', async (req, res) => {
  try {
    const type = req.query.type;
    // In a real app, user phone/session is checked. Here we aggregate or retrieve stored records.
    // Let's grab pending/approved withdrawals from storage or memory models
    let withdrawals = [];
    let deposits = [];
    
    // Check if models exist
    if (typeof Withdrawal !== 'undefined') {
      withdrawals = await Withdrawal.find().sort({ _id: -1 }).limit(20);
    }
    if (typeof Deposit !== 'undefined') {
      deposits = await Deposit.find().sort({ _id: -1 }).limit(20);
    }

    if (type === 'deposit') {
      res.json({ success: true, items: deposits.length > 0 ? deposits : [{ amount: 0, date: 'No deposits yet' }] });
    } else if (type === 'withdraw') {
      res.json({ success: true, items: withdrawals.length > 0 ? withdrawals : [] });
    } else if (type === 'ai_income') {
      res.json({ 
        success: true, 
        breakdown: { machines: 12500, bonus: 5000, referrals: 3000 } 
      });
    } else if (type === 'daily_earnings') {
      res.json({ 
        success: true, 
        machines: [
          { name: 'Hut 9 AI Miner V1', dailyYield: 4500 },
          { name: 'Hut 9 Pro Miner V2', dailyYield: 8000 }
        ] 
      });
    } else {
      res.status(400).json({ success: false, error: 'Invalid type' });
    }
  } catch (err) {
    console.error("Metrics breakdown error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
`;

if (!serverCode.includes('/api/user/metrics-breakdown')) {
  serverCode = serverCode.replace('app.listen', endpointCode + '\n\napp.listen');
  fs.writeFileSync('server.js', serverCode);
  console.log('Metrics breakdown endpoint added to server.js!');
} else {
  console.log('Metrics breakdown endpoint already exists in server.js.');
}
