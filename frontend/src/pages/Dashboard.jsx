import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Plus, TrendingUp, TrendingDown, IndianRupee, Activity } from 'lucide-react'
import { transactionAPI } from '../services/api'
import TransactionList from '../components/TransactionList'

const Dashboard = () => {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await transactionAPI.getAll()
      const allTransactions = response.data || []

      setTransactions(allTransactions.slice(0, 5)) // Show only recent 5
      
      const totalIncome = allTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

      const totalExpenses = allTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      setStats({
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        transactionCount: allTransactions.length
      })

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const handleEditTransaction = (transaction) => {
    navigate(`/edit/${transaction._id}`)
  }

  const handleDeleteTransaction = async (id) => {
    try {
      await transactionAPI.delete(id)
      toast.success('Transaction deleted successfully! 🗑️')
      await fetchDashboardData() // Refresh data after deletion
    } catch (err) {
      console.error('Error deleting transaction:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete transaction'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Overview of your financial activity
          </p>
        </div>
        <Link 
          to="/add" 
          className="btn-primary-mobile sm:btn-primary flex items-center justify-center gap-2 group w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
          <span className="font-medium">Add Transaction</span>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Income</p>
              <p className="text-xl font-semibold text-green-600">
                ₹{stats.totalIncome.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expenses</p>
              <p className="text-xl font-semibold text-red-600">
                ₹{stats.totalExpenses.toLocaleString()}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Balance</p>
              <p className={`text-xl font-semibold ${
                stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`}>
                ₹{stats.balance.toLocaleString()}
              </p>
            </div>
            <IndianRupee className={`h-8 w-8 ${
              stats.balance >= 0 ? 'text-blue-500' : 'text-orange-500'
            }`} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-xl font-semibold text-gray-900">
                {stats.transactionCount}
              </p>
            </div>
            <Activity className="h-8 w-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <Link to="/transactions" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All →
          </Link>
        </div>

        <TransactionList
          transactions={transactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default Dashboard