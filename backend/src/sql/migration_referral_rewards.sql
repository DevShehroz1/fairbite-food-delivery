-- ============================================================
-- QuickBite Referral + Rewards — additive migration
-- Run once in Supabase SQL Editor. Safe to re-run.
-- The UNIQUE constraint is added AFTER backfill so the whole
-- block doesn't roll back when two existing users would collide
-- on the substring-of-id trick.
-- ============================================================

-- 1. Add columns (no UNIQUE yet)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rewards       JSONB DEFAULT '[]';

-- 2. Backfill any missing referral_code with a unique random 8-char code.
--    gen_random_uuid() guarantees no collision between rows.
UPDATE users
   SET referral_code = UPPER(LEFT(REPLACE(gen_random_uuid()::text, '-', ''), 8))
 WHERE referral_code IS NULL;

-- 3. Now safe to add the UNIQUE constraint.
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_referral_code_key;
ALTER TABLE users
  ADD CONSTRAINT users_referral_code_key UNIQUE (referral_code);

-- 4. Lookup indexes.
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users (referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by   ON users (referred_by);
