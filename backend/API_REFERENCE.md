# MiraaLink Smart Market System - API Reference

Complete API documentation for the MiraaLink backend system.

## Base URL
```
http://localhost:3001/api
```

## Authentication

All endpoints except authentication require JWT token in header:
```
Authorization: Bearer <jwt-token>
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "string (2-100 chars)",
  "phone": "string (+254XXXXXXXXX format)",
  "role": "FARMER | BUYER | ADMIN",
  "location": "string (optional, 2-100 chars)"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "string",
    "name": "string",
    "phone": "string",
    "role": "string",
    "location": "string",
    "verified": false,
    "createdAt": "datetime"
  },
  "token": "jwt-token"
}
```

### POST /auth/request-otp
Request OTP for phone number.

**Request Body:**
```json
{
  "phone": "string (+254XXXXXXXXX format)"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "otpSent": true
}
```

### POST /auth/login
Login with OTP verification.

**Request Body:**
```json
{
  "phone": "string (+254XXXXXXXXX format)",
  "otp": "string (6 digits)"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "string",
    "name": "string",
    "phone": "string",
    "role": "string",
    "location": "string",
    "verified": true
  },
  "token": "jwt-token"
}
```

### GET /auth/profile
Get current user profile.

**Response:**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "phone": "string",
    "role": "string",
    "location": "string",
    "verified": true,
    "createdAt": "datetime"
  }
}
```

### PUT /auth/profile
Update user profile.

**Request Body:**
```json
{
  "name": "string (optional)",
  "location": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

## Marketplace Endpoints

### GET /listings
Get all active marketplace listings.

**Query Parameters:**
- `grade`: Filter by miraa grade
- `location`: Filter by location (partial match)
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order (asc/desc, default: desc)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "listings": [
    {
      "id": "string",
      "grade": "Kangeta",
      "qty": "50kg",
      "price": 600,
      "farmer": "John Farmer",
      "location": "Meru Central",
      "verified": true,
      "date": "Dec 15, 2:30 PM"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### GET /listings/:id
Get detailed information about a specific listing.

**Response:**
```json
{
  "listing": {
    "id": "string",
    "grade": "Kangeta",
    "quantity": 50,
    "price": 600,
    "description": "Premium quality",
    "location": "Meru Central",
    "status": "ACTIVE",
    "farmer": {
      "id": "string",
      "name": "John Farmer",
      "phone": "+254712345678",
      "verified": true,
      "location": "Meru"
    },
    "orders": [...],
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

### POST /listings
Create a new marketplace listing (Farmers only).

**Request Body:**
```json
{
  "grade": "Kangeta | Alele | Giza | Lomboko",
  "quantity": "number (1-1000 kg)",
  "price": "number (1-5000 KES/kg)",
  "description": "string (optional, max 500 chars)",
  "location": "string (2-100 chars)"
}
```

**Response:**
```json
{
  "message": "Listing created successfully",
  "listing": { ... }
}
```

### PUT /listings/:id
Update an existing listing (Owner only).

**Request Body:**
```json
{
  "quantity": "number (optional)",
  "price": "number (optional)",
  "description": "string (optional)",
  "location": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Listing updated successfully",
  "listing": { ... }
}
```

---

## Order Management Endpoints

### GET /orders
Get user's orders (filtered by role).

**Query Parameters:**
- `status`: Filter by order status
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "orders": [
    {
      "id": "string",
      "listing": {
        "id": "string",
        "grade": "Kangeta",
        "price": 600,
        "farmer": {
          "id": "string",
          "name": "John Farmer",
          "phone": "+254712345678",
          "verified": true
        }
      },
      "buyer": { ... },
      "quantity": 25,
      "totalPrice": 15000,
      "status": "PENDING",
      "deliveryAddress": "Nairobi CBD",
      "createdAt": "datetime"
    }
  ],
  "pagination": { ... }
}
```

### GET /orders/:id
Get detailed information about a specific order.

**Response:**
```json
{
  "order": { ...detailed order object... }
}
```

### POST /orders
Create a new order (Buyers only).

**Request Body:**
```json
{
  "listingId": "string",
  "quantity": "number (min 1)",
  "deliveryAddress": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "order": { ... }
}
```

### PUT /orders/:id/status
Update order status.

**Request Body:**
```json
{
  "status": "CONFIRMED | PAID | DELIVERED | CANCELLED"
}
```

**Response:**
```json
{
  "message": "Order status updated successfully",
  "order": { ... }
}
```

---

## Training Module Endpoints

### GET /training
Get all training modules.

**Query Parameters:**
- `category`: Filter by category
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "modules": [
    {
      "id": "string",
      "title": "Sustainable Soil Management",
      "description": "Learn essential techniques...",
      "category": "SUSTAINABILITY",
      "content": "Full content here...",
      "duration": 15,
      "difficulty": "BEGINNER",
      "isActive": true,
      "createdAt": "datetime"
    }
  ],
  "pagination": { ... }
}
```

### GET /training/:id
Get a specific training module.

**Response:**
```json
{
  "module": { ... }
}
```

### POST /training
Create a new training module (Admin only).

**Request Body:**
```json
{
  "title": "string (3-100 chars)",
  "description": "string (10-1000 chars)",
  "category": "FARMING_TECHNIQUES | MARKET_INSIGHTS | QUALITY_CONTROL | SUSTAINABILITY | BUSINESS_MANAGEMENT",
  "content": "string (min 50 chars)",
  "duration": "number (1-480 minutes)",
  "difficulty": "BEGINNER | INTERMEDIATE | ADVANCED"
}
```

### PUT /training/:id
Update a training module (Admin only).

**Request Body:** Same as create, all fields optional.

### DELETE /training/:id
Delete a training module (Admin only).

### POST /training/:id/complete
Mark a training module as completed for the current user.

**Response:**
```json
{
  "message": "Training module marked as completed",
  "completion": {
    "id": "string",
    "userId": "string",
    "moduleId": "string",
    "completedAt": "datetime"
  }
}
```

### GET /training/user/completed
Get user's completed training modules.

**Response:**
```json
{
  "completions": [
    {
      "id": "string",
      "module": { ... },
      "completedAt": "datetime"
    }
  ],
  "total": 5
}
```

---

## Predictive Analytics Endpoints

### GET /predictive
Get AI-generated price predictions and market insights.

**Response:**
```json
{
  "predictions": [
    {
      "id": "string",
      "date": "2024-01-15T00:00:00.000Z",
      "grade": "Kangeta",
      "actualPrice": 450.50,
      "predictedPrice": 475.25,
      "demandVolume": 1250,
      "confidence": 0.85,
      "createdAt": "datetime"
    }
  ]
}
```

---

## Wallet Management Endpoints

### GET /wallet
Get user's wallet balance and transaction history.

**Query Parameters:**
- `type`: Filter by CREDIT or DEBIT
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "balance": 45200.50,
  "transactions": [
    {
      "id": "string",
      "type": "CREDIT",
      "amount": 15000,
      "description": "Payment from John Buyer",
      "reference": "MPESA123456",
      "status": "COMPLETED",
      "createdAt": "datetime"
    }
  ],
  "pagination": { ... }
}
```

### POST /wallet/deposit
Add money to wallet via M-Pesa.

**Request Body:**
```json
{
  "amount": "number (10-10000 KES)",
  "paymentMethod": "MPESA"
}
```

**Response:**
```json
{
  "message": "Deposit initiated successfully",
  "transaction": { ... }
}
```

### POST /wallet/withdraw
Withdraw money from wallet.

**Request Body:**
```json
{
  "amount": "number (50-50000 KES)"
}
```

**Response:**
```json
{
  "message": "Withdrawal initiated successfully",
  "transaction": { ... }
}
```

### GET /wallet/transaction/:id
Get details of a specific transaction.

**Response:**
```json
{
  "transaction": { ... }
}
```

### GET /wallet/stats
Get wallet statistics and monthly breakdown.

**Response:**
```json
{
  "stats": {
    "totalCredits": 75000,
    "totalDebits": 29800,
    "transactionCount": 12,
    "balance": 45200
  },
  "monthlyBreakdown": {
    "2024-01": { "credits": 25000, "debits": 12000 },
    "2024-02": { "credits": 50000, "debits": 17800 }
  }
}
```

---

## Payment Processing Endpoints

### POST /payments/mpesa/stkpush
Initiate M-Pesa STK Push payment.

**Request Body:**
```json
{
  "amount": "number (1-150000 KES)",
  "phoneNumber": "string (254XXXXXXXXX format)"
}
```

**Response:**
```json
{
  "message": "STK Push initiated successfully",
  "transaction": {
    "id": "string",
    "reference": "MSMS123456789",
    "amount": 5000,
    "status": "PENDING"
  },
  "instructions": "Please check your phone and enter your M-Pesa PIN"
}
```

### POST /payments/mpesa/callback
M-Pesa payment callback (used by M-Pesa API).

### GET /payments/status/:transactionId
Check payment status.

**Response:**
```json
{
  "transaction": {
    "id": "string",
    "amount": 5000,
    "status": "COMPLETED",
    "reference": "M-Pesa receipt number",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

### POST /payments/order/:orderId
Process payment for an order.

**Request Body:**
```json
{
  "paymentMethod": "WALLET | MPESA"
}
```

**Response:**
```json
{
  "message": "Payment processed successfully",
  "orderId": "string",
  "paymentMethod": "WALLET"
}
```

### GET /payments/methods
Get available payment methods.

**Response:**
```json
{
  "methods": [
    {
      "id": "WALLET",
      "name": "MSMS Wallet",
      "description": "Pay using your MSMS wallet balance",
      "requiresConfirmation": false
    },
    {
      "id": "MPESA",
      "name": "M-Pesa",
      "description": "Pay using M-Pesa STK Push",
      "requiresConfirmation": true
    }
  ]
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": [...] // Optional validation errors
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Rate Limiting

- 100 requests per 15 minutes per IP address
- Applies to all endpoints

---

## Data Types

### User Roles
- `FARMER` - Can create listings and manage their products
- `BUYER` - Can browse listings and place orders
- `ADMIN` - Full system access including training management

### Miraa Grades
- `Kangeta` - Premium grade
- `Alele` - High quality
- `Giza` - Rare variety
- `Lomboko` - Traditional grade

### Order Statuses
- `PENDING` - Order created, awaiting confirmation
- `CONFIRMED` - Order confirmed by farmer
- `PAID` - Payment completed
- `DELIVERED` - Order delivered
- `CANCELLED` - Order cancelled

### Transaction Types
- `CREDIT` - Money added to wallet
- `DEBIT` - Money removed from wallet

### Training Categories
- `FARMING_TECHNIQUES` - Agricultural methods
- `MARKET_INSIGHTS` - Market analysis and trends
- `QUALITY_CONTROL` - Product quality standards
- `SUSTAINABILITY` - Environmental practices
- `BUSINESS_MANAGEMENT` - Farm business operations

---

## Testing

Use the included test script:

```bash
npm run test
```

This will test all major endpoints with sample data.