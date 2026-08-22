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
