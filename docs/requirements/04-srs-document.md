# Software Requirements Specification (SRS)
## FairBite Food Delivery Platform
**Version:** 1.0 | **Date:** April 2026 | **Status:** Approved

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for FairBite, an ethical food delivery platform developed as a Software Engineering academic project.

### 1.2 Scope
FairBite enables customers to discover and order food from local restaurants with full price transparency, supports restaurant owners with a fair 15% commission model, and provides delivery riders with transparent wage calculations.

### 1.3 Definitions
| Term | Definition |
|------|-----------|
| Customer | End-user who orders food |
| Restaurant Owner | Business that lists food on the platform |
| Rider | Delivery personnel |
| Admin | Platform manager |
| Order | A placed food delivery request |
| Commission | Platform fee charged to restaurants (15%) |

### 1.4 References
- Problem Statement Document
- Stakeholder Analysis Document
- Feasibility Study Document

---

## 2. Overall Description

### 2.1 Product Perspective
FairBite is a web-based food delivery platform consisting of:
- React.js frontend (single-page application)
- Node.js/Express REST API backend
- MongoDB database
- JWT-based authentication system

### 2.2 Product Functions (Summary)
1. User registration and authentication (4 roles)
2. Restaurant discovery and browsing
3. Menu viewing with dietary filters
4. Cart management and order placement
5. Real-time order status tracking
6. Payment processing (test mode)
7. Rating and review system
8. Admin dashboard

### 2.3 User Classes and Characteristics
| User Class | Tech Literacy | Primary Device | Frequency |
|------------|--------------|----------------|-----------|
| Customer | Medium | Mobile | Daily |
| Restaurant Owner | Medium | Desktop | Hourly |
| Rider | Low-Medium | Mobile | Continuous |
| Admin | High | Desktop | Daily |

### 2.4 Operating Environment
- **Frontend:** Modern browsers (Chrome, Firefox, Safari, Edge)
- **Backend:** Node.js 18+ on Linux/macOS/Windows
- **Database:** MongoDB 6.0+
- **Minimum Browser:** ES6 support required

### 2.5 Design and Implementation Constraints
- Must use React.js for frontend
- Must use MongoDB for database
- Must implement JWT for authentication
- Must be responsive (mobile + desktop)
- Must follow RESTful API conventions
- Academic timeline: 9 weeks

---

## 3. Functional Requirements

### 3.1 Authentication Module

**FR-AUTH-01: User Registration**
- System shall allow users to register with name, email, password, phone, and role
- System shall validate email uniqueness
- System shall hash passwords before storage
- System shall return JWT token on successful registration

**FR-AUTH-02: User Login**
- System shall authenticate users with email + password
- System shall return JWT token valid for 7 days
- System shall record last login timestamp

**FR-AUTH-03: Profile Management**
- System shall allow authenticated users to view their profile
- System shall allow users to update name, phone, and address
- Password changes require current password verification

**FR-AUTH-04: Role-Based Access**
- System shall enforce role-based access: customer, restaurant, rider, admin
- Routes shall be protected based on user role

---

### 3.2 Restaurant Module

**FR-REST-01: Restaurant Listing**
- System shall display all active restaurants
- System shall support filtering by city, cuisine, rating, dietary tags
- System shall support pagination (10 per page default)

**FR-REST-02: Restaurant Detail**
- System shall display full restaurant profile including menu
- System shall increment view counter on each visit
- System shall display ratings and reviews

**FR-REST-03: Restaurant Management**
- Restaurant owners shall create and manage their restaurant profile
- Owners shall manage operating hours, contact info, images
- Admin shall approve/verify restaurants

**FR-REST-04: Menu Management**
- Restaurant owners shall add, update, delete menu items
- Menu items shall include: name, description, price, category, dietary tags, allergens, spice level
- Menu items shall have availability toggle

---

### 3.3 Order Module

**FR-ORD-01: Order Placement**
- Customers shall add items to cart from a single restaurant
- System shall calculate subtotal, delivery fee, platform fee, total
- Customers shall specify delivery address and payment method

**FR-ORD-02: Order Status Tracking**
- System shall track 8 order stages: pending → confirmed → preparing → ready-for-pickup → picked-up → on-the-way → delivered → cancelled
- All parties shall be notified of status changes
- Customers shall view real-time order status

**FR-ORD-03: Order History**
- Customers shall view past orders
- Restaurants shall view incoming and past orders
- Riders shall view assigned and completed deliveries

**FR-ORD-04: Order Cancellation**
- Customers may cancel orders in pending/confirmed status only
- Cancellation reason must be provided
- System records who cancelled and when

---

### 3.4 Review Module

**FR-REV-01: Review Creation**
- Only customers with delivered orders may submit reviews
- Each order may receive exactly one review
- Review includes: food rating, service rating, delivery rating, overall rating, comment

**FR-REV-02: Restaurant Response**
- Restaurant owners may respond to reviews once
- Response is publicly visible alongside the review

**FR-REV-03: Rating Aggregation**
- System shall auto-calculate restaurant average rating after each review
- Rating displayed as X.X out of 5

---

### 3.5 Admin Module

**FR-ADM-01: User Management**
- Admin shall view, activate/deactivate all user accounts
- Admin shall view all restaurants, orders, reviews

**FR-ADM-02: Restaurant Verification**
- Admin shall verify/unverify restaurants
- Admin shall feature/unfeature restaurants

**FR-ADM-03: Analytics**
- Admin shall view platform-wide statistics: total orders, revenue, active users, top restaurants

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **NFR-PERF-01:** API response time < 500ms for 95% of requests
- **NFR-PERF-02:** Frontend initial load < 3 seconds on 4G
- **NFR-PERF-03:** System supports 100 concurrent users (academic scale)

### 4.2 Security
- **NFR-SEC-01:** All passwords hashed with bcrypt (salt rounds: 10)
- **NFR-SEC-02:** JWT tokens expire in 7 days
- **NFR-SEC-03:** Rate limiting: 100 requests per 15 minutes per IP
- **NFR-SEC-04:** HTTPS required in production
- **NFR-SEC-05:** Input validation on all endpoints
- **NFR-SEC-06:** SQL/NoSQL injection prevention via Mongoose

### 4.3 Usability
- **NFR-USE-01:** All core user flows completable in ≤5 steps
- **NFR-USE-02:** Mobile-responsive design (breakpoints: 320px, 768px, 1024px)
- **NFR-USE-03:** Error messages in plain language
- **NFR-USE-04:** Loading states for all async operations

### 4.4 Reliability
- **NFR-REL-01:** System uptime target: 99% (academic scope)
- **NFR-REL-02:** Graceful error handling — no raw stack traces in production
- **NFR-REL-03:** Database connection retry on failure

### 4.5 Maintainability
- **NFR-MNT-01:** Code organized in MVC pattern
- **NFR-MNT-02:** All environment variables in .env files
- **NFR-MNT-03:** Consistent code style via ESLint

### 4.6 Scalability (Design Intent)
- **NFR-SCA-01:** Stateless API (JWT) enables horizontal scaling
- **NFR-SCA-02:** MongoDB supports sharding for future scale
- **NFR-SCA-03:** Frontend deployable to CDN

---

## 5. System Constraints

1. **Time Constraint:** 9-week academic semester
2. **Budget Constraint:** Zero cost (free tiers only)
3. **Team Constraint:** 4 members, partial availability
4. **Payment Constraint:** Stripe test mode only — no real transactions
5. **Maps Constraint:** Google Maps free tier quota applies

---

## 6. Assumptions and Dependencies

### Assumptions
- Users have internet access and modern browsers
- MongoDB Atlas free tier sufficient for development/demo
- Google Maps API quota not exceeded during testing

### Dependencies
- MongoDB Atlas cloud database
- Stripe test API for payment simulation
- Google Maps JavaScript API
- Node.js ecosystem (npm packages)

---
*FairBite Software Engineering Documentation — Version 1.0*
