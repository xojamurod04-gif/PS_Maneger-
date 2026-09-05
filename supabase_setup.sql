-- =============================================
-- PLAYSTATION & COMPUTER CLUB MANAGER (PS_Manager)
-- Supabase Database Schema & Initial Seed Data
-- =============================================

-- 1. Rooms & Computers Table
CREATE TABLE IF NOT EXISTS rooms_computers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'ps5', -- 'ps5', 'pc', 'vip'
    hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 20000,
    status VARCHAR(50) NOT NULL DEFAULT 'available', -- 'available', 'occupied', 'cleaning'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Products / Inventory Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    min_stock_alert INT NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES rooms_computers(id) ON DELETE CASCADE,
    device_name VARCHAR(100) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    target_duration_minutes INT DEFAULT NULL, -- NULL for unlimited, number for fixed duration
    time_cost NUMERIC(10, 2) DEFAULT 0,
    products_cost NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) DEFAULT 0,
    payment_method VARCHAR(50) DEFAULT 'cash', -- 'cash', 'card', 'click'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Session Orders Table (Products added to an active session)
CREATE TABLE IF NOT EXISTS session_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. System Users Table (Admin & Barmen Accounts)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'barmen', -- 'admin', 'barmen'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Active Logged-In User Sessions Table (Security Tracking & Kick Control)
CREATE TABLE IF NOT EXISTS active_logins (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    device_info VARCHAR(255) NOT NULL,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' -- 'active', 'revoked'
);

-- Row Level Security (RLS) Enable
ALTER TABLE rooms_computers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_logins ENABLE ROW LEVEL SECURITY;

-- Allow public access for anon key
CREATE POLICY "Allow public all access on rooms_computers" ON rooms_computers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on session_orders" ON session_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on active_logins" ON active_logins FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for live updates
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;

-- Seed Data: Sample Computers & Rooms
INSERT INTO rooms_computers (name, type, hourly_rate, status) VALUES
('PS5 #01', 'ps5', 25000, 'available'),
('PS5 #02', 'ps5', 25000, 'available'),
('PS5 #03 (VIP)', 'vip', 35000, 'available'),
('PS5 #04 (VIP)', 'vip', 35000, 'available'),
('PC Gaming #01', 'pc', 18000, 'available'),
('PC Gaming #02', 'pc', 18000, 'available'),
('PC Gaming #03', 'pc', 18000, 'available'),
('PC Gaming #04', 'pc', 18000, 'available'),
('VIP Xona #1', 'vip', 50000, 'available'),
('VIP Xona #2', 'vip', 50000, 'available')
ON CONFLICT DO NOTHING;

-- Seed Data: Categories & Products
INSERT INTO categories (name) VALUES ('Ichimliklar'), ('Yeguliklar'), ('Sneklar') ON CONFLICT DO NOTHING;

INSERT INTO products (name, category_name, price, stock, min_stock_alert) VALUES
('Red Bull 0.25l', 'Ichimliklar', 18000, 45, 10),
('Coca-Cola 0.5l', 'Ichimliklar', 9000, 60, 15),
('Pepsi 0.5l', 'Ichimliklar', 8500, 50, 10),
('Fanta 0.5l', 'Ichimliklar', 8500, 30, 8),
('Suv (Gazsiz) 0.5l', 'Ichimliklar', 4000, 80, 20),
('Lays Chipslar 140g', 'Sneklar', 16000, 25, 5),
('Pringles Original', 'Sneklar', 28000, 15, 5),
('Kirieshki 80g', 'Sneklar', 5000, 70, 15),
('Hot-Dog VIP', 'Yeguliklar', 22000, 20, 5),
('Gamburger Special', 'Yeguliklar', 28000, 18, 5),
('Klubny Sendvich', 'Yeguliklar', 32000, 12, 4)
ON CONFLICT DO NOTHING;

-- Seed Data: System Users
INSERT INTO users (username, password, full_name, role) VALUES
('admin', 'admin123', 'Bosh Administrator', 'admin'),
('barmen1', 'barmen123', 'Barmen (Operator 1)', 'barmen')
ON CONFLICT DO NOTHING;
