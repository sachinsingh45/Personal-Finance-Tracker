import React, { useState } from 'react'
import { Edit2, Trash2, IndianRupee, Receipt } from 'lucide-react'
import { formatCurrency, formatDate, truncateText, getAmountColor, getAmountPrefix } from '../utils/formatters'
import ReceiptTooltip from './ReceiptTooltip'

const TransactionList = ({ transactions, onEdit, onDelete, loading = false }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  const handleDelete = async (id) => {
    try {
      await onDelete(id)
      setDeleteConfirm(null)
    } catch (error) {
    }
  }


  const handleReceiptClick = (transaction) => {
    if (transaction.receiptMetadata?.hasReceipt) {
      setSelectedReceipt(selectedReceipt?._id === transaction._id ? null : transaction)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!transactions?.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <IndianRupee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions</h3>
        <p className="text-gray-600">Get started by adding your first transaction.</p>
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
                        {truncateText(transaction.description, 40)}
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
                    <span className={`text-sm font-medium ${getAmountColor(transaction.type)}`}>
                      {getAmountPrefix(transaction.type)}{formatCurrency(transaction.amount)}
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
                        className="btn-icon text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(transaction._id)}
                        className="btn-icon text-gray-400 hover:text-red-600 hover:bg-red-50"
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
                  <span className={`text-lg font-medium ${getAmountColor(transaction.type)}`}>
                    {getAmountPrefix(transaction.type)}{formatCurrency(transaction.amount)}
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
                      className="btn-icon text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(transaction._id)}
                      className="btn-icon text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-gray-900">
                    {truncateText(transaction.description, 50)}
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
                className="btn-secondary flex-1 sm:flex-none"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="btn-danger flex-1 sm:flex-none"
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