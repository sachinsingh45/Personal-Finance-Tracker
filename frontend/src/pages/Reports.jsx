import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { toast } from 'react-toastify'
import { Calendar, TrendingUp, IndianRupee, List, Download, Eye, EyeOff, BarChart3 } from 'lucide-react'
import { transactionAPI } from '../services/api'

const Reports = () => {
  const [expensesByCategory, setExpensesByCategory] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [dailyData, setDailyData] = useState([])
  const [allTransactions, setAllTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTransactionList, setShowTransactionList] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth()
  })
  
  // Chart interactivity states
  const [hoveredData, setHoveredData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16']

  // Initial data fetch on component mount
  useEffect(() => {
    fetchReportsData(true)
  }, [])

  // Debounced data fetch when selected month changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchReportsData(false)
    }, 300) // Debounce for 300ms

    return () => clearTimeout(timeoutId)
  }, [selectedMonth.year, selectedMonth.month])

  const fetchReportsData = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
      setLoading(true)
      } else {
        setIsLoading(true)
      }
      setError('')
      
      const response = await transactionAPI.getAll()
      const transactions = response.data || []
      
      // Filter transactions by selected month
      const filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date)
        return transactionDate.getFullYear() === selectedMonth.year && 
               transactionDate.getMonth() === selectedMonth.month
      })
      
      setAllTransactions(filteredTransactions)
      
      // Process data for different charts
      const processedData = processTransactionsData(filteredTransactions)
      setExpensesByCategory(processedData.expensesByCategory)
      setMonthlyData(processedData.monthlyData)
      setDailyData(processedData.dailyData)
      
    } catch (error) {
      console.error('Error fetching reports data:', error)
      setError('Failed to load reports data')
    } finally {
      if (isInitialLoad) {
      setLoading(false)
      } else {
        setIsLoading(false)
      }
    }
  }

  const processTransactionsData = (transactions) => {
    // Calculate expenses by category
    const expensesByCategory = calculateExpensesByCategory(transactions)
    
    // Calculate monthly data
    const monthlyData = calculateMonthlyData(transactions)
    
    // Calculate daily data with running balance
    const dailyData = calculateDailyData(transactions)
    
    return { expensesByCategory, monthlyData, dailyData }
  }

  const calculateExpensesByCategory = (transactions) => {
    const expenseMap = {}
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const category = transaction.category
        if (expenseMap[category]) {
          expenseMap[category].value += transaction.amount
          expenseMap[category].count += 1
        } else {
          expenseMap[category] = {
            name: category,
            value: transaction.amount,
            count: 1
          }
        }
      })
    
    return Object.values(expenseMap).sort((a, b) => b.value - a.value)
  }

  const calculateMonthlyData = (transactions) => {
    const monthlyMap = {}
    
    transactions.forEach(transaction => {
      const monthKey = new Date(transaction.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, income: 0, expenses: 0 }
      }
      
      if (transaction.type === 'income') {
        monthlyMap[monthKey].income += transaction.amount
      } else {
        monthlyMap[monthKey].expenses += transaction.amount
      }
    })
    
    return Object.values(monthlyMap).sort((a, b) => 
      new Date(a.month + ' 1, ' + new Date().getFullYear()) - 
      new Date(b.month + ' 1, ' + new Date().getFullYear())
    )
  }

  const calculateDailyData = (transactions) => {
    const dailyMap = {}
    
    // Initialize all days in the selected month
    const { startDate, endDate } = getCurrentMonthDateRange()
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      dailyMap[dayKey] = {
        day: dayKey,
        date: new Date(d),
        income: 0,
        expenses: 0,
        balance: 0,
        runningBalance: 0
      }
    }
    
    // Add transaction data
    transactions.forEach(transaction => {
      const dayKey = new Date(transaction.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
      
      if (dailyMap[dayKey]) {
        if (transaction.type === 'income') {
          dailyMap[dayKey].income += transaction.amount
        } else {
          dailyMap[dayKey].expenses += transaction.amount
        }
      }
    })
    
    // Calculate balance and running balance
    const sortedDays = Object.values(dailyMap).sort((a, b) => new Date(a.date) - new Date(b.date))
    
    let runningBalance = 0
    sortedDays.forEach(day => {
      day.balance = day.income - day.expenses
      runningBalance += day.balance
      day.runningBalance = runningBalance
    })
    
    return sortedDays
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const handleMonthChange = (field, value) => {
    setSelectedMonth(prev => ({
      ...prev,
      [field]: parseInt(value)
    }))
  }

  const getMonthName = (monthIndex) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[monthIndex]
  }

  const getCurrentMonthDateRange = () => {
    const startDate = new Date(selectedMonth.year, selectedMonth.month, 1)
    const endDate = new Date(selectedMonth.year, selectedMonth.month + 1, 0)
    return { startDate, endDate }
  }

  const getTotalIncome = () => {
    return allTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getTotalExpenses = () => {
    return allTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getTotalTransactions = () => {
    return allTransactions.length
  }

  const getFilteredTransactions = () => {
    if (filterType === 'all') return allTransactions
    return allTransactions.filter(t => t.type === filterType)
  }

  const exportToCSV = () => {
    const csvData = getFilteredTransactions().map(transaction => ({
      Date: new Date(transaction.date).toLocaleDateString(),
      Type: transaction.type,
      Category: transaction.category,
      Description: transaction.description,
      Amount: transaction.amount
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const { startDate, endDate } = getCurrentMonthDateRange()
    a.download = `transactions-${getMonthName(selectedMonth.month)}-${selectedMonth.year}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Report exported successfully! 📊')
  }

  // Chart interaction functions
  const handleDataHover = (data) => {
    setHoveredData(data)
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div>
                  <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-96 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Date Filter Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="animate-pulse">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                  <div className="h-12 w-full bg-gray-200 rounded-xl"></div>
                </div>
                <div>
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                  <div className="h-12 w-full bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                  <div className="text-right">
                    <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                    <div className="h-8 w-32 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div className="h-3 w-20 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="animate-pulse">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-80 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
        <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Financial Reports
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm">Comprehensive analysis of your financial data and trends</p>
                  </div>
                </div>
        </div>
              <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={exportToCSV}
                  className="group flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
                  <Download className="h-5 w-5 group-hover:animate-bounce" />
                  <span className="font-semibold">Export CSV</span>
        </button>
              </div>
            </div>
          </div>
      </div>

        {/* Enhanced Month Filter */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Month Filter</h3>
              {isLoading && (
                <div className="ml-auto">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Month</label>
                <div className="relative">
                  <select
                    value={selectedMonth.month}
                    onChange={(e) => handleMonthChange('month', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i}>
                        {getMonthName(i)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Year</label>
                <div className="relative">
                  <select
                    value={selectedMonth.year}
                    onChange={(e) => handleMonthChange('year', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                  >
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - 5 + i
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      )
                    })}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
              <span>Selected month: {getMonthName(selectedMonth.month)} {selectedMonth.year}</span>
              <button
                onClick={() => setSelectedMonth({
                  year: new Date().getFullYear(),
                  month: new Date().getMonth()
                })}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset to Current Month
              </button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Summary Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wide">Total Income</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1">{formatCurrency(getTotalIncome())}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-200 rounded-full animate-pulse"></div>
                <span className="text-emerald-100 text-xs font-medium">Positive Growth</span>
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <IndianRupee className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-red-100 text-sm font-semibold uppercase tracking-wide">Total Expenses</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1">{formatCurrency(getTotalExpenses())}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-200 rounded-full animate-pulse"></div>
                <span className="text-red-100 text-xs font-medium">Expense Tracking</span>
              </div>
          </div>
        </div>
        
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Net Balance</p>
                  <p className={`text-2xl lg:text-3xl font-bold mt-1 ${getTotalIncome() - getTotalExpenses() >= 0 ? 'text-blue-100' : 'text-orange-200'}`}>
                    {formatCurrency(getTotalIncome() - getTotalExpenses())}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${getTotalIncome() - getTotalExpenses() >= 0 ? 'bg-blue-200' : 'bg-orange-200'}`}></div>
                <span className="text-blue-100 text-xs font-medium">
                  {getTotalIncome() - getTotalExpenses() >= 0 ? 'Positive Balance' : 'Negative Balance'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <List className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-purple-100 text-sm font-semibold uppercase tracking-wide">Total Transactions</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1">{getTotalTransactions()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-200 rounded-full animate-pulse"></div>
                <span className="text-purple-100 text-xs font-medium">Activity Count</span>
        </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading data...</span>
          </div>
        </div>
      ) : allTransactions.length > 0 ? (
        <>
          {/* Side-by-Side Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Expenses by Category */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-5 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Expenses by Category</h3>
                    <p className="text-gray-600 mt-1">
                      Visual breakdown of your spending patterns
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {expensesByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                        dataKey="value"
                        stroke="#fff"
                        strokeWidth={2}
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          formatCurrency(value),
                          props.payload.name
                        ]}
                        labelFormatter={(label) => `Category: ${label}`}
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
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <BarChart3 className="h-16 w-16 mb-4 text-gray-300" />
                    <h4 className="text-lg font-medium text-gray-700 mb-2">No Expense Data</h4>
                    <p className="text-sm text-center">
                      No expenses found for the selected date range.<br />
                      Add some expense transactions to see the breakdown.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Monthly Income vs Expenses */}
          {monthlyData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Monthly Income vs Expenses</h3>
                      <p className="text-gray-600 mt-1">
                        Track your monthly financial performance
                </p>
              </div>
                  </div>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              </div>
            </div>
          )}
          </div>

          {/* Enhanced Interactive Daily Financial Overview */}
          {dailyData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                  <div>
                      <h3 className="text-xl font-bold text-gray-900">Daily Financial Overview</h3>
                      <p className="text-gray-600 mt-1">
                      Track your daily income, expenses, and running balance
                    </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Enhanced Hovered Data Display */}
                {hoveredData && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="p-3 bg-white rounded-lg shadow-sm mb-2">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Date</p>
                          <p className="text-lg font-bold text-gray-900 mt-1">{hoveredData.day}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="p-3 bg-white rounded-lg shadow-sm mb-2">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Income</p>
                          <p className="text-lg font-bold text-green-600 mt-1">{formatCurrency(hoveredData.income)}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="p-3 bg-white rounded-lg shadow-sm mb-2">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Expenses</p>
                          <p className="text-lg font-bold text-red-600 mt-1">{formatCurrency(hoveredData.expenses)}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="p-3 bg-white rounded-lg shadow-sm mb-2">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Balance</p>
                          <p className={`text-lg font-bold mt-1 ${hoveredData.runningBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          {formatCurrency(hoveredData.runningBalance)}
                        </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <ResponsiveContainer width="100%" height={350}>
                  <LineChart 
                    data={dailyData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    onMouseMove={(data) => handleDataHover(data.activePayload?.[0]?.payload)}
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
                    
                    {/* Income Line */}
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#10B981" 
                      strokeWidth={4}
                      name="Daily Income"
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 3, fill: '#fff' }}
                      connectNulls={false}
                    />
                    
                    {/* Expenses Line */}
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#EF4444" 
                      strokeWidth={4}
                      name="Daily Expenses"
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 8, stroke: '#EF4444', strokeWidth: 3, fill: '#fff' }}
                      connectNulls={false}
                    />
                    
                    {/* Running Balance Line */}
                    <Line 
                      type="monotone" 
                      dataKey="runningBalance" 
                      stroke="#3B82F6" 
                      strokeWidth={5}
                      name="Running Balance"
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 10, stroke: '#3B82F6', strokeWidth: 3, fill: '#fff' }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                
                {/* Enhanced Chart Info */}
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Hover over data points for detailed information</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Showing {dailyData.length} days of data</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Transaction List Toggle */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-5 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <List className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Transaction Details</h3>
                    <p className="text-gray-600 mt-1">
                      View and filter your transaction history
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="all">All Transactions</option>
                    <option value="income">Income Only</option>
                    <option value="expense">Expenses Only</option>
                  </select>
                  <button
                    onClick={() => setShowTransactionList(!showTransactionList)}
                    className="group flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {showTransactionList ? <EyeOff className="h-4 w-4 group-hover:scale-110 transition-transform" /> : <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />}
                    <span className="font-semibold">{showTransactionList ? 'Hide' : 'Show'} Details</span>
                  </button>
                </div>
              </div>
            </div>
            
            {showTransactionList && (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {getFilteredTransactions().map((transaction, index) => (
                        <tr key={transaction._id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                              transaction.type === 'income' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction.category}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {transaction.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            <span className={`${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {getFilteredTransactions().length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <List className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-500 font-medium">No transactions found for the selected filter</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 px-6 py-5 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">No Data Available</h3>
                <p className="text-gray-600 mt-1">
                  No transactions found for the selected date range
                </p>
              </div>
            </div>
          </div>
          <div className="p-12 text-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Transactions Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              There are no transactions in the selected date range. Try adjusting your date filter or add some transactions to see your financial reports.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setDateRange({
                  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                  endDate: new Date()
                })}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Reset Date Range
              </button>
              <button
                onClick={() => window.location.href = '/add'}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default Reports