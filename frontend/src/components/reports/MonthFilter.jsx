import React from 'react'
import { getMonthName } from '../../utils/formatters'
import LoadingSpinner from '../ui/LoadingSpinner'

const MonthFilter = ({ selectedMonth, onMonthChange, isLoading }) => {
  const handleChange = (field, value) => {
    onMonthChange(field, parseInt(value))
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filter by Month</h3>
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-3"></div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
          <select
            value={selectedMonth.month}
            onChange={(e) => handleChange('month', e.target.value)}
            className="form-select w-full"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {getMonthName(i)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
          <select
            value={selectedMonth.year}
            onChange={(e) => handleChange('year', e.target.value)}
            className="form-select w-full"
          >
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() - 5 + i
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            })}
          </select>
        </div>
      </div>
    </div>
  )
}

export default MonthFilter
