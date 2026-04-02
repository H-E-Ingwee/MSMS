# MSMS Frontend - Directory Tree & File Reference

```
c:\Users\mutcu\OneDrive\Documents\GitHub\MSMS/
│
├── 📄 README.md                          ← Start here (2 min read)
├── 📄 DELIVERY_SUMMARY.md                ← What you got (5 min read)
├── 📄 IMPLEMENTATION_GUIDE.md            ← How to extend (15 min read)
├── 📄 DEVELOPMENT_CHECKLIST.md           ← 7-phase roadmap (plan)
├── 📄 COMPONENT_PATTERNS.md              ← Code examples (copy-paste)
│
├── 📁 docs/
│   └── 📄 MSMS-frontend-spec.md         ← Architecture + design system (reference)
│
├── 📁 src/                               ← All React code here
│   ├── 📄 App.jsx                       ⭐ Entry point (BrowserRouter wrapper)
│   ├── 📄 AppRouter.jsx                 ⭐ Routing + layout (sidebar + nav)
│   ├── 📄 main.jsx                      ⭐ DOM mount (edit: theme, providers)
│   ├── 📄 index.css                     ⭐ Global styles (Tailwind, fonts)
│   │
│   ├── 📁 components/
│   │   ├── 📁 atoms/                    (Reusable base components)
│   │   │   ├── 📄 PrimaryButton.jsx     (Green CTA button)
│   │   │   ├── 📄 Card.jsx              (White card container)
│   │   │   ├── 📄 SectionHeading.jsx    (Title + subtitle)
│   │   │   ├── [TODO] Input.jsx         (Text input with label)
│   │   │   ├── [TODO] Modal.jsx         (Popup dialog)
│   │   │   ├── [TODO] Badge.jsx         (Status tag)
│   │   │   └── [TODO] Toast.jsx         (Notification)
│   │   │
│   │   └── 📁 molecules/                (Compound components)
│   │       ├── 📄 KpiCard.jsx           (Metric card)
│   │       ├── 📄 PredictionLineChart.jsx (Recharts line)
│   │       ├── 📄 DemandBarChart.jsx    (Recharts bar)
│   │       ├── [TODO] ListingCard.jsx   (Marketplace item)
│   │       ├── [TODO] TrainingCard.jsx  (Course card)
│   │       ├── [TODO] TransactionRow.jsx (Wallet tx)
│   │       └── [TODO] FormInputs.jsx    (Form fields)
│   │
│   ├── 📁 pages/                        (Full page views)
│   │   ├── 📄 DashboardPage.jsx         ⭐ Predictive analytics
│   │   ├── 📄 MarketplacePage.jsx       ⭐ Listing browser
│   │   ├── 📄 TrainingPage.jsx          ⭐ Educational content
│   │   ├── 📄 WalletPage.jsx            ⭐ M-Pesa wallet
│   │   ├── [TODO] AuthPage.jsx          (Login + register)
│   │   ├── [TODO] ProfilePage.jsx       (Farmer/buyer profile)
│   │   ├── [TODO] DetailPage.jsx        (Single listing)
│   │   ├── [TODO] OrderPage.jsx         (Checkout + payment)
│   │   └── [TODO] AdminPage.jsx         (User mgmt, analytics)
│   │
│   ├── 📁 services/
│   │   ├── 📄 api.js                    ⭐ API abstraction layer (replace mocks)
│   │   ├── [TODO] auth.js               (Auth logic)
│   │   └── [TODO] payment.js            (M-Pesa integration)
│   │
│   └── 📁 data/
│       └── 📄 mockData.js               ← Sample data (replace with real API)
│
├── 📁 dist/                              ← Production build output
│   ├── index.html
│   ├── assets/index-*.js
│   └── assets/index-*.css
│
├── 📁 node_modules/                      ← Dependencies (do not edit)
│
├── 📄 package.json                       ⭐ Dependencies config
├── 📄 package-lock.json
├── 📄 vite.config.js                    ⭐ Build config
├── 📄 index.html                        ⭐ HTML template
│
└── 📁 .git/                              ← Git repository
```

---

## 🎯 File Navigation Guide

### Start Here (In Order)
1. **[README.md](./README.md)** - Quick start (install + run)
2. **[DELIVERY_SUMMARY.md](./DELIVERY_SUMMARY.md)** - What's built + status
3. **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Architecture + next steps
4. **[COMPONENT_PATTERNS.md](./COMPONENT_PATTERNS.md)** - Code examples to copy

### For Architects / Leads
- [docs/MSMS-frontend-spec.md](./docs/MSMS-frontend-spec.md) - Design system, UX, API contracts
- [DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md) - 7-phase roadmap

### For Frontend Developers
- [src/App.jsx](./src/App.jsx) - Add providers, theme, auth context
- [src/AppRouter.jsx](./src/AppRouter.jsx) - Add new routes here
- [src/pages/](./src/pages/) - Your main work (create new pages)
- [src/components/atoms/](./src/components/atoms/) - Reusable UI primitives
- [src/components/molecules/](./src/components/molecules/) - Compound components
- [src/services/api.js](./src/services/api.js) - Connect to backend API
- [src/index.css](./src/index.css) - Global styles

### For Backend Developers
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md#-api-integration-points) - API endpoints expected
- [src/services/api.js](./src/services/api.js) - API stubs to implement
- Follow the mock structure for request/response format

### Configuration Files
- [package.json](./package.json) - npm dependencies + scripts
- [vite.config.js](./vite.config.js) - Vite build config (Tailwind, React plugin)
- [index.html](./index.html) - HTML entry point (head meta, root div)

