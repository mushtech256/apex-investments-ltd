const fs = require('fs');

let server = fs.readFileSync('server.js', 'utf8');

// 1. Ensure express.json middleware exists
if (!server.includes('app.use(express.json())')) {
  server = server.replace('const app = express();', 'const app = express();\napp.use(express.json());\napp.use(express.urlencoded({ extended: true }));');
}

// 2. Remove any old duplicate action routes
server = server.replace(/app\.post\('\/api\/admin\/withdrawals\/action'[\s\S]*?\}\);\s*/g, '');

// 3. Append the clean, working route
const cleanActionRoute = `
app.post('/api/admin/withdrawals/action', async (req, res) => {
  try {
    console.log("RECEIVED WITHDRAWAL ACTION:", req.body);
    const { phone, amount, action } = req.body;
    
    if (!phone) {
      return res.status(400).json({ success: false, error: "Phone number missing" });
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
      return res.status(404).json({ success: false, error: "User not found for " + cleanPhone });
    }

    if (!user.withdrawals || user.withdrawals.length === 0) {
      return res.status(404).json({ success: false, error: "No withdrawals for user" });
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

    console.log("SUCCESSFULLY UPDATED WITHDRAWAL:", cleanPhone, withdrawal.status);
    return res.json({ success: true, message: "Withdrawal set to " + withdrawal.status });
  } catch (err) {
    console.error("WITHDRAWAL ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});
`;

server += cleanActionRoute;

fs.writeFileSync('server.js', server);
console.log('server.js rewritten cleanly!');
