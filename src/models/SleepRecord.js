const pool = require('../config/database');

class SleepRecord {
  /**
   * 創建睡眠打卡記錄
   */
  static async create(data) {
    const query = `
      INSERT INTO sleep_records (
        user_id, line_user_id, sleep_time, beauty_level, city, gender
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      data.userId,
      data.lineUserId,
      data.sleepTime,
      data.beautyLevel,
      data.city,
      data.gender
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * 獲取用戶今日是否已打卡
   */
  static async getTodayRecord(lineUserId) {
    const query = `
      SELECT * FROM sleep_records
      WHERE line_user_id = $1
        AND DATE(sleep_time AT TIME ZONE 'Asia/Taipei') = CURRENT_DATE
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [lineUserId]);
    return result.rows[0];
  }

  /**
   * 獲取用戶的打卡歷史
   */
  static async getUserHistory(lineUserId, limit = 10) {
    const query = `
      SELECT * FROM sleep_records
      WHERE line_user_id = $1
      ORDER BY sleep_time DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [lineUserId, limit]);
    return result.rows;
  }

  /**
   * 獲取用戶統計
   */
  static async getUserStats(lineUserId) {
    const query = `
      SELECT
        COUNT(*) as total_records,
        COUNT(CASE WHEN beauty_level = 'super_beautiful' THEN 1 END) as super_beautiful_count,
        COUNT(CASE WHEN beauty_level = 'normal_beautiful' THEN 1 END) as normal_beautiful_count,
        COUNT(CASE WHEN beauty_level = 'not_beautiful' THEN 1 END) as not_beautiful_count
      FROM sleep_records
      WHERE line_user_id = $1
    `;

    const result = await pool.query(query, [lineUserId]);
    return result.rows[0];
  }
}

module.exports = SleepRecord;
