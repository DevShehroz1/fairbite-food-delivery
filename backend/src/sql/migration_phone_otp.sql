-- Phone-OTP verification fields on users.
-- Customers must verify their phone (via the OTP flow) before placing an order.
-- After running, NOTIFY pgrst, 'reload schema'; so PostgREST sees the new columns.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone_verified  BOOLEAN     DEFAULT false,
  ADD COLUMN IF NOT EXISTS otp_hash        TEXT,
  ADD COLUMN IF NOT EXISTS otp_expires_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS otp_attempts    INTEGER     DEFAULT 0;

NOTIFY pgrst, 'reload schema';
