const AUTH_CONFIG = {
    DB_KEY: 'hut9_accounts_db',
    MIN_PASSWORD_LENGTH: 6
};
// Global App State with dynamic user defaults
let userBalance = 0;
let userWallet = 0;
let userPendingWithdrawals = [];
let userPurchasedMachines = [];
let userProfile = {
    name: "Investor",
    phone: "Not Set",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    password: "password123"
};
let depositAttemptToggle = false;

// Main Tab Router
function switchMainTab(tabName, element) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (element) element.classList.add('active');

    const mainContent = document.getElementById('main-content') || document.getElementById('main');
    if (!mainContent) return;
    mainContent.innerHTML = '';

    if (tabName === 'home') renderHomeTab(mainContent);
    else if (tabName === 'raffle') renderRaffleTab(mainContent);
    else if (tabName === 'chats') renderChatsTab(mainContent);
    else if (tabName === 'ai') renderAiDashboard(mainContent);
    else if (tabName === 'income') renderIncomeTab(mainContent);
    else if (tabName === 'my') renderMyTab(mainContent);
}

// 1. HOME TAB
function renderHomeTab(container) {
    let pendingHtml = userPendingWithdrawals.map((w, index) => `
        <div onclick="showWithdrawDetails(${index})" style="background: #1e2952; padding: 10px; border-radius: 8px; margin-top: 8px; cursor: pointer;">
            <p style="margin:0; font-size:13px; color:#38bdf8;">Withdrawal: UGX ${w.amount.toLocaleString()} (${w.status})</p>
            <p style="margin:0; font-size:11px; color:#94a3b8;">Tap to view details</p>
        </div>
    `).join('') || '<p style="font-size:12px; color:#94a3b8;">No pending withdrawal requests.</p>';

    container.innerHTML = `
        <div style="padding: 15px;">
            <h2 style="color: #38bdf8; margin-bottom: 5px;">Welcome Back, ${userProfile.name}</h2>
            <p style="font-size: 13px; color: #cbd5e1;">Account Balance: UGX ${userBalance.toLocaleString()}</p>
            <p style="font-size: 13px; color: #cbd5e1;">Active Wallet: UGX ${userWallet.toLocaleString()}</p>
            <div style="background: #101935; border: 1px solid #1e2952; border-radius: 12px; padding: 15px; margin-top: 15px;">
                <h4 style="margin-top:0; color:#38bdf8;">Withdrawal Records</h4>
                ${pendingHtml}
            </div>
        </div>
    `;
}

function showWithdrawDetails(index) {
    let w = userPendingWithdrawals[index];
    alert(`Withdrawal Details:\nName: ${w.name}\nPhone: ${w.phone}\nAmount: UGX ${w.amount.toLocaleString()}\nStatus: ${w.status}`);
}

// 2. RAFFLE TAB
function renderRaffleTab(container) {
    container.innerHTML = `<div style="padding: 20px; text-align: center;"><h3 style="color:#38bdf8;">Raffle Section</h3><p>Participate and win exclusive daily rewards!</p></div>`;
}

// 3. CHATS TAB
function renderChatsTab(container) {
    container.innerHTML = `<div style="padding: 20px; text-align: center;"><h3 style="color:#38bdf8;">Community Chats</h3><p>Connect with other elite investors.</p></div>`;
}

// 4. AI MACHINES DASHBOARD
function renderAiDashboard(container) {
    container.innerHTML = `
        <div style="padding: 15px;">
            <h3 style="color: #38bdf8;">AI Mining & Elite Machines</h3>
            <div style="background: #101935; padding: 15px; border-radius: 12px; border: 1px solid #1e2952; margin-bottom: 12px;">
                <h4 style="margin:0 0 8px 0; color:#fff;">VIP 1 Elite Core (1X)</h4>
                <p style="margin:4px 0; font-size:13px; color:#cbd5e1;">Price: UGX 2,500,000</p>
                <p style="margin:4px 0; font-size:13px; color:#38bdf8;">Daily Payout: UGX 250,000</p>
                <button onclick="rentMachine(2500000, 'VIP 1 Elite Core')" style="width:100%; background:#06b6d4; border:none; padding:10px; border-radius:8px; font-weight:bold; margin-top:8px; cursor:pointer;">Rent Machine</button>
            </div>
            <div style="background: #101935; padding: 15px; border-radius: 12px; border: 1px solid #1e2952; margin-bottom: 12px;">
                <h4 style="margin:0 0 8px 0; color:#fff;">VIP 3 Elite Core (3X)</h4>
                <p style="margin:4px 0; font-size:13px; color:#cbd5e1;">Price: UGX 6,000,000</p>
                <p style="margin:4px 0; font-size:13px; color:#38bdf8;">Daily Payout: UGX 1,000,000</p>
                <button onclick="rentMachine(6000000, 'VIP 3 Elite Core')" style="width:100%; background:#06b6d4; border:none; padding:10px; border-radius:8px; font-weight:bold; margin-top:8px; cursor:pointer;">Rent Machine</button>
            </div>
        </div>
    `;
}

