# v0 T-shirt Design Editor

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/wanhei1s-projects/v0-t-shirt-design-editor)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/yvQIuJ8vycj)

## 📁 Project Structure

```
v0-t-shirt-design-editor/
├── frontend/          # Next.js frontend application
├── backend/           # Node.js/Express backend API
├── shared/            # Shared types, utilities, and constants
├── docs/             # Documentation files
├── package.json      # Root package.json for monorepo management
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon Database recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yeesiang03/v0-t-shirt-design-editor.git
cd v0-t-shirt-design-editor
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
# Copy example environment files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

4. Start development servers:
```bash
npm run dev
```

This will start both frontend (port 3000) and backend (port 3001) servers.

## 📚 Development Commands

```bash
# Start both frontend and backend in development mode
npm run dev

# Start frontend only
npm run dev:frontend

# Start backend only  
npm run dev:backend

# Build both projects
npm run build

# Build frontend only
npm run build:frontend

# Build backend only
npm run build:backend

# Install dependencies for all projects
npm run install:all

# Run tests
npm test
```

   默认访问地址：http://localhost:3000

## 🤝 贡献指南

欢迎贡献代码！请查看我们的贡献指南：

- 📖 [贡献指南 (CONTRIBUTING.md)](./CONTRIBUTING.md)
- 🚀 [部署文档 (VERCEL_DEPLOYMENT.md)](./VERCEL_DEPLOYMENT.md)
- 🗄️ [数据库设置 (databasereadme.md)](./databasereadme.md)

### 快速贡献流程

1. **Fork此项目**
2. **创建功能分支**: `git checkout -b feature/amazing-feature`
3. **提交更改**: `git commit -m 'feat: 添加新功能'`
4. **推送分支**: `git push origin feature/amazing-feature`
5. **创建Pull Request**

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/wanhei1s-projects/v0-t-shirt-design-editor](https://vercel.com/wanhei1s-projects/v0-t-shirt-design-editor)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/yvQIuJ8vycj](https://v0.app/chat/projects/yvQIuJ8vycj)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository