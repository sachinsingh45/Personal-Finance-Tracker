import React, { useState } from 'react'
import { Edit2, Trash2, IndianRupee, Calendar, Tag, FileText, Receipt } from 'lucide-react'
import ReceiptTooltip from './ReceiptTooltip'

const TransactionList = ({ transactions, onEdit, onDelete, loading = false }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  const handleDelete = async (id) => {
    try {
      await onDelete(id)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleReceiptClick = (transaction) => {
    if (transaction.receiptMetadata?.hasReceipt) {
      setSelectedReceipt(selectedReceipt?._id === transaction._id ? null : transaction)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="animate-pulse">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!transactions?.length) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <IndianRupee className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first transaction.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((transaction) => (
                <tr 
                  key={transaction._id} 
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-900">
                        {transaction.description && transaction.description.length > 40 
                          ? `${transaction.description.substring(0, 40)}...` 
                          : transaction.description || 'No description'}
                      </div>
                      {transaction.receiptMetadata?.hasReceipt && (
                        <button
                          onClick={() => handleReceiptClick(transaction)}
                          className="text-blue-500 hover:text-blue-700 p-1 rounded"
                          title="View receipt details"
                        >
                          <Receipt className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 capitalize">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {transaction.receiptMetadata?.hasReceipt && (
                        <button
                          onClick={() => handleReceiptClick(transaction)}
                          className="text-gray-400 hover:text-blue-600 p-1 rounded"
                          title="View receipt details"
                        >
                          <Receipt className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit?.(transaction)}
                        className="text-gray-400 hover:text-blue-600 p-1 rounded"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(transaction._id)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Details Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Receipt Details</h3>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <ReceiptTooltip
                receiptMetadata={selectedReceipt.receiptMetadata}
                isVisible={true}
                position={{ x: 0, y: 0 }}
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {transactions.map((transaction) => (
          <div 
            key={transaction._id} 
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-lg font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </span>
                  <div className="flex items-center space-x-1">
                    {transaction.receiptMetadata?.hasReceipt && (
                      <button
                        onClick={() => handleReceiptClick(transaction)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded"
                        title="View receipt details"
                      >
                        <Receipt className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit?.(transaction)}
                      className="text-gray-400 hover:text-blue-600 p-1 rounded"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(transaction._id)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-gray-900">
                    {transaction.description && transaction.description.length > 50 
                      ? `${transaction.description.substring(0, 50)}...` 
                      : transaction.description || 'No description'}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="capitalize">{transaction.category}</span>
                    <span>{formatDate(transaction.date)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Transaction</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default TransactionList