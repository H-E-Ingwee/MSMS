# MSMS Frontend - Full Implementation Guide

## Project Status
✅ **Build**: Passes (`npm run build`)  
✅ **Dependencies**: Installed (React 18, React Router 6, Recharts, Lucide icons)  
✅ **Architecture**: Full modular component structure with 4 main pages

---

## 📁 Folder Structure

```
src/
├── components/
│   ├── atoms/                 # Reusable base components
│   │   ├── PrimaryButton.jsx
│   │   ├── Card.jsx
│   │   └── SectionHeading.jsx
│   └── molecules/             # Compound components
│       ├── KpiCard.jsx
│       ├── PredictionLineChart.jsx
│       ├── DemandBarChart.jsx
│       └── (add ListingCard, TrainingCard, etc.)
├── pages/                     # Full-page views
│   ├── DashboardPage.jsx
│   ├── MarketplacePage.jsx
│   ├── TrainingPage.jsx
│   └── WalletPage.jsx
├── services/
│   └── api.js                 # Mock API layer (replace with Axios calls)
├── data/
│   └── mockData.js            # Sample data (replace with real backend)
├── App.jsx                    # Entry BrowserRouter wrapper
├── AppRouter.jsx              # Main routing + layout shell
├── main.jsx                   # DOM mount
└── index.css                  # Global styles + Tailwind imports
```

---

## 🚀 Quick Start

```bash
cd c:\Users\mutcu\OneDrive\Documents\GitHub\MSMS
npm install          # Already done
npm run dev          # Run development server (port 5173)
npm run build        # Production build (output: dist/)
```

---

## 📋 Features Implemented

### Pages
| Page | Route | Components | Features |
|------|-------|-----------|----------|
| Dashboard | `/dashboard` | KpiCard, PredictionLineChart, DemandBarChart | 7-day price forecast, AI recommendation, demand volume |
| Marketplace | `/marketplace` | Grade filters, ListingCard grid | Browse listings, filter by grade, contact buyer |
| Training | `/training` | TrainingCard grid, Tip banner | Watch videos, read articles, daily tips |
| M-Pesa Wallet | `/wallet` | Wallet card, transaction history | View balance, transactions, deposit/withdraw buttons |

### UI Library (Atoms)
- `PrimaryButton` - Green CTA button component
- `Card` - Rounded white card with border
- `SectionHeading` - Title + subtitle header

### Charts (Molecules)
- `PredictionLineChart` - Actual vs. Predicted prices
- `DemandBarChart` - Market demand volume by day
- `KpiCard` - Single metric card with delta/icon

---

## 🔌 API Integration Points

**Current**: Mock delays (250-300ms simulated)  
**Next Step**: Replace with real backend calls

### Endpoints to implement:
```javascript
// In src/services/api.js, replace with axios/fetch calls to:
GET  /api/predictive              → getPredictiveData()
GET  /api/listings                → getMarketListings()
GET  /api/training                → getTrainingModules()
GET  /api/wallet                  → getWalletData()
POST /api/listings                → postNewListing()
POST /api/orders                  → createOrder()
POST /api/payments/mpesa          → initiateMpesa()
```

---

## 🛠️ How to Extend

### Add a new page:
1. Create `src/pages/NewPage.jsx` with component
2. Import in `src/AppRouter.jsx`
3. Add route:
   ```jsx
   <Route path="/newpath" element={<NewPage />} />
   ```
4. Add nav item object to `navItems` array in AppRouter

### Add a new component:
1. If atomic (reusable): `src/components/atoms/Component.jsx`
2. If composite: `src/components/molecules/Component.jsx`
3. Export from page using `import Component from '../components/molecules/Component'`

### Replace mock data:
1. Edit `src/services/api.js`
2. Replace `setTimeout` promises with real fetch/axios calls
3. Point to backend host + endpoints

---

## 📱 Responsive Breakpoints

- **Mobile**: `< 768px` (bottom nav)
- **Tablet**: `768px - 1024px` (sidebar hidden, bottom nav)
- **Desktop**: `≥ 1024px` (sidebar visible)

---

## 🎨 Design System (Tailwind CSS)

**Colors**:
- Primary: `green-600` / `green-700`
- Secondary: `blue-700`
- Accent: `purple` (demand charts)
- Text: `gray-800` (headings), `gray-500` (muted)

**Spacing**: `p-4`, `gap-2`, `rounded-2xl` (consistent 16px base)

**Shadows**: `shadow-sm` (cards), `shadow-md` (hover)

---

## ✅ Next Milestones

1. **Create missing components**:
   - [ ] ListingCard (marketplace items)
   - [ ] TrainingCard (video/article preview)
   - [ ] TransactionRow (wallet history)
   - [ ] FormInputs (for new listings)
   - [ ] Modal (for confirmations)

2. **Add pages**:
   - [ ] AuthPage (login/register with OTP)
   - [ ] ProfilePage (farmer/buyer details)
   - [ ] ListingDetailPage (single product view)
   - [ ] OrderPage (checkout + payment)
   - [ ] AdminPage (user management, model analytics)

3. **State management**:
   - [ ] Auth context (JWT token + user role)
   - [ ] Redux Toolkit or Zustand (global state)
   - [ ] RTK Query (API caching + sync)

4. **PWA**:
   - [ ] Service worker (offline caching)
   - [ ] `manifest.json` (install prompt)
   - [ ] Offline fallback page

5. **Testing**:
   - [ ] Jest + React Testing Library (unit tests)
   - [ ] Playwright (e2e tests)
   - [ ] Accessibility audit (axe)

---

## 📖 File Guide

- **src/App.jsx**: BrowserRouter wrapper
- **src/AppRouter.jsx**: Routing logic + layout shell (sidebar + mobile nav)
- **src/main.jsx**: React DOM mount
- **src/pages/*.jsx**: Full-page views (one component per file)
- **src/components/atoms/*.jsx**: Base components (reusable, no page logic)
- **src/components/molecules/*.jsx**: Composite components (combine atoms)
- **src/services/api.js**: API abstraction layer (mock → axios)
- **src/data/mockData.js**: Sample data for development

---

## 🧪 Testing the Build

```bash
npm run dev     # Start dev server → http://localhost:5173
npm run build   # Production build (checks for errors)
npm run preview # Preview production build locally
```

---

## 📚 Stacks Used

- **UI**: React 18.3.1
- **Routing**: React Router 6.16.0
- **Charts**: Recharts 2.9.0
- **Icons**: Lucide React 0.341.0
- **Build**: Vite 5.3.1
- **Styling**: Tailwind CSS (via Vite + PostCSS)

---

## 🚨 Known Issues / TODOs

1. **Bundle size warning**: 569.66 kB (minified) → Consider code-splitting if exceeds 1MB
2. **API mock delays**: Replace with real backend calls in Phase 2
3. **No auth guards**: Protect pages with role-based access (Phase 2)
4. **No error boundaries**: Add try-catch + fallback UI
5. **No offline support**: Add service worker + local storage (Phase 2)

---

## 💬 Questions?

Refer to `docs/MSMS-frontend-spec.md` for architecture details or ask before implementing major changes.
