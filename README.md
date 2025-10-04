 # 💼 ExpenseTracker - Modern Expense Management System

A comprehensive, full-stack expense management application built with React.js and Node.js, featuring real-time approval workflows, OCR receipt scanning, data visualization, and multi-role user management.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎯 Project Overview

ExpenseTracker is a modern expense management system designed for businesses to streamline expense reporting, approval workflows, and financial tracking. Built with a focus on user experience, security, and scalability.

## 👨‍💻 Team Members

| Role | Name | 
|------|------|
| **Team Leader** | Maharsh Mistri | 
| **Member 1** | Vansh Thakkar | 
| **Member 2** | Teesha Mistry | 
| **Member 3** | Saiji Desai |

## Key Features

### Authentication and Authorization
- Multi-role system: Admin, Manager, Employee with specific permissions
- Supports Google OAuth and traditional email-password login
- JWT-based secure authentication with token refresh capability

### Expense Management
- Employee expense submission with detailed category selection
- OCR receipt scanning integration for automatic data extraction
- Multi-currency support based on company location
- Expense history and filtering by date, category, status

### Customizable Approval Rules
- Sequential approval workflows where expenses pass through predefined approval steps
- Percentage-based approval for flexible decision-making
- Specific approver assignment for tailored workflows
- Hybrid rules combining multiple approval strategies
- Role- and amount-based custom rules to ensure compliance with company policies
- Automated real-time notifications and audit logging for transparency

### Real-Time Approval Process
- Manager and Admin dashboards to view pending approvals and team expenses
- Ability to approve or reject expenses with comments
- Configurable escalation rules and thresholds

### Analytics and Reporting
- Interactive charts and graphs showing monthly expense trends, category distributions, and approval status breakdowns
- Exportable PDF reports by Admin and Manager roles, including options for summary, monthly, and category reports
- Dashboard provides at-a-glance metrics: total expenses, pending approvals, monthly totals, and user counts

### Modern UI / UX
- Clean, dark theme for professional and comfortable user experience
- Responsive design for desktop and mobile devices
- Intuitive navigation with clear segmentation by user roles
- All unnecessary text and emojis removed for clarity and professionalism

---

## 🛠️ Technology Stack

### Frontend
- **React.js 18** - Modern UI library
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Lucide React** - Modern icon library
- **Axios** - HTTP client
- **jsPDF** - PDF generation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Passport.js** - Authentication middleware
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### Additional Services
- **OCR.space API** - Receipt text extraction
- **Google OAuth** - Social authentication
- **JWT** - Secure token-based auth

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
```

2. **Setup Backend**
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Update .env with your configurations
```

3. **Setup Frontend**
```bash
cd frontend
npm install
```

4. **Configure Environment Variables**

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense-management
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
OCR_API_KEY=your-ocr-space-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CORS_ORIGIN=http://localhost:3000
```

5. **Start the Application**

Backend:
```bash
cd backend
npm run dev
```

Frontend (new terminal):
```bash
cd frontend
npm start
```

6. **Create Test Users**
```bash
cd backend
node create-test-users.js
```

## 📱 Usage

### Login Credentials
After running the setup script:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@test.com | password123 | Full system access |
| **Manager** | manager@test.com | password123 | Team management, approvals |
| **Employee** | employee@test.com | password123 | Expense submission only |

### Core Workflows

1. **Employee Expense Submission**
   - Submit expenses with receipt upload
   - OCR automatically extracts data
   - Track submission status

2. **Manager Approval Process**
   - Review pending team expenses
   - Approve or reject with comments
   - Monitor team spending patterns

3. **Admin System Management**
   - Configure approval rules
   - Manage user accounts
   - Generate comprehensive reports
   - View system analytics

## 📊 API Endpoints

### Authentication
```
POST /api/auth/signup     - User registration
POST /api/auth/login      - User login
POST /api/auth/refresh    - Refresh JWT token
GET  /api/auth/google     - Google OAuth login
```

### Expenses
```
GET    /api/expenses      - Get expenses (filtered by role)
POST   /api/expenses      - Create new expense
PUT    /api/expenses/:id  - Update expense
DELETE /api/expenses/:id  - Delete expense
```

### Approvals
```
GET  /api/approvals/pending  - Get pending approvals
POST /api/approvals/process  - Process approval decision
GET  /api/approvals/rules    - Get approval rules
POST /api/approvals/rules    - Create approval rule
```

### OCR
```
POST /api/ocr/process     - Process receipt image
```

## 🏗️ Project Structure

```
expense-tracker/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # Context providers
│   │   ├── services/    # API services
│   │   └── App.js       # Main component
└── README.md
```

## 🔧 Configuration

### MongoDB Setup
1. **Local MongoDB**: Install and run MongoDB locally
2. **MongoDB Atlas**: Use cloud database (recommended for production)

### OCR Configuration
1. Get free API key from [OCR.space](https://ocr.space/ocrapi)
2. Add to environment variables

### Google OAuth Setup
1. Create project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google+ API
3. Configure OAuth consent screen
4. Create credentials and add to environment

## 📈 Features in Detail

### Approval Rules Engine
- **Sequential Approval**: Step-by-step approval chain
- **Percentage-based**: Approval by percentage of approvers
- **Specific Approver**: Direct assignment to specific users
- **Hybrid Rules**: Combination of multiple rule types

### OCR Integration
- **Automatic text extraction** from receipt images
- **Smart data parsing** for amount, date, merchant
- **Support for multiple formats** (PNG, JPEG, PDF)
- **Fallback manual entry** if OCR fails

### Multi-Currency Support
- **Automatic currency detection** based on country
- **Dynamic currency symbols** and formatting
- **Exchange rate considerations** for reporting

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Check if MongoDB is running
   mongosh
   # Or use MongoDB Compass
   ```

2. **OCR API Errors**
   ```bash
   # Verify API key in .env
   # Check image size (max 5MB for free tier)
   ```

3. **Google OAuth Not Working**
   ```bash
   # Verify callback URL in Google Console
   # Check credentials in .env file
   ```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

