const AUTH_CONFIG = {
    DB_KEY: 'hut9_accounts_db',
    MIN_PASSWORD_LENGTH: 6
};

let currentUser = {
    phone: '',
    password: '',
    wallet: 0,
    balance: 0,
    depositTotal: 0,
    withdrawTotal: 0,
    raffles: 0,
    name: 'User',
    avatar: '👤',
    inviteCode: ''
};

let userPurchasedMachines = []; 
let userWithdrawRequests = []; 
let depositToggle = false;

function sanitizePhone(phoneInput) {
    if (!phoneInput) return '';
    let cleaned = phoneInput.trim().replace(/\s+/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '+256' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+')) {
        cleaned = '+256' + cleaned;
    }
    return cleaned;
}

function generateUniqueInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'HUT9-';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function switchAuthTab(formType) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTabBtn = document.getElementById('loginTabBtn');
    const registerTabBtn = document.getElementById('registerTabBtn');

    if (formType === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        loginTabBtn.classList.add('active');
        registerTabBtn.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        loginTabBtn.classList.remove('active');
        registerTabBtn.classList.add('active');
    }
}

function handleAuth(event, type) {
    event.preventDefault();
    const isLogin = (type === 'Login');
    
    const rawPhone = document.getElementById(isLogin ? 'loginPhone' : 'regPhone').value;
    const phone = sanitizePhone(rawPhone);
    const password = document.getElementById(isLogin ? 'loginPassword' : 'regPassword').value;

    let accountsDB = JSON.parse(localStorage.getItem(AUTH_CONFIG.DB_KEY)) || [];

    if (!isLogin) {
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        if (password !== confirmPassword) {
            alert("Error: Passwords do not match.");
            return;
        }
        if (password.length < AUTH_CONFIG.MIN_PASSWORD_LENGTH) {
            alert(`Error: Password must be at least ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} characters long.`);
            return;
        }

        const existingAccount = accountsDB.find(acc => acc.phone === phone || acc.phone === rawPhone);
        if (existingAccount) {
            alert("An account with this phone number already exists! Please login instead.");
            switchAuthTab('login');
            return;
        }

        const newAccount = {
            phone: phone,
            password: password,
            wallet: 0,
            balance: 0,
            depositTotal: 0,
            withdrawTotal: 0,
            raffles: 0,
            name: 'Mr. Rodgers',
            avatar: '👤',
            inviteCode: generateUniqueInviteCode(),
            purchasedMachines: [],
            withdrawRequests: [],
            createdAt: new Date().toISOString()
        };

        accountsDB.push(newAccount);
        localStorage.setItem(AUTH_CONFIG.DB_KEY, JSON.stringify(accountsDB));

        alert("Account created successfully! Please proceed to login.");
        switchAuthTab('login');
        document.getElementById('registerForm').reset();
        return;
    }

    const targetAccount = accountsDB.find(acc => acc.phone === phone || acc.phone === rawPhone || sanitizePhone(acc.phone) === phone);
    if (!targetAccount) {
        alert("Phone number not registered. Please create an account first!");
        switchAuthTab('register');
        return;
    }
    if (targetAccount.password !== password) {
        alert("Incorrect password!");
        return;
    }

    currentUser = {
        ...targetAccount,
        name: targetAccount.name || 'Mr. Rodgers',
        avatar: targetAccount.avatar || '👤',
        inviteCode: targetAccount.inviteCode || generateUniqueInviteCode()
    };

    userPurchasedMachines = currentUser.purchasedMachines || [];
    userWithdrawRequests = currentUser.withdrawRequests || [];

    alert("Login successful!");
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('main-app-content').style.display = 'block';
    document.getElementById('bottomNavbar').style.display = 'flex';
    
    switchMainTab('home', document.querySelector('.nav-item'));
}

function saveUserData() {
    currentUser.purchasedMachines = userPurchasedMachines;
    currentUser.withdrawRequests = userWithdrawRequests;
    let accountsDB = JSON.parse(localStorage.getItem(AUTH_CONFIG.DB_KEY)) || [];
    let index = accountsDB.findIndex(acc => acc.phone === currentUser.phone);
    if (index !== -1) {
        accountsDB[index] = currentUser;
        localStorage.setItem(AUTH_CONFIG.DB_KEY, JSON.stringify(accountsDB));
    }
}

function signOut() {
    saveUserData();
    currentUser = { phone: '', password: '', wallet: 0, balance: 0, depositTotal: 0, withdrawTotal: 0, raffles: 0, name: 'Mr. Rodgers', avatar: '👤', inviteCode: '' };
    userPurchasedMachines = [];
    userWithdrawRequests = [];
    document.getElementById('main-app-content').style.display = 'none';
    document.getElementById('bottomNavbar').style.display = 'none';
    document.getElementById('auth-container').style.display = 'block';
    document.getElementById('loginForm').reset();
    alert("Signed out successfully.");
}

const aiMachinesData = [
    { id: 'H1', series: 'H', name: 'H1 Tractor Machine (1X)', price: 30000, daily: 3000, days: 30, total: 3000 * 30 },
    { id: 'H2', series: 'H', name: 'H2 Tractor Machine (2X)', price: 100000, daily: 10000, days: 30, total: 10000 * 30 },
    { id: 'H3', series: 'H', name: 'H3 Tractor Machine (3X)', price: 250000, daily: 21000, days: 30, total: 21000 * 30 },
    { id: 'H4', series: 'H', name: 'H4 Tractor Machine (4X)', price: 300000, daily: 28000, days: 30, total: 28000 * 30 },
    { id: 'H5', series: 'H', name: 'H5 Tractor Machine (5X)', price: 500000, daily: 35000, days: 30, total: 35000 * 30 },

    { id: 'D1', series: 'D', name: 'D1 Mining Unit (1X)', price: 150000, daily: 50000, days: 15, total: 50000 * 15 },
    { id: 'D2', series: 'D', name: 'D2 Mining Unit (2X)', price: 350000, daily: 75000, days: 15, total: 75000 * 15 },
    { id: 'D3', series: 'D', name: 'D3 Mining Unit (3X)', price: 600000, daily: 100000, days: 15, total: 100000 * 15 },
    { id: 'D4', series: 'D', name: 'D4 Mining Unit (4X)', price: 800000, daily: 150000, days: 15, total: 150000 * 15 },
    { id: 'D5', series: 'D', name: 'D5 Mining Unit (5X)', price: 1000000, daily: 200000, days: 15, total: 200000 * 15 },

    { id: 'G1', series: 'G', name: 'G1 Grid Unit (1X)', price: 200000, daily: 15000, days: 20, total: 15000 * 20 },
    { id: 'G2', series: 'G', name: 'G2 Grid Unit (2X)', price: 400000, daily: 32000, days: 20, total: 32000 * 20 },
    { id: 'G3', series: 'G', name: 'G3 Grid Unit (3X)', price: 700000, daily: 60000, days: 20, total: 60000 * 20 },
    { id: 'G4', series: 'G', name: 'G4 Grid Unit (4X)', price: 950000, daily: 85000, days: 20, total: 85000 * 20 },
    { id: 'G5', series: 'G', name: 'G5 Grid Unit (5X)', price: 1200000, daily: 110000, days: 20, total: 110000 * 20 },

    { id: 'Z1', series: 'Z', name: 'Z1 Quantum Rig (1X)', price: 500000, daily: 50000, days: 7, total: 50000 * 7 },
    { id: 'Z2', series: 'Z', name: 'Z2 Quantum Rig (2X)', price: 850000, daily: 150000, days: 7, total: 150000 * 7 },
    { id: 'Z3', series: 'Z', name: 'Z3 Quantum Rig (3X)', price: 1000000, daily: 400000, days: 7, total: 400000 * 7 },
    { id: 'Z4', series: 'Z', name: 'Z4 Quantum Rig (4X)', price: 1500000, daily: 450000, days: 7, total: 450000 * 7 },
    { id: 'Z5', series: 'Z', name: 'Z5 Quantum Rig (5X)', price: 2000000, daily: 500000, days: 7, total: 500000 * 7 },

    { id: 'V1', series: 'VIP', name: 'VIP 1 Elite Core (1X)', price: 2500000, daily: 25000, days: 100, total: 25000 * 100 },
    { id: 'V2', series: 'VIP', name: 'VIP 2 Elite Core (2X)', price: 4000000, daily: 35000, days: 100, total: 35000 * 100 },
    { id: 'V3', series: 'VIP', name: 'VIP 3 Elite Core (3X)', price: 6000000, daily: 100000, days: 100, total: 100000 * 100 },
    { id: 'V4', series: 'VIP', name: 'VIP 4 Elite Core (4X)', price: 8000000, daily: 190000, days: 100, total: 190000 * 100 },
    { id: 'V5', series: 'VIP', name: 'VIP 5 Elite Core (5X)', price: 10000000, daily: 250000, days: 100, total: 250000 * 100 }
];

function switchMainTab(tabName, element) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    if (element) element.classList.add('active');

    const mainContent = document.getElementById('main-app-content');
    
    if (tabName === 'home') renderHomeTab(mainContent);
    else if (tabName === 'raffle') renderRaffleTab(mainContent);
    else if (tabName === 'chats') renderChatsTab(mainContent);
    else if (tabName === 'ai') renderAiDashboard('All');
    else if (tabName === 'income') renderIncomeTab(mainContent);
    else if (tabName === 'my') renderMyTab(mainContent);
}

function renderHomeTab(container) {
    let withdrawList = userWithdrawRequests.length === 0 ? '<p style="font-size: 12px; color: #38bdf8;">0</p>' : '';
    userWithdrawRequests.forEach((w, idx) => {
        let cancelBtn = w.status === 'Pending' ? `<br><span style="color: #ef4444; cursor: pointer; font-size: 11px; text-decoration: underline;" onclick="cancelWithdraw(${idx})">Cancel</span>` : '';
        withdrawList += `<p style="font-size: 12px; color: #38bdf8;">UGX ${w.amount.toLocaleString()} - <strong>${w.status}</strong>${cancelBtn}</p>`;
    });

    let aiIncomeAll = userPurchasedMachines.reduce((sum, m) => sum + (m.status === 'Collected' ? m.total : 0), 0);
    let todaysEarningsAll = userPurchasedMachines.filter(m => m.status === 'Running').reduce((sum, m) => sum + m.daily, 0);

    container.innerHTML = `
        <h2 style="color: #38bdf8; margin-bottom: 5px;">Welcome, ${currentUser.name}</h2>
        <p style="font-size: 13px; color: #38bdf8; margin-bottom: 12px;">HUT 9 Platform Dashboard</p>
        
        <div style="display: flex; gap: 10px; overflow-x: auto; margin-bottom: 15px; padding-bottom: 5px;">
            <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500" style="width: 260px; height: 130px; object-fit: cover; border-radius: 6px; border: 1px solid #38bdf8;">
            <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500" style="width: 260px; height: 130px; object-fit: cover; border-radius: 6px; border: 1px solid #38bdf8;">
            <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=500" style="width: 260px; height: 130px; object-fit: cover; border-radius: 6px; border: 1px solid #38bdf8;">
        </div>

        <div class="grid-stats">
            <div class="grid-item"><span style="font-size: 11px; color: #38bdf8;">Deposit details</span><p style="font-size: 15px; font-weight: bold; color: #38bdf8; margin-top: 4px;">UGX ${currentUser.depositTotal.toLocaleString()}</p></div>
            <div class="grid-item"><span style="font-size: 11px; color: #38bdf8;">Withdraw details</span><div style="margin-top: 4px;">${withdrawList}</div></div>
            <div class="grid-item"><span style="font-size: 11px; color: #38bdf8;">Ai income</span><p style="font-size: 15px; font-weight: bold; color: #38bdf8; margin-top: 4px;">UGX ${aiIncomeAll.toLocaleString()}</p></div>
            <div class="grid-item"><span style="font-size: 11px; color: #38bdf8;">Today's earnings</span><p style="font-size: 15px; font-weight: bold; color: #38bdf8; margin-top: 4px;">UGX ${todaysEarningsAll.toLocaleString()}</p></div>
        </div>
    `;
}

