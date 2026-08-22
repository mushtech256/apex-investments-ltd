// --- APP STATE & AUTH ---
let currentUser = JSON.parse(localStorage.getItem('hut9_user')) || null;

const machines = [
    { series: 'H', name: 'H1 Miner (1X)', price: '200,000', payout: '15,000', cycle: '20 Days' },
    { series: 'H', name: 'H2 Miner (2X)', price: '400,000', payout: '32,000', cycle: '20 Days' },
    { series: 'D', name: 'D1 Mining Unit (1X)', price: '500,000', payout: '50,000', cycle: '7 Days' },
    { series: 'G', name: 'G1 Grid Unit (1X)', price: '300,000', payout: '25,000', cycle: '15 Days' },
    { series: 'Z', name: 'Z1 Quantum Rig (1X)', price: '1,500,000', payout: '160,000', cycle: '30 Days' },
    { series: 'VIP', name: 'VIP 1 Elite Core (1X)', price: '2,500,000', payout: '250,000', cycle: '100 Days' }
];

let currentFilter = 'All';

// --- INITIAL LOAD & ROUTING ---
window.onload = function() {
    checkAuthAndRender();
};

function checkAuthAndRender() {
    const mainContent = document.getElementById('main-content');
    const bottomNav = document.querySelector('.bottom-nav');
    const headerTitle = document.getElementById('header-title');

    if (!currentUser) {
        if (bottomNav) bottomNav.style.display = 'none';
        headerTitle.innerText = 'Apex Investments - Access';
        renderLoginScreen(mainContent);
    } else {
        if (bottomNav) bottomNav.style.display = 'flex';
        headerTitle.innerText = 'Apex Investments';
        switchMainTab('home', document.querySelector('.nav-item'));
    }
}

// --- AUTH SCREENS ---
function renderLoginScreen(container) {
    container.innerHTML = `
        <div style="padding:20px; max-width:400px; margin:auto;">
            <div style="text-align:center; margin-bottom:20px;">
                <h2 style="color:#38bdf8; margin-bottom:5px;">Welcome Back</h2>
                <p style="color:#94a3b8; font-size:13px;">Login to manage your AI mining portfolio</p>
            </div>
            
            <div style="background:#101935; padding:20px; border-radius:12px; border:1px solid #1e2952;">
                <label style="font-size:12px; color:#cbd5e1;">Phone Number or Username</label>
                <input type="text" id="login-phone" placeholder="Enter phone/username" style="width:100%; padding:10px; margin-top:5px; margin-bottom:15px; background:#0b1329; border:1px solid #1e2952; color:#fff; border-radius:6px;">
                
                <label style="font-size:12px; color:#cbd5e1;">Password</label>
                <input type="password" id="login-password" placeholder="Enter password" style="width:100%; padding:10px; margin-top:5px; margin-bottom:20px; background:#0b1329; border:1px solid #1e2952; color:#fff; border-radius:6px;">
                
                <button onclick="handleLogin()" style="width:100%; background:#0284c7; border:none; padding:12px; border-radius:6px; font-weight:bold; color:#fff; cursor:pointer; margin-bottom:10px;">Login</button>
                <button onclick="renderRegisterScreen()" style="width:100%; background:transparent; border:1px solid #1e2952; padding:10px; border-radius:6px; color:#38bdf8; cursor:pointer;">Create Account (Register)</button>
            </div>
        </div>
    `;
}

function renderRegisterScreen() {
    const container = document.getElementById('main-content');
    container.innerHTML = `
        <div style="padding:20px; max-width:400px; margin:auto;">
            <div style="text-align:center; margin-bottom:20px;">
                <h2 style="color:#38bdf8; margin-bottom:5px;">Create Account</h2>
                <p style="color:#94a3b8; font-size:13px;">Join Apex Investments today</p>
            </div>
            
            <div style="background:#101935; padding:20px; border-radius:12px; border:1px solid #1e2952;">
                <label style="font-size:12px; color:#cbd5e1;">Full Name</label>
                <input type="text" id="reg-name" placeholder="Enter your name" style="width:100%; padding:10px; margin-top:5px; margin-bottom:12px; background:#0b1329; border:1px solid #1e2952; color:#fff; border-radius:6px;">
                
                <label style="font-size:12px; color:#cbd5e1;">Phone Number</label>
                <input type="text" id="reg-phone" placeholder="+256..." style="width:100%; padding:10px; margin-top:5px; margin-bottom:12px; background:#0b1329; border:1px solid #1e2952; color:#fff; border-radius:6px;">
                
                <label style="font-size:12px; color:#cbd5e1;">Password</label>
                <input type="password" id="reg-password" placeholder="Create password" style="width:100%; padding:10px; margin-top:5px; margin-bottom:20px; background:#0b1329; border:1px solid #1e2952; color:#fff; border-radius:6px;">
                
                <button onclick="handleRegister()" style="width:100%; background:#10b981; border:none; padding:12px; border-radius:6px; font-weight:bold; color:#fff; cursor:pointer; margin-bottom:10px;">Register Account</button>
                <button onclick="checkAuthAndRender()" style="width:100%; background:transparent; border:1px solid #1e2952; padding:10px; border-radius:6px; color:#94a3b8; cursor:pointer;">Back to Login</button>
            </div>
        </div>
    `;
}

