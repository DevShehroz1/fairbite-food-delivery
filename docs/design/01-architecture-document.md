# System Architecture Document

## Architecture Style: Three-Tier MVC

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT TIER                         │
│         React.js SPA (Material-UI)                  │
│    Pages | Components | Services | State (Zustand)  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS / REST API
                       │ (JSON over HTTP)
┌──────────────────────▼──────────────────────────────┐
│                 APPLICATION TIER                     │
│            Node.js + Express.js API                 │
│  Routes → Middleware → Controllers → Models         │
│  Auth (JWT) | Rate Limit | CORS | Helmet           │
└──────────────────────┬──────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼──────────────────────────────┐
│                  DATABASE TIER                       │
│                MongoDB (Atlas)                       │
│     Users | Restaurants | Orders | Reviews          │
└─────────────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend Architecture
```
src/
├── pages/
│   ├── auth/         # Login, Register
│   ├── customer/     # Home, RestaurantList, Detail, Cart, Orders, Profile
│   ├── restaurant/   # Dashboard, MenuManage, OrderManage
│   ├── rider/        # Dashboard, ActiveOrder
│   └── admin/        # Dashboard, Users, Restaurants
├── components/
│   ├── common/       # Button, Card, Input, Modal, Spinner, Toast
│   ├── layout/       # Navbar, Footer, Sidebar
│   └── forms/        # LoginForm, RegisterForm, MenuItemForm
├── services/
│   ├── api.js        # Axios instance with JWT interceptor
│   ├── authService.js
│   ├── restaurantService.js
│   └── orderService.js
├── context/
│   └── AuthContext.jsx  # Global auth state
└── hooks/
    ├── useAuth.js
    └── useCart.js
```

### Backend Architecture (MVC)
```
src/
├── server.js          # Entry point
├── app.js             # Express app config
├── config/
│   └── db.js          # MongoDB connection
├── models/            # Mongoose schemas (M)
│   ├── User.js
│   ├── Restaurant.js
│   ├── Order.js
│   └── Review.js
├── controllers/       # Business logic (C)
│   ├── authController.js
│   ├── restaurantController.js
│   ├── orderController.js
│   └── reviewController.js
├── routes/            # Route definitions (V)
│   ├── authRoutes.js
│   ├── restaurantRoutes.js
│   ├── orderRoutes.js
│   └── reviewRoutes.js
└── middleware/
    └── auth.js        # JWT protect + authorize
```

## Request-Response Flow

```
Browser Request
    │
    ▼
React Component (page/component)
    │ calls service function
    ▼
Service Layer (api.js + serviceX.js)
    │ Axios HTTP request with JWT header
    ▼
Express Router (routes/xRoutes.js)
    │ matches route + method
    ▼
Auth Middleware (protect + authorize)
    │ validates JWT, checks role
    ▼
Controller Function
    │ business logic
    ▼
Mongoose Model
    │ DB query
    ▼
MongoDB Atlas
    │ returns document
    ▼
Controller → JSON Response
    │
    ▼
React Component (updates UI state)
```

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth strategy | JWT (stateless) | Enables horizontal scaling; no server session storage |
| State management | Zustand | Simpler than Redux; sufficient for academic scope |
| CSS framework | Material-UI | Comprehensive component library; professional look |
| ODM | Mongoose | Schema validation; middleware hooks; easy to use |
| API style | REST | Widely understood; simple to implement and test |
| DB | MongoDB | Flexible schema; good for nested menu items |

## Security Architecture

```
Internet
    │
    ▼ HTTPS (TLS)
Express Server
    │
    ├── Helmet (security headers)
    ├── CORS (whitelist CLIENT_URL only)
    ├── Rate Limiter (100 req/15 min)
    ├── Input Validator (express-validator)
    ├── JWT Middleware (route protection)
    └── Mongoose (NoSQL injection prevention)
```

## Deployment Architecture (Production Intent)

```
GitHub Repository
    │
    ├── Frontend → Vercel (CDN, auto-deploy)
    └── Backend → Render (Node.js, auto-deploy)
                    │
                    └── MongoDB Atlas (cloud DB)
```

---
*FairBite Software Engineering Documentation — Version 1.0*
