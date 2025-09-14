import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { IndianRupee, Calendar, Tag, FileText, Plus } from 'lucide-react'

const TransactionForm = ({ onSubmit, initialData = {}, submitButtonText = "Add Transaction" }) => {
  const [formData, setFormData] = useState({
    type: initialData.type || 'expense',
    amount: initialData.amount || '',
    category: initialData.category || '',
    description: initialData.description || '',
    date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Common categories for quick selection
  const expenseCategories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Other'
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
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date)
      })
      
      // Reset form if this is a new transaction (no initialData)
      if (!initialData.id) {
        setFormData({
          type: 'expense',
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        })
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const getCurrentCategories = () => {
    return formData.type === 'expense' ? expenseCategories : incomeCategories
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
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
          <IndianRupee className="inline h-4 w-4 mr-1" />
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
          <Tag className="inline h-4 w-4 mr-1" />
          Category
        </label>
        <div className="flex space-x-2">
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className={`form-select flex-1 ${errors.category ? 'border-red-500 focus:ring-red-500' : ''}`}
          >
            <option value="">Select a category</option>
            {getCurrentCategories().map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className={`form-input flex-1 ${errors.category ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Or enter custom category"
          />
        </div>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="inline h-4 w-4 mr-1" />
          Description (Optional)
        </label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="form-input resize-none"
          placeholder="Add a note about this transaction..."
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="inline h-4 w-4 mr-1" />
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
        className={`w-full btn-primary flex items-center justify-center gap-2 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        )}
        <span>{loading ? 'Saving...' : submitButtonText}</span>
        {!loading && <Plus className="h-4 w-4" />}
      </button>
    </form>
  )
}

export default TransactionForm