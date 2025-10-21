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

  try {
    await Promise.all(
      events.map(async (event) => {
        console.log('收到事件:', event.type);

        if (event.type === 'message' && event.message.type === 'text') {
          return await LineService.handleTextMessage(event);
        }

        if (event.type === 'follow') {
          // 用戶加入好友時的歡迎訊息
          return await LineService.handleHelp(event.replyToken);
        }

        return null;
      })
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook 處理錯誤:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  lineMiddleware: middleware(config),
  handleWebhook
};
