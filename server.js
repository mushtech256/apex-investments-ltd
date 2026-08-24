const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));


let users = [];

// STRUCTURED MACHINE SERIES
const MACHINE_SERIES = {
  'C-SERIES': [
    { id: 101, name: 'HUT 1 Starter Miner', price: 15000, daily_return: 1000, days: 30 },
    { id: 102, name: 'HUT 3 Turbo Miner', price: 50000, daily_return: 3500, days: 45 },
    { id: 103, name: 'HUT 9 Pro Rig', price: 150000, daily_return: 12000, days: 60 }
  ],
  'D-SERIES': [
    { id: 201, name: 'D-1 Express Miner', price: 30000, daily_return: 2200, days: 30 },
    { id: 202, name: 'D-2 Advanced Rig', price: 100000, daily_return: 7800, days: 45 }
  ],
  'F-SERIES': [
    { id: 301, name: 'F-1 Power Node', price: 200000, daily_return: 16000, days: 60 },
    { id: 302, name: 'F-2 Ultra Cluster', price: 500000, daily_return: 42000, days: 90 }
  ],
  'Z-SERIES': [
    { id: 401, name: 'Z-1 Quantum Vault', price: 800000, daily_return: 70000, days: 90 },
    { id: 402, name: 'Z-2 Apex Core', price: 1500000, daily_return: 135000, days: 120 }
  ],
  'VIP-SERIES': [
    { id: 501, name: 'VIP Supreme Engine', price: 3000000, daily_return: 300000, days: 180 }
  ]
};

// Flatten list helper for validation
const ALL_MACHINES = Object.values(MACHINE_SERIES).flat().map(m => ({
  ...m,
  total_return: m.daily_return * m.days
}));

// REGISTER ROUTE
app.post('/api/auth/register', (req, res) => {
  const { phone_number, password } = req.body;
  const ugandaPhoneRegex = /^\+256\d{9}$/;

  if (!ugandaPhoneRegex.test(phone_number)) {
    return res.status(400).json({ error: 'Invalid format! Use +256...' });
  }

  let existingUser = users.find(u => u.phone_number === phone_number);
  if (existingUser) {
    return res.status(400).json({ error: 'Phone number already registered' });
  }

  const newUser = { id: users.length + 1, phone_number, password, balance: 0, daily_earning: 0 };
  users.push(newUser);

  res.status(201).json({ message: 'Success!', user: newUser });
});

// LOGIN ROUTE
app.post('/api/auth/login', (req, res) => {
  const { phone_number, password } = req.body;
  const user = users.find(u => u.phone_number === phone_number && u.password === password);
  if (!user) {
    return res.status(400).json({ error: 'Invalid phone number or password' });
  }
  res.status(200).json({ message: 'Login successful!', user });
});

// GET MACHINES (BY SERIES OR ALL)
app.get('/api/machines', (req, res) => {
  const formattedData = {};
  for (let series in MACHINE_SERIES) {
    formattedData[series] = MACHINE_SERIES[series].map(m => ({
      ...m,
      total_return: m.daily_return * m.days
    }));
  }
  res.json(formattedData);
});

// BUY MACHINE
app.post('/api/buy', (req, res) => {
  const { phone_number, machineId } = req.body;
  const user = users.find(u => u.phone_number === phone_number);
  const machine = ALL_MACHINES.find(m => m.id === Number(machineId));

  if (!user || !machine) return res.status(400).json({ error: 'Invalid request' });
  if (user.balance < machine.price) return res.status(400).json({ error: 'Insufficient balance' });

  user.balance -= machine.price;
  user.daily_earning += machine.daily_return;
  res.json({ message: 'Machine purchased successfully', user });
});

// CLAIM ROUTE
app.post('/api/claim', (req, res) => {
  const { phone_number } = req.body;
  const user = users.find(u => u.phone_number === phone_number);

  if (!user || user.daily_earning <= 0) return res.status(400).json({ error: 'No earnings to claim' });

  user.balance += user.daily_earning;
  res.json({ message: `Claimed +${user.daily_earning} UGX daily earnings!`, balance: user.balance });
});

// MOCK DEPOSIT ROUTE
app.post('/api/deposit', async (req, res) => {
  try {
    const { phone, amount } = req.body;
    if (!phone || !amount) {
      return res.status(400).json({ success: false, message: 'Phone and amount are required' });
    }

    let cleanPhone = phone.toString().replace(/\+/g, '').trim();
    if (cleanPhone.startsWith('0')) cleanPhone = '256' + cleanPhone.slice(1);
    const formattedPhone = '+' + cleanPhone;

    let user = users.find(u => u.phone_number === formattedPhone);
    if (user) {
      user.balance = (user.balance || 0) + Number(amount);
    }

    console.log(`[MOCK DEPOSIT] Credited ${amount} UGX to ${formattedPhone}`);
    return res.json({ success: true, message: 'Deposit simulated successfully! (Mock Mode)' });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error processing mock deposit' });
  }
});


app.post('/api/auth/register', (req, res) => {
  const { phone_number, password, confirm_password } = req.body;
  const ugandaPhoneRegex = /^\+256\d{9}$/;

  if (!ugandaPhoneRegex.test(phone_number)) {
    return res.status(400).json({ error: 'Invalid format! Use +256...' });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  let existingUser = users.find(u => u.phone_number === phone_number);
  if (existingUser) {
    return res.status(400).json({ error: 'Phone number already registered!' });
  }

  const newUser = { id: users.length + 1, phone_number, password };
  users.push(newUser);

  res.status(201).json({ message: 'Success!', user: newUser });
});
/// Catch-all route that handles the root, query parameters, and all sub-paths
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

