// Force update K-Series

let currentUser = JSON.parse(localStorage.getItem('hut9_user')) || null;
window.onload = () => checkAuth();

function checkAuth() {
    const c = document.getElementById('main-content');
    const nav = document.querySelector('.bottom-nav');
    if (!currentUser) {
        if (nav) nav.style.display = 'none';
        c.innerHTML = `<div style="padding:20px; color:#fff; text-align:center;"><h2>Login</h2><input id="p" placeholder="Phone" style="width:100%;padding:8px;margin-bottom:10px;"><input id="pw" type="password" placeholder="Password" style="width:100%;padding:8px;margin-bottom:10px;"><button onclick="login()" style="width:100%;padding:10px;background:#0284c7;color:#fff;border:none;">Login</button></div>`;
    } else {
        if (nav) nav.style.display = 'flex';
        c.innerHTML = `<div style="padding:20px;color:#fff;"><h2>Welcome, ${currentUser.name}</h2><button onclick="logout()" style="background:red;color:#fff;padding:10px;border:none;width:100%;margin-top:20px;">Logout</button></div>`;
    }
}

function login() {
    currentUser = { name: document.getElementById('p').value || 'User', phone: document.getElementById('p').value };
    localStorage.setItem('hut9_user', JSON.stringify(currentUser));
    checkAuth();
}

function logout() {
    localStorage.removeItem('hut9_user');
    currentUser = null;
    checkAuth();
}

// Safe Auto-loader for Admin Withdrawals
document.addEventListener("DOMContentLoaded", () => {
  const adminContainer = document.getElementById('admin-withdrawals') || document.getElementById('pending-withdrawals-container') || document.querySelector('.admin-withdrawals');
  if (adminContainer) {
    fetch('/api/admin/withdrawals')
      .then(res => res.json())
      .then(data => {
        if (!data || data.length === 0) {
          adminContainer.innerHTML = '<p>No pending withdrawals.</p>';
          return;
        }
        adminContainer.innerHTML = data.map(w => `
          <div style="background:rgba(255,255,255,0.05); padding:10px; margin-bottom:8px; border-radius:8px;">
            <p><b>Phone:</b> ${w.phone_number || w.phone}</p>
            <p><b>Amount:</b> UGX ${w.amount}</p>
            <p><b>Status:</b> ${w.status || 'Pending'}</p>
          </div>
        `).join('');
      }).catch(err => console.log('Admin withdrawals load skipped:', err));
  }
});

// Corrected Admin Withdrawals Loader targeting admin-withdrawals-list
document.addEventListener("DOMContentLoaded", () => {
  const adminContainer = document.getElementById('admin-withdrawals-list') || document.getElementById('admin-withdrawals') || document.getElementById('pending-withdrawals-container');
  if (adminContainer) {
    fetch('/api/admin/withdrawals')
      .then(res => res.json())
      .then(data => {
        const list = data.withdrawals || data;
        if (!list || list.length === 0) {
          adminContainer.innerHTML = '<p style="color:#94a3b8; font-size:12px;">No pending withdrawals.</p>';
          return;
        }
        adminContainer.innerHTML = list.map(w => `
  <div data-phone="${w.phone_number || w.phone}" data-amount="${w.amount}" style="background:rgba(255,255,255,0.05); padding:10px; margin-bottom:8px; border-radius:8px;">
    <p><b>Phone:</b> ${w.phone_number || w.phone}</p>
    <p><b>Amount:</b> UGX ${w.amount}</p>
    <p><b>Status:</b> ${w.status || 'Pending'}</p>
    <div style="margin-top:8px;">
      <button class="approve-withdrawal" style="background:#10b981; color:#fff; border:none; padding:5px 12px; border-radius:4px; margin-right:5px; cursor:pointer;">Approve</button>
      <button class="reject-withdrawal" style="background:#ef4444; color:#fff; border:none; padding:5px 12px; border-radius:4px; cursor:pointer;">Reject</button>
    </div>
  </div>
`).join('');
      }).catch(err => console.log('Admin withdrawals load skipped:', err));
  }
});

// Handle Admin Withdrawal Actions (Approve/Reject)
document.addEventListener('click', async (e) => {
  if (e.target && (e.target.matches('.approve-withdrawal') || e.target.matches('.reject-withdrawal') || e.target.textContent === 'Approve' || e.target.textContent === 'Reject')) {
    const btn = e.target;
    const action = btn.textContent.toLowerCase().includes('approve') ? 'approve' : 'reject';
    
    // Find the item ID from dataset or parent container
    const container = btn.closest('[data-id]') || btn.parentElement;
    const withdrawalId = container ? container.dataset.id : null;
    
    if (!withdrawalId) {
      console.log('Action triggered, but missing withdrawal ID reference.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Processing...';

    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        btn.textContent = 'Done!';
        setTimeout(() => location.reload(), 1000);
      } else {
        alert(data.error || 'Failed to process action');
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
