import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import receiptRoutes from './routes/receipts.js';

dotenv.config();

// Debug environment variables
console.log('Environment variables loaded:');
console.log('AZURE_DOC_INTELLIGENCE_ENDPOINT:', process.env.AZURE_DOC_INTELLIGENCE_ENDPOINT ? 'SET' : 'NOT SET');
console.log('AZURE_DOC_INTELLIGENCE_KEY:', process.env.AZURE_DOC_INTELLIGENCE_KEY ? 'SET' : 'NOT SET');

connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://personal-finance-tracker-i4nl.vercel.app',
    'https://personal-finance-tracker-beta-inky.vercel.app/',
    'https://vercel.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/receipts', receiptRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});