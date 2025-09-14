import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR']
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiptMetadata: {
    merchant: {
      type: String,
      default: null
    },
    transactionDate: {
      type: Date,
      default: null
    },
    items: [{
      name: String,
      price: Number
    }],
    confidence: {
      merchant: {
        type: Number,
        default: 0,
        min: 0,
        max: 1
      },
      total: {
        type: Number,
        default: 0,
        min: 0,
        max: 1
      },
      date: {
        type: Number,
        default: 0,
        min: 0,
        max: 1
      }
    },
    hasReceipt: {
      type: Boolean,
      default: false
    }
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;