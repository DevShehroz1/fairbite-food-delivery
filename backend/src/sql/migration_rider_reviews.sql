-- Reviews are now about the rider's delivery service, not the restaurant.
-- Adds a nullable rider_id (so old rows aren't broken) and an index for
-- the per-rider review listing.
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS rider_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS reviews_rider_id_idx ON reviews(rider_id);

NOTIFY pgrst, 'reload schema';
