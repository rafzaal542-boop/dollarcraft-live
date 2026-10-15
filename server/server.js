const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  credentials: true
}));

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://your_mongo_connection_string_here';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  balanceCents: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const ADMIN_EMAIL = 'dollarcraft3@gmail.com';

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName ? lastName.trim() : '',
      email: normalizedEmail,
      password: password,
      balanceCents: 0
    });

    await newUser.save();

    res.status(201).json({
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        name: `${newUser.firstName} ${newUser.lastName}`.trim(),
        email: newUser.email,
        createdAt: newUser.createdAt,
        balanceCents: newUser.balanceCents,
        role: 'user'
      },
      isAdmin: false
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        createdAt: user.createdAt,
        balanceCents: user.balanceCents,
        role: 'user'
      },
      isAdmin: false
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const formattedUsers = users.map(u => ({
      id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      name: `${u.firstName} ${u.lastName}`.trim(),
      email: u.email,
      createdAt: u.createdAt,
      balanceCents: u.balanceCents
    }));

    const adminMaster = {
      id: 'admin-master',
      email: ADMIN_EMAIL,
      name: 'Dollar Craft Admin',
      firstName: 'Dollar',
      lastName: 'Craft',
      createdAt: '2026-10-10T16:55:54.137Z',
      balanceCents: 0
    };

    res.json({ users: [adminMaster, ...formattedUsers] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users history.' });
  }
});

app.post('/api/users/:id/balance', async (req, res) => {
  try {
    const { id } = req.params;
    const { changeInCents } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    user.balanceCents += changeInCents;
    await user.save();

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        createdAt: user.createdAt,
        balanceCents: user.balanceCents
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update balance.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});