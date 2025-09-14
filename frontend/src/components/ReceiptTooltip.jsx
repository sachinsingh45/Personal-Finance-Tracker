import React from 'react'
import { Receipt, Calendar, Store, Package, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate, getConfidenceColor, getConfidenceText } from '../utils/receiptUtils'

const ReceiptTooltip = ({ receiptMetadata, isVisible, position, isModal = false }) => {
  if (!isVisible || !receiptMetadata?.hasReceipt) {
    return null
  }

  const containerClass = isModal 
    ? "bg-white rounded-lg p-4 max-w-sm w-full"
    : "fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm"

  const containerStyle = isModal ? {} : {
    left: position.x + 10,
    top: position.y - 10,
    transform: 'translateY(-100%)'
  }

  return (
    <div 
      className={containerClass}
      style={containerStyle}
    >
      {/* Header */}
      <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-100">
        <Receipt className="h-4 w-4 text-blue-600" />
        <span className="font-semibold text-gray-900 text-sm">Receipt Details</span>
      </div>

      {/* Merchant */}
      {receiptMetadata.merchant && (
        <div className="flex items-center space-x-2 mb-2">
          <Store className="h-3 w-3 text-gray-500" />
          <span className="text-xs text-gray-600">Merchant:</span>
          <span className="text-xs font-medium text-gray-900">{receiptMetadata.merchant}</span>
          {receiptMetadata.confidence?.merchant > 0 && (
            <span className={`text-xs ${getConfidenceColor(receiptMetadata.confidence.merchant)}`}>
              ({getConfidenceText(receiptMetadata.confidence.merchant, 'short')})
            </span>
          )}
        </div>
      )}

      {/* Receipt Date */}
      {receiptMetadata.transactionDate && (
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="h-3 w-3 text-gray-500" />
          <span className="text-xs text-gray-600">Receipt Date:</span>
          <span className="text-xs font-medium text-gray-900">
            {formatDate(receiptMetadata.transactionDate)}
          </span>
          {receiptMetadata.confidence?.date > 0 && (
            <span className={`text-xs ${getConfidenceColor(receiptMetadata.confidence.date)}`}>
              ({getConfidenceText(receiptMetadata.confidence.date, 'short')})
            </span>
          )}
        </div>
      )}

      {/* Items */}
      {receiptMetadata.items && receiptMetadata.items.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center space-x-2 mb-1">
            <Package className="h-3 w-3 text-gray-500" />
            <span className="text-xs text-gray-600">Items:</span>
          </div>
          <div className="ml-5 space-y-1 max-h-20 overflow-y-auto">
            {receiptMetadata.items.slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="text-gray-700 truncate flex-1 mr-2">{item.name}</span>
                {item.price && (
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(item.price)}
                  </span>
                )}
              </div>
            ))}
            {receiptMetadata.items.length > 5 && (
              <div className="text-xs text-gray-500 italic">
                +{receiptMetadata.items.length - 5} more items
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confidence Summary */}
      {receiptMetadata.confidence && (
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-3 w-3 text-gray-500" />
            <span className="text-xs text-gray-600">Extraction Confidence:</span>
            <span className={`text-xs font-medium ${getConfidenceColor(receiptMetadata.confidence.total)}`}>
              {getConfidenceText(receiptMetadata.confidence.total, 'short')}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReceiptTooltip
