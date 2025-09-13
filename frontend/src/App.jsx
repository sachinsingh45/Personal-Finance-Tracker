import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import FloatingActionButton from './components/FloatingActionButton';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import EditTransaction from './pages/EditTransaction';
import TransactionList from './pages/TransactionList';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Navbar />
                <main className="container mx-auto px-4 py-6 md:py-8">
                  <Dashboard />
                </main>
                <FloatingActionButton />
              </ProtectedRoute>
            } />
            <Route path="/add" element={
              <ProtectedRoute>
                <Navbar />
                <main className="container mx-auto px-4 py-6 md:py-8">
                  <AddTransaction />
                </main>
                <FloatingActionButton />
              </ProtectedRoute>
            } />
            <Route path="/edit/:id" element={
              <ProtectedRoute>
                <Navbar />
                <main className="container mx-auto px-4 py-6 md:py-8">
                  <EditTransaction />
                </main>
                <FloatingActionButton />
              </ProtectedRoute>
            } />
            <Route path="/transactions" element={
              <ProtectedRoute>
                <Navbar />
                <main className="container mx-auto px-4 py-6 md:py-8">
                  <TransactionList />
                </main>
                <FloatingActionButton />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Navbar />
                <main className="container mx-auto px-4 py-6 md:py-8">
                  <Reports />
                </main>
                <FloatingActionButton />
              </ProtectedRoute>
            } />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App