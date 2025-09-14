import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Filter, X, Plus } from 'lucide-react'
import { transactionAPI } from '../services/api'
import { getMonthName } from '../utils/formatters'
import TransactionListComponent from '../components/TransactionList'
import ErrorMessage from '../components/ui/ErrorMessage'

const TransactionListPage = () => {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    category: '',
    type: ''
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
      setError('Failed to load transactions')
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
      await fetchTransactions()
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete transaction'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  const uniqueCategories = useMemo(() => {
    const categories = transactions.map(t => t.category).filter(Boolean)
    return [...new Set(categories)].sort()
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      const transactionMonth = transactionDate.getMonth()
      const transactionYear = transactionDate.getFullYear()

      if (filters.month !== '' && transactionMonth !== parseInt(filters.month)) {
        return false
      }

      if (filters.year && filters.year !== '' && transactionYear !== parseInt(filters.year)) {
        return false
      }

      if (filters.category && transaction.category !== filters.category) {
        return false
      }

      if (filters.type && transaction.type !== filters.type) {
        return false
      }

      return true
    })
  }, [transactions, filters])

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      month: '',
      year: '',
      category: '',
      type: ''
    })
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Transactions</h1>
            <p className="text-gray-600 mt-1 text-sm">
              {loading ? 'Loading...' : `${filteredTransactions.length} of ${transactions.length} transactions`}
            </p>
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
              <span>Add Transaction</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filter Transactions</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
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
              className="btn-secondary text-sm w-full sm:w-auto"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      <ErrorMessage message={error} />

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