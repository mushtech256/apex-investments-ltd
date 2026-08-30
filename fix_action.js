const fs = require('fs');

// 1. Update script.js to store phone and amount directly on the button or container
let script = fs.readFileSync('script.js', 'utf8');

const newClickEvent = `
// Handle Admin Withdrawal Actions (Approve/Reject)
document.addEventListener('click', async (e) => {
  if (e.target && (e.target.matches('.approve-withdrawal') || e.target.matches('.reject-withdrawal') || e.target.textContent === 'Approve' || e.target.textContent === 'Reject')) {
    const btn = e.target;
    const action = btn.textContent.toLowerCase().includes('approve') ? 'approve' : 'reject';
    
    const container = btn.closest('[data-phone]');
    if (!container) {
      alert('Action failed: missing container reference');
      return;
    }
    
    const phone = container.dataset.phone;
    const amount = container.dataset.amount;

    btn.disabled = true;
    btn.textContent = 'Processing...';

    try {
      const res = await fetch(\`/api/admin/withdrawals/action\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount, action })
      });
      const data = await res.json();
      if (data.success) {
        btn.textContent = 'Done!';
        setTimeout(() => location.reload(), 800);
      } else {
        alert(data.error || 'Action failed');
        btn.disabled = false;
        btn.textContent = action === 'approve' ? 'Approve' : 'Reject';
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
      btn.disabled = false;
      btn.textContent = action === 'approve' ? 'Approve' : 'Reject';
    }
  }
});
`;

// Replace old click listener
if (script.includes("Handle Admin Withdrawal Actions")) {
  script = script.replace(/\/\/ Handle Admin Withdrawal Actions[\s\S]*?\}\);\s*\}\);\s*/, newClickEvent);
} else {
  script += "\n" + newClickEvent;
}

// Also update the rendering part so container has data-phone and data-amount
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
console.log('script.js updated with phone/amount data attributes!');
