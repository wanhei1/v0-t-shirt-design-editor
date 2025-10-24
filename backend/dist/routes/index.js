"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoutes = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const models_1 = require("../models");
const auth_1 = require("../middleware/auth");
const createRoutes = (client) => {
    const router = (0, express_1.Router)();
    const userModel = new models_1.UserModel(client);
    const authController = new controllers_1.AuthController(userModel);
    // 注册路由
    router.post('/register', (req, res) => authController.register(req, res));
    // 登录路由
    router.post('/login', (req, res) => authController.login(req, res));
    // 受保护的路由示例
    router.get('/profile', auth_1.authenticate, async (req, res) => {
        try {
            // 添加类型检查
            if (!req.userId) {
                return res.status(401).json({ message: 'User ID not found' });
            }
            const user = await userModel.findUserById(req.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    // 新增：更新用户资料的路由
    router.put('/profile', auth_1.authenticate, async (req, res) => {
        try {
            if (!req.userId) {
                return res.status(401).json({ message: 'User ID not found' });
            }
            const { username } = req.body;
            if (!username || username.trim() === '') {
                return res.status(400).json({ message: 'Username is required' });
            }
            // 检查用户名是否已被其他用户使用
            const existingUser = await userModel.findUserByUsername(username);
            if (existingUser && existingUser.id !== req.userId) {
                return res.status(409).json({ message: 'Username already exists' });
            }
            const updatedUser = await userModel.updateUser(req.userId, { username });
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({
                message: 'Profile updated successfully',
                user: {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email
                }
            });
        }
        catch (error) {
            console.error('Profile update error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    return router;
};
exports.createRoutes = createRoutes;
