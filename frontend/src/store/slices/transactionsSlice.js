import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../config/constants.js';
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/transactions`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch transactions';
      return rejectWithValue(message);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/transactions`, transactionData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create transaction';
      return rejectWithValue(message);
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async ({ id, ...transactionData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/transactions/${id}`, transactionData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update transaction';
      return rejectWithValue(message);
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/transactions/${id}`);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete transaction';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  transactions: [],
  isLoading: false,
  error: null,
  filters: {
    type: 'all',
    category: '',
    dateRange: {
      start: null,
      end: null,
    },
  },
  stats: {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0,
  },
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilter: (state, action) => {
      const { filterType, value } = action.payload;
      state.filters[filterType] = value;
    },
    clearFilters: (state) => {
      state.filters = {
        type: 'all',
        category: '',
        dateRange: {
          start: null,
          end: null,
        },
      };
    },
    calculateStats: (state) => {
      const income = state.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = state.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      state.stats = {
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses,
        transactionCount: state.transactions.length,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
        transactionsSlice.caseReducers.calculateStats(state);
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create transaction
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.unshift(action.payload);
        transactionsSlice.caseReducers.calculateStats(state);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update transaction
      .addCase(updateTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.transactions.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        transactionsSlice.caseReducers.calculateStats(state);
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = state.transactions.filter(t => t._id !== action.payload);
        transactionsSlice.caseReducers.calculateStats(state);
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setFilter, clearFilters, calculateStats } = transactionsSlice.actions;
export default transactionsSlice.reducer;
