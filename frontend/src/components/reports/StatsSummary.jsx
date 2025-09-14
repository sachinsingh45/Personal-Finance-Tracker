import React from 'react'
import { TrendingUp, TrendingDown, List } from 'lucide-react'
import { calculateStats, formatCurrency } from '../../utils/formatters'

const StatsSummary = ({ transactions }) => {
  const stats = calculateStats(transactions)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <p className="text-sm font-medium text-gray-600">Transactions</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.transactionCount}
            </p>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <List className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsSummary
