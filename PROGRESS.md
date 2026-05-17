# QuickBite — Progress Tracker
> Resume from here when continuing in a new session. Last updated: **17 May 2026**

---

## ⚠️ DO NOT TOUCH — THESE FILES ARE STABLE, LEAVE THEM ALONE

| File | Why it must not change |
|------|------------------------|
| `frontend/src/pages/auth/LandingPage.jsx` | Login + Google OAuth is working. The `GoogleSignInBlock` component and `handleGoogleSuccess` structure are final. |
| `frontend/src/services/api.js` | Token key is `quickbite_token`, interceptor only redirects on 401. Do not change. |
| `backend/src/routes/authRoutes.js` | All auth routes (`/register`, `/login`, `/google`, `/google-token`, `/me`) are wired correctly. |
| `backend/src/controllers/authController.js` | `googleTokenAuth` (access-token flow) and `googleAuth` (ID-token flow) both work. Do not merge or change. |
| `frontend/src/index.js` | `GoogleOAuthProvider` uses `REACT_APP_GOOGLE_CLIENT_ID`. Do not remove. |
| `frontend/.env.production` | Backend URL is `quickbite-backend-two.vercel.app`. Google Client ID is set. Do not change URLs. |
| `backend/src/app.js` | CORS accepts `*.vercel.app` and `*.netlify.app`. Do not narrow it back to localhost only. |
| `frontend/src/context/AuthContext.jsx` | Uses local JWT decode first (prevents session loss on cold-start). Do not revert to network-only approach. |
| `frontend/src/App.js` | `RoleRoute` checks `loading` flag before redirect. Works correctly. Do not change. |

---

## 🐛 BUGS FIXED — 17 May 2026

### 1. Both email + Google login broken in production
- **Root cause:** Backend CORS only allowed `http://localhost:3000`. Production frontend on Vercel was blocked.
- **Fix:** `backend/src/app.js` — added `*.vercel.app` + `*.netlify.app` + `ALLOWED_ORIGINS` env var support.

### 2. Google login failing ("Google sign-in failed. Try email login.")
- **Root cause:** `REACT_APP_GOOGLE_CLIENT_ID` was missing from `frontend/.env.production`. `GoogleOAuthProvider` got an empty string as `clientId` in production.
- **Fix:** Added `REACT_APP_GOOGLE_CLIENT_ID=...` to `.env.production`.
- **Google Cloud Console:** Already configured — `quickbite-frontend-eosin.vercel.app` and `quickbite-frontend-hok-s-projects.vercel.app` are in Authorized JavaScript Origins. Do not remove them.

### 3. Session lost after 5–10 min inactivity (redirect to login)
- **Root cause:** `/auth/me` network error (Vercel cold-start) → `user = null` → `isAuthenticated = false` → `RoleRoute` redirected to login, even with a valid token.
- **Fix:** `AuthContext.jsx` now decodes the JWT locally first (instant, no network) to set `user` and `loading = false`. Then calls `/auth/me` in the background to hydrate full user data. Network errors no longer log the user out — only a real `401` response does.

### 4. Order placed → immediately redirected to login
- **Root cause:** `AuthContext` was removing the token on ANY error from `/auth/me`, including network errors during Vercel cold-start.
- **Fix:** Token only removed on `err.response?.status === 401`.

### 5. "Failed to place order" intermittent error in Cart
- **Root cause:** Vercel serverless function cold-start caused the first order request to timeout.
- **Fix:** `CartPage.jsx` retries the order request once (2s delay) on network errors.

### 6. Welcome banner cut off on right side (not centered)
- **Root cause:** Framer Motion's `y` animation writes `transform: translateY(...)` which overwrote our `translateX(-50%)` centering on the same `motion.div`.
- **Fix:** Separated into two elements — plain `div` for `position:fixed` centering (`left:12, right:12, margin:auto`), inner `motion.div` for the slide animation only.

### 7. Leaflet map showing blank/plain (no road tiles)
- **Root cause:** Tile URL had `{z}/{y}/{x}` — x and y were swapped. Correct format is `{z}/{x}/{y}`.
- **Fix:** Fixed URL in `LeafletMap.jsx`. Now shows real CartoCDN Voyager street map.

