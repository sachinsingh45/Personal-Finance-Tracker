import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Calendar } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Income:</span>
            <span className="text-sm font-medium text-green-600">{formatCurrency(data.income)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Expenses:</span>
            <span className="text-sm font-medium text-red-600">{formatCurrency(data.expenses)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Balance:</span>
            <span className={`text-sm font-medium ${data.runningBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatCurrency(data.runningBalance)}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

const DailyLineChart = ({ data }) => {
  const [hoveredData, setHoveredData] = useState(null)

  if (!data || data.length === 0) return null

  return (
    <div>
      {/* Hovered Data Display */}
      {hoveredData && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Date</p>
              <p className="text-sm font-medium text-gray-900">{hoveredData.day}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Income</p>
              <p className="text-sm font-medium text-green-600">₹{hoveredData.income.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Expenses</p>
              <p className="text-sm font-medium text-red-600">₹{hoveredData.expenses.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Balance</p>
              <p className={`text-sm font-medium ${hoveredData.runningBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                ₹{hoveredData.runningBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={350}>
        <LineChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          onMouseMove={(data) => setHoveredData(data.activePayload?.[0]?.payload)}
          onMouseLeave={() => setHoveredData(null)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="day" 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="#10B981" 
            strokeWidth={4}
            name="Daily Income"
            dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 3, fill: '#fff' }}
          />
          
          <Line 
            type="monotone" 
            dataKey="expenses" 
            stroke="#EF4444" 
            strokeWidth={4}
            name="Daily Expenses"
            dot={{ fill: '#EF4444', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 8, stroke: '#EF4444', strokeWidth: 3, fill: '#fff' }}
          />
          
          <Line 
            type="monotone" 
            dataKey="runningBalance" 
            stroke="#3B82F6" 
            strokeWidth={5}
            name="Running Balance"
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 10, stroke: '#3B82F6', strokeWidth: 3, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Hover over data points for detailed information</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>Showing {data.length} days of data</span>
        </div>
      </div>
    </div>
  )
}

export default DailyLineChart
