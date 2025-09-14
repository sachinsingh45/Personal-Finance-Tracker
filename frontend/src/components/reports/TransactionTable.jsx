import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { formatDate, formatCurrency, getAmountColor, getAmountPrefix } from '../../utils/formatters'
import EmptyState from '../ui/EmptyState'

const TransactionTable = ({ transactions, filterType, onFilterChange }) => {
  const [showDetails, setShowDetails] = useState(false)

  const filteredTransactions = filterType === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filterType)

  if (filteredTransactions.length === 0) {
    return (
      <EmptyState
        title="No transactions found"
        description="No transactions match the selected filter criteria."
      />
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-medium text-gray-900">Transaction Details</h3>
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => onFilterChange(e.target.value)}
              className="form-select w-full sm:w-auto"
            >
              <option value="all">All Transactions</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="btn-secondary flex items-center gap-2 w-full sm:w-auto"
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
        </div>
      </div>
      
      {showDetails && (
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded capitalize ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {transaction.category}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {transaction.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <span className={getAmountColor(transaction.type)}>
                        {getAmountPrefix(transaction.type)}{formatCurrency(transaction.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionTable
