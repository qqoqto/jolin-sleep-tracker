require('dotenv').config();
const express = require('express');
const { lineMiddleware, handleWebhook } = require('./controllers/webhookController');

const app = express();
const PORT = process.env.PORT || 3000;

// 健康檢查端點
app.get('/', (req, res) => {
  res.send('Jolin 睡覺打卡 Line Bot is running!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Line Bot Webhook 端點
app.post('/webhook', lineMiddleware, handleWebhook);

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('伺服器錯誤:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`\n請確保：`);
  console.log(`1. 已設定 .env 檔案中的 LINE_CHANNEL_ACCESS_TOKEN 和 LINE_CHANNEL_SECRET`);
  console.log(`2. 已執行 npm run db:migrate 建立資料庫結構`);
  console.log(`3. PostgreSQL 資料庫正在運行`);
  console.log(`4. 在 Line Developers Console 設定 Webhook URL`);
});

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信號，正在關閉伺服器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信號，正在關閉伺服器...');
  process.exit(0);
});
