// 产品服务
import { Client } from 'pg';

export class ProductService {
  constructor(private client: Client) {}

  // 获取所有产品
  async getAllProducts() {
    const result = await this.client.query(
      'SELECT * FROM products WHERE id > 0 ORDER BY created_at DESC'
    );
    return result.rows;
  }

  // 获取产品变体（按颜色、性别、尺码）
  async getProductVariants(productId: number, color?: string, gender?: string) {
    let query = 'SELECT * FROM product_variants WHERE product_id = $1';
    const params: any[] = [productId];

    if (color) {
      query += ` AND color = $${params.length + 1}`;
      params.push(color);
    }
    if (gender) {
      query += ` AND gender = $${params.length + 1}`;
      params.push(gender);
    }

    const result = await this.client.query(query, params);
    return result.rows;
  }

  // 创建产品变体
  async createProductVariant(productId: number, variant: any) {
    const { color, gender, size, stock } = variant;
    const sku = `${productId}-${color}-${gender}-${size}`;
    
    const result = await this.client.query(
      `INSERT INTO product_variants (product_id, color, gender, size, stock, sku)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [productId, color, gender, size, stock, sku]
    );
    return result.rows[0];
  }
}

// 设计服务
export class DesignService {
  constructor(private client: Client) {}

  // 创建设计
  async createDesign(userId: number, designData: any) {
    const { name, description, imageUrl, prompt, aiModel, productId, color, isPublished } = designData;
    
    const result = await this.client.query(
      `INSERT INTO designs (user_id, name, description, image_url, prompt, ai_model, product_id, color, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, name, description, imageUrl, prompt, aiModel, productId, color, isPublished || false]
    );
    return result.rows[0];
  }

  // 获取用户的设计
  async getUserDesigns(userId: number, publishedOnly = false) {
    let query = 'SELECT * FROM designs WHERE user_id = $1';
    if (publishedOnly) {
      query += ' AND is_published = TRUE';
    }
    query += ' ORDER BY created_at DESC';

    const result = await this.client.query(query, [userId]);
    return result.rows;
  }

