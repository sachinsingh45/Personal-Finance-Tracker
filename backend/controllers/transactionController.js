import Transaction from '../models/Transaction.js';

export const getTransactions = async (req, res) => {
  try {
    console.log('Getting transactions for user:', req.user.id);
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    console.log('Found transactions:', transactions.length);
    res.json(transactions);
  } catch (error) {
    console.error('Error in getTransactions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date, receiptMetadata } = req.body;
    
    if (!type || !amount || !category) {
      return res.status(400).json({ message: 'Please provide type, amount, and category' });
    }
    
    // Validate amount is positive
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }
    
    const transactionData = {
      type,
      amount: Math.round(amount), // Round to nearest rupee
      category,
      description: description || '',
      date: date || new Date(),
      currency: 'INR',
      userId: req.user.id
    };

    // Add receipt metadata if provided
    if (receiptMetadata) {
      transactionData.receiptMetadata = {
        merchant: receiptMetadata.merchant || null,
        transactionDate: receiptMetadata.transactionDate || null,
        items: receiptMetadata.items || [],
        confidence: {
          merchant: receiptMetadata.confidence?.merchant || 0,
          total: receiptMetadata.confidence?.total || 0,
          date: receiptMetadata.confidence?.date || 0
        },
        hasReceipt: true
      };
    } else {
      transactionData.receiptMetadata = {
        hasReceipt: false
      };
    }
    
    const transaction = await Transaction.create(transactionData);
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Round amount to nearest rupee if provided
    if (updateData.amount) {
      if (updateData.amount <= 0) {
        return res.status(400).json({ message: 'Amount must be greater than 0' });
      }
      updateData.amount = Math.round(updateData.amount);
    }
    
    // Ensure currency is INR
    updateData.currency = 'INR';
    
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};