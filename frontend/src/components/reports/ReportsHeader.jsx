import React from 'react'
import { Download } from 'lucide-react'
import { getMonthName } from '../../utils/formatters'

const ReportsHeader = ({ selectedMonth, onExportCSV }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-600">
          Financial analysis for {getMonthName(selectedMonth.month)} {selectedMonth.year}
        </p>
      </div>
      <button
        onClick={onExportCSV}
        className="btn-primary bg-green-600 hover:bg-green-700 flex items-center gap-2 w-full sm:w-auto"
      >
        <Download className="h-4 w-4" />
        Export CSV
      </button>
    </div>
  )
}

export default ReportsHeader
