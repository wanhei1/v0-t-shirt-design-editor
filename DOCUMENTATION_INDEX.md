# 📚 项目文档导航

## 🎯 快速导航

### 🚀 立即开始
- **[本地开发指南](LOCAL_SETUP_GUIDE.md)** - 完整的本地环境设置步骤
- **[项目完成总结](PROJECT_COMPLETION_SUMMARY.md)** - 当前状态和所有已完成功能
- **[快速开始指南](QUICK_START_GUIDE.md)** - 5 分钟快速上手

### 📱 前端
- **[商城组件文档](MARKETPLACE_COMPONENTS_README.md)** - 5 个新组件详细说明
- **[前端部署指南](FRONTEND_DEPLOYMENT_GUIDE.md)** - Vercel 部署步骤
- **[前端组件说明](FRONTEND_COMPONENTS_README.md)** - 所有 UI 组件列表

### 🔧 后端
- **[API 文档](docs/api.md)** - 完整的 API 端点参考
- **[数据库说明](docs/databasereadme.md)** - 数据库结构和表设计
- **[后端 README](backend/README.md)** - 后端项目说明

### 🗄️ 数据库
- **[PostgreSQL 设置指南](backend/POSTGRESQL_SETUP.md)** - 本地数据库配置
- **[数据库迁移文件](backend/src/migrations/001_platform_expansion.sql)** - SQL 迁移脚本

### 📊 项目管理
- **[项目路线图](PROJECT_ROADMAP.md)** - 功能规划和优先级
- **[贡献指南](docs/CONTRIBUTING.md)** - 代码贡献规范
- **[GitHub 管理指南](GITHUB_MANAGEMENT_GUIDE.md)** - PR 和分支管理

---

## 📋 功能清单

### ✅ 已实现

#### 后端服务
- [x] ProductService - 产品管理
- [x] DesignService - 设计上传和管理
- [x] MembershipService - 会员系统（¥188/¥1068/¥2016）
- [x] OrderService - 订单处理
- [x] ReferralService - 推荐系统（¥15 奖励）

#### 前端组件
- [x] ProductSelector - 产品选择和自定义
- [x] MembershipPurchase - 会员购买页面
- [x] DesignGallery - 设计库和浏览
- [x] DesignCreator - 设计上传和编辑
- [x] ReferralAndEarnings - 推荐代码和收益管理

#### API 端点
- [x] GET `/api/products` - 获取产品列表
- [x] GET `/api/products/:id/variants` - 获取产品变种
- [x] POST `/api/designs` - 创建设计
- [x] GET `/api/gallery` - 获取设计库
- [x] POST `/api/membership/purchase` - 购买会员
- [x] GET `/api/membership/status` - 查询会员状态
- [x] POST `/api/referral/generate` - 生成推荐码
- [x] GET `/api/earnings` - 查询收益

#### 基础设施
- [x] JWT 认证
- [x] CORS 多源支持
- [x] 本地 PostgreSQL 数据库
- [x] 环境变量管理
- [x] 错误处理和日志

---

## 🔍 文档使用指南