function rentMachine(price, name) {
    if (userWallet < price) {
        alert("Insufficient wallet balance to rent this machine. Please deposit funds first.");
        return;
    }
    userWallet -= price;
    userPurchasedMachines.push({ name, price, status: 'Active' });
    alert(`Successfully rented ${name}! UGX ${price.toLocaleString()} has been deducted from your wallet.`);
}

// 5. INCOME TAB
function renderIncomeTab(container) {
    let machinesHtml = userPurchasedMachines.map((m, i) => `
        <div style="background:#101935; padding:12px; border-radius:8px; margin-bottom:10px; border:1px solid #1e2952;">
            <p style="margin:0; font-weight:bold; color:#38bdf8;">${m.name}</p>
            <p style="margin:5px 0; font-size:12px; color:#cbd5e1;">Status: ${m.status}</p>
            <button onclick="receiveMachineIncome(${i})" style="background:#10b981; border:none; color:#fff; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer;">Receive Income</button>
        </div>
    `).join('') || '<p style="color:#94a3b8; font-size:13px;">No active rented machines found.</p>';

    container.innerHTML = `
        <div style="padding: 15px;">
            <h3 style="color: #38bdf8;">Income & Earnings</h3>
            <p style="font-size:13px; color:#cbd5e1;">Current Balance: UGX ${userBalance.toLocaleString()}</p>
            <div style="margin-top: 15px;">${machinesHtml}</div>
        </div>
    `;
}

function receiveMachineIncome(index) {
    let machine = userPurchasedMachines[index];
    let earnings = 250000; // Accrued return
    userBalance += earnings;
    alert(`Successfully collected UGX ${earnings.toLocaleString()} from ${machine.name}! Added to your balance.`);
    renderIncomeTab(document.getElementById('main-content'));
}

// 6. MY TAB & SUB-MENUS
function renderMyTab(container) {
    container.innerHTML = `
        <div style="padding: 15px;">
            <div style="display: flex; align-items: center; gap: 12px; background: #101935; padding: 15px; border-radius: 12px; border: 1px solid #1e2952; margin-bottom: 15px;">
                <img src="${userProfile.avatar}" style="width: 55px; height: 55px; border-radius: 50%; object-fit: cover;">
                <div>
                    <h3 style="margin: 0; color: #fff; font-size: 16px;">${userProfile.name}</h3>
                    <p style="margin: 3px 0 0 0; color: #94a3b8; font-size: 12px;">Phone: ${userProfile.phone}</p>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
                <button onclick="renderDepositView()" style="background:#101935; color:#fff; border:1px solid #1e2952; padding:12px; border-radius:8px; text-align:left; font-weight:bold; cursor:pointer;">💳 Deposit</button>
                <button onclick="renderWalletView()" style="background:#101935; color:#fff; border:1px solid #1e2952; padding:12px; border-radius:8px; text-align:left; font-weight:bold; cursor:pointer;">💰 Wallet</button>
                <button onclick="renderWithdrawView()" style="background:#101935; color:#fff; border:1px solid #1e2952; padding:12px; border-radius:8px; text-align:left; font-weight:bold; cursor:pointer;">🏦 Withdraw</button>
                <button onclick="renderInviteView()" style="background:#101935; color:#fff; border:1px solid #1e2952; padding:12px; border-radius:8px; text-align:left; font-weight:bold; cursor:pointer;">🔗 Invite Friends</button>
                <button onclick="window.open('https://t.me/hut9uganda', '_blank')" style="background:#101935; color:#38bdf8; border:1px solid #1e2952; padding:12px; border-radius:8px; text-align:left; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:space-between;">
                    <span>✈️ Customer Care (Telegram)</span>
                    <span style="font-size:12px; background:#0284c7; color:#fff; padding:3px 8px; border-radius:4px;">Join</span>
                </button>
                <button onclick="alert('Downloading APK package...')" style="background:#101935; color:#fff; border:1px solid #1e2952; padding:12px; border-radius:8px; text-align:left; font-weight:bold; cursor:pointer;">📥 Download App</button>
                <button onclick="renderSettingsView()" style="background:#101935; color:#fff; border:1px solid #1e2952; padding:12px; border-radius:8px; text-align:left; font-weight:bold; cursor:pointer;">⚙️ Settings & Security</button>
            </div>
        </div>
    `;
}

