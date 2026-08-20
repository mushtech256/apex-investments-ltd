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
    name: 'Mr. Rodgers',
    avatar: '👤',
    inviteCode: ''
};

let userPurchasedMachines = []; 
let userWithdrawRequests = []; 
let depositToggle = false;

function sanitizePhone(phoneInput) {
    if (!phoneInput) return '';
    let cleaned = phoneInput.trim().replace(/\s+/g, '');
    // Standardize Ugandan numbers for smooth matching
    if (cleaned.startsWith('0')) {
        cleaned = '+256' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+')) {
        cleaned = '+256' + cleaned;
    }
    return cleaned;
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

        // Check if phone already exists (checking both normalized and raw formats)
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

    // Login validation (checking both normalized and raw inputs)
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
        inviteCode: `https://hut9-platform.onrender.com/?ref=${phone}`
    };

    userPurchasedMachines = currentUser.purchasedMachines || [];
    userWithdrawRequests = currentUser.withdrawRequests || [];

    alert("Login successful!");
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('main-app-content').style.display = 'block';
    document.getElementById('bottomNavbar').style.display = 'flex';
    
    switchMainTab('home', document.querySelector('.nav-item'));
}

