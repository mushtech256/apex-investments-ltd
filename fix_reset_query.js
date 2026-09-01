const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// Replace the reset-password route with a flexible regex search for phone numbers
const newResetRoute = `
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { phone, newPassword } = req.body;
    if (!phone || !newPassword) {
      return res.status(400).json({ success: false, error: "Phone and new password required" });
    }

    if (typeof User !== 'undefined') {
      // Clean input phone (remove leading 0 or +256/256 if user typed local format)
      let cleanPhone = phone.trim();
      if (cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone.substring(1); // turns 077... into 77...
      } else if (cleanPhone.startsWith('+')) {
        cleanPhone = cleanPhone.replace(/[^0-9]/g, '');
      }

      console.log("Searching user with flexible phone query for:", cleanPhone);

      // Search using a regex that matches the tail digits regardless of prefix
      const updatedUser = await User.findOneAndUpdate(
        { phone: { $regex: cleanPhone + '$' } },
        { password: newPassword },
        { sort: { _id: -1 }, new: true }
      );

      if (updatedUser) {
        console.log("SUCCESS: Password reset for user:", updatedUser.phone);
        return res.json({ success: true, message: "Password updated successfully" });
      }
    }

    res.status(404).json({ success: false, error: "User not found with this phone number" });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
`;

// Remove old reset route if present
code = code.replace(/app\.post\(['"]\/api\/auth\/reset-password['"][\s\S]*?\}\);\s*\}\);/g, '');

// Append before app.listen
code = code.replace('app.listen', newResetRoute + '\n\napp.listen');

fs.writeFileSync('server.js', code);
console.log('server.js updated with flexible phone regex for password reset!');