function handleLogin() {
    const phone = document.getElementById('login-phone').value;
    const pass = document.getElementById('login-password').value;

    let savedUser = JSON.parse(localStorage.getItem('hut9_registered_user'));

    if (savedUser && savedUser.phone === phone && savedUser.password === pass) {
        currentUser = savedUser;
        localStorage.setItem('hut9_user', JSON.stringify(currentUser));
        checkAuthAndRender();
    } else {
        // Fallback default test login if none registered yet
        if (phone === 'admin' && pass === 'password') {
            currentUser = { name: "Admin User", phone: "+256700000000", balance: 55000, password: "password" };
            localStorage.setItem('hut9_user', JSON.stringify(currentUser));
            checkAuthAndRender();
        } else {
            alert("Invalid login credentials or account not found. Try registering first!");
        }
    }
}

function handleRegister() {
    const name = document.getElementById('reg-name').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;

    if (!name || !phone || !password) {
        alert("Please fill in all fields.");
        return;
    }

    const newUser = { name, phone, balance: 10000, password }; // gives starting bonus balance
    localStorage.setItem('hut9_registered_user', JSON.stringify(newUser));
    localStorage.setItem('hut9_user', JSON.stringify(newUser));
    currentUser = newUser;
    
    alert("Account created successfully!");
    checkAuthAndRender();
}

function logout() {
    localStorage.removeItem('hut9_user');
    currentUser = null;
    checkAuthAndRender();
}

// --- MAIN TAB ROUTER ---
function switchMainTab(tabName, element) {
    if (!currentUser) return;
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (element) element.classList.add('active');

    const headerTitle = document.getElementById('header-title');
    const container = document.getElementById('main-content');
    container.innerHTML = '';

    if (tabName === 'home') {
        headerTitle.innerText = 'Apex Investments';
        renderHomeTab(container);
    } else if (tabName === 'raffle') {
        headerTitle.innerText = 'Lucky Raffle';
        container.innerHTML = `<div style="padding:15px; text-align:center;"><h3 style="color:#38bdf8;">Daily Raffle</h3><p style="color:#cbd5e1;">Spin and win rewards daily!</p></div>`;
    } else if (tabName === 'chats') {
        headerTitle.innerText = 'Community Chats';
        container.innerHTML = `<div style="padding:15px;"><h3 style="color:#38bdf8;">Support & Community</h3><p style="color:#cbd5e1;">Join our official channels for updates.</p></div>`;
    } else if (tabName === 'ai') {
        headerTitle.innerText = 'AI Machines';
        renderAiTab(container);
    } else if (tabName === 'income') {
        headerTitle.innerText = 'My Income';
        container.innerHTML = `<div style="padding:15px;"><h3 style="color:#38bdf8;">Earnings Overview</h3><p style="color:#cbd5e1;">Active rentals and daily dividends will appear here.</p></div>`;
    } else if (tabName === 'my') {
        headerTitle.innerText = 'My Profile & Wallet';
        renderMyTab(container);
    }
}

// --- TAB RENDERERS ---
function renderHomeTab(container) {
    container.innerHTML = `
        <div style="padding:15px;">
            <div style="background:linear-gradient(135deg, #0284c7, #1e1b4b); padding:20px; border-radius:12px; margin-bottom:15px;">
                <h2 style="margin:0 0 5px 0; color:#fff;">Welcome, ${currentUser.name}</h2>
                <p style="margin:0; color:#94a3b8; font-size:13px;">Secure your future with automated AI mining returns.</p>
            </div>
            <div style="background:#101935; padding:15px; border-radius:12px; border:1px solid #1e2952;">
                <h4 style="margin-top:0; color:#38bdf8;">Platform Notice</h4>
                <p style="font-size:13px; color:#cbd5e1; margin-bottom:0;">Ensure you use our updated rotating deposit numbers when funding your wallet.</p>
            </div>
        </div>
    `;
}

