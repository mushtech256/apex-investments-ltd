
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.approve-withdrawal, .reject-withdrawal');
  if (!btn) return;

  const action = btn.classList.contains('approve-withdrawal') ? 'approve' : 'reject';
  const container = btn.closest('[data-phone]');
  if (!container) {
    alert('Debug: Missing container data-phone');
    return;
  }

  const phone = container.dataset.phone;
  const amount = container.dataset.amount;

  btn.disabled = true;
  btn.textContent = 'Working...';

  try {
    const res = await fetch('/api/admin/withdrawals/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, amount, action })
    });
    
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { error: text };
    }

    if (res.ok && data.success) {
      alert('Success: ' + data.message);
      location.reload();
    } else {
      alert('HTTP ' + res.status + ' Error: ' + (data.error || text));
      btn.disabled = false;
      btn.textContent = action === 'approve' ? 'Approve' : 'Reject';
    }
  } catch (err) {
    alert('Fetch Exception: ' + err.message);
    btn.disabled = false;
    btn.textContent = action === 'approve' ? 'Approve' : 'Reject';
  }
});
