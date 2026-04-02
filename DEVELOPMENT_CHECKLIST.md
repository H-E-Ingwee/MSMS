# MSMS Frontend - Development Checklist

## Phase 1: Core UI ✅ (Complete)

### Architecture & Setup
- [x] Project scaffold (Vite + React 18)
- [x] Tailwind CSS configured
- [x] React Router 6 routing
- [x] Folder structure (components, pages, services, data)
- [x] Build passes without errors

### Atomic Components
- [x] PrimaryButton
- [x] Card
- [x] SectionHeading
- [ ] Input (text input with label)
- [ ] Badge (status tag)
- [ ] Modal (popup)
- [ ] Toast (notifications)
- [ ] Checkbox / Radio
- [ ] Tabs

### Molecule Components
- [x] KpiCard (metric display)
- [x] PredictionLineChart (Recharts line)
- [x] DemandBarChart (Recharts bar)
- [ ] ListingCard (marketplace item)
- [ ] TrainingCard (video/article card)
- [ ] TransactionRow (wallet transaction)
- [ ] FilterChip (togglable filter button)
- [ ] StarRating (farmer verification)

### Pages (Views)
- [x] DashboardPage (KPIs + charts)
- [x] MarketplacePage (listing grid + filters)
- [x] TrainingPage (modules grid + tip)
- [x] WalletPage (balance + transactions)
- [ ] AuthPage (login + register)
- [ ] ProfilePage (farmer/buyer dashboard)
- [ ] DetailPage (single listing detail)
- [ ] OrderPage (checkout + M-Pesa)
- [ ] AdminPage (user mgmt + analytics)
- [ ] ErrorPage (404 + offine fallback)

### Navigation & Layout
- [x] Desktop sidebar with nav
- [x] Mobile bottom nav
- [x] Responsive layout (mobile/tablet/desktop)
- [x] Active nav highlighting
- [ ] Mobile header with menu icon
- [ ] Breadcrumb navigation

---

## Phase 2: Authentication & State (Next)

### Auth System
- [ ] Create AuthContext (login, logout, currentUser, role)
- [ ] Create AuthPage (phone OTP verification)
- [ ] JWT token storage (localStorage + secure cookie)
- [ ] Protected routes (PrivateRoute wrapper)
- [ ] Role-based access (Farmer vs Buyer vs Admin)
- [ ] Session refresh logic

### State Management
- [ ] Install Redux Toolkit
- [ ] Create Redux store (auth, listings, wallet, predictions)
- [ ] Alternative: Zustand for simpler state
- [ ] RTK Query for API caching + sync

### API Integration
- [ ] Install axios
- [ ] Create API client with interceptors
- [ ] Replace mock delays with real endpoints:
  - [ ] POST /auth/login (OTP verification)
  - [ ] GET /api/predictions
  - [ ] GET /api/listings
  - [ ] POST /api/listings (create listing)
  - [ ] GET /api/orders
  - [ ] POST /api/orders (create order)
  - [ ] GET /api/wallet
  - [ ] POST /api/payments/mpesa (STK push)
- [ ] Error handling + loading states
- [ ] Retry logic for failed requests

---

## Phase 3: Forms & Interactions

### Form Components
- [ ] CreateListingForm (guided wizard, file upload)
- [ ] PlaceOrderForm (quantity, delivery address)
- [ ] UpdateProfileForm (KYC fields)

### Form Features
- [ ] React Hook Form + Zod validation
- [ ] Real-time validation feedback
- [ ] Multi-step wizards
- [ ] Image/file uploads
- [ ] Geolocation picker

### User Interactions
- [ ] Modal confirmations (delete, confirm buy)
- [ ] Toast notifications (success, error, loading)
- [ ] Dropdown menus (user profile)
- [ ] Search + filter with debounce
- [ ] Pagination for listings

---

## Phase 4: PWA & Offline

