import React from 'react'
import { Store, Calendar, Package, TrendingUp, Database, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { formatCurrency, formatDate, getConfidenceColor, getConfidenceText, formatConfidencePercentage } from '../utils/receiptUtils'

const ReceiptMetadataDisplay = ({ receiptData, isVisible = true }) => {
  if (!isVisible || !receiptData) {
    return null
  }

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4" />
    if (confidence >= 0.6) return <AlertCircle className="h-4 w-4" />
    return <XCircle className="h-4 w-4" />
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 pb-3 border-b border-blue-200">
        <Database className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Receipt Metadata - Database Preview</h3>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          Will be saved to DB
        </span>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Merchant Information */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Store className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Merchant</span>
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Name:</span> 
              <span className="ml-2 text-gray-700">
                {receiptData.merchant || 'Not detected'}
              </span>
            </div>
            {receiptData.confidence?.merchant !== undefined && (
              <div className={`flex items-center space-x-2 text-xs px-2 py-1 rounded ${getConfidenceColor(receiptData.confidence.merchant, true)}`}>
                {getConfidenceIcon(receiptData.confidence.merchant)}
                <span>{getConfidenceText(receiptData.confidence.merchant)} ({formatConfidencePercentage(receiptData.confidence.merchant)})</span>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Date */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Receipt Date</span>
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Date:</span> 
              <span className="ml-2 text-gray-700">
                {formatDate(receiptData.transactionDate, 'long')}
              </span>
            </div>
            {receiptData.confidence?.date !== undefined && (
              <div className={`flex items-center space-x-2 text-xs px-2 py-1 rounded ${getConfidenceColor(receiptData.confidence.date, true)}`}>
                {getConfidenceIcon(receiptData.confidence.date)}
                <span>{getConfidenceText(receiptData.confidence.date)} ({formatConfidencePercentage(receiptData.confidence.date)})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Amount Information */}
      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">Amount Details</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Total Amount:</span> 
              <span className="ml-2 text-gray-700 font-semibold">
                {receiptData.total ? formatCurrency(receiptData.total) : 'Not detected'}
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Transaction Type:</span> 
              <span className="ml-2 text-gray-700 capitalize">
                {receiptData.type || 'expense'}
              </span>
            </div>
          </div>
          {receiptData.confidence?.total !== undefined && (
            <div className={`flex items-center space-x-2 text-xs px-2 py-1 rounded ${getConfidenceColor(receiptData.confidence.total, true)}`}>
              {getConfidenceIcon(receiptData.confidence.total)}
              <span>{getConfidenceText(receiptData.confidence.total)} ({formatConfidencePercentage(receiptData.confidence.total)})</span>
            </div>
          )}
        </div>
      </div>

      {/* Items List */}
      {receiptData.items && receiptData.items.length > 0 && (
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <Package className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              Extracted Items ({receiptData.items.length})
            </span>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {receiptData.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                <span className="text-gray-700 flex-1 mr-2">{item.name}</span>
                {item.price && (
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(item.price)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category and Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="text-sm">
            <span className="font-medium text-gray-900">Auto-detected Category:</span> 
            <span className="ml-2 text-gray-700">
              {receiptData.category || 'Other'}
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="text-sm">
            <span className="font-medium text-gray-900">Generated Description:</span> 
            <span className="ml-2 text-gray-700">
              {receiptData.description || 'No description generated'}
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default ReceiptMetadataDisplay
