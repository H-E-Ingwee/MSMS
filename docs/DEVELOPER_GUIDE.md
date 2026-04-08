# MiraaLink Smart Market System (MSMS) — Developer Guide

This developer guide explains how the MSMS platform is built, how to set up the development environment, and how to contribute effectively.

## 1. Project Overview

MSMS is a dual-stack application:

- **Frontend:** React + Vite application located in the repository root.
- **Backend:** Node.js + Express API server located in `backend/`.
- **Database:** Prisma ORM with SQLite for development.

The system supports three user roles: Buyer, Farmer, and Admin.

## 2. Tech Stack

- Frontend
  - React 18
  - Vite
  - React Router DOM
  - Recharts
  - Lucide React icons

- Backend
  - Node.js
  - Express
  - Prisma ORM
  - SQLite
  - JWT authentication
  - Africa's Talking SMS for OTP
  - IntaSend / M-Pesa for payments

## 3. Repository Layout

```
MSMS/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── prisma/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── docs/
│   ├── DEVELOPER_GUIDE.md
│   ├── USER_GUIDE.md
│   ├── MSMS-frontend-spec.md
│   └── PREDICTION_MODEL_DOCS.md
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   ├── AppRouter.jsx
│   └── main.jsx
├── package.json
└── README.md
```

## 4. Setup Instructions

### Frontend

```bash
cd MSMS
npm install
npm run dev
```

### Backend

```bash
cd MSMS/backend
npm install
cp .env.example .env
# Edit the .env file with your secrets
npm run dev
```

### Database

Run Prisma migrations and seed data:

```bash
cd MSMS/backend
npm run db:migrate
npm run db:seed
```

Open Prisma Studio:

```bash
npm run db:studio
```

## 5. Environment Variables

Use `backend/.env.example` as a template.

Key variables:

- `DATABASE_URL` — SQLite database path
- `JWT_SECRET` — JWT signing secret
- `PORT` — API server port
- `FRONTEND_URL` — allowed frontend origin
- `AFRICASTALKING_USERNAME`, `AFRICASTALKING_API_KEY`, `AFRICASTALKING_SENDER_ID`
- `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_ENVIRONMENT`

## 6. Backend Architecture

### `backend/server.js`

- Configures middleware: Helmet, CORS, logging, rate limiting, JSON parsing.
- Registers API routes for auth, listings, orders, payments, training, wallet, admin, and notifications.
- Uses `express-rate-limit` globally and selectively for `/api/auth`.

### Routes

- `backend/routes/auth.js`
  - `/api/auth/request-otp`
  - `/api/auth/login`
  - `/api/auth/register`
  - `/api/auth/profile`

- `backend/routes/listings.js`
  - `/api/listings`
  - Listing CRUD and seller updates

- `backend/routes/orders.js`
  - `/api/orders`
  - `/api/orders/:id/approve`
  - Buyer order creation, farmer approval, and workflow enforcement

- `backend/routes/payments.js`
  - `/api/payments/order/:orderId`
  - `/api/payments/status/:transactionId`
  - IntaSend payment initiation and status queries

- `backend/routes/training.js`
  - `/api/training`
  - Training module content

- `backend/routes/wallet.js`
  - `/api/wallet`
  - Wallet balance and transaction history

- `backend/routes/notifications.js`
  - `/api/notifications`
  - Notification retrieval and marking read

- `backend/routes/admin.js`
  - `/api/admin/*`
  - Admin statistics, user/listing/training management, CSV reports

### Middleware

- `backend/middleware/auth.js`
  - JWT validation and authentication helper
  - Role checks for admin-protected routes

## 7. Frontend Architecture

### Core Pages