### 8. Map zoom too wide (pins too small)
- **Fix:** `FitToRoute` padding reduced from `0.4` → `0.15`, `maxZoom: 15` added.

### 9. Restaurant images slow / not loading (Daily Deli, Baskin Robbins)
- **Fix:** `SmartImg` in `ui/index.js` now calls `optimizeImg()` which rewrites Supabase URLs to use the render/transform API (`?width=600&quality=80`) and adds Unsplash quality params. Shows emoji fallback on error instead of broken image.

---

## ✅ WHAT WAS CHANGED — 17 May 2026

| File | What changed |
|------|-------------|
| `backend/src/app.js` | CORS: accepts `*.vercel.app`, `*.netlify.app`, and `ALLOWED_ORIGINS` env var |
| `frontend/.env.production` | Added `REACT_APP_GOOGLE_CLIENT_ID`; backend URL updated to `quickbite-backend-two.vercel.app` |
| `frontend/src/context/AuthContext.jsx` | Local JWT decode first → prevents cold-start session loss |
| `frontend/src/pages/auth/LandingPage.jsx` | `GoogleSignInBlock` improved error handling (`profileRes.ok` check, `catch(err)`) |
| `frontend/src/components/ui/index.js` | `SmartImg` uses `optimizeImg()`, emoji fallback; `WelcomeBanner` centering fixed (split motion/layout) |
| `frontend/src/pages/customer/OrderTrackingPage.jsx` | Orange header, ETA row, LeafletMap, vertical timeline, spacing fixes |
| `frontend/src/pages/customer/CartPage.jsx` | Retry logic on order placement; delivery address text input added |
| `frontend/src/components/LeafletMap.jsx` | Fixed tile URL `{y}/{x}` → `{x}/{y}`; tighter zoom (pad 0.15, maxZoom 15) |

---

## CURRENT DEPLOYMENT

| Service | URL |
|---------|-----|
| Frontend | `https://quickbite-frontend-eosin.vercel.app` |
| Backend  | `https://quickbite-backend-two.vercel.app` |
| GitHub   | `https://github.com/DevShehroz1/fairbite-food-delivery` |

---

---

## COMPLETED ✅

### Backend (100% Complete)
- [x] `src/config/db.js` — MongoDB connection
- [x] `src/app.js` — Express app, middleware, routes
- [x] `src/server.js` — Server entry point
- [x] `src/models/User.js` — User model, bcrypt, JWT
- [x] `src/models/Restaurant.js` — Restaurant + embedded menu
- [x] `src/models/Order.js` — 8-stage order tracking
- [x] `src/models/Review.js` — Review + restaurant response
- [x] `src/middleware/auth.js` — protect + authorize
- [x] `src/controllers/authController.js`
- [x] `src/controllers/restaurantController.js`
- [x] `src/controllers/orderController.js`
- [x] `src/controllers/reviewController.js`
- [x] `src/routes/authRoutes.js`
- [x] `src/routes/restaurantRoutes.js`
- [x] `src/routes/orderRoutes.js`
- [x] `src/routes/reviewRoutes.js`
- [x] `package.json` with correct scripts

### Frontend (90% Complete — needs npm install)
- [x] `package.json` — all dependencies listed
- [x] `public/index.html`
- [x] `src/index.js` — React root
- [x] `src/App.js` — Routes + ProtectedRoute
- [x] `src/utils/theme.js` — MUI orange theme
- [x] `src/context/AuthContext.jsx` — JWT persistence
- [x] `src/services/api.js` — Axios + interceptors
- [x] `src/services/demoService.js` — **DEMO MODE** (class presentation feature)
- [x] `src/hooks/useCart.js` — Zustand cart store
- [x] `src/components/layout/Navbar.jsx` — with Demo toggle
- [x] `src/pages/auth/LoginPage.jsx` — with quick demo buttons
- [x] `src/pages/auth/RegisterPage.jsx`
- [x] `src/pages/customer/HomePage.jsx` — hero + commission comparison
- [x] `src/pages/customer/RestaurantListPage.jsx` — search + dietary filters
- [x] `src/pages/customer/RestaurantDetailPage.jsx` — menu + cart
- [x] `src/pages/customer/CartPage.jsx` — transparent pricing
- [x] `src/pages/customer/OrderTrackingPage.jsx` — **DEMO MODE animated tracking**
- [x] `src/pages/customer/OrderHistoryPage.jsx`
- [x] `src/pages/restaurant/RestaurantDashboard.jsx` — savings calculator
- [x] `src/pages/rider/RiderDashboard.jsx` — fair wage display
- [x] `src/pages/admin/AdminDashboard.jsx` — platform overview

