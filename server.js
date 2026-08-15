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

// DEPOSIT ROUTE
app.post('/api/deposit', async (req, res) => {
  try {
    const { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ success: false, message: 'Phone and amount are required' });
    }

    let formattedPhone = phone.toString().replace(/\+/g, '').trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '256' + formattedPhone.slice(1);
    }

    const payload = {
      account_no: process.env.RELWORX_ACCOUNT_NO,
      reference: `DEP-${Date.now()}`,
      msisdn: formattedPhone,
      amount: Number(amount),
      currency: 'UGX',
      description: 'Account Deposit'
    };

    console.log("Sending payload to Relworx:", payload);

    const response = await fetch('https://api.relworx.com/v1/mobile-money/request-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Authorization': `Bearer ${process.env.RELWORX_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log("Relworx raw response:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Relworx returned non-JSON response. Check API credentials or endpoint.' });
    }

    if (response.ok && (data.status === 'success' || data.success)) {
      return res.json({ success: true, message: 'PIN prompt sent successfully' });
    } else {
      return res.status(400).json({ success: false, message: data.message || data.error || 'Relworx payment initiation failed' });
    }

  } catch (error) {
    console.error('Deposit Error Details:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error processing deposit' });
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
