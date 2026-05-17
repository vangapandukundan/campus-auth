require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Connect MongoDB
connectDB();

// Allow requests from React frontend (localhost dev + Vercel production)
const allowedOrigins = [
  'http://localhost:3000',
  'https://campus-auth.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean); // remove undefined/null entries

app.use(cors({
  origin: (origin, callback) => {
    // Allow no-origin requests (e.g. curl, Postman) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json());

// All auth routes start with /api/auth
app.use('/api/auth', authRoutes);

// Health check — Render uses this to confirm the server is alive
app.get('/', (req, res) => res.json({ message: '✅ Campus Auth Server Running' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on http://localhost:${PORT}`));