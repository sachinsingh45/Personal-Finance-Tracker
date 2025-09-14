import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Filter, X, ChevronDown, Plus } from 'lucide-react'
import { transactionAPI } from '../services/api'
import TransactionListComponent from '../components/TransactionList'

const TransactionListPage = () => {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filter states
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    category: '',
    type: '' // 'income', 'expense', or ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await transactionAPI.getAll()
      const transactionsData = response.data || []
      setTransactions(transactionsData)

    } catch (err) {
      console.error('Error fetching transactions:', err)
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })
      setError(`Failed to load transactions: ${err.response?.data?.message || err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEditTransaction = (transaction) => {
    navigate(`/edit/${transaction._id}`)
  }

  const handleDeleteTransaction = async (id) => {
    try {
      await transactionAPI.delete(id)
      toast.success('Transaction deleted successfully! 🗑️')
      await fetchTransactions() // Refresh data after deletion
    } catch (err) {
      console.error('Error deleting transaction:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete transaction'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  // Get unique categories from transactions
  const uniqueCategories = useMemo(() => {
    const categories = transactions.map(t => t.category).filter(Boolean)
    return [...new Set(categories)].sort()
  }, [transactions])

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      const transactionMonth = transactionDate.getMonth()
      const transactionYear = transactionDate.getFullYear()

      // Month filter
      if (filters.month !== '' && transactionMonth !== parseInt(filters.month)) {
        return false
      }

      // Year filter
      if (filters.year && filters.year !== '' && transactionYear !== parseInt(filters.year)) {
        return false
      }

      // Category filter
      if (filters.category && transaction.category !== filters.category) {
        return false
      }

      // Type filter
      if (filters.type && transaction.type !== filters.type) {
        return false
      }

      return true
    })
  }, [transactions, filters])

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      month: '',
      year: '',
      category: '',
      type: ''
    })
  }

  // Get month name
  const getMonthName = (monthIndex) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[monthIndex]
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    All Transactions
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm">
                    {loading ? 'Loading...' : `${filteredTransactions.length} of ${transactions.length} transactions`}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
              <Link 
                to="/add" 
                className="btn-primary flex items-center justify-center gap-2 group w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                <span>Add New Transaction</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filter Transactions</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                className="form-select"
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {getMonthName(i)}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="form-select"
              >
                <option value="">All Years</option>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="form-select"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="form-select"
              >
                <option value="">All Types</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <TransactionListComponent
        transactions={filteredTransactions}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        loading={loading}
      />
    </div>
  )
}

export default TransactionListPage