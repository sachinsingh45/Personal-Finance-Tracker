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
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports</h1>
            <p className="mt-1 text-sm text-gray-600">
              Financial analysis for {getMonthName(selectedMonth.month)} {selectedMonth.year}
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Month Filter */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filter by Month</h3>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={selectedMonth.month}
                onChange={(e) => handleMonthChange('month', e.target.value)}
                className="form-select w-full"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {getMonthName(i)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedMonth.year}
                onChange={(e) => handleMonthChange('year', e.target.value)}
                className="form-select w-full"
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
            </div>
          </div>
        </div>
        
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Income</p>
                <p className="text-xl font-semibold text-green-600">
                  ₹{getTotalIncome().toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expenses</p>
                <p className="text-xl font-semibold text-red-600">
                  ₹{getTotalExpenses().toLocaleString()}
                </p>
              </div>
              <IndianRupee className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Balance</p>
                <p className={`text-xl font-semibold ${
                  getTotalIncome() - getTotalExpenses() >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  ₹{(getTotalIncome() - getTotalExpenses()).toLocaleString()}
                </p>
              </div>
              <BarChart3 className={`h-8 w-8 ${
                getTotalIncome() - getTotalExpenses() >= 0 ? 'text-blue-500' : 'text-orange-500'
              }`} />
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-xl font-semibold text-gray-900">
                  {getTotalTransactions()}
                </p>
              </div>
              <List className="h-8 w-8 text-gray-500" />
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
            {/* Expenses by Category */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Expenses by Category</h3>
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

            {/* Monthly Income vs Expenses */}
          {monthlyData.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Monthly Income vs Expenses</h3>
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

          {/* Daily Financial Overview */}
          {dailyData.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Daily Financial Overview</h3>
              </div>
              
              <div className="p-6">
                {/* Enhanced Hovered Data Display */}
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

          {/* Transaction List Toggle */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-medium text-gray-900">Transaction Details</h3>
                <div className="flex gap-3">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="form-select"
                  >
                    <option value="all">All Transactions</option>
                    <option value="income">Income Only</option>
                    <option value="expense">Expenses Only</option>
                  </select>
                  <button
                    onClick={() => setShowTransactionList(!showTransactionList)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    {showTransactionList ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showTransactionList ? 'Hide' : 'Show'} Details
                  </button>
                </div>
              </div>
            </div>
            
            {showTransactionList && (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {getFilteredTransactions().map((transaction) => (
                        <tr key={transaction._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded capitalize ${
                              transaction.type === 'income' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {transaction.category}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                            {transaction.description || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            <span className={`${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
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
  )
}

export default Reports