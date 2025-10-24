# T-Shirt Designer 项目功能规划

## 📋 核心需求总结

### 1. 产品管理
- **T-Shirt**: 仅黑色和白色两种颜色
- **扩展产品**: 帽子、杯子
- **尺码管理**: 男性/女性两种尺码体系
- **AI 模型**: 支持多种模型选择 + 自定义模型上传（可选）
- **虚拟试穿**: 预览时显示真人穿着效果

### 2. 订单与支付
- **下单结算**: 购买时扣费
- **库存管理**: 按产品+颜色+尺码+性别管理

### 3. 会员系统
#### 会员类型
- **季度会员**: ¥188/3个月，可制作 3 件
- **半年会员**: ¥1068/6个月，可制作 6 件
- **年度会员**: ¥2016/年，可制作 12 件

#### 会员权益
- 享受 AI 文生图功能（只出图，不下单）
- 设计保存与分享
- 预览图展示在主页
- 作品被他人下单时获得 35% 提成

#### 推荐系统
- 会员可以推荐其他人
- 被推荐用户缴费 ¥198 时，推荐人获得 ¥15 返利

### 4. 内容与社交
- **创意市场**: 展示会员的设计作品
- **作者主页**: 通过预览图进入作者的所有作品
- **设计分享**: 已发布的设计供其他用户选择下单
- **收益分配**: 下单时自动计算提成

---

## 🗄️ 数据库架构

### 新增数据表

#### users 表 (扩展)
```sql
ALTER TABLE users ADD COLUMN (
  user_type ENUM('free', 'quarterly', 'half_year', 'annual') DEFAULT 'free',
  membership_start_date TIMESTAMP,
  membership_end_date TIMESTAMP,
  designs_quota INT DEFAULT 0,  -- 该月可制作数量
  designs_used INT DEFAULT 0,   -- 该月已制作数量
  referrer_id INT,  -- 推荐人 ID
  total_earnings DECIMAL(10, 2) DEFAULT 0,  -- 总提成
  avatar_url VARCHAR(500),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### products 表 (新增)
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,  -- T-Shirt, Hat, Mug
  category VARCHAR(50) NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### product_variants 表 (新增)
```sql
CREATE TABLE product_variants (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id),
  color VARCHAR(50) NOT NULL,  -- 'black', 'white'
  gender VARCHAR(10) NOT NULL,  -- 'male', 'female'
  size VARCHAR(10) NOT NULL,  -- 'XS', 'S', 'M', 'L', 'XL', 'XXL'
  stock INT DEFAULT 0,
  sku VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### designs 表 (新增)
```sql
CREATE TABLE designs (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  prompt TEXT,  -- AI 生成提示词
  ai_model VARCHAR(100),  -- 使用的 AI 模型
  product_id INT NOT NULL REFERENCES products(id),
  color VARCHAR(50) NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,  -- 是否发布到创意市场
  views INT DEFAULT 0,
  purchases INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### orders 表 (扩展)
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  total_price DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'paid', 'shipped', 'delivered') DEFAULT 'pending',
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### order_items 表 (新增)
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id),
  design_id INT NOT NULL REFERENCES designs(id),
  product_variant_id INT NOT NULL REFERENCES product_variants(id),
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  design_author_id INT REFERENCES users(id),  -- 如果是购买他人设计
  commission_rate DECIMAL(3, 2) DEFAULT 0.35,  -- 35% 提成
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### memberships 表 (新增)
```sql
CREATE TABLE memberships (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,  -- 'quarterly', 'half_year', 'annual'
  price DECIMAL(10, 2) NOT NULL,
  quota INT NOT NULL,  -- 可制作数量
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  transaction_id VARCHAR(100),
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### referrals 表 (新增)
```sql
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INT NOT NULL REFERENCES users(id),
  referred_user_id INT NOT NULL REFERENCES users(id),
  referral_code VARCHAR(50) UNIQUE,
  referred_membership_id INT REFERENCES memberships(id),
  commission_amount DECIMAL(10, 2) DEFAULT 15,  -- ¥15
  status ENUM('pending', 'earned', 'withdrawn') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### ai_models 表 (新增)
```sql
CREATE TABLE ai_models (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,  -- 'Stable Diffusion v2', 'DALL-E 3' 等
  provider VARCHAR(50) NOT NULL,
  api_endpoint VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🏗️ 前端结构调整

### 新增页面
- `/design/gallery` - 创意市场/主页
- `/design/[id]` - 作者主页
- `/membership` - 会员购买页
- `/orders` - 我的订单
- `/earnings` - 收益中心（会员用）
- `/models` - AI 模型选择
- `/products/[id]` - 产品详情

### 功能模块
- 产品选择器（T-Shirt/帽子/杯子 + 颜色 + 性别 + 尺码）
- 虚拟试穿预览
- 会员状态显示
- 订单管理
- 设计分享与保存

---

## 🔄 业务流程

### 会员购买流程
1. 用户选择会员类型
2. 支付 ¥188/¥1068/¥2016
3. 系统记录有效期和配额
4. 会员享受 AI 文生图权限

### 设计创建流程
1. 会员选择产品类型、颜色、性别、尺码
2. 选择 AI 模型
3. 输入文本提示词生成图片
4. 预览虚拟试穿效果
5. 保存或发布到创意市场

### 下单流程
1. 消费者（会员或非会员）浏览创意市场
2. 选择感兴趣的设计
3. 选择尺码等规格
4. 结算支付
5. 系统自动计算提成给设计作者

---

## 📅 开发优先级

### Phase 1 (基础)
- [ ] 产品管理后台
- [ ] 会员系统核心
- [ ] 订单支付流程

### Phase 2 (进阶)
- [ ] 创意市场展示
- [ ] 虚拟试穿集成
- [ ] AI 模型选择接口

### Phase 3 (优化)
- [ ] 推荐系统
- [ ] 收益统计
- [ ] 自定义模型上传（可选）

---
