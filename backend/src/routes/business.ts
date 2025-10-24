// 产品相关 API 路由
import { Router } from 'express';
import { ProductService, DesignService, MembershipService, OrderService, ReferralService } from '../services/business';
import { authenticate } from '../middleware/auth';
import { Client } from 'pg';

export const createBusinessRoutes = (client: Client) => {
  const router = Router();
  
  const productService = new ProductService(client);
  const designService = new DesignService(client);
  const membershipService = new MembershipService(client);
  const orderService = new OrderService(client);
  const referralService = new ReferralService(client);

  // ==================== 产品相关 ====================
  
  // 获取所有产品
  router.get('/products', async (req, res) => {
    try {
      const products = await productService.getAllProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // 获取产品变体
  router.get('/products/:productId/variants', async (req, res) => {
    try {
      const { productId } = req.params;
      const { color, gender } = req.query;
      
      const variants = await productService.getProductVariants(
        parseInt(productId),
        color as string,
        gender as string
      );
      res.json(variants);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== 设计相关 ====================

  // 创建设计
  router.post('/designs', authenticate, async (req, res) => {
    try {
      const userId = req.userId!;
      
      // 检查会员权限
      const canCreate = await membershipService.canCreateDesign(userId);
      if (!canCreate) {
        return res.status(403).json({ message: 'Design quota exceeded or not a member' });
      }

      const design = await designService.createDesign(userId, req.body);
      
      // 增加已使用配额
      await membershipService.incrementDesignsUsed(userId);
      
      res.status(201).json(design);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // 获取用户设计
  router.get('/designs', authenticate, async (req, res) => {
    try {
      const userId = req.userId!;
      const designs = await designService.getUserDesigns(userId);
      res.json(designs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // 获取创意市场
  router.get('/gallery', async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const gallery = await designService.getGallery(
        parseInt(limit as string),
        parseInt(offset as string)
      );
      res.json(gallery);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // 获取作者主页
  router.get('/authors/:authorId', async (req, res) => {
    try {
      const { authorId } = req.params;
      const designs = await designService.getAuthorDesigns(parseInt(authorId));
      res.json(designs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // 发布/取消发布设计
  router.patch('/designs/:designId/publish', authenticate, async (req, res) => {
    try {
      const { designId } = req.params;
      const { published } = req.body;
      
      const result = await client.query(
        `UPDATE designs
         SET is_published = $1, updated_at = NOW()
         WHERE id = $2 AND user_id = $3
         RETURNING *`,
        [published, designId, req.userId!]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Design not found or unauthorized' });
      }

      res.json(result.rows[0]);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== 会员相关 ====================

  // 购买会员
  router.post('/membership/purchase', authenticate, async (req, res) => {
    try {
      const userId = req.userId!;
      const { type, transactionId } = req.body;
      
      if (!['quarterly', 'half_year', 'annual'].includes(type)) {
        return res.status(400).json({ message: 'Invalid membership type' });
      }

      const membership = await membershipService.purchaseMembership(userId, type, transactionId);
      
      // 处理推荐提成
      await referralService.completeReferral(userId);
      
      res.status(201).json(membership);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // 检查会员状态
  router.get('/membership/status', authenticate, async (req, res) => {
    try {
      const userId = req.userId!;
      const isValid = await membershipService.isValidMember(userId);
      res.json({ isMember: isValid });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== 订单相关 ====================

  // 创建订单
  router.post('/orders', authenticate, async (req, res) => {
    try {
      const userId = req.userId!;
      const order = await orderService.createOrder(userId, req.body);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // 获取用户订单
  router.get('/orders', authenticate, async (req, res) => {
    try {
      const userId = req.userId!;
      const orders = await orderService.getUserOrders(userId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // 支付订单
  router.post('/orders/:orderId/pay', authenticate, async (req, res) => {
    try {
      const { orderId } = req.params;
      const { transactionId } = req.body;
      
      const order = await orderService.payOrder(parseInt(orderId), transactionId);
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== 推荐相关 ====================

  // 生成推荐码
  router.post('/referral/generate', authenticate, async (req, res) => {
    try {
      const userId = req.userId!;
      const referralCode = await referralService.generateReferralCode(userId);
      res.status(201).json({ referralCode });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // 应用推荐码
  router.post('/referral/apply', authenticate, async (req, res) => {
    try {
      const userId = req.userId!;
      const { referralCode } = req.body;
      
      await referralService.applyReferralCode(userId, referralCode);
      res.json({ message: 'Referral code applied successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==================== 用户收益 ====================

  // 获取用户收益信息
  router.get('/earnings', authenticate, async (req, res) => {
    try {
      const userId = req.userId!;
      const result = await client.query(
        `SELECT total_earnings FROM users WHERE id = $1`,
        [userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ earnings: result.rows[0].total_earnings });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
