"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const routes_1 = require("./routes");
require("./types"); // 导入类型扩展
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8189; // 默认使用 8189 端口
// 中间件
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // 允许前端访问
    credentials: true
}));
app.use(express_1.default.json());
// 健康检查路由
app.get('/', (req, res) => {
    res.json({
        message: 'T-shirt Design Editor API is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
// API 根路由提示
app.get('/api', (req, res) => {
    res.json({
        message: 'API online',
        endpoints: {
            login: 'POST /api/login',
            register: 'POST /api/register',
            profile: 'GET /api/profile',
            health: 'GET /health'
        }
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
    let client = null;
    let dbConnected = false;
    try {
        // 尝试连接数据库
        try {
            client = await (0, database_1.default)();
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
            dbConnected = true;
            console.log('✅ Database connected and initialized');
        }
        catch (dbError) {
            console.warn('⚠️ Database connection failed, running without database features');
            console.log(`📝 Database error: ${dbError?.message || 'Unknown error'}`);
            console.log('💡 To enable full features, please configure your DATABASE_URL environment variable');
        }
        // 设置 API 路由（传入数据库客户端，如果连接失败则为 null）
        app.use('/api', (0, routes_1.createRoutes)(client));
        // 404 处理
        app.use('*', (req, res) => {
            res.status(404).json({
                message: 'Route not found',
                database: dbConnected ? 'connected' : 'disconnected',
                availableRoutes: [
                    'GET /',
                    'GET /health',
                    'POST /api/register (需要数据库)',
                    'POST /api/login (需要数据库)',
                    'GET /api/profile (需要数据库)'
                ]
            });
        });
        app.listen(PORT, () => {
            console.log(`🚀 Backend server is running on port ${PORT}`);
            console.log(`📡 API available at http://localhost:${PORT}/api`);
            console.log(`💚 Health check at http://localhost:${PORT}/health`);
            console.log(`🗄️ Database status: ${dbConnected ? '✅ Connected' : '❌ Disconnected'}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to initialize app:', error);
        process.exit(1);
    }
};
initializeApp();
