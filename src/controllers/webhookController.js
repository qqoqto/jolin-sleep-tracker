const { middleware } = require('@line/bot-sdk');
const LineService = require('../services/lineService');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

/**
 * Webhook 處理函數
 */
async function handleWebhook(req, res) {
  const events = req.body.events;

  console.log('📨 收到 Webhook 請求，事件數量:', events.length);

  try {
    await Promise.all(
      events.map(async (event) => {
        console.log('📩 事件類型:', event.type);

        if (event.type === 'message' && event.message.type === 'text') {
          console.log('💬 收到文字訊息:', event.message.text);
          return await LineService.handleTextMessage(event);
        }

        if (event.type === 'follow') {
          console.log('👋 新用戶加入好友');
          // 用戶加入好友時的歡迎訊息
          return await LineService.handleHelp(event.replyToken);
        }

        console.log('⚠️ 未處理的事件類型:', event.type);
        return null;
      })
    );

    console.log('✅ Webhook 處理完成');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook 處理錯誤:', error);
    console.error('錯誤堆疊:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  lineMiddleware: middleware(config),
  handleWebhook
};
