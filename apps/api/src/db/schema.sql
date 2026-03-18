-- =============================================================================
-- Bhavana Studio - PostgreSQL Schema
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('admin', 'client');
CREATE TYPE photo_variant AS ENUM ('original', 'preview', 'thumbnail');

-- -----------------------------------------------------------------------------
-- USERS
-- -----------------------------------------------------------------------------

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'client',
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- -----------------------------------------------------------------------------
-- SESSIONS (for NextAuth / custom sessions)
-- -----------------------------------------------------------------------------

CREATE TABLE sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_token   ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- -----------------------------------------------------------------------------
-- PHOTO ALBUMS (groupings for a client's shoot)
-- -----------------------------------------------------------------------------

CREATE TABLE albums (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  shoot_date  DATE,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_albums_client_id ON albums(client_id);

-- -----------------------------------------------------------------------------
-- PHOTOS
-- -----------------------------------------------------------------------------

CREATE TABLE photos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id         UUID REFERENCES albums(id) ON DELETE SET NULL,
  original_key     TEXT NOT NULL,
  preview_key      TEXT NOT NULL,
  thumbnail_key    TEXT NOT NULL,
  original_url     TEXT NOT NULL,
  preview_url      TEXT NOT NULL,
  thumbnail_url    TEXT NOT NULL,
  filename         TEXT NOT NULL,
  mime_type        TEXT NOT NULL DEFAULT 'image/jpeg',
  file_size        BIGINT NOT NULL DEFAULT 0,
  width            INTEGER,
  height           INTEGER,
  metadata         JSONB,
  uploaded_by      UUID NOT NULL REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_photos_album_id ON photos(album_id);
CREATE INDEX idx_photos_uploaded_by ON photos(uploaded_by);

-- -----------------------------------------------------------------------------
-- CLIENT PHOTO ACCESS (which photos a client can see)
-- -----------------------------------------------------------------------------

CREATE TABLE client_photo_access (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photo_id   UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id, photo_id)
);

CREATE INDEX idx_cpa_client_id ON client_photo_access(client_id);
CREATE INDEX idx_cpa_photo_id  ON client_photo_access(photo_id);

-- -----------------------------------------------------------------------------
-- CLIENT PHOTO INTERACTIONS (likes and selections)
-- -----------------------------------------------------------------------------

CREATE TABLE photo_interactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photo_id   UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  is_liked   BOOLEAN NOT NULL DEFAULT false,
  is_selected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id, photo_id)
);

CREATE INDEX idx_pi_client_id ON photo_interactions(client_id);
CREATE INDEX idx_pi_photo_id  ON photo_interactions(photo_id);
CREATE INDEX idx_pi_liked     ON photo_interactions(client_id, is_liked) WHERE is_liked = true;
CREATE INDEX idx_pi_selected  ON photo_interactions(client_id, is_selected) WHERE is_selected = true;

-- -----------------------------------------------------------------------------
-- PORTFOLIO (public gallery items)
-- -----------------------------------------------------------------------------

CREATE TABLE portfolio_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT,
  photo_key   TEXT NOT NULL,
  photo_url   TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portfolio_category ON portfolio_items(category);
CREATE INDEX idx_portfolio_featured ON portfolio_items(is_featured) WHERE is_featured = true;

-- -----------------------------------------------------------------------------
-- CONTACT FORM SUBMISSIONS
-- -----------------------------------------------------------------------------

CREATE TABLE contact_submissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  event_type TEXT,
  event_date DATE,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TRIGGER: auto-update updated_at
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_albums_updated_at
  BEFORE UPDATE ON albums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_photos_updated_at
  BEFORE UPDATE ON photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_pi_updated_at
  BEFORE UPDATE ON photo_interactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_portfolio_updated_at
  BEFORE UPDATE ON portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
