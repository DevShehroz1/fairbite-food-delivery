-- ============================================================
-- FairBite Database Schema — run this in Supabase SQL Editor
-- ============================================================

-- Drop tables if re-running
DROP TABLE IF EXISTS reviews  CASCADE;
DROP TABLE IF EXISTS orders   CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS users    CASCADE;

-- ── users ────────────────────────────────────────────────────
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20)  NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer','rider','restaurant','admin')),
  phone       VARCHAR(20),
  avatar      TEXT,
  google_id   VARCHAR(100),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── restaurants ──────────────────────────────────────────────
CREATE TABLE restaurants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  cuisine     TEXT[]       DEFAULT '{}',
  address     JSONB        DEFAULT '{}',
  contact     JSONB        DEFAULT '{}',
  images      JSONB        DEFAULT '{}',
  menu        JSONB        DEFAULT '[]',
  rating      JSONB        DEFAULT '{"average":0,"count":0}',
  delivery    JSONB        DEFAULT '{"fee":50,"estimatedTime":30,"isAvailable":true}',
  pricing     JSONB        DEFAULT '{"commissionRate":15,"minimumOrder":100}',
  status      JSONB        DEFAULT '{"isVerified":false,"isActive":true}',
  stats       JSONB        DEFAULT '{"totalOrders":0,"totalRevenue":0,"views":0}',
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ── orders ───────────────────────────────────────────────────
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     VARCHAR(20) UNIQUE NOT NULL,
  customer_id      UUID REFERENCES users(id),
  restaurant_id    UUID REFERENCES restaurants(id),
  rider_id         UUID REFERENCES users(id),
  status           VARCHAR(30) DEFAULT 'pending',
  items            JSONB DEFAULT '[]',
  pricing          JSONB DEFAULT '{}',
  delivery_address JSONB DEFAULT '{}',
  payment          JSONB DEFAULT '{"method":"cash","status":"pending"}',
  status_history   JSONB DEFAULT '[]',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── reviews ──────────────────────────────────────────────────
CREATE TABLE reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID REFERENCES orders(id),
  customer_id   UUID REFERENCES users(id),
  restaurant_id UUID REFERENCES restaurants(id),
  rating        INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Disable Row Level Security (service key bypasses anyway) ──
ALTER TABLE users        DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants  DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders       DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews      DISABLE ROW LEVEL SECURITY;
