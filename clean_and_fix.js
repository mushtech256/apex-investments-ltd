const fs = require('fs');

let server = fs.readFileSync('server.js', 'utf8');

// Split into lines and remove any old duplicate/broken withdrawal action blocks
let lines = server.split('\n');
let newLines = [];
let skipping = false;

for (let line of lines) {
  if (line.includes("/api/admin/withdrawals/action")) {
    skipping = true;
    continue;
  }
  if (skipping) {
    if (line.trim() === "});") {
      skipping = false;
    }
    continue;
  }
  newLines.push(line);
}

server = newLines.join('\n');

// Append the pristine, explicitly async route block
const properRoute = `
app.post('/api/admin/withdrawals/action', async (req, res) => {
  try {
    console.log("WITHDRAWAL ACTION HIT:", req.body);
    const { phone, amount, action } = req.body;
    
    if (!phone) {
      return res.status(400).json({ success: false, error: "Phone number is missing." });
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
      return res.status(404).json({ success: false, error: "No withdrawal records found." });
    }

    let withdrawal = null;
    if (amount) {
      withdrawal = user.withdrawals.find(w => String(w.amount) === String(amount));
    }
    if (!withdrawal) {
      withdrawal = user.withdrawals[0];
    }

    withdrawal.status = action === 'approve' ? 'Approved' : 'Rejected';
    await user.save();

    console.log("SUCCESS: Withdrawal updated to", withdrawal.status);
    return res.json({ success: true, message: "Withdrawal successfully " + withdrawal.status });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});
`;

server += properRoute;

fs.writeFileSync('server.js', server);
console.log('server.js cleaned and rewritten!');
