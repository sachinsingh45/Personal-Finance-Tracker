import React from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

const FloatingActionButton = () => {
  return (
    <Link
      to="/add"
      className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 md:hidden"
      aria-label="Add Transaction"
    >
      <Plus className="h-5 w-5" />
    </Link>
  )
}

export default FloatingActionButton
