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
    process.exit(1);
  }
}

migrate();
