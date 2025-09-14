import receiptService from '../services/receiptService.js';
import Transaction from '../models/Transaction.js';

export const uploadReceipt = async (req, res) => {
  try {
    console.log('Receipt upload started, file:', req.file?.originalname);
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid file type. Please upload an image (JPEG, PNG, GIF) or PDF file.' 
      });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        success: false, 
        message: 'File too large. Maximum size is 5MB.' 
      });
    }

    console.log('Starting receipt analysis...');
    
    // Analyze receipt using Azure Document Intelligence or mock data
    const receiptData = await receiptService.analyzeReceipt(req.file.path);
    
    console.log('Receipt analysis completed:', receiptData);

    res.json({
      success: true,
      message: 'Receipt analyzed successfully',
      data: receiptData
    });

  } catch (error) {
    console.error('Receipt upload error:', error);
    
    // Handle specific Azure API errors
    if (error.message.includes('Azure Document Intelligence not configured')) {
      return res.status(503).json({
        success: false,
        message: 'Receipt analysis service is not configured. Please add Azure Document Intelligence credentials to your environment variables.'
      });
    }

    if (error.message.includes('No receipt data could be extracted')) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract data from the receipt. Please ensure the image is clear and contains a valid receipt.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to analyze receipt. Please try again.'
    });
  }
};

export const createTransactionFromReceipt = async (req, res) => {
  try {
    const { 
      type, 
      amount, 
      category, 
      description, 
      date,
      receiptMetadata
    } = req.body;

    // Validate required fields
    if (!type || !amount || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide type, amount, and category' 
      });
    }

    // Validate amount is positive
    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be greater than 0' 
      });
    }

    // Create transaction with receipt metadata
    const transactionData = {
      type,
      amount: Math.round(amount),
      category,
      description: description || '',
      date: date || new Date(),
      currency: 'INR',
      userId: req.user.id,
      receiptMetadata: receiptMetadata ? {
        merchant: receiptMetadata.merchant || null,
        transactionDate: receiptMetadata.transactionDate || null,
        items: receiptMetadata.items || [],
        confidence: {
          merchant: receiptMetadata.confidence?.merchant || 0,
          total: receiptMetadata.confidence?.total || 0,
          date: receiptMetadata.confidence?.date || 0
        },
        hasReceipt: true
      } : {
        hasReceipt: false
      }
    };

    const transaction = await Transaction.create(transactionData);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully from receipt',
      data: transaction
    });

  } catch (error) {
    console.error('Create transaction from receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction. Please try again.'
    });
  }
};
