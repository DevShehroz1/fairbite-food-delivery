# FairBite Food Delivery

A full-stack food delivery PWA built for a class demo. Real-time order tracking with animated maps, multi-role dashboards (customer, rider, restaurant, admin).

---

## Live URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://frontend-olive-eight-54.vercel.app |
| **Backend API** | https://backend-eight-iota-236qu03xa0.vercel.app |
| **GitHub** | https://github.com/DevShehroz1/fairbite-food-delivery |

---

## Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@demo.com | demo123 |
| Rider | rider@demo.com | demo123 |
| Restaurant | restaurant@demo.com | demo123 |
| Admin | admin@demo.com | demo123 |

---

## Demo Flow (Class Presentation)

1. **Open frontend** on 2-3 phones/tabs
2. **Phone 1** — Login as `customer@demo.com`, browse restaurants, place an order
3. **Phone 2** — Login as `rider@demo.com`, see the order appear and accept it
4. **Watch Phone 1** — order auto-progresses through all stages with animated map:
   - Pending → Confirmed (4s) → Preparing (9s) → Ready for Pickup (16s)
   - Rider at Restaurant (22s) → On The Way (28s) → Delivered (46s)
5. Map shows animated route with rider moving from restaurant to destination

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, MUI v5, Framer Motion, Zustand, React Router v6 |
| Backend | Node.js, Express 5, Socket.io |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Hosting | Vercel (frontend + backend) |
| Realtime | Socket.io (WebSockets) |

---

## Project Structure

```
fairbite-food-delivery/
├── backend/
│   ├── src/
│   │   ├── config/supabase.js       # Supabase client
│   │   ├── controllers/             # Route handlers
│   │   ├── middleware/auth.js       # JWT middleware
│   │   ├── models/                  # Supabase service models
│   │   │   ├── User.js
│   │   │   ├── Restaurant.js
│   │   │   ├── Order.js
│   │   │   └── Review.js
│   │   ├── routes/                  # Express routes
│   │   ├── seedDemoUsers.js         # Seed demo accounts
│   │   ├── seedRestaurants.js       # Seed demo restaurants
│   │   └── server.js                # Express + Socket.io server
│   └── vercel.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── customer/
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── RestaurantListPage.jsx
│   │   │   │   ├── RestaurantDetailPage.jsx
│   │   │   │   ├── CartPage.jsx
│   │   │   │   ├── OrderTrackingPage.jsx  # SVG map + demo sim
│   │   │   │   └── OrderHistoryPage.jsx
│   │   │   ├── rider/RiderDashboard.jsx
│   │   │   ├── restaurant/
│   │   │   ├── admin/
│   │   │   └── auth/
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── socket.js            # Socket.io client
│   │   │   └── demoService.js       # Auto-progression timing
│   │   └── utils/theme.js           # Red food theme, 12px radius
│   └── vercel.json
└── render.yaml                      # Render blueprint (alternative)
```

---

## Supabase Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password text not null,
  role text not null default 'customer',
  phone text,
  avatar text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Restaurants
create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references users(id),
  name text not null,
  description text,
  cuisine text[] default '{}',
  address jsonb default '{}',
  contact jsonb default '{}',
  images jsonb default '{}',
  menu jsonb[] default '{}',
  rating jsonb default '{"average":0,"count":0}',
  delivery jsonb default '{"fee":50,"estimatedTime":30,"isAvailable":true}',
  pricing jsonb default '{"commissionRate":15,"minimumOrder":100}',
  status jsonb default '{"isActive":true,"isVerified":false,"isFeatured":false}',
  stats jsonb default '{"totalOrders":0,"totalRevenue":0,"views":0}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid references users(id),
  restaurant_id uuid references restaurants(id),
  rider_id uuid references users(id),
  items jsonb[] default '{}',
  pricing jsonb default '{}',
  delivery_address jsonb default '{}',
  payment jsonb default '{"method":"cash","status":"pending"}',
  status text default 'pending',
  status_history jsonb[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reviews
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  customer_id uuid references users(id),
  restaurant_id uuid references restaurants(id),
  rating jsonb default '{}',
  comment text,
  images text[] default '{}',
  restaurant_response jsonb,
  created_at timestamptz default now()
);
```

---

## Environment Variables

### Backend (Vercel)
```
SUPABASE_URL=https://mzvcjapddqaegcxjenpj.supabase.co
SUPABASE_SERVICE_KEY=<your-service-role-key>
JWT_SECRET=fairbite_super_secret_jwt_2024_xK9mP3nQ7rL
JWT_EXPIRE=7d
NODE_ENV=production
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://backend-eight-iota-236qu03xa0.vercel.app/api
REACT_APP_SOCKET_URL=https://backend-eight-iota-236qu03xa0.vercel.app
```

---

## Run Locally

```bash
# Backend
cd backend
npm install
npm run dev   # runs on http://localhost:5001

# Seed data (first time only)
node src/seedDemoUsers.js
node src/seedRestaurants.js

# Frontend
cd frontend
npm install
npm start     # runs on http://localhost:3000
```

---

## Key Features

- **Foodpanda-accurate flow**: Restaurant confirms first → prepares → marks ready → riders notified → rider waits 6s at restaurant → starts riding
- **Animated SVG map**: Google Maps-style city map with multi-segment route, Framer Motion path animation, rider moves along route
- **Demo simulation**: Auto-progresses through all order stages (no rider needed for demo)
- **Real-time Socket.io**: Multi-phone sync — rider accepts and customer sees update instantly
- **PWA**: Installable on iOS/Android from browser
- **Red food theme**: #E53935 primary, 12px border radius everywhere, smooth animations
