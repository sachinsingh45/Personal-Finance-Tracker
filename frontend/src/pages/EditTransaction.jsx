import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ArrowLeft } from 'lucide-react'
import { transactionAPI } from '../services/api'
import TransactionForm from '../components/TransactionForm'

const EditTransaction = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (id) {
      fetchTransaction()
    }
  }, [id])

  const fetchTransaction = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Get all transactions and find the one we need
      const response = await transactionAPI.getAll()
      const foundTransaction = response.data?.find(t => t._id === id)
      
      if (!foundTransaction) {
        setError('Transaction not found')
        return
      }
      
      setTransaction(foundTransaction)
    } catch (err) {
      console.error('Error fetching transaction:', err)
      setError('Failed to load transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (transactionData) => {
    try {
      setError('')
      setSuccess('')

      await transactionAPI.update(id, transactionData)
      
      toast.success('Transaction updated successfully! ✅')
      
      // Redirect to transactions list after a short delay
      setTimeout(() => {
        navigate('/transactions')
      }, 1500)

    } catch (err) {
      console.error('Error updating transaction:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update transaction. Please try again.'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="card-body">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !transaction) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/transactions')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transactions
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/transactions')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Transactions
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Transaction</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update your transaction details
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Transaction Form */}
      {transaction && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Transaction Details</h2>
          </div>
          <div className="card-body">
            <TransactionForm 
              onSubmit={handleSubmit} 
              initialData={transaction}
              submitButtonText="Update Transaction"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default EditTransaction
