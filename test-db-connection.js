require('dotenv').config();
const { Client } = require('pg');

console.log('🔍 測試 Supabase 資料庫連接...\n');

console.log('連接資訊：');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);
console.log('Password:', process.env.DB_PASSWORD ? '已設定' : '未設定');
console.log('\n開始連接...\n');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  },
  // 強制使用 IPv4
  family: 4
});

client.connect((err) => {
  if (err) {
    console.error('❌ 連接失敗:', err.message);
    console.error('\n完整錯誤:', err);
    process.exit(1);
  }

  console.log('✅ 連接成功！');

  client.query('SELECT version()', (err, result) => {
    if (err) {
      console.error('❌ 查詢失敗:', err.message);
    } else {
      console.log('✅ PostgreSQL 版本:', result.rows[0].version);
    }

    client.end();
    process.exit(0);
  });
});
