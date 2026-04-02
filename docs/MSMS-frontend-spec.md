# MSMS Frontend Specification

## 1. Project overview
MiraaLink Smart Market System (MSMS) is an agricultural fintech PWA for Kenyan Miraa farmers.

Key features:
- Predictive analytics dashboard (daily price + demand forecast)
- Digital marketplace (listings, buyer-seller interaction)
- Integrated M-Pesa wallet flow
- Training modules for sustainable farm practices
- Offline-first mobile PWA design for low bandwidth areas

## 2. Architecture
### 2.1 Layers
1. UI (React + component library)
2. State store (Redux Toolkit / Zustand)
3. Network (REST API + Fallback cache)
4. PWA service worker + local persistence

### 2.2 Pages
- `/` -> Predictive Dashboard
- `/market` -> Marketplace listing + filters
- `/market/new` -> Create listing
- `/wallet` -> M-Pesa wallet
- `/training` -> Educational modules
- `/auth/login`, `/auth/register`
- `/profile` (role-specific)

### 2.3 API contracts
1. `GET /api/predictive` -> stats
2. `GET /api/listings` -> marketplace
3. `POST /api/listings` -> create listing
4. `POST /api/orders` -> order request
5. `POST /api/payments/mpesa` -> STK push
6. `GET /api/training` -> curriculum
7. `POST /api/auth/login` / `api/auth/register`

## 3. Component system
### 3.1 Atomic components
- `Button`, `Input`, `Card`, `Badge`, `Modal`, `Toast`

### 3.2 Molecules
- `PriceKpi`, `ListingCard`, `PredictionLineChart`, `DemandBarChart`, `StatusChip`

### 3.3 Organisms
- `KpiGrid`, `ForecastChartsPanel`, `ListingFilters`, `TrainingCardsPanel`, `WalletSummary`

### 3.4 Page containers
- `DashboardView`, `MarketplaceView`, `TrainingView`, `WalletView`, `AuthLayout`, `AppShell`

## 4. User experience (UX)
### 4.1 Farmer flow
1. Register/Login (OTP phone + role selection)
2. Dashboard ingestion (top KPIs + recommendation)
3. Market browsing with grade filter and quick buy
4. Listing creation with guided form
5. Receive orders and complete payment via M-Pesa

### 4.2 Buyer flow
1. Login
2. Search & filter highest-quality Miraa
3. Secure payment, escrow, and delivery scheduling

### 4.3 Accessibility + mobile-first
- 44x44 touch targets
- 12+ font size for legibility
- high-contrast modes
- keyboard navigation and screen reader labels

## 5. Offline and reliability
- Service worker caches shell, assets, API responses
- Read-only view when offline (last snapshot)
- Queued transactions when offline for later retry

## 6. Metrics
- `LCP` < 2.5s
- `TTI` < 5s
- `Synthetic purchase path` success > 95%
- `RUM adoption` and task completion rate

## 7. Build / test plan
1. Set up repo scaffold
2. Implement prototypes from `src/App.jsx`
3. Build reusable components
4. Connect to backend APIs (mock with JSON server first)
5. Add unit tests (Jest + RTL) + e2e (Playwright)
6. Add PWA manifest, service worker, install prompt
7. Conduct UAT with farmer sample and refine
