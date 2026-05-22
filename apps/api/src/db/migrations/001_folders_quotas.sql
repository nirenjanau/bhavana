-- =============================================================================
-- 001 · Nested folders (Google-Drive-style) + per-client storage quotas
-- =============================================================================
-- Idempotent: safe to re-run. Each statement guards with IF NOT EXISTS.
-- -----------------------------------------------------------------------------

-- Albums can now nest (parent_album_id). A NULL parent means a top-level
-- "root" folder for a client. sort_order controls folder ordering within a
-- parent.
ALTER TABLE albums
  ADD COLUMN IF NOT EXISTS parent_album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS sort_order      INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_albums_parent       ON albums(parent_album_id);
CREATE INDEX IF NOT EXISTS idx_albums_client_parent ON albums(client_id, parent_album_id);

-- -----------------------------------------------------------------------------
-- Every photo carries the client it was uploaded for (primary "owner"), so
-- quota accounting and Drive-style "My Gallery" views work without scanning
-- client_photo_access. NULL means unassigned library / portfolio photo.
-- -----------------------------------------------------------------------------

ALTER TABLE photos
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_photos_client_id       ON photos(client_id);
CREATE INDEX IF NOT EXISTS idx_photos_client_album    ON photos(client_id, album_id);

-- Backfill client_id from existing client_photo_access rows (first owner wins).
UPDATE photos p
SET client_id = cpa.client_id
FROM (
  SELECT DISTINCT ON (photo_id) photo_id, client_id
  FROM client_photo_access
  ORDER BY photo_id, granted_at ASC
) cpa
WHERE p.id = cpa.photo_id
  AND p.client_id IS NULL;

-- -----------------------------------------------------------------------------
-- Per-client storage quotas. 30 GB default (≈ 3,000 hi-res photos).
-- storage_used_bytes is the cached sum of file_size across a client's photos.
-- -----------------------------------------------------------------------------

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS storage_quota_bytes BIGINT NOT NULL DEFAULT 32212254720, -- 30 GB
  ADD COLUMN IF NOT EXISTS storage_used_bytes  BIGINT NOT NULL DEFAULT 0;

-- Recompute usage for all clients from actual photo file_size totals.
UPDATE users u
SET storage_used_bytes = COALESCE(sub.total, 0)
FROM (
  SELECT client_id, COALESCE(SUM(file_size), 0)::BIGINT AS total
  FROM photos
  WHERE client_id IS NOT NULL
  GROUP BY client_id
) sub
WHERE u.id = sub.client_id AND u.role = 'client';
