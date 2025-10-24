-- ============================================================
-- T-Shirt Designer Platform - Database Migration
-- ============================================================

-- 1. 扩展 users 表
ALTER TABLE users ADD COLUMN IF NOT EXISTS (
  user_type VARCHAR(50) DEFAULT 'free',
  membership_start_date TIMESTAMP,
  membership_end_date TIMESTAMP,
  designs_quota INT DEFAULT 0,
  designs_used INT DEFAULT 0,
  referrer_id INT,
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  avatar_url VARCHAR(500),
  bio TEXT
);

-- 2. 产品表
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 产品变体表（颜色+性别+尺码组合）
CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color VARCHAR(50) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  size VARCHAR(10) NOT NULL,
  stock INT DEFAULT 0,
  sku VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 设计表
CREATE TABLE IF NOT EXISTS designs (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  prompt TEXT,
  ai_model VARCHAR(100),
  product_id INT NOT NULL REFERENCES products(id),
  color VARCHAR(50),
  is_published BOOLEAN DEFAULT FALSE,
  views INT DEFAULT 0,
  purchases INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 订单表
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. 订单项表
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  design_id INT NOT NULL REFERENCES designs(id),
  product_variant_id INT NOT NULL REFERENCES product_variants(id),
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  design_author_id INT REFERENCES users(id),
  commission_rate DECIMAL(3, 2) DEFAULT 0.35,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. 会员表
CREATE TABLE IF NOT EXISTS memberships (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quota INT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  transaction_id VARCHAR(100),
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. 推荐表
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  referred_membership_id INT REFERENCES memberships(id),
  commission_amount DECIMAL(10, 2) DEFAULT 15,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. AI 模型表
CREATE TABLE IF NOT EXISTS ai_models (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  api_endpoint VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初始产品数据
INSERT INTO products (name, category, base_price, description) VALUES
  ('Classic T-Shirt', 't-shirt', 99, 'High-quality cotton T-shirt'),
  ('Baseball Cap', 'cap', 79, 'Classic style baseball cap'),
  ('Coffee Mug', 'mug', 59, 'Ceramic coffee mug')
ON CONFLICT DO NOTHING;

-- 初始 AI 模型数据
INSERT INTO ai_models (name, provider, api_endpoint, is_active) VALUES
  ('Stable Diffusion v2', 'ComfyUI', 'http://82.157.19.21:8188', TRUE),
  ('Stable Diffusion XL', 'ComfyUI', 'http://82.157.19.21:8188', TRUE)
ON CONFLICT DO NOTHING;

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_designs_user_id ON designs(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_is_published ON designs(is_published);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_design_id ON order_items(design_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
