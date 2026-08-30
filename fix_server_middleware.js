const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

// Ensure express.json() is at the very top of middleware setup
if (!server.includes('app.use(express.json());')) {
  server = server.replace('const app = express();', 'const app = express();\napp.use(express.json());\napp.use(express.urlencoded({ extended: true }));');
}

// Ensure the action endpoint has robust console logging
const oldRoutePattern = /app\.post\('\/api\/admin\/withdrawals\/action'[\s\S]*?\}\);\s*\}\);\s*/g;

const robustRoute = `
app.post('/api/admin/withdrawals/action', async (req, res) => {
  try {
    console.log("INCOMING WITHDRAWAL ACTION REQ:", req.body);
    const { phone, amount, action } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: "Phone is missing from request" });
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
      return res.status(404).json({ success: false, error: "User has no withdrawals" });
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

    console.log("Withdrawal updated successfully for:", cleanPhone);
    return.json({ success: true, message: "Withdrawal marked as " + withdrawal.status });
  } catch (err) {
    console.error("CRITICAL ERROR IN WITHDRAWAL ACTION:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});
`;

if (server.includes('/api/admin/withdrawals/action')) {
  // Replace existing action route
  server = server.replace(oldRoutePattern, robustRoute);
} else {
  server += robustRoute;
}

fs.writeFileSync('server.js', server);
console.log('server.js patched with middleware and logging!');
