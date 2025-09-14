import React from 'react'
import { formatCurrency } from '../../utils/formatters'

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'gray',
  isCurrency = false,
  className = '' 
}) => {
  const colorClasses = {
    green: 'text-green-600',
    red: 'text-red-600', 
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    gray: 'text-gray-600'
  }

  const iconColorClasses = {
    green: 'text-green-500',
    red: 'text-red-500',
    blue: 'text-blue-500', 
    orange: 'text-orange-500',
    gray: 'text-gray-500'
  }

  const displayValue = isCurrency ? formatCurrency(value) : value?.toLocaleString?.() || value

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-xl font-semibold ${colorClasses[color]}`}>
            {displayValue}
          </p>
        </div>
        {Icon && <Icon className={`h-8 w-8 ${iconColorClasses[color]}`} />}
      </div>
    </div>
  )
}

export default StatCard