// DEPOSIT SUB-VIEW (Rotating Numbers)
function renderDepositView() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div style="padding: 15px;">
            <button onclick="renderMyTab(document.getElementById('main-content'))" style="background:none; border:none; color:#38bdf8; font-weight:bold; cursor:pointer; margin-bottom:10px;">← Back</button>
            <h3 style="color: #38bdf8;">Deposit Funds</h3>
            <div style="background:#101935; padding:15px; border-radius:12px; border:1px solid #1e2952;">
                <label style="font-size:13px; color:#cbd5e1;">Your Phone Number</label>
                <input type="text" id="dep-phone" value="${userProfile.phone !== 'Not Set' ? userProfile.phone : ''}" placeholder="e.g. 0770000000" style="width:100%; padding:10px; margin-top:5px; margin-bottom:12px; background:#0b1329; border:1px solid #1e2952; color:#fff; border-radius:6px;">
                
                <label style="font-size:13px; color:#cbd5e1;">Amount (UGX)</label>
                <input type="number" id="dep-amount" placeholder="Enter amount" style="width:100%; padding:10px; margin-top:5px; margin-bottom:15px; background:#0b1329; border:1px solid #1e2952; color:#fff; border-radius:6px;">
                
                <button onclick="processDepositStep()" style="width:100%; background:#06b6d4; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;">CONTINUE</button>
            </div>
        </div>
    `;
}

function processDepositStep() {
    const phone = document.getElementById('dep-phone').value;
    const amount = document.getElementById('dep-amount').value;
    if(!phone || !amount) {
        alert("Please fill in both fields.");
        return;
    }

    // Automatically sync phone number to user profile if not set
    if(userProfile.phone === 'Not Set') {
        userProfile.phone = phone;
    }

    // Toggle rotating numbers
    depositAttemptToggle = !depositAttemptToggle;
    let agentNumber = depositAttemptToggle ? "0795160094" : "0773539696";
    let agentName = depositAttemptToggle ? "JOSEPH BYABASAIJA" : "NEMA KISA";

    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div style="padding: 15px;">
            <button onclick="renderDepositView()" style="background:none; border:none; color:#38bdf8; font-weight:bold; cursor:pointer; margin-bottom:10px;">← Back to Deposit</button>
            <h3 style="color: #38bdf8;">Complete Payment</h3>
            <div style="background:#101935; padding:15px; border-radius:12px; border:1px solid #1e2952;">
                <p style="font-size:13px; color:#cbd5e1;">Send <b>UGX ${Number(amount).toLocaleString()}</b> to the details below:</p>
                <div style="background:#0b1329; padding:12px; border-radius:8px; margin:10px 0; border:1px solid #1e2952;">
                    <p style="margin:0; font-size:15px; color:#38bdf8; font-weight:bold;">Number: ${agentNumber} <button onclick="navigator.clipboard.writeText('${agentNumber}');alert('Number copied!');" style="background:#0284c7; border:none; color:#fff; padding:2px 6px; border-radius:4px; font-size:11px; cursor:pointer; margin-left:6px;">Copy</button></p>
                    <p style="margin:5px 0 0 0; font-size:13px; color:#fff;">Name: ${agentName} <button onclick="navigator.clipboard.writeText('${agentName}');alert('Name copied!');" style="background:#0284c7; border:none; color:#fff; padding:2px 6px; border-radius:4px; font-size:11px; cursor:pointer; margin-left:6px;">Copy</button></p>
                </div>
                <button onclick="simulateSuccessfulPayment(${amount})" style="width:100%; background:#10b981; border:none; padding:12px; border-radius:8px; font-weight:bold; color:#fff; cursor:pointer; margin-top:10px;">I Have Sent Money (Verify)</button>
            </div>
        </div>
    `;
}

