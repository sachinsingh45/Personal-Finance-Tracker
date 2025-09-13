import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ArrowLeft } from 'lucide-react'
import { transactionAPI } from '../services/api'
import TransactionForm from '../components/TransactionForm'

const AddTransaction = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (transactionData) => {
    try {
      setError('')
      setSuccess('')

      const response = await transactionAPI.create(transactionData)
      
      toast.success('Transaction added successfully! 🎉')
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/')
      }, 1500)

    } catch (err) {
      console.error('Error creating transaction:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add transaction. Please try again.'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 via-blue-600/5 to-purple-600/5"></div>
        <div className="relative p-6 sm:p-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Add Transaction
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Record a new income or expense transaction
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-green-700 text-sm font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* Enhanced Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
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

      {/* Transaction Form */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Transaction Details</h2>
        </div>
        <div className="card-body">
          <TransactionForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}

export default AddTransaction