### Documentation (100% Complete)
- [x] `docs/requirements/01-problem-statement.md`
- [x] `docs/requirements/02-stakeholder-analysis.md`
- [x] `docs/requirements/03-feasibility-study.md`
- [x] `docs/requirements/04-srs-document.md`
- [x] `docs/requirements/05-requirement-prioritization.md`
- [x] `docs/design/01-architecture-document.md`
- [x] `docs/design/02-design-patterns.md`
- [x] `docs/design/04-database-schema.md`
- [x] `docs/diagrams/uml/use-case-diagram.md` (PlantUML)
- [x] `docs/diagrams/uml/sequence-diagrams.md` (PlantUML)
- [x] `docs/diagrams/uml/class-diagram.md` (PlantUML)
- [x] `docs/testing/01-test-plan.md`
- [x] `docs/testing/02-test-cases.md` (60 test cases)
- [x] `docs/management/01-project-timeline.md` (Gantt)
- [x] `docs/management/02-sprint-reports.md`
- [x] `docs/management/04-staff-allocation.md`

---

## REMAINING TODO 📋

### Frontend (to do next session)
- [x] `src/pages/auth/LandingPage.jsx` — new landing/login with Google picker + role selection
- [x] Fixed rider not receiving new orders (replaced socket-only with 5s polling via `/orders/available`)
- [x] `src/App.js` — `/` now shows LandingPage (no Navbar), redirects logged-in users to dashboard
- [ ] `src/pages/customer/CheckoutSuccessPage.jsx`
- [ ] `src/components/common/LoadingSpinner.jsx`
- [ ] `src/pages/customer/ReviewPage.jsx`
- [ ] `src/pages/restaurant/MenuManagePage.jsx` (form to add/edit menu items)
- [ ] Connect restaurant dashboard to real API
- [ ] Connect rider dashboard to real API

### Testing (Sprint 6 — next session)
- [ ] `backend/tests/auth.test.js` — Jest + Supertest
- [ ] `backend/tests/restaurant.test.js`
- [ ] `backend/tests/order.test.js`
- [ ] `docs/testing/03-test-report.md`

### Documentation (remaining)
- [ ] `docs/design/03-ui-design-reference.md` — reference Grub APK screens
- [ ] `docs/diagrams/uml/activity-diagram.md`
- [ ] `docs/diagrams/er-diagrams/quickbite-er.md`
- [ ] `docs/management/03-activity-chart.md`

### Deployment (Sprint 6)
- [ ] Deploy backend to Render.com
- [ ] Deploy frontend to Vercel
- [ ] Set up MongoDB Atlas
- [ ] Update `.env` with production values

### GitHub
- [ ] Push to GitHub (need username — ask user)
- [ ] Add GitHub Actions CI (optional)

---

## HOW TO RUN (Resume Instructions)

```bash
# 1. Start MongoDB
mongod

# 2. Backend (terminal 1)
cd fairbite-food-delivery/backend
npm install  # only needed once
npm run dev
# Runs on http://localhost:5000

# 3. Frontend (terminal 2)
cd fairbite-food-delivery/frontend
npm install  # only needed once
npm start
# Runs on http://localhost:3000

# 4. Test health
curl http://localhost:5000/health
```

## CLASS DEMO INSTRUCTIONS

1. Open `http://localhost:3000`
2. Click the **DEMO** toggle in the navbar (turns orange banner on)
3. Go to Restaurants → Pick any restaurant → Add items to cart
4. Click "Place Demo Order"
5. Watch the order **automatically progress** through all 8 stages:
   - Pending → Confirmed → Preparing → Ready → Picked Up → On The Way → Delivered
6. During "On The Way" — rider card (Ali Hassan) appears with animated map
7. Each stage shows a toast notification

---

## APK REFERENCE
Grub APK at: `/Users/shehrozasif/Downloads/Grub.apk`
Screenshots should be placed in: `apk-reference/screenshots/`

---
*Last updated: April 2026 | Continue with: "continue" or specify what to work on next*
