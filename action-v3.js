
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
