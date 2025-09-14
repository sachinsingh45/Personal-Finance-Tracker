# Personal Finance Tracker

A modern, full-stack personal finance management application that helps you track income, expenses, and analyze your financial data with AI-powered receipt processing.



## 📸 Demo Video
https://youtu.be/dLLQMcg8pb0?si=iF9q6L7OJVN3kaYd



## 🌟 Features

### Core Functionality
- **Transaction Management**: Add, edit, delete, and categorize income and expenses
- **Dashboard**: Visual overview of your financial status with charts and summaries
- **Financial Reports**: Detailed monthly analytics with interactive charts
- **User Authentication**: Secure login and registration system

### AI-Powered Receipt Processing
- **Smart Receipt Upload**: Drag-and-drop receipt images for automatic data extraction
- **Azure Document Intelligence**: AI-powered extraction of merchant, amount, date, and items
- **Auto-Fill Forms**: Automatically populate transaction forms with extracted data
- **Smart Categorization**: Intelligent transaction categorization based on merchant and items
- **Confidence Scoring**: Visual feedback on extraction accuracy

### User Experience
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Updates**: Instant feedback with toast notifications
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **Interactive Charts**: Visual data representation using Recharts

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Interactive charts and data visualization
- **Lucide React** - Beautiful icons
- **React Toastify** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Azure Document Intelligence** - AI-powered document processing

## 📁 Project Structure

```
PFT/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── charts/      # Chart components
│   │   │   ├── reports/     # Report-specific components
│   │   │   └── ui/          # Basic UI components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store and slices
│   │   ├── contexts/        # React contexts
│   │   └── config/          # Configuration files
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── config/              # Database and service configs
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── services/            # Business logic services
│   └── server.js            # Application entry point
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Azure Document Intelligence service (for receipt processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PFT
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Setup

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/personal-finance-tracker

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Azure Document Intelligence (for receipt processing)
AZURE_DOC_INTELLIGENCE_ENDPOINT=your-azure-endpoint
AZURE_DOC_INTELLIGENCE_KEY=your-azure-key

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The API will be available at `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## 📱 Usage

### Getting Started
1. **Register**: Create a new account with your email and password
2. **Login**: Sign in to access your personal dashboard
3. **Add Transactions**: Manually add income or expenses
4. **Upload Receipts**: Use the AI-powered receipt upload for automatic transaction creation
5. **View Reports**: Analyze your spending patterns with interactive charts

### Key Features

#### Transaction Management
- Add transactions manually with category, amount, and description
- Edit existing transactions
- Delete unwanted entries
- Filter and search through your transaction history

#### Receipt Processing
- Upload receipt images (JPEG, PNG, PDF supported)
- AI automatically extracts merchant, amount, date, and items
- Review and edit extracted data before saving
- Smart categorization based on merchant type

#### Financial Analytics
- Monthly spending breakdown by category
- Income vs expense trends
- Interactive charts and graphs
- Customizable date range filtering

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Receipts
- `POST /api/receipts/upload` - Upload and process receipt
- `POST /api/receipts/create-transaction` - Create transaction from receipt data

## 🎨 UI Components

The application features a modern, clean interface with:
- **Responsive Navigation**: Mobile-friendly navigation bar
- **Interactive Forms**: Smart forms with validation
- **Data Visualization**: Charts and graphs for financial insights
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages

## 🔒 Security Features

- **Password Hashing**: Secure password storage with bcrypt
- **JWT Authentication**: Stateless authentication tokens
- **Protected Routes**: Client-side route protection
- **Input Validation**: Server-side data validation
- **File Upload Security**: Secure file handling with type validation