function cancelWithdraw(idx) {
    const w = userWithdrawRequests[idx];
    if (w.status !== 'Pending') return;
    currentUser.balance += w.amount;
    w.status = 'Cancelled';
    alert(`Withdrawal cancelled. UGX ${w.amount.toLocaleString()} returned to Account Balance.`);
    saveUserData();
    renderHomeTab(document.getElementById('main-app-content'));
}

function renderRaffleTab(container) {
    container.innerHTML = `<h2>Raffle Rewards</h2><div class="card" style="margin-top: 15px; text-align: center;"><p style="color: #38bdf8;">Purchase machines to earn raffle bonuses!</p><p style="font-weight: bold; color: #38bdf8; margin-top: 10px;">Total Raffles: ${currentUser.raffles}</p></div>`;
}

function renderChatsTab(container) {
    container.innerHTML = `
        <h2>Customer Support</h2>
        <div class="card" style="margin-top: 15px; text-align: center;">
            <p style="font-size: 14px; color: #38bdf8; margin-bottom: 15px;">24/7 Online Customer Service</p>
            <a href="https://t.me/hut9uganda" target="_blank" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #38bdf8; color: #0b132b; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                Join Telegram Group
            </a>
        </div>
    `;
}

function renderAiDashboard(filterSeries) {
    const mainContent = document.getElementById('main-app-content');
    const seriesList = ['All', 'H', 'D', 'G', 'Z', 'VIP'];
    let buttonsHtml = '<div style="display: flex; gap: 6px; overflow-x: auto; margin-bottom: 20px; padding-bottom: 5px;">';
    
    seriesList.forEach(s => {
        const displayName = s === 'All' ? 'All Series' : `${s}-Series`;
        const activeStyle = filterSeries === s ? 'background: #38bdf8; color: #0b132b;' : 'background: #1c2541; color: #38bdf8; border: 1px solid #38bdf8;';
        buttonsHtml += `<button onclick="renderAiDashboard('${s}')" style="padding: 8px 14px; border-radius: 6px; font-weight: bold; cursor: pointer; white-space: nowrap; ${activeStyle}">${displayName}</button>`;
    });
    buttonsHtml += '</div>';

    const filtered = filterSeries === 'All' ? aiMachinesData : aiMachinesData.filter(m => m.series === filterSeries);
    let machinesHtml = '';

    filtered.forEach(m => {
        let activeMatch = userPurchasedMachines.find(item => item.name === m.name && item.status === 'Running');
        let runningStatusHtml = '';
        if (activeMatch) {
            runningStatusHtml = `<p style="font-size: 12px; color: #38bdf8; margin-top: 8px; background: rgba(56, 189, 248, 0.1); padding: 6px; border-radius: 4px;"><strong>Status:</strong> Running (Day ${activeMatch.daysPassed} of ${activeMatch.daysTotal})</p>`;
        }

        machinesHtml += `
            <div class="card" style="margin-bottom: 16px; padding: 18px; border: 1px solid rgba(56, 189, 248, 0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="background: #38bdf8; color: #0b132b; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px;">${m.series}-SERIES</span>
                    <span style="font-size: 12px; color: #38bdf8;">Cycle: ${m.days} Days</span>
                </div>
                <h3 style="color: #38bdf8; font-size: 16px; margin-bottom: 12px; line-height: 1.4;">${m.name}</h3>
                <div style="margin-bottom: 14px;">
                    <p style="font-size: 13px; margin: 6px 0; color: #cbd5e1;">Rental Price: <strong style="color: #ffffff;">UGX ${m.price.toLocaleString()}</strong></p>
                    <p style="font-size: 13px; margin: 6px 0; color: #cbd5e1;">Daily Payout: <strong style="color: #38bdf8;">UGX ${m.daily.toLocaleString()}</strong></p>
                    <p style="font-size: 13px; margin: 6px 0; color: #cbd5e1;">Total Return: <strong style="color: #38bdf8;">UGX ${m.total.toLocaleString()}</strong></p>
                </div>
                ${runningStatusHtml}
                <button class="btn-primary" style="margin-top: 8px;" onclick="buyMachine('${m.id}')">Rent Machine Now</button>
            </div>
        `;
    });

    mainContent.innerHTML = `
        <h2 style="margin-bottom: 5px;">AI Mining & Tractor Units</h2>
        <p style="font-size: 12px; color: #38bdf8; margin-bottom: 15px;">Tap any series category below to view specific machinery options.</p>
        ${buttonsHtml}
        ${machinesHtml}
    `;
}