### 新手用户
1. 从 **[快速开始指南](QUICK_START_GUIDE.md)** 开始
2. 阅读 **[本地开发指南](LOCAL_SETUP_GUIDE.md)** 来设置环境
3. 按照 **[测试流程](LOCAL_SETUP_GUIDE.md#-功能测试流程)** 验证功能

### 开发者
1. 查看 **[API 文档](docs/api.md)** 了解所有端点
2. 参考 **[商城组件文档](MARKETPLACE_COMPONENTS_README.md)** 集成组件
3. 检查 **[项目路线图](PROJECT_ROADMAP.md)** 了解规划

### 运维人员
1. 参考 **[PostgreSQL 设置指南](backend/POSTGRESQL_SETUP.md)** 配置数据库
2. 查看 **[前端部署指南](FRONTEND_DEPLOYMENT_GUIDE.md)** 部署到生产
3. 学习 **[后端 README](backend/README.md)** 了解服务配置

### 设计师/产品经理
1. 阅读 **[项目完成总结](PROJECT_COMPLETION_SUMMARY.md)** 了解全景
2. 查看 **[项目路线图](PROJECT_ROADMAP.md)** 了解未来计划

---

## 📁 文件结构说明

```
📦 custom-tshirt-designer/
├── 📄 本地开发相关
│   ├── LOCAL_SETUP_GUIDE.md              ← 本地环境设置（推荐先读）
│   ├── PROJECT_COMPLETION_SUMMARY.md     ← 项目总结
│   ├── QUICK_START_GUIDE.md             ← 快速开始
│   └── PROJECT_ROADMAP.md               ← 功能规划
│
├── 📄 前端相关
│   ├── FRONTEND_COMPONENTS_README.md    ← UI 组件文档
│   ├── FRONTEND_DEPLOYMENT_GUIDE.md     ← Vercel 部署
│   ├── MARKETPLACE_COMPONENTS_README.md ← 新组件说明 ⭐
│   └── frontend/
│       ├── components/marketplace/      ← 新组件（5 个）
│       ├── lib/api-client.ts           ← 扩展的 API 客户端
│       └── ...
│
├── 📄 后端相关
│   ├── backend/
│   │   ├── README.md                   ← 后端说明
│   │   ├── POSTGRESQL_SETUP.md         ← 数据库配置
│   │   ├── .env                        ← 环境变量（已更新为本地 PG）
│   │   ├── src/
│   │   │   ├── services/business.ts    ← 5 个业务服务
│   │   │   ├── routes/business.ts      ← API 路由
│   │   │   └── migrations/
│   │   │       └── 001_platform_expansion.sql ← 数据库迁移
│   │   └── ...
│   └── backend/.env                    ← 更新为本地 PostgreSQL
│
├── 📄 文档相关
│   ├── docs/
│   │   ├── api.md                     ← API 端点文档
│   │   ├── databasereadme.md          ← 数据库表设计
│   │   ├── CONTRIBUTING.md            ← 贡献指南
│   │   └── ...
│   ├── GITHUB_MANAGEMENT_GUIDE.md     ← GitHub PR 管理
│   └── ...
│
└── 📄 其他
    ├── package.json
    └── vercel.json
```

---

## 🎯 常见任务

### 我想要...

**...本地启动项目**
→ 阅读 [本地开发指南](LOCAL_SETUP_GUIDE.md#-启动服务)

**...理解会员系统**
→ 阅读 [项目完成总结](PROJECT_COMPLETION_SUMMARY.md#-会员系统详情)

**...添加新的 API 端点**
→ 查看 [API 文档](docs/api.md)

**...集成商城组件到页面**
→ 阅读 [商城组件文档](MARKETPLACE_COMPONENTS_README.md#-使用这些组件)

**...部署到生产**
→ 参考 [前端部署指南](FRONTEND_DEPLOYMENT_GUIDE.md)

**...测试功能是否正常工作**
→ 按照 [测试流程](LOCAL_SETUP_GUIDE.md#-功能测试流程)

**...排查问题**
→ 查看 [故障排除](LOCAL_SETUP_GUIDE.md#-常见问题排查)

**...了解完整流程**
→ 查看 [完整用户流程图](PROJECT_COMPLETION_SUMMARY.md#-完整用户流程)

---

## 🔄 开发工作流

```
1. 从 main 分支创建功能分支
   git checkout -b feature/your-feature

2. 实现功能并测试
   npm run dev

3. 提交到 GitHub
   git push origin feature/your-feature

4. 创建 Pull Request
   在 GitHub 上创建 PR

5. 审查和合并
   参考 GITHUB_MANAGEMENT_GUIDE.md

6. 部署到生产
   参考 FRONTEND_DEPLOYMENT_GUIDE.md
```

---

## ✅ 验证清单

启动项目前，确保已完成：

- [ ] 安装了 PostgreSQL
- [ ] 创建了 `tshirt_designer` 数据库
- [ ] 执行了迁移 SQL (`001_platform_expansion.sql`)
- [ ] 更新了 `.env` 文件
- [ ] 安装了 NPM 依赖 (`npm install`)
- [ ] 后端正常启动（`npm run dev`）
- [ ] 前端正常启动（`npm run dev`）
- [ ] 可以访问 http://localhost:3000

---

## 📞 获取帮助

### 常见问题
→ 查看 [常见问题排查](LOCAL_SETUP_GUIDE.md#-常见问题排查)

### API 问题
→ 参考 [API 文档](docs/api.md)

### 数据库问题
→ 参考 [PostgreSQL 设置](backend/POSTGRESQL_SETUP.md)

### 组件问题
→ 参考 [商城组件文档](MARKETPLACE_COMPONENTS_README.md)

### 其他问题
→ 查看后端日志或浏览器控制台（F12）

---

## 📊 项目统计

| 指标 | 数量 |
|-----|-----|
| **前端组件** | 5 个新组件 + UI 库 |
| **API 端点** | 30+ 个端点 |
| **业务服务** | 5 个核心服务 |
| **数据库表** | 8 个主要表 |
| **文档页面** | 15+ 个 |
| **Git 提交** | 20+ 个 |

---

## 🎓 学习路径

### 初级（1-2 小时）
1. 快速开始指南
2. 本地开发指南
3. 运行测试流程

### 中级（2-4 小时）
1. API 文档
2. 数据库设计
3. 商城组件文档
4. 项目路线图

### 高级（4+ 小时）
1. 后端源代码
2. 前端源代码
3. 数据库优化
4. 部署和运维

---

## 🔐 重要提示

⚠️ **生产环境部署前检查**：
- [ ] 更新 JWT_SECRET
- [ ] 启用 HTTPS
- [ ] 配置支付网关
- [ ] 设置日志和监控
- [ ] 数据库备份策略
- [ ] 速率限制配置

---

## 📝 最后更新

- **日期**: 2025-10-24
- **版本**: 1.0.0
- **状态**: ✅ 完成并测试就绪
- **数据库**: ✅ 本地 PostgreSQL
- **前端**: ✅ 所有组件完成
- **后端**: ✅ 所有 API 就绪

---

## 📚 相关资源

### 技术栈
- [Next.js 文档](https://nextjs.org/docs)
- [Express.js 文档](https://expressjs.com/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)

### 工具
- [VS Code](https://code.visualstudio.com/)
- [pgAdmin](https://www.pgadmin.org/) - PostgreSQL 管理工具
- [Postman](https://www.postman.com/) - API 测试工具
- [Git](https://git-scm.com/) - 版本控制

---

**🎉 欢迎使用 T-Shirt Design Platform！**

如有任何问题或建议，请查阅相应的文档或提出 Issue。

---

*导航文档 v1.0 | 2025-10-24*
