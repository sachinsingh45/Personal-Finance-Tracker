
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount)
}

export const formatDate = (date, format = 'short') => {
  if (!date) return 'Not detected'
  
  const options = format === 'long' 
    ? {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    : {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
  
  return new Date(date).toLocaleDateString('en-US', options)
}

export const getConfidenceColor = (confidence, withBackground = false) => {
  const baseColors = {
    high: withBackground ? 'text-green-600 bg-green-50' : 'text-green-600',
    medium: withBackground ? 'text-yellow-600 bg-yellow-50' : 'text-yellow-600',
    low: withBackground ? 'text-red-600 bg-red-50' : 'text-red-600'
  }
  
  if (confidence >= 0.8) return baseColors.high
  if (confidence >= 0.6) return baseColors.medium
  return baseColors.low
}

export const getConfidenceText = (confidence, format = 'full') => {
  const level = confidence >= 0.8 ? 'High' : confidence >= 0.6 ? 'Medium' : 'Low'
  return format === 'full' ? `${level} Confidence` : level
}

export const formatConfidencePercentage = (confidence) => {
  return `${Math.round(confidence * 100)}%`
}
