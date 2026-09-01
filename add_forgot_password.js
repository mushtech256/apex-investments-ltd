const fs = require('fs');

// 1. Update index.html to add the Forgot Password link/section under the Create Account button
let html = fs.readFileSync('index.html', 'utf8');

const forgotPasswordHtml = `
  <div style="text-align: center; margin-top: 15px;">
    <a href="#" onclick="showForgotPasswordModal(event)" style="color: #38bdf8; font-size: 13px; text-decoration: none;">Forgot Password?</a>
  </div>
`;

const forgotPasswordModalScript = `
<div id="forgot-password-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999; align-items:center; justify-content:center;">
  <div style="background:#1e293b; padding:20px; border-radius:8px; width:90%; max-width:350px; color:#fff; text-align:center;">
    <h3>Reset Password</h3>
    <p style="font-size:12px; color:#94a3b8; margin-bottom:15px;">Enter your phone number and a new password.</p>
    <input type="text" id="reset-phone" placeholder="Phone Number" style="width:100%; padding:10px; margin-bottom:10px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:4px;">
    <input type="password" id="reset-new-password" placeholder="New Password" style="width:100%; padding:10px; margin-bottom:15px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:4px;">
    <button onclick="submitPasswordReset()" style="width:100%; padding:10px; background:#0284c7; color:#fff; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Update Password</button>
    <button onclick="closeForgotPasswordModal()" style="width:100%; padding:8px; background:transparent; color:#94a3b8; border:none; margin-top:8px; cursor:pointer;">Cancel</button>
  </div>
</div>

<script>
function showForgotPasswordModal(e) {
  e.preventDefault();
  document.getElementById('forgot-password-modal').style.display = 'flex';
}
function closeForgotPasswordModal() {
  document.getElementById('forgot-password-modal').style.display = 'none';
}
async function submitPasswordReset() {
  const phone = document.getElementById('reset-phone').value.trim();
  const newPassword = document.getElementById('reset-new-password').value.trim();
  if(!phone || !newPassword) {
    alert('Please fill in all fields');
    return;
  }
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, newPassword })
    });
    const data = await res.json();
    if(data.success) {
      alert('Password updated successfully! You can now log in.');
      closeForgotPasswordModal();
    } else {
      alert(data.error || 'Failed to reset password');
    }
  } catch(err) {
    alert('Network error resetting password');
  }
}
</script>
`;

if (!html.includes('showForgotPasswordModal')) {
  // Insert the link right after Create Account button or form container
  html = html.replace('</form>', '</form>' + forgotPasswordHtml);
  html = html.replace('</body>', forgotPasswordModalScript + '\n</body>');
  fs.writeFileSync('index.html', html);
  console.log('index.html updated with Forgot Password modal and link!');
}

// 2. Add the backend reset route in server.js
let code = fs.readFileSync('server.js', 'utf8');

const resetRoute = `
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { phone, newPassword } = req.body;
    if (!phone || !newPassword) {
      return res.status(400).json({ success: false, error: "Phone and new password required" });
    }

    if (typeof User !== 'undefined') {
      const updatedUser = await User.findOneAndUpdate(
        { phone: { $regex: phone.replace('+', '') } },
        { password: newPassword },
        { sort: { _id: -1 }, new: true }
      );

      if (updatedUser) {
        console.log("SUCCESS: Password reset for phone:", phone);
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

if (!code.includes('/api/auth/reset-password')) {
  code = code.replace('app.listen', resetRoute + '\n\napp.listen');
  fs.writeFileSync('server.js', code);
  console.log('server.js updated with password reset endpoint!');
}