### Service Worker
- [ ] Create service worker (src/sw.js)
- [ ] Register in main.jsx
- [ ] Cache static assets (JS, CSS, images)
- [ ] Runtime cache for API responses (stale-while-revalidate)
- [ ] Offline fallback page

### App Manifest
- [ ] Create public/manifest.json
- [ ] Add icon sets (192x192, 512x512)
- [ ] Configure display modes, colors, orientation
- [ ] Test install prompt on mobile

### Offline Features
- [ ] Queue transactions when offline
- [ ] Sync on reconnect
- [ ] Indicate offline status in UI
- [ ] Read-only mode when offline

---

## Phase 5: Testing & QA

### Unit Tests
- [ ] Jest + React Testing Library setup
- [ ] Component unit tests (atoms, molecules)
- [ ] API service tests (mocked axios)
- [ ] Auth context tests
- [ ] Redux reducer tests

### E2E Tests
- [ ] Playwright setup
- [ ] Critical user flows:
  - [ ] Farmer: Login → View Dashboard → List Produce → Check Wallet
  - [ ] Buyer: Login → Browse Market → Place Order → Pay

### Performance & Accessibility
- [ ] Lighthouse audit (>90 on all metrics)
- [ ] WCAG 2.1 AA compliance (axe audit)
- [ ] Mobile lighthouse test
- [ ] Load test (concurrent users)

### User Testing
- [ ] Beta UAT with 5 farmers
- [ ] Beta UAT with 5 buyers
- [ ] Collect feedback on UX/clarity
- [ ] Fix high-priority issues

---

## Phase 6: Deployment & Monitoring

### Build Optimization
- [ ] Code splitting (dynamic imports for routes)
- [ ] Image optimization
- [ ] Cache busting strategy
- [ ] Sourcemap management

### Deployment
- [ ] Setup CI/CD pipeline (GitHub Actions)
- [ ] Deploy to staging (preview)
- [ ] Deploy to production (AWS/Vercel)
- [ ] Domain + SSL setup

### Monitoring
- [ ] Error tracking (Sentry or similar)
- [ ] Analytics (Google Analytics or Mixpanel)
- [ ] Performance monitoring (Core Web Vitals)
- [ ] Uptime monitoring
- [ ] User feedback collection

---

## Phase 7: Feedback & Iteration

### Post-Launch
- [ ] Monitor error logs
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Plan feature backlog

### Feature Backlog (Future)
- [ ] Voice input for listings
- [ ] Real-time chat (buyer-seller)
- [ ] Delivery tracking
- [ ] Weather API integration
- [ ] IoT sensor data
- [ ] Blockchain traceability
- [ ] Multi-language support (Swahili)

---

## 📊 Progress Tracker

| Phase | Status | Owner | Start | End |
|-------|--------|-------|-------|-----|
| Phase 1 | ✅ 100% | Dev | Week 1 | Week 2 |
| Phase 2 | ⏳ 0% | Dev | Week 3 | Week 4 |
| Phase 3 | ⏳ 0% | Dev | Week 5 | Week 6 |
| Phase 4 | ⏳ 0% | Dev | Week 7 | Week 8 |
| Phase 5 | ⏳ 0% | QA | Week 9 | Week 10 |
| Phase 6 | ⏳ 0% | DevOps | Week 11 | Week 12 |
| Phase 7 | ⏳ 0% | PM | Week 13+ | Ongoing |

---

## 🎯 Definition of Done

- [ ] Code passes linter & build
- [ ] Unit tests written (>80% coverage)
- [ ] E2E tests pass
- [ ] Accessibility audit passes (axe)
- [ ] Performance: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Documented in code comments
- [ ] PR reviewed by 2 team members
- [ ] No console errors/warnings
- [ ] Works on mobile (iOS Safari, Android Chrome)

---

## 📝 Notes

- Prioritize Phase 2 (Auth) to unblock backend integration
- Phase 4 (PWA) is critical for farmers in low-connectivity areas
- Phase 5 (Testing) ensures quality before UAT
- Regularly sync with backend team on API contracts