function renderAiTab(container) {
    container.innerHTML = `
        <div style="padding:15px;">
            <div style="display:flex; gap:8px; overflow-x:auto; margin-bottom:15px;" id="series-tabs">
                <button class="nav-tab active" onclick="filterSeries('All', event)" style="background:#0284c7; border:none; color:#fff; padding:6px 14px; border-radius:16px; cursor:pointer;">All</button>
                <button class="nav-tab" onclick="filterSeries('H', event)" style="background:#101935; border:1px solid #1e2952; color:#fff; padding:6px 14px; border-radius:16px; cursor:pointer;">H</button>
                <button class="nav-tab" onclick="filterSeries('D', event)" style="background:#101935; border:1px solid #1e2952; color:#fff; padding:6px 14px; border-radius:16px; cursor:pointer;">D</button>
                <button class="nav-tab" onclick="filterSeries('G', event)" style="background:#101935; border:1px solid #1e2952; color:#fff; padding:6px 14px; border-radius:16px; cursor:pointer;">G</button>
                <button class="nav-tab" onclick="filterSeries('Z', event)" style="background:#101935; border:1px solid #1e2952; color:#fff; padding:6px 14px; border-radius:16px; cursor:pointer;">Z</button>
                <button class="nav-tab" onclick="filterSeries('VIP', event)" style="background:#101935; border:1px solid #1e2952; color:#fff; padding:6px 14px; border-radius:16px; cursor:pointer;">VIP</button>
            </div>
            <div id="machines-container"></div>
        </div>
    `;
    renderMachinesList('All');
}

function filterSeries(series, event) {
    document.querySelectorAll('#series-tabs button').forEach(b => {
        b.style.background = '#101935';
        b.style.borderColor = '#1e2952';
    });
    event.target.style.background = '#0284c7';
    renderMachinesList(series);
}

function renderMachinesList(filter) {
    const container = document.getElementById('machines-container');
    if (!container) return;
    container.innerHTML = '';
    const filtered = filter === 'All' ? machines : machines.filter(m => m.series === filter);
    
    filtered.forEach(m => {
        container.innerHTML += `
            <div style="background:#101935; border:1px solid #1e2952; border-radius:12px; padding:15px; margin-bottom:12px;">
                <div style="font-size:16px; font-weight:bold; color:#38bdf8; margin-bottom:6px;">${m.name}</div>
                <div style="font-size:13px; color:#cbd5e1; margin-bottom:4px;">Price: UGX ${m.price}</div>
                <div style="font-size:13px; color:#34d399; margin-bottom:4px;">Daily Payout: UGX ${m.payout}</div>
                <div style="font-size:12px; color:#94a3b8; margin-bottom:10px;">Cycle: ${m.cycle}</div>
                <button onclick="alert('Rented ${m.name} successfully!')" style="width:100%; background:#0284c7; border:none; padding:8px; border-radius:6px; font-weight:bold; color:#fff; cursor:pointer;">Rent Machine</button>
            </div>
        `;
    });
}

function renderMyTab(container) {
    container.innerHTML = `
        <div style="padding:15px;">
            <div style="background:#101935; padding:15px; border-radius:12px; border:1px solid #1e2952; margin-bottom:15px; text-align:center;">
                <h3 style="margin:0 0 5px 0; color:#fff;">${currentUser.name}</h3>
                <p style="margin:0; color:#cbd5e1; font-size:13px;">${currentUser.phone}</p>
                <p style="margin:8px 0 0 0; color:#34d399; font-weight:bold;">Wallet Balance: UGX ${currentUser.balance.toLocaleString()}</p>
            </div>
            
            <div style="background:#101935; padding:15px; border-radius:12px; border:1px solid #1e2952; margin-bottom:15px;">
                <h4 style="margin-top:0; color:#fff; font-size:14px;">Profile Settings</h4>
                <label style="font-size:12px; color:#cbd5e1;">Display Name</label>
                <input type="text" id="set-name" value="${currentUser.name}" style="width:100%; padding:8px; margin-top:4px; margin-bottom:10px; background:#0b1329; border:1px solid #1e2952; color:#fff; border-radius:6px;">
                
                <label style="font-size:12px; color:#cbd5e1;">Phone Number</label>
                <input type="text" id="set-phone" value="${currentUser.phone}" style="width:100%; padding:8px; margin-top:4px; margin-bottom:12px; background:#0b1329; border:1px solid #1e2952; color:#fff; border-radius:6px;">
                
                <button onclick="updateProfileDetails()" style="width:100%; background:#0284c7; border:none; padding:10px; border-radius:6px; font-weight:bold; color:#fff; cursor:pointer;">Save Profile</button>
            </div>

            <button onclick="logout()" style="width:100%; background:#ef4444; border:none; padding:12px; border-radius:6px; font-weight:bold; color:#fff; cursor:pointer;">Logout</button>
        </div>
    `;
}

function updateProfileDetails() {
    currentUser.name = document.getElementById('set-name').value;
    currentUser.phone = document.getElementById('set-phone').value;
    localStorage.setItem('hut9_user', JSON.stringify(currentUser));
    localStorage.setItem('hut9_registered_user', JSON.stringify(currentUser));
    alert("Profile updated successfully!");
    renderMyTab(document.getElementById('main-content'));
}

