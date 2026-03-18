-- =============================================================================
-- Bhavana Studio - Seed Data
-- Passwords are bcrypt hashes:
--   Admin@12345  → $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBIhfKxAtO9/gm
--   Client@12345 → $2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC..og/wu2JFwG8kW3vW
-- =============================================================================

-- Admin user
INSERT INTO users (id, email, name, password_hash, role) VALUES
  ('00000000-0000-0000-0000-000000000001',
   'admin@bhavanastudio.com',
   'Bhavana Admin',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBIhfKxAtO9/gm',
   'admin');

-- Sample clients
INSERT INTO users (id, email, name, password_hash, role) VALUES
  ('00000000-0000-0000-0000-000000000002',
   'priya@example.com',
   'Priya Sharma',
   '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC..og/wu2JFwG8kW3vW',
   'client'),
  ('00000000-0000-0000-0000-000000000003',
   'arjun@example.com',
   'Arjun & Meera',
   '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC..og/wu2JFwG8kW3vW',
   'client'),
  ('00000000-0000-0000-0000-000000000004',
   'client@example.com',
   'Sample Client',
   '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC..og/wu2JFwG8kW3vW',
   'client');

-- Sample albums
INSERT INTO albums (id, client_id, title, description, shoot_date) VALUES
  ('00000000-0000-0000-0001-000000000001',
   '00000000-0000-0000-0000-000000000002',
   'Priya & Raj Wedding',
   'Wedding ceremony at The Leela Palace, Bangalore',
   '2025-02-14'),
  ('00000000-0000-0000-0001-000000000002',
   '00000000-0000-0000-0000-000000000003',
   'Arjun & Meera Engagement',
   'Romantic engagement session at Cubbon Park',
   '2025-03-01');

-- Portfolio items (using placeholder Unsplash keys)
INSERT INTO portfolio_items (title, category, description, photo_key, photo_url, sort_order, is_featured) VALUES
  ('Golden Hour Wedding', 'Wedding', 'A magical golden hour ceremony', 'portfolio/wedding-01.jpg', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200', 1, true),
  ('Intimate Portrait', 'Portrait', 'Editorial portrait series', 'portfolio/portrait-01.jpg', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200', 2, true),
  ('Monsoon Love', 'Couple', 'Pre-wedding in the rain', 'portfolio/couple-01.jpg', 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=1200', 3, true),
  ('Bridal Details', 'Wedding', 'Intricate bridal jewellery shots', 'portfolio/wedding-02.jpg', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200', 4, false),
  ('Candid Moments', 'Events', 'Unscripted family moments', 'portfolio/events-01.jpg', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200', 5, false),
  ('Soft Studio Light', 'Portrait', 'Clean minimalist studio portraits', 'portfolio/portrait-02.jpg', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200', 6, false),
  ('Destination Wedding', 'Wedding', 'Beach ceremony at Goa', 'portfolio/wedding-03.jpg', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200', 7, true),
  ('New Born Joy', 'Family', 'Precious first days', 'portfolio/family-01.jpg', 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200', 8, false);
