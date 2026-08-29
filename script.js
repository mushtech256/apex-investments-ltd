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
