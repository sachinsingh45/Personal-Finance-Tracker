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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalIncome)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalExpenses)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  stats.balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'
                }`}>
                  <IndianRupee className={`h-6 w-6 ${
                    stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Balance</p>
                <p className={`text-2xl font-bold ${
                  stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  {formatCurrency(stats.balance)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.transactionCount}
                </p>
              </div>
            </div>
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