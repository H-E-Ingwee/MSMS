# MiraaLink Smart Market System (MSMS) Frontend Roadmap

This repository holds the frontend documentation and prototype for the MiraaLink Smart Market System (MSMS).

## Goal
Build a Progressive Web App (PWA) that empowers Miraa farmers with a predictive pricing dashboard, direct marketplace, M-Pesa wallet interactions, and sustainable farming training.

## Structure
- `docs/` - architecture, component design, UX flow, and implementation checklist.
- `src/App.jsx` - interactive React prototype using the provided sample UI and Recharts.

## How to use
1. Install dependencies:
   - `npm install react react-dom recharts lucide-react`
2. Run app with CRA or Vite.
3. Read docs in `docs/MSMS-frontend-spec.md` for component architecture, UX patterns, and API contracts.

## Status
- [x] Initial full document completed
- [x] React prototype `src/App.jsx` created
- [x] Architecture + UX plan created


## Next steps
1. Convert prototype into modular components under `src/components/`
2. Add React Router, auth context, and state management (Redux Toolkit or Zustand)
3. Add PWA manifest, service worker, and offline-first cache strategy
4. Integrate backend APIs (auth, market listings, predictions, payments)
5. Run milestone-based user tests and iterate.
