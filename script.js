cat << 'EOF' > script.js
let currentUser = JSON.parse(localStorage.getItem('hut9_user')) || null;
const machines = [
    { series: 'H', name: 'H1 Miner', price: '200,000', payout: '15,000' },
    { series: 'D', name: 'D1 Unit', price: '500,000', payout: '50,000' }
];

window.onload = () => checkAuth();

function checkAuth() {
    const c = document.getElementById('main-content');
    const nav = document.querySelector('.bottom-nav');
    if (!currentUser) {
        if (nav) nav.style.display = 'none';
        c.innerHTML = `<div style="padding:20px; color:#fff; text-align:center;"><h2>Login</h2><input id="p" placeholder="Phone" style="width:100%;padding:8px;margin-bottom:10px;"><input id="pw" type="password" placeholder="Password" style="width:100%;padding:8px;margin-bottom:10px;"><button onclick="login()" style="width:100%;padding:10px;background:#0284c7;color:#fff;border:none;">Login</button><button onclick="reg()" style="width:100%;padding:10px;background:none;color:#38bdf8;border:none;margin-top:5px;">Register</button></div>`;
    } else {
        if (nav) nav.style.display = 'flex';
        switchMainTab('home');
    }
}

function login() {
    currentUser = { name: document.getElementById('p').value || "User", phone: document.getElementById('p').value, balance: 10000 };
    localStorage.setItem('hut9_user', JSON.stringify(currentUser));
    checkAuth();
}

function reg() { login(); }
function logout() { localStorage.removeItem('hut9_user'); currentUser = null; checkAuth(); }

function switchMainTab(tab) {
    const c = document.getElementById('main-content');
    if (tab === 'home') {
        c.innerHTML = `<div style="padding:20px;color:#fff;"><h2>Welcome, ${currentUser.name}</h2><p>Balance: UGX ${currentUser.balance}</p></div>`;
    } else if (tab === 'my') {
        c.innerHTML = `<div style="padding:20px;color:#fff;"><h3>Profile</h3><button onclick="logout()" style="background:red;color:#fff;padding:10px;border:none;width:100%;">Logout</button></div>`;
    }
}
EOF

