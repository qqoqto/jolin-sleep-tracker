#!/usr/bin/env node

/**
 * 設定檢查腳本
 * 用於驗證 Jolin 睡覺打卡 Line Bot 的環境設定
 */

require('dotenv').config();
const { Pool } = require('pg');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function logSuccess(message) {
  console.log('✅', message);
  checks.passed++;
}

function logError(message) {
  console.log('❌', message);
  checks.failed++;
}

function logWarning(message) {
  console.log('⚠️ ', message);
  checks.warnings++;
}

function logInfo(message) {
  console.log('ℹ️ ', message);
}

console.log('\n🔍 開始檢查環境設定...\n');

// 1. 檢查 Node.js 版本
console.log('【Node.js 版本】');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion >= 16) {
  logSuccess(`Node.js 版本: ${nodeVersion}`);
} else {
  logError(`Node.js 版本過舊: ${nodeVersion}（需要 >= 16.x）`);
}

// 2. 檢查環境變數
console.log('\n【環境變數】');

const requiredEnvVars = [
  'LINE_CHANNEL_ACCESS_TOKEN',
  'LINE_CHANNEL_SECRET',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD'
];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    if (varName.includes('TOKEN') || varName.includes('SECRET') || varName.includes('PASSWORD')) {
      const masked = process.env[varName].substring(0, 4) + '***';
      logSuccess(`${varName}: ${masked}`);
    } else {
      logSuccess(`${varName}: ${process.env[varName]}`);
    }
  } else {
    logError(`${varName}: 未設定`);
  }
});

// 3. 檢查資料庫連接
console.log('\n【資料庫連接】');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'jolin_sleep_tracker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function checkDatabase() {
  try {
    // 測試連接
    const client = await pool.connect();
    logSuccess('PostgreSQL 連接成功');

    // 檢查資料庫是否存在
    const dbResult = await client.query(
      "SELECT datname FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'jolin_sleep_tracker']
    );

    if (dbResult.rows.length > 0) {
      logSuccess(`資料庫「${process.env.DB_NAME}」存在`);
    } else {
      logError(`資料庫「${process.env.DB_NAME}」不存在`);
    }

    // 檢查資料表
    const tables = ['users', 'sleep_records', 'daily_statistics'];
    for (const table of tables) {
      const tableResult = await client.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = $1
        )`,
        [table]
      );

      if (tableResult.rows[0].exists) {
        logSuccess(`資料表「${table}」存在`);

        // 檢查記錄數
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        logInfo(`  └─ 記錄數: ${countResult.rows[0].count}`);
      } else {
        logWarning(`資料表「${table}」不存在（請執行 npm run db:migrate）`);
      }
    }

    client.release();
  } catch (error) {
    logError(`資料庫連接失敗: ${error.message}`);
  } finally {
    await pool.end();
  }
}

// 4. 檢查必要的套件
console.log('\n【必要套件】');

const requiredPackages = [
  '@line/bot-sdk',
  'express',
  'pg',
  'dotenv',
  'moment-timezone'
];

requiredPackages.forEach(packageName => {
  try {
    require.resolve(packageName);
    logSuccess(`${packageName} 已安裝`);
  } catch (e) {
    logError(`${packageName} 未安裝`);
  }
});

// 執行非同步檢查
checkDatabase().then(() => {
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 檢查結果：');
  console.log(`✅ 通過: ${checks.passed}`);
  console.log(`❌ 失敗: ${checks.failed}`);
  console.log(`⚠️  警告: ${checks.warnings}`);

  if (checks.failed === 0 && checks.warnings === 0) {
    console.log('\n🎉 所有檢查都通過了！你可以開始使用 Bot 了。');
    console.log('\n下一步：');
    console.log('1. 執行 npm run dev 啟動開發伺服器');
    console.log('2. 使用 ngrok 取得公開 URL');
    console.log('3. 在 Line Developers Console 設定 Webhook');
    console.log('4. 掃描 QR Code 加入 Bot 好友');
  } else if (checks.failed === 0) {
    console.log('\n⚠️  有一些警告，但應該不影響基本功能。');
    console.log('建議檢查警告項目並修正。');
  } else {
    console.log('\n❌ 有錯誤需要修正，請檢查上方的錯誤訊息。');
    console.log('\n常見問題：');
    console.log('• 環境變數未設定 → 複製 .env.example 為 .env 並填入設定');
    console.log('• 資料庫連接失敗 → 確認 PostgreSQL 正在運行且設定正確');
    console.log('• 資料表不存在 → 執行 npm run db:migrate');
    console.log('• 套件未安裝 → 執行 npm install');
  }

  console.log('\n');
  process.exit(checks.failed > 0 ? 1 : 0);
});
