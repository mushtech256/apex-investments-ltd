const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

let users = [];

const MACHINES = [
  { id: 1, name: 'HUT 1 Starter Miner', price: 15000, daily_return: 1000 },
  { id: 2, name: 'HUT 3 Turbo Miner', price: 50000, daily_return: 3500 },
  { id: 3, name: 'HUT 9 Pro Rig', price: 150000, daily_return: 12000 }
];

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

app.get('/api/machines', (req, res) => res.json(MACHINES));

app.post('/api/buy', (req, res) => {
  const { phone_number, machineId } = req.body;
  const user = users.find(u => u.phone_number === phone_number);
  const machine = MACHINES.find(m => m.id === machineId);

  if (!user || !machine) return res.status(400).json({ error: 'Invalid request' });
  if (user.balance < machine.price) return res.status(400).json({ error: 'Insufficient balance' });

  user.balance -= machine.price;
  user.daily_earning += machine.daily_return;
  res.json({ message: 'Machine purchased successfully', user });
});

app.post('/api/claim', (req, res) => {
  const { phone_number } = req.body;
  const user = users.find(u => u.phone_number === phone_number);

  if (!user || user.daily_earning <= 0) return res.status(400).json({ error: 'No earnings to claim' });

  user.balance += user.daily_earning;
  res.json({ message: `Claimed +${user.daily_earning} UGX daily earnings!`, balance: user.balance });
});

// MOCK DEPOSIT ROUTE (For Testing UI Flow)
app.post('/api/deposit', async (req, res) => {
  try {
    const { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ success: false, message: 'Phone and amount are required' });
    }

    let cleanPhone = phone.toString().replace(/\+/g, '').trim();
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '256' + cleanPhone.slice(1);
    }
    const formattedPhone = '+' + cleanPhone;

    // Simulate crediting the user balance directly for development
    let user = users.find(u => u.phone_number === formattedPhone);
    if (user) {
      user.balance = (user.balance || 0) + Number(amount);
    }

    console.log(`[MOCK DEPOSIT] Successfully credited ${amount} UGX to ${formattedPhone}`);

    return res.json({
      success: true,
      message: 'Deposit simulated successfully! (Mock Mode)'
    });

  } catch (error) {
    console.error('Deposit Error Details:', error);
    return res.status(500).json({ success: false, message: 'Server error processing mock deposit' });
  }
});

// RELWORX WEBHOOK
app.post('/api/relworx-callback', (req, res) => {
  const { status, amount, msisdn } = req.body;

  if (status === 'SUCCESS' || status === 'COMPLETED') {
    const user = users.find(u => u.phone_number === msisdn);
    if (user) {
      user.balance = (user.balance || 0) + Number(amount);
      console.log(`Credited ${amount} to ${msisdn}`);
    }
  }

  res.status(200).json({ status: 'ok' });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
