const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Your MongoDB Atlas Connection String
const MONGO_URI = "mongodb+srv://mushtech256_db_user:Mtvt96J1IcyL78Eu@cluster0.kd5otgm.mongodb.net/?appName=Cluster0";

// Connect to MongoDB Atlas
mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define User Schema & Model
const userSchema = new mongoose.Schema({
  phone_number: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

let withdrawals = [];

// STRUCTURED MACHINE SERIES
const MACHINE_SERIES = {
  'C-SERIES': [
    { id: 101, name: 'HUT 1 Starter Miner', price: 15000, daily_return: 500, days: 30 },
    { id: 102, name: 'HUT 3 Turbo Miner', price: 50000, daily_return: 3500, days: 30 },
    { id: 103, name: 'HUT 9 Pro Rig', price: 150000, daily_return: 12000, days: 30 }
  ],
  'D-SERIES': [
    { id: 201, name: 'D-1 Express Miner', price: 30000, daily_return: 2200, days: 30 },
    { id: 202, name: 'D-2 Advanced Rig', price: 100000, daily_return: 7500, days: 30 }
  ],
  'F-SERIES': [
    { id: 301, name: 'F-1 Power Node', price: 200000, daily_return: 16000, days: 30 },
    { id: 302, name: 'F-2 Ultra Cluster', price: 500000, daily_return: 42000, days: 30 }
  ],
  'Z-SERIES': [
    { id: 401, name: 'Z-1 Quantum Vault', price: 800000, daily_return: 70000, days: 30 },
    { id: 402, name: 'Z-2 Apex Core', price: 1500000, daily_return: 135000, days: 30 }
  ],
  'VIP-SERIES': [
    { id: 501, name: 'VIP Supreme Engine', price: 3000000, daily_return: 300000, days: 30 }
  ]
};

// REGISTER ROUTE (Connected to MongoDB)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { phone_number, password } = req.body;
    const ugandaPhoneRegex = /^\+256\d{9}$/;

    if (!ugandaPhoneRegex.test(phone_number)) {
      return res.status(400).json({ error: 'Invalid format! Use +256...' });
    }

    let existingUser = await User.findOne({ phone_number });
    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ phone_number, password: hashedPassword, balance: 0 });
    await newUser.save();

    res.status(201).json({ message: 'Success!', user: { id: newUser._id, phone_number: newUser.phone_number } });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// LOGIN ROUTE (Connected to MongoDB)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone_number, password } = req.body;
    const user = await User.findOne({ phone_number });
    
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    res.json({ message: 'Login successful', user: { id: user._id, phone_number: user.phone_number, balance: user.balance } });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

