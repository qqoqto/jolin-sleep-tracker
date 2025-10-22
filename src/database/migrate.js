const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function migrate() {
  try {
    console.log('開始執行資料庫遷移...');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(schema);

    console.log('資料庫遷移完成！');
    process.exit(0);
  } catch (error) {
    console.error('資料庫遷移失敗:', error);
    // 如果是 trigger 已存在的錯誤，視為成功（表示已經遷移過了）
    if (error.code === '42710') {
      console.log('資料庫結構已存在，跳過遷移。');
      process.exit(0);
    }
    process.exit(1);
  }
}

migrate();
