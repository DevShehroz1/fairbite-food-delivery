# Project Timeline (Gantt Chart)
## FairBite Food Delivery — 9 Week Schedule

---

## Summary Schedule

| Week | Phase | Key Deliverables |
|------|-------|-----------------|
| Week 1 | Requirements & Planning | Problem Statement, Stakeholder Analysis, SRS, MoSCoW |
| Week 2 | Design | Architecture, DB Schema, ER Diagrams, UML (Use Case, Class) |
| Week 3 | Backend — Foundation | User model, Auth API, JWT middleware |
| Week 4 | Backend — Core | Restaurant & Menu APIs, Order APIs |
| Week 5 | Backend — Complete + FE Start | Review API, Admin API; React setup |
| Week 6 | Frontend — Core | Auth pages, Restaurant list, Restaurant detail |
| Week 7 | Frontend — Orders | Cart, Checkout, Order tracking |
| Week 8 | Frontend — Dashboard | Restaurant dashboard, Rider view, Admin panel |
| Week 9 | Testing & Deployment | All tests, bug fixes, docs, presentation |

---

## Detailed Gantt

```
Task                          W1  W2  W3  W4  W5  W6  W7  W8  W9
─────────────────────────────────────────────────────────────────
REQUIREMENTS PHASE
  Problem Statement           ███
  Stakeholder Analysis        ███
  Feasibility Study           ███
  SRS Document                ███ ██
  MoSCoW Prioritization       ███

DESIGN PHASE
  Architecture Document           ███
  DB Schema Design                ███
  ER Diagrams                     ███
  Use Case Diagrams               ███
  Class Diagrams                  ███ ██
  Sequence Diagrams                   ██

BACKEND DEVELOPMENT
  Project Setup + DB Config           ███
  User Model + Auth Routes            ███
  Restaurant Model + Routes               ███
  Menu Management API                     ███
  Order Model + Routes                    ███ ██
  Review API                                  ██
  Admin Routes                                ██

FRONTEND DEVELOPMENT
  React Setup + Routing                           ███
  Auth Pages (Login/Register)                     ███
  Home + Restaurant Listing                       ███ ██
  Restaurant Detail + Menu                            ███
  Cart Component                                      ███
  Checkout + Order Placement                          ███
  Order Tracking Page                                 ███ ██
  Restaurant Owner Dashboard                              ███
  Rider Dashboard                                         ███
  Admin Panel                                             ███

INTEGRATION & TESTING
  API Integration Testing                                 ███ ██
  Unit Tests (Jest)                                           ██ ███
  System Testing                                              ██ ███
  Bug Fixes                                                      ███

DOCUMENTATION & DEPLOYMENT
  Complete all docs                                          ██ ███
  Deploy to Vercel + Render                                      ███
  Final Presentation Prep                                        ███
```

---

## Milestones

| Milestone | Target Date | Criteria |
|-----------|-------------|---------|
| M1: Requirements Complete | End Week 1 | All 5 requirement docs done |
| M2: Design Complete | End Week 2 | Architecture, DB schema, all UML diagrams |
| M3: Backend API Complete | End Week 5 | All endpoints working, Postman tested |
| M4: Frontend MVP | End Week 7 | Customer flow: browse → order complete |
| M5: Full Integration | End Week 8 | All roles working end-to-end |
| M6: Delivery Ready | End Week 9 | Tests pass, deployed, docs complete |

---

## Sprint Breakdown (Agile)

### Sprint 1 (Week 1-2): Planning & Design
**Goal:** Complete all documentation, design database, create UML diagrams

**Tasks:**
- Write Problem Statement, Stakeholder Analysis, Feasibility Study
- Write SRS and MoSCoW prioritization
- Design system architecture
- Design MongoDB schemas
- Draw Use Case, Class, Sequence, Activity, ER diagrams

**Definition of Done:** All docs peer-reviewed; diagrams drawn in tool; team agreed on DB schema

---

### Sprint 2 (Week 3-4): Backend Core
**Goal:** Working authentication and restaurant APIs

**Tasks:**
- Set up Node.js/Express project
- Implement User model + auth middleware
- Build auth routes (register, login, profile)
- Build Restaurant CRUD routes
- Build Menu management routes
- Test all endpoints in Postman

**Definition of Done:** All Postman tests pass; JWT auth working; data persists in MongoDB

---

### Sprint 3 (Week 5): Backend Complete
**Goal:** Orders, Reviews, Admin — backend feature-complete

**Tasks:**
- Implement Order model and all order routes
- Implement Review CRUD and rating aggregation
- Implement basic Admin routes
- Write unit tests for controllers

**Definition of Done:** Complete API, all routes tested, 80% controller coverage

---

### Sprint 4 (Week 6-7): Frontend Core
**Goal:** Customer-facing frontend complete

**Tasks:**
- Set up React + MUI + Zustand + routing
- Build Login/Register pages
- Build Home page with restaurant listings
- Build Restaurant detail + menu page
- Build Cart and Checkout flow
- Build Order tracking page

**Definition of Done:** Customer can register, browse, order, track — all connected to real API

---

### Sprint 5 (Week 8): Dashboards
**Goal:** Restaurant, Rider, Admin dashboards

**Tasks:**
- Restaurant owner dashboard (orders, menu management)
- Rider dashboard (available orders, active delivery)
- Admin panel (user/restaurant management)

**Definition of Done:** All 4 user roles have functional dashboards

---

### Sprint 6 (Week 9): Testing, Polish & Deployment
**Goal:** Production-ready, fully tested, deployed

**Tasks:**
- Run full test suite; fix all P1 bugs
- Deploy frontend to Vercel
- Deploy backend to Render
- Complete all documentation
- Prepare presentation

**Definition of Done:** App live on Vercel; all docs in `/docs`; presentation deck ready

---
*FairBite Software Engineering Documentation — Version 1.0*
