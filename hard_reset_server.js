const fs = require('fs');

let server = fs.readFileSync('server.js', 'utf8');

// Cut off everything from the first occurrence of 'withdrawals' or duplicate app.post actions onwards
const cutIndex = server.indexOf("app.post('/api/admin/withdrawals");
if (cutIndex !== -1) {
  server = server.substring(0, cutIndex);
} else {
  // Try alternative lookups if needed
  const altIndex = server.indexOf("/api/admin/withdrawals");
  if (altIndex !== -1) {
    server = server.substring(0, altIndex - 20); // trim a bit before
  }
}

// Ensure express.json middleware exists
if (!server.includes('app.use(express.json())')) {
  server = server.replace('const app = express();', 'const app = express();\napp.use(express.json());\napp.use(express.urlencoded({ extended: true }));');
}

// Append the valid route cleanly with explicit async
server += `
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

fs.writeFileSync('server.js', server);
console.log('Hard reset applied to server.js!');