function buyMachine(id) {
    const m = aiMachinesData.find(item => item.id === id);
    if (currentUser.wallet < m.price) {
        alert("Insufficient funds in wallet!");
        return;
    }
    currentUser.wallet -= m.price;
    currentUser.raffles += 1;
    userPurchasedMachines.push({ 
        name: m.name, 
        price: m.price, 
        total: m.total, 
        daysTotal: m.days, 
        daysPassed: 1, 
        status: 'Running' 
    });
    saveUserData();
    alert(`Successfully rented ${m.name}!`);
    switchMainTab('income', document.querySelectorAll('.nav-item')[4]);
}

function renderIncomeTab(container) {
    let list = userPurchasedMachines.length === 0 ? '<p style="color: #38bdf8;">No machines rented.</p>' : '';
    userPurchasedMachines.forEach((m, idx) => {
        let canCollect = m.daysPassed >= m.daysTotal && m.status === 'Running';
        let btnHtml = canCollect ? 
            `<button class="btn-primary" style="background: #38bdf8; color: #0b132b;" onclick="receiveIncome(${idx})">Receive Income (UGX ${m.total.toLocaleString()})</button>` :
            `<p style="font-size: 12px; color: #38bdf8; margin-top: 8px;">Status: ${m.status} (Day ${m.daysPassed} of ${m.daysTotal})</p>`;

        list += `
            <div class="card">
                <h3 style="font-size: 15px; color: #38bdf8;">${m.name}</h3>
                <p style="font-size: 13px; margin: 3px 0;">Total Return: UGX ${m.total.toLocaleString()}</p>
                ${btnHtml}
            </div>
        `;
    });
    container.innerHTML = `<h2>My Machines</h2>${list}`;
}

function receiveIncome(idx) {
    const m = userPurchasedMachines[idx];
    m.status = 'Collected';
    currentUser.balance += m.total;
    saveUserData();
    alert(`Cycle complete! UGX ${m.total.toLocaleString()} added to Account Balance.`);
    renderIncomeTab(document.getElementById('main-app-content'));
}

