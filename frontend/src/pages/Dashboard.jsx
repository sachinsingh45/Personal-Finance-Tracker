import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, IndianRupee, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTransactions, deleteTransaction } from '../store/slices/transactionsSlice';
import { formatCurrency } from '../utils/formatters';
import TransactionList from '../components/TransactionList';

const Dashboard = () => {
  const dispatch = useAppDispatch()
  const { transactions, isLoading, error, stats } = useAppSelector((state) => state.transactions)
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchTransactions())
  }, [dispatch])


  const handleEditTransaction = (transaction) => {
    navigate(`/edit/${transaction._id}`)
  }

  const handleDeleteTransaction = async (id) => {
    const result = await dispatch(deleteTransaction(id))
    if (result.type === 'transactions/delete/fulfilled') {
      toast.success('Transaction deleted successfully! 🗑️')
    } else {
      toast.error(result.payload || 'Failed to delete transaction')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 
            className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Overview of your financial activity
          </p>
        </div>
        <Link 
          to="/add" 
          className="btn-primary flex items-center justify-center gap-2 group w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:rotate-90" />
          <span>Add Transaction</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Income</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalExpenses)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Balance</p>
              <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(stats.balance)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stats.balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <IndianRupee className={`h-6 w-6 ${stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.transactionCount}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Activity className="h-6 w-6 text-gray-600" />
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
          transactions={transactions.slice(0, 5)}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          loading={isLoading}
        />
      </div>
    </div>
  )
}

export default Dashboard