import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { BarChart3 } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'
import EmptyState from '../ui/EmptyState'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16']

const ExpensesPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No Expense Data"
        description="No expenses found for the selected date range. Add some expense transactions to see the breakdown."
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          stroke="#fff"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name, props) => [
            formatCurrency(value),
            props.payload.name
          ]}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '15px' }}
          iconType="circle"
          formatter={(value, entry) => (
            <span style={{ color: entry.color }}>
              {value} ({formatCurrency(entry.payload.value)})
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default ExpensesPieChart
