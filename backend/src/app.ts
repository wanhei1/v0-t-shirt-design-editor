import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectToDatabase from './config/database';
import { createRoutes } from './routes';
import './types'; // 导入类型扩展

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // 改为 3001，避免与前端冲突

// 中间件
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // 允许前端访问
    credentials: true
}));
app.use(express.json());

// 健康检查路由
app.get('/', (req, res) => {
    res.json({
        message: 'T-shirt Design Editor API is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// API 状态路由
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// 初始化数据库连接和路由
const initializeApp = async () => {
    try {
        const client = await connectToDatabase();
        
        // 创建用户表
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 设置 API 路由
        app.use('/api', createRoutes(client));

        // 404 处理
        app.use('*', (req, res) => {
            res.status(404).json({
                message: 'Route not found',
                availableRoutes: [
                    'GET /',
                    'GET /health', 
                    'POST /api/register',
                    'POST /api/login',
                    'GET /api/profile'
                ]
            });
        });

        app.listen(PORT, () => {
            console.log(`🚀 Backend server is running on port ${PORT}`);
            console.log(`📡 API available at http://localhost:${PORT}/api`);
            console.log(`💚 Health check at http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('Failed to initialize app:', error);
        process.exit(1);
    }
};

initializeApp();