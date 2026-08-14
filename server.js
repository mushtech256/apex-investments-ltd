const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

let users = [];

const MACHINES = [
  { id: 1, name: 'HUT 1 Starter Miner', price: 15000, daily_return: 1500 },
  { id: 2, name: 'HUT 3 Turbo Miner', price: 50000, daily_return: 5500 },
  { id: 3, name: 'HUT 9 Pro Rig', price: 150000, daily_return: 18000 }
];

app.post('/api/auth/register', (req, res) => {
  const { phone_number, password } = req.body;
  const ugandaPhoneRegex = /^\+256\d{9}$/;
  
  if (!ugandaPhoneRegex.test(phone_number)) {
    return res.status(400).json({ error: 'Invalid format! Use +256 followed by 9 digits.' });
  }

  let user = users.find(u => u.phone_number === phone_number);
  if (!user) {
    user = { id: users.length + 1, phone_number, password, balance: 5000, daily_earning: 0 };
    users.push(user);
  }

  res.status(200).json({ message: 'Success!', user });
});

app.get('/api/machines', (req, res) => res.json(MACHINES));

app.post('/api/buy', (req, res) => {
  const { phone_number, machineId } = req.body;
  const user = users.find(u => u.phone_number === phone_number);
  const machine = MACHINES.find(m => m.id === machineId);

  if (!user || !machine) return res.status(400).json({ error: 'Invalid request' });
  if (user.balance < machine.price) return res.status(400).json({ error: 'Insufficient balance! Deposit funds first.' });

  user.balance -= machine.price;
  user.daily_earning += machine.daily_return;

  res.json({ message: `Successfully purchased ${machine.name}!`, user });
});

app.post('/api/claim', (req, res) => {
  const { phone_number } = req.body;
  const user = users.find(u => u.phone_number === phone_number);

  if (!user || user.daily_earning <= 0) return res.status(400).json({ error: 'No daily earnings available.' });

  user.balance += user.daily_earning;
  res.json({ message: `Claimed +${user.daily_earning} UGX daily earnings!`, user });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
