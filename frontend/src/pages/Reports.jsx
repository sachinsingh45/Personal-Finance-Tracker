import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Calendar } from 'lucide-react'
import { transactionAPI } from '../services/api'
import { getMonthName, formatDate } from '../utils/formatters'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import EmptyState from '../components/ui/EmptyState'
import ReportsHeader from '../components/reports/ReportsHeader'
import MonthFilter from '../components/reports/MonthFilter'
import StatsSummary from '../components/reports/StatsSummary'
import ExpensesPieChart from '../components/charts/ExpensesPieChart'
import MonthlyBarChart from '../components/charts/MonthlyBarChart'
import DailyLineChart from '../components/charts/DailyLineChart'
import TransactionTable from '../components/reports/TransactionTable'

const Reports = () => {
  const [expensesByCategory, setExpensesByCategory] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [dailyData, setDailyData] = useState([])
  const [allTransactions, setAllTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth()
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchReportsData(true)
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchReportsData(false)
    }, 300)

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
      
      const filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date)
        return transactionDate.getFullYear() === selectedMonth.year && 
               transactionDate.getMonth() === selectedMonth.month
      })
      
      setAllTransactions(filteredTransactions)
      
      const processedData = processTransactionsData(filteredTransactions)
      setExpensesByCategory(processedData.expensesByCategory)
      setMonthlyData(processedData.monthlyData)
      setDailyData(processedData.dailyData)
      
    } catch (error) {
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
    const expensesByCategory = calculateExpensesByCategory(transactions)
    const monthlyData = calculateMonthlyData(transactions)
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
    
    const sortedDays = Object.values(dailyMap).sort((a, b) => new Date(a.date) - new Date(b.date))
    
    let runningBalance = 0
    sortedDays.forEach(day => {
      day.balance = day.income - day.expenses
      runningBalance += day.balance
      day.runningBalance = runningBalance
    })
    
    return sortedDays
  }

  const handleMonthChange = (field, value) => {
    setSelectedMonth(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getCurrentMonthDateRange = () => {
    const startDate = new Date(selectedMonth.year, selectedMonth.month, 1)
    const endDate = new Date(selectedMonth.year, selectedMonth.month + 1, 0)
    return { startDate, endDate }
  }

  const getFilteredTransactions = () => {
    if (filterType === 'all') return allTransactions
    return allTransactions.filter(t => t.type === filterType)
  }

  const exportToCSV = () => {
    const csvData = getFilteredTransactions().map(transaction => ({
      Date: formatDate(transaction.date),
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
    a.download = `transactions-${getMonthName(selectedMonth.month)}-${selectedMonth.year}.csv`
    a.click()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <ReportsHeader 
        selectedMonth={selectedMonth} 
        onExportCSV={exportToCSV} 
      />
      
      <MonthFilter 
        selectedMonth={selectedMonth} 
        onMonthChange={handleMonthChange} 
        isLoading={isLoading} 
      />
      
      <ErrorMessage message={error} />
      
      <StatsSummary transactions={allTransactions} />

      {/* Charts Section */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      ) : allTransactions.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Expenses by Category</h3>
              </div>
              <div className="p-4">
                <ExpensesPieChart data={expensesByCategory} />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Monthly Overview</h3>
              </div>
              <div className="p-4">
                <MonthlyBarChart data={monthlyData} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Daily Trends</h3>
            </div>
            <div className="p-4">
              <DailyLineChart data={dailyData} />
            </div>
          </div>

          <TransactionTable 
            transactions={allTransactions} 
            filterType={filterType} 
            onFilterChange={setFilterType} 
          />
        </>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data for selected month</h3>
          <p className="text-gray-600">Try selecting a different month or add some transactions.</p>
        </div>
      )}
    </div>
  )
}

export default Reports