  // 获取创意市场（已发布设计）
  async getGallery(limit = 20, offset = 0) {
    const result = await this.client.query(
      `SELECT d.*, u.username, u.avatar_url, u.id as author_id
       FROM designs d
       JOIN users u ON d.user_id = u.id
       WHERE d.is_published = TRUE
       ORDER BY d.views DESC, d.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  // 获取作者的所有设计
  async getAuthorDesigns(authorId: number) {
    const result = await this.client.query(
      `SELECT * FROM designs
       WHERE user_id = $1 AND is_published = TRUE
       ORDER BY created_at DESC`,
      [authorId]
    );
    return result.rows;
  }

  // 增加设计浏览次数
  async incrementDesignViews(designId: number) {
    await this.client.query(
      'UPDATE designs SET views = views + 1 WHERE id = $1',
      [designId]
    );
  }
}

// 会员服务
export class MembershipService {
  constructor(private client: Client) {}

  // 定义会员类型
  readonly MEMBERSHIP_TYPES = {
    quarterly: { price: 188, quota: 3, months: 3 },
    half_year: { price: 1068, quota: 6, months: 6 },
    annual: { price: 2016, quota: 12, months: 12 }
  };

  // 购买会员
  async purchaseMembership(userId: number, type: keyof typeof this.MEMBERSHIP_TYPES, transactionId: string) {
    const config = this.MEMBERSHIP_TYPES[type];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + config.months);

    const result = await this.client.query(
      `INSERT INTO memberships (user_id, type, price, quota, start_date, end_date, transaction_id, paid)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       RETURNING *`,
      [userId, type, config.price, config.quota, startDate, endDate, transactionId]
    );

    // 更新用户会员信息
    await this.client.query(
      `UPDATE users
       SET user_type = $1, membership_start_date = $2, membership_end_date = $3, designs_quota = $4, designs_used = 0
       WHERE id = $5`,
      [type, startDate, endDate, config.quota, userId]
    );

    return result.rows[0];
  }

  // 检查会员是否有效
  async isValidMember(userId: number) {
    const result = await this.client.query(
      `SELECT * FROM users
       WHERE id = $1 AND membership_end_date > NOW() AND user_type != 'free'`,
      [userId]
    );
    return result.rows.length > 0;
  }

  // 检查设计配额
  async canCreateDesign(userId: number) {
    const result = await this.client.query(
      `SELECT designs_quota, designs_used FROM users WHERE id = $1`,
      [userId]
    );
    if (result.rows.length === 0) return false;

    const { designs_quota, designs_used } = result.rows[0];
    return designs_used < designs_quota;
  }

  // 增加已使用配额
  async incrementDesignsUsed(userId: number) {
    await this.client.query(
      `UPDATE users SET designs_used = designs_used + 1 WHERE id = $1`,
      [userId]
    );
  }
}

// 订单服务
export class OrderService {
  constructor(private client: Client) {}

  // 创建订单
  async createOrder(userId: number, orderData: any) {
    const { items, totalPrice, paymentMethod } = orderData;
    
    // 创建订单
    const orderResult = await this.client.query(
      `INSERT INTO orders (user_id, total_price, payment_method, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [userId, totalPrice, paymentMethod]
    );
    const order = orderResult.rows[0];

    // 添加订单项
    for (const item of items) {
      await this.client.query(
        `INSERT INTO order_items (order_id, design_id, product_variant_id, quantity, unit_price, design_author_id, commission_rate)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, item.designId, item.productVariantId, item.quantity, item.unitPrice, item.designAuthorId, 0.35]
      );
    }

    return order;
  }

  // 获取用户订单
  async getUserOrders(userId: number) {
    const result = await this.client.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  // 支付订单
  async payOrder(orderId: number, transactionId: string) {
    const result = await this.client.query(
      `UPDATE orders
       SET status = 'paid', transaction_id = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [transactionId, orderId]
    );
    
    // 处理提成
    if (result.rows.length > 0) {
      await this.processCommissions(orderId);
    }

    return result.rows[0];
  }

  // 处理设计作者提成
  private async processCommissions(orderId: number) {
    const itemsResult = await this.client.query(
      `SELECT design_author_id, unit_price, commission_rate
       FROM order_items
       WHERE order_id = $1 AND design_author_id IS NOT NULL`,
      [orderId]
    );

    for (const item of itemsResult.rows) {
      const commission = item.unit_price * item.commission_rate;
      await this.client.query(
        `UPDATE users
         SET total_earnings = total_earnings + $1
         WHERE id = $2`,
        [commission, item.design_author_id]
      );
    }
  }
}

// 推荐服务
export class ReferralService {
  constructor(private client: Client) {}

  // 生成推荐码
  async generateReferralCode(referrerId: number) {
    const code = `REF${referrerId}${Date.now().toString().slice(-6)}`;
    
    const result = await this.client.query(
      `INSERT INTO referrals (referrer_id, referred_user_id, referral_code, status)
       VALUES ($1, $1, $2, 'pending')
       RETURNING referral_code`,
      [referrerId, code]
    );

    return result.rows[0].referral_code;
  }

  // 使用推荐码注册
  async applyReferralCode(referredUserId: number, referralCode: string) {
    const result = await this.client.query(
      `SELECT referrer_id FROM referrals WHERE referral_code = $1 LIMIT 1`,
      [referralCode]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid referral code');
    }

    const referrerId = result.rows[0].referrer_id;

    // 更新推荐记录
    await this.client.query(
      `UPDATE referrals
       SET referred_user_id = $1
       WHERE referral_code = $2`,
      [referredUserId, referralCode]
    );

    // 设置用户推荐人
    await this.client.query(
      `UPDATE users SET referrer_id = $1 WHERE id = $2`,
      [referrerId, referredUserId]
    );
  }

  // 完成推荐提成（用户缴费时调用）
  async completeReferral(referredUserId: number) {
    const userResult = await this.client.query(
      `SELECT referrer_id FROM users WHERE id = $1`,
      [referredUserId]
    );

    if (userResult.rows.length > 0 && userResult.rows[0].referrer_id) {
      const referrerId = userResult.rows[0].referrer_id;
      
      // 更新推荐记录状态
      await this.client.query(
        `UPDATE referrals
         SET status = 'earned'
         WHERE referred_user_id = $1`,
        [referredUserId]
      );

      // 增加推荐人收益
      await this.client.query(
        `UPDATE users
         SET total_earnings = total_earnings + 15
         WHERE id = $1`,
        [referrerId]
      );
    }
  }
}
