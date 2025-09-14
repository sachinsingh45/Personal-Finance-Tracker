import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../utils/formatters'

const MonthlyBarChart = ({ data }) => {
  if (!data || data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis 
          tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} 
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <Tooltip 
          formatter={(value) => formatCurrency(value)} 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '15px' }}
          iconType="rect"
        />
        <Bar 
          dataKey="income" 
          fill="#10B981" 
          name="Income" 
          radius={[4, 4, 0, 0]}
          stroke="#059669"
          strokeWidth={1}
        />
        <Bar 
          dataKey="expenses" 
          fill="#EF4444" 
          name="Expenses" 
          radius={[4, 4, 0, 0]}
          stroke="#DC2626"
          strokeWidth={1}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default MonthlyBarChart
