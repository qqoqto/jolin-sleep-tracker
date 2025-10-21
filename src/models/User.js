const pool = require('../config/database');

class User {
  /**
   * 根據 Line User ID 查找用戶
   */
  static async findByLineUserId(lineUserId) {
    const query = 'SELECT * FROM users WHERE line_user_id = $1';
    const result = await pool.query(query, [lineUserId]);
    return result.rows[0];
  }

  /**
   * 創建新用戶
   */
  static async create(lineUserId, displayName) {
    const query = `
      INSERT INTO users (line_user_id, display_name)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await pool.query(query, [lineUserId, displayName]);
    return result.rows[0];
  }

  /**
   * 更新用戶資料
   */
  static async update(lineUserId, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.gender) {
      fields.push(`gender = $${paramCount++}`);
      values.push(data.gender);
    }
    if (data.city) {
      fields.push(`city = $${paramCount++}`);
      values.push(data.city);
    }
    if (data.displayName) {
      fields.push(`display_name = $${paramCount++}`);
      values.push(data.displayName);
    }

    if (fields.length === 0) return null;

    values.push(lineUserId);
    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE line_user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * 取得或創建用戶
   */
  static async getOrCreate(lineUserId, displayName) {
    let user = await this.findByLineUserId(lineUserId);
    if (!user) {
      user = await this.create(lineUserId, displayName);
    }
    return user;
  }
}

module.exports = User;
