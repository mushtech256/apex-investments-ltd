const fs = require('fs');

// 1. Create a completely fresh script file named action-v3.js
const freshCode = `
console.log("Action v3 loaded successfully");

document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.approve-withdrawal, .reject-withdrawal');
  if (!btn) return;

  const action = btn.classList.contains('approve-withdrawal') ? 'approve' : 'reject';
  const container = btn.closest('[data-phone]');
  if (!container) {
    alert('Error: Container missing data-phone');
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
      alert('Failed: ' + (data.error || 'Unknown server error'));
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

fs.writeFileSync('action-v3.js', freshCode);

// 2. Point index.html to action-v3.js
let html = fs.readFileSync('index.html', 'utf8');
// Remove old script tags
html = html.replace(/<script[^>]*src="[^"]*admin-action\.js[^"]*"><\/script>/g, '');
html = html.replace(/<script[^>]*src="[^"]*script\.js[^"]*"><\/script>/g, '');
html = html.replace(/<script[^>]*src="[^"]*action-v3\.js[^"]*"><\/script>/g, '');

// Insert action-v3.js right before </body>
html = html.replace('</body>', '<script src="action-v3.js?v=' + Date.now() + '"></script>\n</body>');
fs.writeFileSync('index.html', html);

console.log('Frontend cleanly updated to action-v3.js!');
