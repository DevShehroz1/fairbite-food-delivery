-- ============================================================
-- QuickBite Referral + Rewards — additive migration
-- Run once in Supabase SQL Editor. Safe to re-run (IF NOT EXISTS).
-- ============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rewards       JSONB DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users (referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by   ON users (referred_by);

-- Backfill: give every existing user a referral code if missing.
-- Use gen_random_uuid() per row so the unique constraint isn't violated when
-- multiple users have UUIDs that begin with the same characters.
UPDATE users
   SET referral_code = UPPER(LEFT(REPLACE(gen_random_uuid()::text, '-', ''), 8))
 WHERE referral_code IS NULL;
