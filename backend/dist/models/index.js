"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
class UserModel {
    constructor(client) {
        this.client = client;
    }
    async createUser(username, email, hashedPassword) {
        const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at';
        const values = [username, email, hashedPassword];
        const result = await this.client.query(query, values);
        return result.rows[0];
    }
    async findUserByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await this.client.query(query, [email]);
        return result.rows[0] || null;
    }
    async findUserById(id) {
        const query = 'SELECT id, username, email, created_at FROM users WHERE id = $1';
        const result = await this.client.query(query, [id]);
        return result.rows[0] || null;
    }
    async findUserByIdWithPassword(id) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await this.client.query(query, [id]);
        return result.rows[0] || null;
    }
    // 新增：通过用户名查找用户
    async findUserByUsername(username) {
        const query = 'SELECT id, username, email, created_at FROM users WHERE username = $1';
        const result = await this.client.query(query, [username]);
        return result.rows[0] || null;
    }
    // 新增：更新用户信息
    async updateUser(id, updateData) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (updateData.username) {
            fields.push(`username = $${paramCount}`);
            values.push(updateData.username);
            paramCount++;
        }
        if (updateData.email) {
            fields.push(`email = $${paramCount}`);
            values.push(updateData.email);
            paramCount++;
        }
        if (fields.length === 0) {
            throw new Error('No fields to update');
        }
        values.push(id);
        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, username, email, created_at`;
        const result = await this.client.query(query, values);
        return result.rows[0] || null;
    }
}
exports.UserModel = UserModel;