- `src/pages/LandingPage.jsx`
- `src/pages/LoginPage.jsx`
- `src/pages/RegisterPage.jsx`
- `src/pages/DashboardPage.jsx`
- `src/pages/MarketplacePage.jsx`
- `src/pages/OrdersPage.jsx`
- `src/pages/FarmerDashboardPage.jsx`
- `src/pages/AdminDashboardPage.jsx`
- `src/pages/WalletPage.jsx`
- `src/pages/TrainingPage.jsx`
- `src/pages/OrderTrackingPage.jsx`
- `src/pages/ProfilePage.jsx`

### Components

- `src/components/atoms/` — reusable UI building blocks.
- `src/components/molecules/` — charts, cards, and complex UI elements.
- `src/components/ProtectedRoute.jsx` — route guard for authentication.
- `src/components/Header.jsx` and `NotificationBell.jsx`.

### Context

- `src/context/AuthContext.jsx`
  - Manages current user state, login, logout, and auth token storage.

### API client

- `src/services/api.js`
  - Shared fetch wrapper and auth headers
  - Functions for auth, listings, orders, payments, notifications, and admin operations.

## 8. Feature Flows

### Buyer order flow

1. Buyer authenticates via OTP.
2. Buyer browses listings.
3. Buyer submits an order request.
4. Order is created with `PENDING_APPROVAL`.
5. Farmer approves or rejects the order.
6. Buyer pays with M-Pesa once approved.
7. Order status updates through payment, shipping, and delivery.

### Farmer approval flow

- Farmers receive order notifications.
- Farmers review orders in the dashboard.
- Farmers approve/reject orders for their own listings.
- Approved orders become payable by buyers.

### Admin flow

- Admins access metrics and reports.
- Admins manage users, listings, and training content.
- Admins can download CSV reports for auditing.

## 9. API Reference Summary

### Authentication

- `POST /api/auth/request-otp`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/profile`

### Listings

- `GET /api/listings`
- `POST /api/listings`
- `PUT /api/listings/:id`
- `DELETE /api/listings/:id`

### Orders

- `GET /api/orders`
- `POST /api/orders`
- `PUT /api/orders/:id/approve`

### Payments

- `POST /api/payments/order/:orderId`
- `GET /api/payments/status/:transactionId`

### Training

- `GET /api/training`
- `POST /api/admin/training`
- `PUT /api/admin/training/:id`
- `DELETE /api/admin/training/:id`

### Notifications

- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`

### Admin

- `GET /api/admin/stats`
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/verify`
- `PUT /api/admin/users/:id/role`
- `PUT /api/admin/users/:id/status`
- `DELETE /api/admin/users/:id`
- `POST /api/admin/users/bulk`
- `GET /api/admin/reports/:type`

## 10. Development Workflow

### Working locally

- Run frontend and backend concurrently.
- Use `backend/.env.example` to configure services.
- Keep the frontend origin in `FRONTEND_URL` for CORS.

### Debugging tips

- Use browser dev tools to inspect API requests.
- Check backend logs for Express and Prisma errors.
- Use `node -c` to validate JavaScript syntax.
- Use `npm run db:studio` to inspect the database.

### Adding features

- Extend routes in `backend/routes/`.
- Add new services under `backend/services/`.
- Add UI pages/components under `src/pages/` and `src/components/`.
- Add API helper functions in `src/services/api.js`.

## 11. Coding Conventions

- Use modern ES modules throughout the repo.
- Keep route controllers clean and use helper services for business logic.
- Reuse UI atoms and molecules for consistent design.
- Store auth tokens in `localStorage` and attach them to API requests.

## 12. Future Improvements

- Add full unit and integration tests.
- Improve mobile responsiveness and offline support.
- Add real-time socket notifications.
- Add role-based dashboards for admin, buyer, and farmer.
- Add production-grade database support (Postgres, MySQL).

## 13. Useful Resources

- [Vite documentation](https://vitejs.dev/)
- [React documentation](https://reactjs.org/)
- [Prisma documentation](https://www.prisma.io/docs/)
- [Express documentation](https://expressjs.com/)
- [Africa's Talking](https://africastalking.com/)
- [IntaSend](https://intasend.com/)