---

## 🚀 Quick Commands

```bash
# In terminal, run from project root:
cd c:\Users\mutcu\OneDrive\Documents\GitHub\MSMS

# Install (already done)
npm install

# Development
npm run dev          # http://localhost:5173 (auto-reload)

# Production
npm run build        # Creates dist/ folder
npm run preview      # Test production build

# Optional (once installed)
npm audit fix        # Fix vulnerabilities
npm update           # Update packages
```

---

## 🧩 Component Inventory

### ✅ Existing Components (Use These)
| Component | Type | File | Purpose |
|-----------|------|------|---------|
| PrimaryButton | Atom | `atoms/PrimaryButton.jsx` | Green CTA button |
| Card | Atom | `atoms/Card.jsx` | White card container |
| SectionHeading | Atom | `atoms/SectionHeading.jsx` | Title + subtitle |
| KpiCard | Molecule | `molecules/KpiCard.jsx` | Metric display |
| PredictionLineChart | Molecule | `molecules/PredictionLineChart.jsx` | Price forecast chart |
| DemandBarChart | Molecule | `molecules/DemandBarChart.jsx` | Demand volume chart |

### 🔄 Planned Components (Phase 2-3)
| Component | Type | Usage |
|-----------|------|-------|
| Input | Atom | Forms |
| Modal | Atom | Dialogs |
| Badge | Atom | Tags |
| Toast | Atom | Notifications |
| ListingCard | Molecule | Marketplace grid |
| TrainingCard | Molecule | Course list |
| Form | Organism | Create listing, checkout |

---

## 📊 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| UI Framework | React | 18.3.1 | Component rendering |
| Routing | React Router | 6.16.0 | Page navigation |
| State | TBD (Zustand/Redux) | - | Global state |
| Charts | Recharts | 2.9.0 | Data visualization |
| Icons | Lucide React | 0.341.0 | Icon library |
| Styling | Tailwind CSS | Latest | CSS utility framework |
| Build | Vite | 5.3.1 | Dev + prod build |
| HTTP | TBD (Axios/Fetch) | - | API calls (Phase 2) |
| Forms | TBD (React Hook Form) | - | Form handling (Phase 3) |
| Testing | TBD (Jest/RTL) | - | Unit tests (Phase 5) |

---

## 🎯 Which File to Edit for Common Tasks

| Task | File(s) to Edit |
|------|-----------------|
| Add new page | `src/pages/NewPage.jsx` + `src/AppRouter.jsx` |
| Add route/nav item | `src/AppRouter.jsx` (line ~13, ~45) |
| Add reusable component | `src/components/atoms/` or `src/components/molecules/` |
| Change colors | `src/index.css` or inline Tailwind classes |
| Connect real API | `src/services/api.js` |
| Add global state | Create `src/context/` or `src/store/` |
| Modify layout | `src/AppRouter.jsx` (Sidebar, MobileNav) |
| Add auth | Create `src/context/AuthContext.jsx` + `src/pages/AuthPage.jsx` |
| Setup PWA | Create `src/sw.js` + `public/manifest.json` (Phase 4) |

---

## 🔗 Import Path Cheat Sheet

```javascript
// Atoms
import PrimaryButton from '../components/atoms/PrimaryButton';
import Card from '../components/atoms/Card';
import SectionHeading from '../components/atoms/SectionHeading';

// Molecules
import KpiCard from '../components/molecules/KpiCard';
import PredictionLineChart from '../components/molecules/PredictionLineChart';
import DemandBarChart from '../components/molecules/DemandBarChart';

// Pages
import DashboardPage from '../pages/DashboardPage';
import MarketplacePage from '../pages/MarketplacePage';

// Services
import { getPredictiveData, getMarketListings } from '../services/api';

// Data
import { predictiveData, marketListings } from '../data/mockData';

// Icons (lucide-react)
import { Leaf, TrendingUp, ShoppingCart, BookOpen, Wallet } from 'lucide-react';

// Router
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
```

---

## ✨ Pro Tips

1. **Use NavLink for active state**: `<NavLink to="/path" className={({isActive}) => isActive ? 'active' : ''}>`
2. **Lazy load pages**: `const ProfilePage = lazy(() => import('./pages/ProfilePage'))`
3. **Debounce search**: Use `useMemo` with `debounce` utility
4. **Type safety**: Add JSDoc comments or migrate to TypeScript later
5. **Component reuse**: Lift state up or use Context API
6. **Error handling**: Add try-catch + error boundary
7. **Performance**: Use `React.memo` for expensive renders

---

## 📞 Common Questions

**Q: Where do I add authentication?**  
A: Create `src/context/AuthContext.jsx` + `src/pages/AuthPage.jsx`. See `COMPONENT_PATTERNS.md` for example.

**Q: How do I connect to the backend?**  
A: Edit `src/services/api.js` and replace mock promises with axios/fetch calls.

**Q: Where do I add a new page?**  
A: Create `src/pages/NewPage.jsx` and add route in `src/AppRouter.jsx`.

**Q: How do I add global state?**  
A: Use Context API for auth/user. Use Zustand or Redux Toolkit for other state.

**Q: Can I add TypeScript?**  
A: Yes, but rename `.jsx` → `.jsx` (no change needed yet). Add types later.

**Q: How do I test components?**  
A: Use Jest + React Testing Library (setup in Phase 5). See `COMPONENT_PATTERNS.md` for example.

---

**Ready to build? Start with `npm run dev` and read `README.md`!**
