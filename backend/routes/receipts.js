import express from 'express';
import upload from '../config/multer.js';
import { uploadReceipt, createTransactionFromReceipt } from '../controllers/receiptController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Upload and analyze receipt
router.post('/upload', upload.single('receipt'), uploadReceipt);

// Create transaction from receipt data
router.post('/create-transaction', createTransactionFromReceipt);

export default router;