function renderMyTab(container) {
    container.innerHTML = `
        <h2>My Account</h2>
        <div class="card" style="display: flex; align-items: center; gap: 10px; margin-top: 15px;">
            <span style="font-size: 30px;">${currentUser.avatar}</span>
            <div><h3 style="color: #38bdf8;">${currentUser.name}</h3><p style="font-size: 13px; color: #38bdf8;">${currentUser.phone}</p></div>
        </div>
        <div class="my-grid">
            <button class="my-btn" onclick="renderDepositView()"><span>💳</span> Deposit</button>
            <button class="my-btn" onclick="renderWalletView()"><span>💰</span> Wallet</button>
            <button class="my-btn" onclick="renderWithdrawView()"><span>🏦</span> Withdraw</button>
            <button class="my-btn" onclick="renderInviteView()"><span>🔗</span> Invite</button>
            <button class="my-btn" onclick="alert('App download ready.')"><span>📥</span> App</button>
            <button class="my-btn" onclick="renderSettingsView()"><span>⚙️</span> Settings</button>
        </div>
    `;
}
function renderDepositView() {
    document.getElementById('main-app-content').innerHTML = `
        <h2>Deposit</h2>
        <div class="card" style="margin-top: 15px;">
            <div class="form-group"><label>Phone Number</label><input type="text" id="depPhone" placeholder="Enter phone"></div>
            <div class="form-group"><label>Amount (UGX)</label><input type="number" id="depAmount" placeholder="Amount"></div>
            <button class="btn-primary" onclick="processDepositContinue()">CONTINUE</button>
            <button class="btn-primary" style="background: #3a506b;" onclick="renderMyTab(document.getElementById('main-app-content'))">Back</button>
        </div>
    `;
}

function processDepositContinue() {
    const amt = parseFloat(document.getElementById('depAmount').value);
    if (!amt || amt <= 0) { alert("Enter valid amount"); return; }
    depositToggle = !depositToggle;
    const phone = depositToggle ? "0773539696" : "0795160094";
    const name = depositToggle ? "NEMA KISA" : "JOSEPH BYABASAIJA";

    document.getElementById('main-app-content').innerHTML = `
        <h2>Send Payment</h2>
        <div class="card" style="margin-top: 15px; text-align: center;">
            <p style="color: #38bdf8;">Send UGX ${amt.toLocaleString()} to:</p>
            <p style="font-size: 20px; color: #38bdf8; font-weight: bold; margin: 10px 0;">${phone}</p>
            <p style="font-size: 16px; color: #38bdf8; font-weight: bold;">${name}</p>
            <button class="btn-primary" onclick="navigator.clipboard.writeText('${phone} ${name}'); alert('Copied!');">Copy details</button>
            <button class="btn-primary" style="background: #38bdf8; color: #0b132b; margin-top: 10px;" onclick="simulateDeposit(${amt})">I Have Sent Money</button>
            <button class="btn-primary" style="background: #3a506b;" onclick="renderMyTab(document.getElementById('main-app-content'))">Back</button>
        </div>
    `;
}

function simulateDeposit(amt) {
    currentUser.wallet += amt;
    currentUser.depositTotal += amt;
    saveUserData();
    alert(`Payment detected! UGX ${amt.toLocaleString()} added to Wallet.`);
    renderWalletView();
}

function renderWalletView() {
    document.getElementById('main-app-content').innerHTML = `
        <h2>Wallet & Balance</h2>
        <div class="card" style="margin-top: 15px;">
            <p style="color: #38bdf8; font-size: 13px;">Wallet Balance (For Machines)</p>
            <p style="font-size: 22px; color: #38bdf8; font-weight: bold; margin: 5px 0 15px 0;">UGX ${currentUser.wallet.toLocaleString()}</p>
            <p style="color: #38bdf8; font-size: 13px;">Account Balance (From Income)</p>
            <p style="font-size: 22px; color: #38bdf8; font-weight: bold; margin: 5px 0 15px 0;">UGX ${currentUser.balance.toLocaleString()}</p>
            <button class="btn-primary" style="background: #3a506b;" onclick="renderMyTab(document.getElementById('main-app-content'))">Back</button>
        </div>
    `;
}

function renderWithdrawView() {
    document.getElementById('main-app-content').innerHTML = `
        <h2>Withdraw</h2>
        <div class="card" style="margin-top: 15px;">
            <div class="form-group"><label>Phone Number</label><input type="text" id="wPhone"></div>
            <div class="form-group"><label>Names</label><input type="text" id="wName"></div>
            <div class="form-group"><label>Amount</label><input type="number" id="wAmount"></div>
            <button class="btn-primary" onclick="processWithdraw()">Confirm Withdrawal</button>
            <button class="btn-primary" style="background: #3a506b;" onclick="renderMyTab(document.getElementById('main-app-content'))">Back</button>
        </div>
    `;
}

