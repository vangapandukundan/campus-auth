require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Connect MongoDB
connectDB();

// Allow requests from React frontend
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());

// All auth routes start with /api/auth
app.use('/api/auth', authRoutes);

// Simple health check — open http://localhost:4000 to confirm server works
app.get('/', (req, res) => res.json({ message: '✅ Campus Auth Server Running' }));

const PORT = process.env.PORT || 4000;
// TO THIS:
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on http://localhost:${PORT}`));