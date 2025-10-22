const { Pool } = require('pg');
require('dotenv').config();

// 解析 DATABASE_URL 或使用個別環境變數
let config;

if (process.env.DATABASE_URL) {
  // 手動解析 DATABASE_URL
  // 格式: postgresql://user:password@host:port/database
  try {
    const url = new URL(process.env.DATABASE_URL);
    config = {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1), // 移除開頭的 '/'
      user: url.username,
      password: decodeURIComponent(url.password),
      ssl: { rejectUnauthorized: false },
    };
  } catch (error) {
    console.error('無法解析 DATABASE_URL:', error);
    throw error;
  }
} else {
  // 使用個別環境變數
  config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'jolin_sleep_tracker',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
}

const pool = new Pool({
  ...config,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// 測試連線並記錄資訊
pool.connect((err, client, release) => {
  if (err) {
    console.error('資料庫連線失敗:', err);
  } else {
    console.log('✅ 資料庫連線成功!');
    console.log('📊 連線資訊:', {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user
    });
    release();
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
