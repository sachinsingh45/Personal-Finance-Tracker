const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://personal-finance-tracker-1-w991.onrender.com/api'
    : 'http://localhost:5000/api',
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      CHECK: '/auth/check'
    },
    TRANSACTIONS: {
      BASE: '/transactions',
      BY_ID: (id) => `/transactions/${id}`
    },
    RECEIPTS: {
      BASE: '/receipts',
      ANALYZE: '/receipts/analyze'
    }
  }
};

export const { BASE_URL, ENDPOINTS } = API_CONFIG;
export default API_CONFIG;