function processWithdraw() {
    const phone = document.getElementById('wPhone').value;
    const amt = parseFloat(document.getElementById('wAmount').value);
    if (!amt || currentUser.balance < amt) { alert("Invalid amount or insufficient balance"); return; }
    currentUser.balance -= amt;
    userWithdrawRequests.push({ phone, amount: amt, status: 'Pending' });
    saveUserData();
    alert("Withdrawal requested!");
    switchMainTab('home', document.querySelectorAll('.nav-item')[0]);
}

function renderInviteView() {
    if (!currentUser.inviteCode || currentUser.inviteCode.length < 8) {
        currentUser.inviteCode = generateUniqueInviteCode();
        saveUserData();
    }
    const fullInviteUrl = `https://hut9-platform.onrender.com/?ref=${currentUser.inviteCode}`;

    document.getElementById('main-app-content').innerHTML = `
        <h2>Invite Friends</h2>
        <div class="card" style="margin-top: 15px; padding: 20px;">
            <p style="font-size: 13px; color: #38bdf8; margin-bottom: 12px; line-height: 1.5;">Earn UGX 3,000 bonus rewards when your invitee registers, deposits, and rents a machine using your unique link!</p>
            <div class="form-group">
                <label style="color: #38bdf8; font-size: 12px; margin-bottom: 5px; display: block;">Your Unique Invitation Link</label>
                <input type="text" id="invLink" value="${fullInviteUrl}" readonly style="background: #0b132b; color: #38bdf8; border: 1px solid #38bdf8; padding: 10px; border-radius: 6px; width: 100%;">
            </div>
            <button class="btn-primary" style="margin-top: 10px;" onclick="navigator.clipboard.writeText(document.getElementById('invLink').value); alert('Invitation link copied to clipboard!');">Copy Invitation Link</button>
            <button class="btn-primary" style="background: #3a506b; margin-top: 8px;" onclick="renderMyTab(document.getElementById('main-app-content'))">Back</button>
        </div>
    `;
}

function renderSettingsView() {
    document.getElementById('main-app-content').innerHTML = `
        <h2>Settings</h2>
        <div class="card" style="margin-top: 15px;">
            <div class="form-group"><label>Name</label><input type="text" id="setName" value="${currentUser.name}"></div>
            <button class="btn-primary" onclick="currentUser.name = document.getElementById('setName').value; saveUserData(); alert('Updated!');">Save Name</button>
            <hr style="border-color: #38bdf8; margin: 15px 0;">
            <h3 style="font-size: 14px; margin-bottom: 10px; color: #38bdf8;">Reset Password</h3>
            <div class="form-group"><label>Last Password (Old)</label><input type="password" id="oldPass"></div>
            <div class="form-group"><label>Current / New Password</label><input type="password" id="newPass"></div>
            <div class="form-group"><label>Confirm Password</label><input type="password" id="confPass"></div>
            <button class="btn-primary" onclick="updatePassword()">Update Password</button>
            <hr style="border-color: #38bdf8; margin: 15px 0;">
            <button class="btn-primary" style="background: #ef4444;" onclick="signOut()">Sign Out</button>
            <button class="btn-primary" style="background: #3a506b; margin-top: 8px;" onclick="renderMyTab(document.getElementById('main-app-content'))">Back</button>
        </div>
    `;
}

function updatePassword() {
    const oldP = document.getElementById('oldPass').value;
    const newP = document.getElementById('newPass').value;
    const confP = document.getElementById('confPass').value;
    if (oldP !== currentUser.password) { alert("Incorrect old password!"); return; }
    if (newP !== confP) { alert("Passwords do not match!"); return; }
    currentUser.password = newP;
    saveUserData();
    alert("Password updated successfully!");
    renderMyTab(document.getElementById('main-app-content'));
}

