const fs = require('fs');

// 1. Fix server.js action route
let server = fs.readFileSync('server.js', 'utf8');

const cleanRoute = `
// Admin Route: Update Withdrawal Status (Bulletproof)
app.post('/api/admin/withdrawals/action', async (req, res) => {
  try {
    const { phone, amount, action } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number is missing" });

    const cleanPhone = String(phone).trim();
    const user = await User.findOne({ 
      $or: [
        { phone_number: cleanPhone },
        { phone: cleanPhone },
        { phone_number: { $regex: cleanPhone.replace('+', '') } }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: "User not found for " + cleanPhone });
    }

    if (!user.withdrawals || user.withdrawals.length === 0) {
      return res.status(404).json({ error: "User has no withdrawal records" });
    }

    // Find matching withdrawal by amount or take the first pending one
    let withdrawal = user.withdrawals.find(w => String(w.amount) === String(amount));
    if (!withdrawal) {
      withdrawal = user.withdrawals[0];
    }

    withdrawal.status = action === 'approve' ? 'Approved' : 'Rejected';
    await user.save();

    return res.json({ success: true, message: "Withdrawal " + withdrawal.status });
  } catch (err) {
    console.error("Withdrawal action error:", err);
    return res.status(500).json({ error: err.message });
  }
});
`;

// Remove old route if exists and append new one
server = server.replace(/\/\/ Admin Route: Update Withdrawal Status[\s\S]*?\}\);\s*\}\);\s*/g, '');
server = server.replace(/\/api\/admin\/withdrawals\/action[\s\S]*?\}\);\s*\}\);\s*/g, '');
server += cleanRoute;
fs.writeFileSync('server.js', server);

// 2. Fix script.js click handler and rendering
let script = fs.readFileSync('script.js', 'utf8');

const newScriptBlock = `
// Handle Admin Withdrawal Actions (Bulletproof)
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.approve-withdrawal, .reject-withdrawal');
  if (!btn) return;

  const action = btn.classList.contains('approve-withdrawal') ? 'approve' : 'reject';
  const container = btn.closest('[data-phone]');
  if (!container) {
    alert('Error: Missing container data-phone');
    return;
  }

  const phone = container.dataset.phone;
  const amount = container.dataset.amount;

  btn.disabled = true;
  btn.textContent = 'Processing...';

  try {
    const res = await fetch('/api/admin/withdrawals/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, amount, action })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert('Success: ' + data.message);
      location.reload();
    } else {
      alert('Server Error: ' + (data.error || JSON.stringify(data)));
      btn.disabled = false;
      btn.textContent = action === 'approve' ? 'Approve' : 'Reject';
    }
  } catch (err) {
    alert('Network Error: ' + err.message);
    btn.disabled = false;
    btn.textContent = action === 'approve' ? 'Approve' : 'Reject';
  }
});
`;

script = script.replace(/\/\/ Handle Admin Withdrawal Actions[\s\S]*?\}\);\s*\}\);\s*/g, '');
script += newScriptBlock;

// Ensure rendering has proper classes and data attributes
script = script.replace(
  /adminContainer\.innerHTML\s*=\s*list\.map\([\s\S]*?\)\.join\(''\);/,
  `adminContainer.innerHTML = list.map(w => \`
  <div data-phone="\${w.phone_number || w.phone}" data-amount="\${w.amount}" style="background:rgba(255,255,255,0.05); padding:10px; margin-bottom:8px; border-radius:8px;">
    <p><b>Phone:</b> \${w.phone_number || w.phone}</p>
    <p><b>Amount:</b> UGX \${w.amount}</p>
    <p><b>Status:</b> \${w.status || 'Pending'}</p>
    <div style="margin-top:8px;">
      <button class="approve-withdrawal" style="background:#10b981; color:#fff; border:none; padding:5px 12px; border-radius:4px; margin-right:5px; cursor:pointer;">Approve</button>
      <button class="reject-withdrawal" style="background:#ef4444; color:#fff; border:none; padding:5px 12px; border-radius:4px; cursor:pointer;">Reject</button>
    </div>
  </div>
\`).join('');`
);

fs.writeFileSync('script.js', script);
console.log('All files updated successfully!');