function simulateSuccessfulPayment(amount) {
    userWallet += Number(amount);
    alert(`Payment of UGX ${Number(amount).toLocaleString()} automatically detected and credited to your wallet!`);
    switchMainTab('home', document.querySelector('.nav-item'));
}

// WALLET SUB-VIEW
function renderWalletView() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div style="padding: 15px;">
            <button onclick="renderMyTab(document.getElementById('main-content'))" style="background:none; border:none; color:#38bdf8; font-weight:bold; cursor:pointer; margin-bottom:10px;">← Back</button>
            <h3 style="color: #38bdf8;">My Wallet</h3>
            <div style="background:#101935; padding:20px; border-radius:12px; border:1px solid #1e2952; text-align:center;">
                <p style="font-size:14px; color:#cbd5e1; margin:0;">Active Wallet Balance</p>
                <h1 style="color:#38bdf8; margin:10px 0;">UGX ${userWallet.toLocaleString()}</h1>
                <p style="font-size:11px; color:#94a3b8;">Funds available for renting machines.</p>
            </div>
        </div>
    `;
}

// WITHDRAW SUB-VIEW
function renderWithdrawView() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div style="padding: 15px;">
            <button onclick="renderMyTab(document.getElementById('main-content'))" style="background:none; border:none; color:#38bdf8; font-weight:bold; cursor:pointer; margin-bottom:10px;">← Back</button>
            <h3 style="color: #38bdf8;">Withdraw Funds</h3>
            <div style="background:#101935; padding:15px; border-radius:12px; border:1px solid #1e2952;">
                <label style="font-size:13px; color:#cbd5e1;">Phone Number</label>
                <input type="text" id="w-phone" value="${userProfile.phone !== 'Not Set' ? userProfile.phone : ''}" placeholder="Enter recipient number" style="width:100%; padding:10px; margin-top:5px; margin-bottom:12px; background:#0b1329; border:1px solid #1e2952; color:#fff; border-radius:6px;">
                
                <label style="font-size:13px; color:#cbd5e1;">Account Names</label>
                <input type="text" id="w-name" value="${userProfile.name !== 'Investor' ? userProfile.name : ''}" placeholder="Enter registered names" style="width:100%; padding:10px; margin-top:5px; margin-bottom:12px; background:#0b1329; border:1px solid #1e2952; color:#fff; border-radius:6px;">
                
                <label style="font-size:13px; color:#cbd5e1;">Amount to Withdraw</label>
                <input type="number" id="w-amount" placeholder="Enter amount" style="width:100%; padding:10px; margin-top:5px; margin-bottom:15px; background:#0b1329; border:1px solid #1e2952; color:#fff; border-radius:6px;">
                
                <button onclick="submitWithdrawal()" style="width:100%; background:#06b6d4; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;">Confirm Withdrawal</button>
            </div>
        </div>
    `;
}

function submitWithdrawal() {
    const phone = document.getElementById('w-phone').value;
    const name = document.getElementById('w-name').value;
    const amount = Number(document.getElementById('w-amount').value);

    if(!phone || !name || !amount) {
        alert("Please fill in all withdrawal details.");
        return;
    }
    if(amount > userBalance) {
        alert("Insufficient balance.");
        return;
    }

    userBalance -= amount;
    userPendingWithdrawals.push({ phone, name, amount, status: 'Pending' });
    alert("Withdrawal submitted successfully! Check Home tab for pending status.");
    switchMainTab('home', document.querySelector('.nav-item'));
}

