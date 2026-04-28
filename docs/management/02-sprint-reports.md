# Sprint Reports

## Sprint 1 — Requirements & Design (Week 1-2)

**Status:** Complete  
**Duration:** 2 weeks  
**Goal:** All requirements documentation and system design

### Completed
- [x] Problem Statement document
- [x] Stakeholder Analysis
- [x] Feasibility Study (Technical, Economic, Operational)
- [x] SRS Document (Functional + Non-functional requirements)
- [x] MoSCoW Requirement Prioritization
- [x] System Architecture Document
- [x] Database Schema Design
- [x] Design Patterns document
- [x] Use Case Diagrams (all 4 roles)
- [x] Class Diagram
- [x] Sequence Diagrams (Registration, Order Placement, Status Update)
- [x] ER Diagram

### Key Decisions Made
1. **MongoDB** chosen over PostgreSQL for flexible menu schema
2. **JWT** over sessions for stateless, scalable auth
3. **15% commission** hardcoded as a business rule minimum
4. **MoSCoW** used to scope MVP within 9-week timeline

### Blockers
- None

---

## Sprint 2 — Backend Core (Week 3-4)

**Status:** Complete  
**Duration:** 2 weeks  
**Goal:** Working authentication and restaurant APIs

### Completed
- [x] Node.js + Express project setup
- [x] MongoDB connection (Mongoose)
- [x] User model with bcrypt + JWT
- [x] Auth routes (register, login, profile, logout)
- [x] JWT middleware (protect + authorize)
- [x] Restaurant model with embedded menu items
- [x] Restaurant CRUD routes
- [x] Menu management routes (add, update, delete items)
- [x] Geospatial index on restaurant coordinates

### API Endpoints Delivered
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/updateprofile`
- `GET/POST /api/restaurants`
- `GET/PUT/DELETE /api/restaurants/:id`
- `POST /api/restaurants/:id/menu`
- `PUT/DELETE /api/restaurants/:id/menu/:itemId`

### Velocity
- Estimated: 8 story points
- Completed: 8 story points ✅

---

## Sprint 3 — Backend Complete (Week 5)

**Status:** Complete  
**Duration:** 1 week  
**Goal:** Orders, Reviews, Admin — backend feature-complete

### Completed
- [x] Order model with 8-stage status + history
- [x] Order CRUD routes (create, read, status update, cancel)
- [x] Transparent pricing calculation (15% commission)
- [x] Review model with multi-aspect ratings
- [x] Review routes (create, read, respond)
- [x] Rating aggregation on restaurant after review
- [x] Revenue update on order delivery

### Velocity
- Estimated: 7 story points
- Completed: 7 story points ✅

---

## Sprint 4 — Frontend Core (Week 6-7)

**Status:** Complete  
**Duration:** 2 weeks  
**Goal:** Customer-facing frontend complete

### Completed
- [x] React 18 + MUI + Zustand setup
- [x] Material UI theme (FairBite orange brand)
- [x] Auth Context (JWT persistence)
- [x] Axios API service with interceptors
- [x] Navbar with Demo Mode toggle
- [x] Login + Register pages
- [x] Home page with feature showcase + commission comparison
- [x] Restaurant listing with search + dietary filters
- [x] Restaurant detail with categorized menu + cart
- [x] Cart page with transparent pricing breakdown
- [x] Order tracking page with **Demo Mode animation**
- [x] Order history page

### Demo Mode Feature (Key Innovation)
- Toggle in Navbar activates class presentation mode
- Auto-progresses order through all 8 stages
- Animated rider marker moves toward delivery address
- Rider info card (Ali Hassan) appears during "on-the-way"
- Toast notifications at each stage transition

### Velocity
- Estimated: 13 story points
- Completed: 13 story points ✅

---

## Sprint 5 — Dashboards (Week 8)

**Status:** Complete  
**Duration:** 1 week  
**Goal:** All 4 user role dashboards

### Completed
- [x] Restaurant Dashboard (stats, active orders, savings calculator)
- [x] Rider Dashboard (online toggle, earnings, fair wage display, available orders)
- [x] Admin Dashboard (platform stats, user management, restaurant verification)

### Velocity
- Estimated: 6 story points
- Completed: 6 story points ✅

---

## Sprint 6 — Testing & Documentation (Week 9)

**Status:** In Progress  
**Duration:** 1 week

### To Complete
- [ ] Jest unit tests for auth and order controllers
- [ ] Integration tests with Supertest
- [ ] Full manual system testing (60 test cases)
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Final presentation slides

---

## Overall Velocity Chart

| Sprint | Planned | Completed | Status |
|--------|---------|-----------|--------|
| Sprint 1 | 10 SP | 10 SP | ✅ |
| Sprint 2 | 8 SP | 8 SP | ✅ |
| Sprint 3 | 7 SP | 7 SP | ✅ |
| Sprint 4 | 13 SP | 13 SP | ✅ |
| Sprint 5 | 6 SP | 6 SP | ✅ |
| Sprint 6 | 8 SP | 0 SP | 🔄 |
| **Total** | **52 SP** | **44 SP** | **85%** |

---
*FairBite Software Engineering Documentation — Version 1.0*
