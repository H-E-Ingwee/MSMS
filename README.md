# MiraaLink Smart Market System (MSMS)

A modern marketplace and farm-management platform built for Miraa farmers, buyers, and administrators. MSMS combines real-time listings, predictive demand insights, secure authentication, M-Pesa payment workflows, notifications, training, and a centralized admin console.

---

## 🚀 What MSMS Does

- Buyer marketplace for direct orders from Miraa farmers
- Seller dashboard with order approval, listing management, and wallet tracking
- Admin control panel for user management, reports, and system insights
- OTP login via mobile phone and secure role-based access
- M-Pesa payment integration with transaction tracking
- Notifications, order status updates, and training content
- Predictive and historical data support for smarter agricultural decisions

---

## 🧭 Key Features

### For Buyers
- Browse verified farmer listings by grade, location, price, and quantity
- Place order requests directly and receive updates
- Pay with M-Pesa once orders are approved
- Track order lifecycle from approval to delivery
- Receive push-style notifications for order and payment events

### For Farmers
- Publish and manage Miraa listings
- Receive incoming purchase requests
- Approve or reject orders directly from the seller dashboard
- Monitor wallet balance, transaction history, and notifications
- Access training content for sustainable cultivation and sales

### For Admins
- View aggregated system metrics and dashboards
- Manage users, roles, verification status, and reports
- Review listings, training modules, and marketplace activity
- Export CSV reports for users, transactions, listings, and audit logs

---

## 🏗️ Architecture

MSMS is built in two main layers:

- **Frontend:** React + Vite + Recharts + Lucide Icons
- **Backend:** Node.js + Express + Prisma + SQLite

Supporting services:
- OTP via Africa's Talking SMS gateway
- M-Pesa payment orchestration through IntaSend/STK
- JWT authentication and role-based access control
- Rate limiting and security headers with Helmet

---

## 📁 Repository Structure

```
MSMS/
├── backend/                 # Express API server, Prisma ORM, payment and auth routes
├── docs/                    # Project documentation and feature specs
├── src/                     # React frontend application
│   ├── components/          # UI atoms, molecules, reusable controls
│   ├── context/             # Auth and application state
│   ├── pages/               # User and admin page views
│   ├── services/            # API client abstractions
│   └── data/                # Mock data and helpers
├── package.json             # Frontend dependencies and scripts
├── backend/package.json     # Backend dependencies and scripts
└── README.md                # Project overview and getting started
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js >= 18
- npm
- Git

### Frontend
```bash
cd MSMS
npm install
npm run dev
```

Frontend runs on `http://localhost:5177/` by default.

### Backend
```bash
cd MSMS/backend
npm install
cp .env.example .env
# Edit .env to add your secrets
npm run dev
```

Backend runs on `http://localhost:3001/` by default.

---

## 🛠️ Frontend Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite development server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |

---

## 🧩 Backend Scripts

| Command | Description |
| --- | --- |
| `npm start` | Run backend server |
| `npm run dev` | Run backend with nodemon |
| `npm run build` | Generate Prisma client |
| `npm run test` | Run backend API smoke test |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database |

---

## 🔐 Environment Variables

Copy `backend/.env.example` to `backend/.env` and update your secrets.

Important variables:
- `DATABASE_URL` — SQLite file path or database URL
- `JWT_SECRET` — Strong secret key for auth tokens
- `PORT` — Backend port
- `FRONTEND_URL` — Frontend origin URL for CORS
- `AFRICASTALKING_USERNAME`, `AFRICASTALKING_API_KEY`, `AFRICASTALKING_SENDER_ID`
- `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_ENVIRONMENT`

---

## 📚 Documentation

- **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)** - **Complete academic project documentation** (comprehensive system overview, architecture, implementation details)
- [API Reference](backend/API_REFERENCE.md) - Complete backend API documentation
- [Frontend Spec](docs/MSMS-frontend-spec.md) - Architecture and design system
- [Prediction Model Docs](docs/PREDICTION_MODEL_DOCS.md) - AI/ML integration details
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Setup and contribution guidelines
- [User Guide](docs/USER_GUIDE.md) - End-user instructions

---

## 💡 Notes

- Order approval is handled by farmers for their own listings only (farmers cannot approve orders for other farmers' listings).
- Payments require order approval before M-Pesa checkout begins.
- Notifications are used for order creation, approval, payment status, and training updates.
- Predictive dashboard displays realistic pricing (KES 560/kg) with farmer-friendly explanations and actionable recommendations.

---

## ❤️ Contributing

Contributions are welcome. Open an issue or use a branch for feature updates. Follow the developer guide for repo conventions and setup instructions.
