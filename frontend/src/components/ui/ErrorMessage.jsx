import React from 'react'
import { AlertCircle } from 'lucide-react'

const ErrorMessage = ({ message, className = '' }) => {
  if (!message) return null

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
        <p className="text-red-700 text-sm font-medium">{message}</p>
      </div>
    </div>
  )
}

export default ErrorMessage
