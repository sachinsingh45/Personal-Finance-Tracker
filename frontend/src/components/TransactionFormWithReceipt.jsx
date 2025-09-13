import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { IndianRupee, Calendar, Tag, FileText, Plus, Receipt, Sparkles } from 'lucide-react'
import ReceiptUpload from './ReceiptUpload'

const TransactionFormWithReceipt = ({ onSubmit, initialData = {}, submitButtonText = "Add Transaction" }) => {
  const [formData, setFormData] = useState({
    type: initialData.type || 'expense',
    amount: initialData.amount || '',
    category: initialData.category || '',
    description: initialData.description || '',
    date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [receiptData, setReceiptData] = useState(null)
  const [showReceiptUpload, setShowReceiptUpload] = useState(false)

  // Common categories for quick selection
  const expenseCategories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Groceries', 'Other'
  ]

  const incomeCategories = [
    'Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'
  ]

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleReceiptAnalyzed = (data) => {
    setReceiptData(data)
    
    // Auto-fill form with receipt data
    const updates = {}
    
    if (data.total && data.total > 0) {
      updates.amount = data.total.toString()
    }
    
    if (data.category) {
      updates.category = data.category
    }
    
    if (data.description) {
      updates.description = data.description
    }
    
    if (data.transactionDate) {
      updates.date = new Date(data.transactionDate).toISOString().split('T')[0]
    }
    
    // Always set to expense for receipts
    updates.type = 'expense'
    
    setFormData(prev => ({
      ...prev,
      ...updates
    }))

    // Show success message with confidence info
    if (data.confidence) {
      const avgConfidence = Math.round(
        (data.confidence.merchant + data.confidence.total + data.confidence.date) / 3 * 100
      )
      toast.success(`Receipt analyzed with ${avgConfidence}% confidence. Please review the extracted data.`)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required'
    }

    if (!formData.type) {
      newErrors.type = 'Transaction type is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date)
      }

      // Include receipt data if available
      if (receiptData) {
        transactionData.receiptData = receiptData
        transactionData.merchant = receiptData.merchant
      }

      await onSubmit(transactionData)
      
      // Reset form if this is a new transaction (no initialData)
      if (!initialData.id) {
        setFormData({
          type: 'expense',
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        })
        setReceiptData(null)
        setShowReceiptUpload(false)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentCategories = () => {
    return formData.type === 'expense' ? expenseCategories : incomeCategories
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Receipt Upload Toggle */}
      <div className="border border-gray-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Receipt Scanner</span>
          </div>
          <button
            type="button"
            onClick={() => setShowReceiptUpload(!showReceiptUpload)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              showReceiptUpload
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showReceiptUpload ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {/* Receipt Upload Component */}
      {showReceiptUpload && (
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <ReceiptUpload onReceiptAnalyzed={handleReceiptAnalyzed} disabled={loading} />
        </div>
      )}

      {/* Receipt Data Preview */}
      {receiptData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">Data Extracted</span>
          </div>
          <div className="text-xs text-green-700 space-y-1">
            {receiptData.merchant && <div>Merchant: {receiptData.merchant}</div>}
            {receiptData.total && <div>Amount: ₹{receiptData.total}</div>}
            {receiptData.category && <div>Category: {receiptData.category}</div>}
          </div>
        </div>
      )}

      {/* Transaction Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transaction Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
            formData.type === 'expense' 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-200 hover:border-red-300'
          }`}>
            <input
              type="radio"
              name="type"
              value="expense"
              checked={formData.type === 'expense'}
              onChange={(e) => handleChange('type', e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded ${formData.type === 'expense' ? 'bg-red-100' : 'bg-gray-100'}`}>
                <svg className={`h-4 w-4 ${formData.type === 'expense' ? 'text-red-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <span className={`font-medium ${formData.type === 'expense' ? 'text-red-700' : 'text-gray-600'}`}>
                Expense
              </span>
            </div>
          </label>
          <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
            formData.type === 'income' 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-green-300'
          }`}>
            <input
              type="radio"
              name="type"
              value="income"
              checked={formData.type === 'income'}
              onChange={(e) => handleChange('type', e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded ${formData.type === 'income' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <svg className={`h-4 w-4 ${formData.type === 'income' ? 'text-green-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
              <span className={`font-medium ${formData.type === 'income' ? 'text-green-700' : 'text-gray-600'}`}>
                Income
              </span>
            </div>
          </label>
        </div>
        {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-sm">₹</span>
          </div>
          <input
            type="number"
            step="1"
            min="0"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            className={`form-input pl-6 ${errors.amount ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="0"
          />
        </div>
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className={`form-select w-full ${errors.category ? 'border-red-500 focus:ring-red-500' : ''}`}
        >
          <option value="">Select a category</option>
          {getCurrentCategories().map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          rows={2}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="form-input resize-none"
          placeholder="Add a note..."
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          className="form-input w-full"
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Adding...' : 'Add Transaction'}
      </button>
    </form>
  )
}

export default TransactionFormWithReceipt
