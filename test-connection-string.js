const { Client } = require('pg');

// 使用完整的連接字串
const connectionString = 'postgresql://postgres.ckpavzaeuidllykuwsqw:JolinSleep2024!@#@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

console.log('🔍 使用連接字串測試...\n');
console.log('連接字串:', connectionString.replace(/:([^@]+)@/, ':***@'), '\n');

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
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
