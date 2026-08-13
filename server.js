const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const users = [];
const WELCOME_BONUS = 5000;

app.post('/api/auth/register', (req, res) => {
  const { phone_number, password } = req.body;
  
  // Accepts +256 followed by exactly 9 digits (e.g., +256759537511 or +256391234567)
  const ugandaPhoneRegex = /^\+256\d{9}$/;
  
  if (!ugandaPhoneRegex.test(phone_number)) {
    return res.status(400).json({ error: 'Invalid Ugandan phone format! Must be +256 followed by 9 digits (e.g. +256759537511).' });
  }

  const existingUser = users.find(u => u.phone_number === phone_number);
  if (existingUser) return res.status(400).json({ error: 'Phone number already registered.' });

  const newUser = { id: users.length + 1, phone_number, password, balance: WELCOME_BONUS };
  users.push(newUser);

  res.status(201).json({ message: 'Success!', user: newUser });
});

app.get('/api/machines', (req, res) => {
  res.json([
    { id: 1, name: 'HUT 1 Starter Miner', price: 15000, daily_return: 1500 },
    { id: 2, name: 'HUT 3 Turbo Miner', price: 50000, daily_return: 5500 },
    { id: 3, name: 'HUT 9 Pro Rig', price: 150000, daily_return: 18000 }
  ]);
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = 5000;
app.listen(PORT, () => console.log(`HUT 9 active at http://localhost:${PORT}`));
