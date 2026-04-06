# MiraaLink Smart Market System - Backend API

A comprehensive backend API for the MiraaLink Smart Market System, built with Node.js, Express.js, and Prisma ORM. This system provides authentication, marketplace functionality, predictive analytics, training modules, wallet management, and M-Pesa payment integration.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd msms/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

The API will be available at `http://localhost:3001`

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **SQLite** (comes with Node.js, no separate installation needed)

## 🛠️ Installation

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd msms/backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express.js for the web framework
- Prisma ORM for database management
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation
- helmet for security headers
- cors for cross-origin requests
- morgan for logging

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Or create it manually with the following content:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server Configuration
PORT=3001
NODE_ENV="development"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
```

**Security Note:** Never commit the `.env` file to version control. Add it to `.gitignore`.

### 4. Database Setup

#### Initialize Prisma

```bash
# Generate Prisma client
npm run db:generate

# Create and run migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

#### Alternative: Push Schema Directly

If you prefer to push the schema directly without migrations:

```bash
npm run db:push
```

### 5. Start the Server

#### Development Mode (with auto-restart)

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

## 📊 Database Schema

The system uses SQLite with the following main entities:

### User
- Authentication and user management
- Roles: FARMER, BUYER, ADMIN
- Phone-based authentication with OTP

### Listing
- Marketplace product listings
- Grades: Kangeta, Alele, Giza, Lomboko
- Status: ACTIVE, SOLD, CANCELLED

### Order
- Purchase transactions
- Status: PENDING, CONFIRMED, PAID, DELIVERED, CANCELLED

### TrainingModule
- Educational content for farmers
- Categories: FARMING_TECHNIQUES, MARKET_INSIGHTS, QUALITY_CONTROL, SUSTAINABILITY, BUSINESS_MANAGEMENT
- Difficulty levels: BEGINNER, INTERMEDIATE, ADVANCED

### WalletTransaction
- Financial transactions
- Types: CREDIT, DEBIT
- Status: PENDING, COMPLETED, FAILED, CANCELLED

### Prediction
- AI-generated price forecasts
- Historical and predicted price data

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication with phone-based OTP verification.

### Authentication Flow

1. **Registration**: User provides name, phone, role, location
2. **OTP Request**: System sends OTP to phone number
3. **Login**: User enters OTP to authenticate
4. **Token**: JWT token issued for subsequent requests

### Protected Routes

All API endpoints (except auth) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/request-otp` | Request OTP for login |
| POST | `/login` | Login with OTP |
| GET | `/profile` | Get current user profile |
| PUT | `/profile` | Update user profile |

### Marketplace (`/api/listings`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all active listings |
| GET | `/:id` | Get single listing details |
| POST | `/` | Create new listing (farmers only) |
| PUT | `/:id` | Update listing (owner only) |

### Orders (`/api/orders`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user's orders |
| GET | `/:id` | Get single order details |
| POST | `/` | Create new order (buyers only) |
| PUT | `/:id/status` | Update order status |

### Training (`/api/training`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all training modules |
| GET | `/:id` | Get single training module |
| POST | `/` | Create training module (admin only) |
| PUT | `/:id` | Update training module (admin only) |
| DELETE | `/:id` | Delete training module (admin only) |
| POST | `/:id/complete` | Mark module as completed |
| GET | `/user/completed` | Get user's completed modules |

### Predictive Analytics (`/api/predictive`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get price predictions and market insights |

### Wallet (`/api/wallet`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get wallet balance and transactions |
| POST | `/deposit` | Add money to wallet |
| POST | `/withdraw` | Withdraw money from wallet |
| GET | `/transaction/:id` | Get transaction details |
| GET | `/stats` | Get wallet statistics |

### Payments (`/api/payments`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/mpesa/stkpush` | Initiate M-Pesa payment |
| POST | `/mpesa/callback` | M-Pesa payment callback |
| GET | `/status/:transactionId` | Check payment status |
| POST | `/order/:orderId` | Process order payment |

## 🧪 Testing the API

### Health Check

```bash
curl http://localhost:3001/health
```

### Authentication Example

```bash
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Farmer",
    "phone": "+254712345678",
    "role": "FARMER",
    "location": "Meru"
  }'

# Request OTP
curl -X POST http://localhost:3001/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+254712345678"}'

# Login with OTP (check console for OTP)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254712345678",
    "otp": "123456"
  }'
```

### Using JWT Token

```bash
# Use the token from login response
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/listings
```

## 🗄️ Database Management

### Prisma Studio (Database GUI)

```bash
npm run db:studio
```

Opens a web interface at `http://localhost:5555` to view and edit database data.

### Database Commands

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create new migration
npm run db:migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Push schema changes directly (development only)
npm run db:push
```

### Seeding Data

The system comes with sample data including:
- Sample users (farmers, buyers, admin)
- Product listings
- Training modules
- Price predictions
- Wallet transactions

```bash
npm run db:seed
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin request protection
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: express-validator for all inputs
- **JWT Authentication**: Secure token-based auth
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## 📝 Development

### Project Structure

```
backend/
├── middleware/          # Authentication & security middleware
├── prisma/             # Database schema and migrations
│   ├── schema.prisma   # Database schema definition
│   ├── seed.js         # Sample data seeding
│   └── migrations/     # Database migrations
├── routes/             # API route handlers
│   ├── auth.js         # Authentication routes
│   ├── listings.js     # Marketplace routes
│   ├── orders.js       # Order management routes
│   ├── training.js     # Training module routes
│   ├── wallet.js       # Wallet management routes
│   ├── payments.js     # Payment processing routes
│   └── predictive.js   # AI predictions routes
├── .env                # Environment variables
├── server.js           # Main application server
└── package.json        # Dependencies and scripts
```

### Adding New Features

1. **Database Changes**:
   - Update `prisma/schema.prisma`
   - Run `npm run db:migrate`

2. **New API Routes**:
   - Create new file in `routes/` directory
   - Import and mount in `server.js`

3. **Middleware**:
   - Add to `middleware/` directory
   - Import in routes or `server.js`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database file path | `file:./dev.db` |
| `JWT_SECRET` | JWT signing secret | Required |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**:
   - Use strong JWT secret
   - Set `NODE_ENV=production`
   - Configure production database URL

2. **Database**:
   - Consider PostgreSQL for production
   - Set up proper backups
   - Configure connection pooling

3. **Security**:
   - Use HTTPS in production
   - Implement proper OTP SMS service
   - Set up monitoring and logging

### Vercel Deployment

The backend includes `vercel.json` for easy deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find process using port 3001
netstat -ano | findstr :3001
# Kill the process
taskkill /PID <PID> /F
```

**Database connection issues:**
```bash
# Reset database
npx prisma migrate reset
npm run db:seed
```

**Authentication problems:**
- Check JWT token expiration (7 days)
- Verify token format: `Bearer <token>`
- Ensure user exists in database

### Logs

The application uses Morgan for HTTP request logging. Check console output for:
- Incoming requests
- Authentication attempts
- Database operations
- Error messages

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Check existing issues in the repository
4. Create a new issue with detailed information

## 📄 License

This project is part of the MiraaLink Smart Market System. See the main project README for licensing information.