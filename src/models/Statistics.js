const pool = require('../config/database');

class Statistics {
  /**
   * 獲取全台統計數據
   */
  static async getOverallStats() {
    const query = `
      SELECT
        beauty_level,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM sleep_records
      GROUP BY beauty_level
      ORDER BY count DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * 按縣市統計
   */
  static async getStatsByCity() {
    const query = `
      SELECT
        city,
        beauty_level,
        COUNT(*) as count
      FROM sleep_records
      WHERE city IS NOT NULL
      GROUP BY city, beauty_level
      ORDER BY city, count DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * 按性別統計
   */
  static async getStatsByGender() {
    const query = `
      SELECT
        gender,
        beauty_level,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY gender), 2) as percentage
      FROM sleep_records
      WHERE gender IS NOT NULL
      GROUP BY gender, beauty_level
      ORDER BY gender, count DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * 獲取特定縣市的統計
   */
  static async getCityStats(city) {
    const query = `
      SELECT
        beauty_level,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM sleep_records
      WHERE city = $1
      GROUP BY beauty_level
      ORDER BY count DESC
    `;

    const result = await pool.query(query, [city]);
    return result.rows;
  }

  /**
   * 獲取總打卡次數
   */
  static async getTotalRecords() {
    const query = 'SELECT COUNT(*) as total FROM sleep_records';
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }

  /**
   * 獲取最漂亮的縣市 (超級漂亮比例最高)
   */
  static async getMostBeautifulCity() {
    const query = `
      SELECT
        city,
        COUNT(CASE WHEN beauty_level = 'super_beautiful' THEN 1 END) as super_count,
        COUNT(*) as total,
        ROUND(
          COUNT(CASE WHEN beauty_level = 'super_beautiful' THEN 1 END) * 100.0 / COUNT(*),
          2
        ) as super_percentage
      FROM sleep_records
      WHERE city IS NOT NULL
      GROUP BY city
      HAVING COUNT(*) >= 10
      ORDER BY super_percentage DESC, total DESC
      LIMIT 1
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = Statistics;
