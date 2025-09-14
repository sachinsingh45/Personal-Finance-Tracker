import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ArrowLeft } from 'lucide-react'
import { transactionAPI, receiptAPI } from '../services/api'
import TransactionFormWithReceipt from '../components/TransactionFormWithReceipt'

const AddTransaction = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (transactionData) => {
    try {
      setError('')
      setSuccess('')

      let response
      
      if (transactionData.receiptMetadata) {
        response = await receiptAPI.createTransaction(transactionData)
      } else {
        response = await transactionAPI.create(transactionData)
      }
      
      toast.success('Transaction added successfully! 🎉')
      
      setTimeout(() => {
        navigate('/')
      }, 1500)

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add transaction. Please try again.'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Simple Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Back</span>
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Add Transaction</h1>
        <div></div>
      </div>

      {/* Transaction Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <TransactionFormWithReceipt onSubmit={handleSubmit} />
      </div>
    </div>
  )
}

export default AddTransaction