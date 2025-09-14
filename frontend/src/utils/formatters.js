
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount)
}

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options })
}

export const formatDateInput = (date) => {
  return new Date(date).toISOString().split('T')[0]
}

export const getMonthName = (monthIndex) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[monthIndex]
}

export const truncateText = (text, maxLength = 50) => {
  if (!text) return 'No description'
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}

export const getAmountColor = (type) => {
  return type === 'income' ? 'text-green-600' : 'text-red-600'
}

export const getAmountPrefix = (type) => {
  return type === 'income' ? '+' : '-'
}

export const calculateStats = (transactions) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    transactionCount: transactions.length
  }
}
