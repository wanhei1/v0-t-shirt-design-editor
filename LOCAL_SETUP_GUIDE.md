# 🚀 本地开发和测试指南

## 📋 前置条件

### 1. 安装依赖
```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd ../frontend
npm install
```

### 2. 配置本地数据库

#### 第一步：安装 PostgreSQL
- 下载链接：https://www.postgresql.org/download/windows/
- 安装时记住 `postgres` 用户的密码

#### 第二步：创建数据库和用户
打开 `pgAdmin` 或 `psql` 命令行：

```sql
-- 创建数据库
CREATE DATABASE tshirt_designer;

-- 创建用户
CREATE USER designer WITH PASSWORD 'designer123';

-- 赋予权限
ALTER ROLE designer WITH CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE tshirt_designer TO designer;
```

#### 第三步：执行迁移 SQL
```bash
# 进入项目根目录
cd e:\BIT_file\year4\FUZHUANG\custom-tshirt-designer

# 执行迁移文件
psql -U designer -d tshirt_designer -f backend/src/migrations/001_platform_expansion.sql
```

### 3. 配置环境变量

**后端** (`backend/.env`):
```env
DATABASE_URL=postgresql://designer:designer123@localhost:5432/tshirt_designer
PORT=8189
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
JWT_SECRET=6c30758fcd0cd747155ea1a7d14f31e9
DB_SSL=false
```

**前端** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8189/api
```

---

## 🎯 启动服务

### 终端 1：启动后端
```bash
cd backend
npm run dev
```
✅ 应该看到：`Server is running on port 8189`

### 终端 2：启动前端
```bash
cd frontend
npm run dev
```
✅ 应该看到：`ready - started server on 0.0.0.0:3000`

### 终端 3：（可选）用 Vercel CLI 启动
```bash
cd frontend
npm run dev -- -p 3001
```

---

## 🧪 功能测试流程

### 测试 1：用户注册和登录
1. 打开 http://localhost:3000
2. 点击 **Sign Up** 
3. 填入：
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test@1234`
4. 提交注册
5. ✅ 应该重定向到登录页
6. 使用相同凭证登录
7. ✅ 应该看到欢迎消息和导航栏

### 测试 2：会员购买
1. 登录成功后，点击导航栏 **Membership**
2. ✅ 应该看到三个套餐卡片：
   - Quarterly: ¥188 (3 designs)
   - Half Year: ¥1068 (6 designs) - Recommended
   - Annual: ¥2016 (12 designs)
3. 点击 **Purchase - ¥188** 按钮
4. ✅ 应该看到：`"Successfully purchased quarterly membership!"`
5. 页面应显示：`Active Membership`，配额：`0 / 3`

### 测试 3：创建设计
1. 点击 **Create Design** 菜单
2. 填入表单：
   - Title: `My Awesome T-Shirt`
   - Description: `A cool minimalist design`
   - 上传一张图片
3. ✅ 预览应该显示图片
4. 点击 **Publish Now** 按钮
5. ✅ 应该看到：`"Design created and published successfully!"`
6. 配额应该更新为：`1 / 3`

### 测试 4：浏览设计库
1. 点击 **Design Gallery** 菜单
2. ✅ 应该看到你刚创建的设计出现在库中
3. 点击设计卡片查看详情
4. ✅ 详情弹窗应显示：
   - 完整图片
   - 标题和描述
   - 浏览数：1
   - 作者信息
   - Status: Published
5. 关闭弹窗

### 测试 5：产品选择
1. 点击 **Products** 菜单
2. ✅ 应该看到产品列表（如果后端有数据）
3. 选择产品、颜色、性别、尺码
4. ✅ 价格和库存应该实时更新
5. 点击 **Add to Cart** 按钮
6. ✅ 应该看到加入购物车的确认

### 测试 6：推荐和收益
1. 点击 **Referral & Earnings** 菜单
2. ✅ 应该看到：
   - 推荐代码（自动生成的唯一代码）
   - **Copy** 按钮工作正常
   - 总收益：¥0.00
   - 本月佣金：¥0.00
   - 推荐奖励：¥0.00
   - 待结算：¥0.00
3. 点击 **Copy** 按钮
4. ✅ 应该看到：`"✓ Copied"`
5. 点击 **Copy Link** 按钮
6. ✅ 应该复制推荐链接

### 测试 7：后端连接验证
1. 打开浏览器开发者工具（F12）
2. 切换到 **Network** 标签
3. 执行任何操作（如登录、购买会员等）
4. ✅ 应该看到网络请求：
   - URL: `http://localhost:8189/api/...`
   - Status: 200（成功）或 4xx（客户端错误）
5. ✅ 响应应该包含 JSON 数据

---

## 🔍 常见问题排查

### 问题 1：`Failed to fetch` 错误
**原因**：后端未运行或 API 地址错误

**解决**：
```bash
# 检查后端是否运行
curl http://localhost:8189/health

# 如果返回 { "status": "ok" }，后端正常
# 如果连接失败，确保后端进程在运行
```

### 问题 2：数据库连接错误
**原因**：PostgreSQL 未启动或凭证错误

**解决**：
```bash
# 测试连接
psql -U designer -d tshirt_designer -c "SELECT 1;"

# 如果失败，检查：
# 1. PostgreSQL 服务是否运行
# 2. .env 中的连接字符串是否正确
# 3. 数据库和用户是否存在
```

### 问题 3：页面显示 `Loading...` 无限加载
**原因**：API 请求超时或未返回正确格式

**解决**：
```bash
# 查看后端日志中是否有错误
# 在浏览器开发者工具中查看网络响应
# 确保后端 API 端点返回 JSON 格式
```

### 问题 4：认证错误 `401 Unauthorized`
**原因**：JWT token 过期或无效

**解决**：
```javascript
// 在浏览器控制台清除旧 token
localStorage.removeItem('authToken');

// 重新登录获取新 token
```

---

## 📊 API 端点快速测试

使用 Postman 或 curl 测试 API：

```bash
# 获取所有产品
curl http://localhost:8189/api/products

# 获取产品变种
curl "http://localhost:8189/api/products/1/variants?color=Black&gender=Unisex"

# 获取设计库
curl http://localhost:8189/api/gallery?limit=20&offset=0

# 获取会员状态（需要认证）
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8189/api/membership/status

# 获取收益
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8189/api/earnings
```

---

## ✅ 完整端到端测试

按顺序执行以验证完整流程：

1. ✅ 注册新账户
2. ✅ 购买季度会员（¥188）
3. ✅ 创建并发布设计
4. ✅ 在设计库中查看设计
5. ✅ 生成推荐代码
6. ✅ 查看收益仪表板
7. ✅ 创建第二个账户
8. ✅ 使用第一个账户的推荐代码注册第二个账户
9. ✅ 第二个账户购买会员（验证佣金）
10. ✅ 第一个账户收益增加 ¥15

---

## 🐛 调试技巧

### 查看实时日志
```bash
# 后端日志
cd backend && npm run dev

# 前端日志
cd frontend && npm run dev
```

### 检查网络请求
1. 打开浏览器 DevTools (F12)
2. 切换到 **Network** 标签
3. 执行操作
4. 查看请求/响应

### 使用 VS Code 调试
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Backend Debug",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/src/app.ts",
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
```

---

## 📝 下一步

- [ ] 集成支付网关
- [ ] 添加搜索功能
- [ ] 实现用户评论系统
- [ ] 创建订单管理页面
- [ ] 性能优化（缓存、分页）
- [ ] 部署到生产环境

---

**祝测试顺利！🎉**

如有任何问题，请查看项目文档或后端日志中的错误信息。