// INVITE SUB-VIEW
function renderInviteView() {
    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const inviteLink = `https://hut9-platform.onrender.com/register?ref=${randomCode}`;

    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div style="padding: 15px;">
            <button onclick="renderMyTab(document.getElementById('main-content'))" style="background:none; border:none; color:#38bdf8; font-weight:bold; cursor:pointer; margin-bottom:10px;">← Back</button>
            <h3 style="color: #38bdf8;">Invite Members & Earn</h3>
            <div style="background:#101935; padding:15px; border-radius:12px; border:1px solid #1e2952;">
                <p style="font-size:13px; color:#cbd5e1;">Share your professional referral link. Earn 3,000 UGX when your referral registers and buys a machine!</p>
                <input type="text" readonly value="${inviteLink}" id="invite-link-box" style="width:100%; padding:10px; margin:10px 0; background:#0b1329; border:1px solid #1e2952; color:#38bdf8; border-radius:6px; font-size:12px;">
                <button onclick="navigator.clipboard.writeText('${inviteLink}');alert('Invitation link copied successfully!');" style="width:100%; background:#06b6d4; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;">Copy Link</button>
            </div>
        </div>
    `;
}

// SETTINGS & PASSWORD RESET SUB-VIEW
function renderSettingsView() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div style="padding: 15px;">
            <button onclick="renderMyTab(document.getElementById('main-content'))" style="background:none; border:none; color:#38bdf8; font-weight:bold; cursor:pointer; margin-bottom:10px;">← Back</button>
            <h3 style="color: #38bdf8;">Settings & Security</h3>
            <div style="background:#101935; padding:15px; border-radius:12px; border:1px solid #1e2952; margin-bottom:15px;">
                <h4 style="margin-top:0; color:#fff; font-size:14px;">Profile Customization</h4>
                <label style="font-size:12px; color:#cbd5e1;">Display Name / Username</label>
                <input type="text" id="set-name" value="${userProfile.name}" style="width:100%; padding:8px; margin-top:4px; margin-bottom:10px; background:#0b1329; border:1px solid #1e2952; color:#fff; border-radius:6px;">
                
                <label style="font-size:12px; color:#cbd5e1;">Phone Number</label>
                <input type="text" id="set-phone" value="${userProfile.phone}" style="width:100%; padding:8px; margin-top:4px; margin-bottom:10px; background:#0b1329; border:1px solid #1e2952; color:#fff; border-radius:6px;">
                
                <label style="font-size:12px; color:#cbd5e1;">Avatar Image URL</label>
                <input type="text" id="set-avatar" value="${userProfile.avatar}" style="width:100%; padding:8px; margin-top:4px; margin-bottom:10px; background:#0b1329; border:1px solid #1e2952; color:#fff; border-radius:6px;">
                
                
le="width:100%; background:#0284c7; border:none; padding:10px; border-radius:6px; font-weight:bold; color:#fff; cursor:pointer;">Save Profile</button>
            </div>

            <div style="background:#101935; padding:15px; border-radius:12px; border:1px solid #1e2952;">
                <h4 style="margin-top:0; color:#fff; font-size:14px;">Reset Password</h4>
                <label style="font-size:12px; color:#cbd5e1;">Last Password</label>
                <input type="password" id="pass-old" placeholder="Enter last password" style="width:100%; padding:8px; margin-top:4px; margin-bottom:10px; background:#0b1329; border:1px solid #1e2952; color:#fff; border-radius:6px;">
                <label style="font-size:12px; color:#cbd5e1;">Current / New Password</label>
                <input type="password" id="pass-new" placeholder="Enter new password" style="width:100%; padding:8px; margin-top:4px; margin-bottom:10px; background:#0b1329; border:1px solid #1e2952; color:#fff; border-radius:6px;">
                
                <label style="font-size:12px; color:#cbd5e1;">Confirm Password</label>
                <input type="password" id="pass-confirm" placeholder="Confirm new password" style="width:100%; padding:8px; margin-top:4px; margin-bottom:12px; background:#0b1329; border:1px solid #1e2952; color:#fff; border-radius:6px;">
                
                <button onclick="updatePassword()" style="width:100%; background:#10b981; border:none; padding:10px; border-radius:6px; font-weight:bold; color:#fff; cursor:pointer;">Update Password</button>
            </div>
        </div>
    `;
}

function updateProfileDetails() {
    userProfile.name = document.getElementById('set-name').value;
    userProfile.phone = document.getElementById('set-phone').value;
    userProfile.avatar = document.getElementById('set-avatar').value;
    alert("Profile and phone details updated successfully!");
    renderMyTab(document.getElementById('main-content'));
}

function updatePassword() {
    let oldP = document.getElementById('pass-old').value;
    let newP = document.getElementById('pass-new').value;
    let confP = document.getElementById('pass-confirm').value;

    if (oldP !== userProfile.password) {
        alert("The last password you entered is incorrect.");
        return;
    }
    if (!newP || newP !== confP) {
        alert("New passwords do not match or are empty.");
        return;
    }

    userProfile.password = newP;
    alert("Password successfully updated! Use your new password for subsequent logins.");
    renderMyTab(document.getElementById('main-content'));
}

