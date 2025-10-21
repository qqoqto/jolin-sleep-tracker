const { Client } = require('@line/bot-sdk');
const User = require('../models/User');
const SleepRecord = require('../models/SleepRecord');
const Statistics = require('../models/Statistics');
const { determineBeautyLevel, getCurrentTaiwanTime, formatSleepTime } = require('../utils/beautyLevel');
const { TAIWAN_CITIES, GENDER_LABELS, BEAUTY_LEVEL_LABELS } = require('../utils/constants');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);

class LineService {
  /**
   * 處理文字訊息
   */
  static async handleTextMessage(event) {
    const { replyToken, source, message } = event;
    const userId = source.userId;
    const text = message.text.trim();

    try {
      // 獲取用戶資料
      const profile = await client.getProfile(userId);
      let user = await User.getOrCreate(userId, profile.displayName);

      // 處理指令
      if (text === '打卡' || text === '睡覺' || text.includes('晚安')) {
        return await this.handleCheckIn(replyToken, userId, user);
      } else if (text === '統計' || text === '我的統計') {
        return await this.handleUserStats(replyToken, userId);
      } else if (text === '全台統計') {
        return await this.handleOverallStats(replyToken);
      } else if (text === '設定縣市') {
        return await this.handleSetCity(replyToken);
      } else if (text === '設定性別') {
        return await this.handleSetGender(replyToken);
      } else if (text === '說明' || text === '幫助' || text === 'help') {
        return await this.handleHelp(replyToken);
      } else if (TAIWAN_CITIES.includes(text)) {
        // 設定縣市
        await User.update(userId, { city: text });
        return await this.replyText(replyToken, `已將你的縣市設定為：${text}`);
      } else if (text === '男' || text === '女' || text === '其他') {
        // 設定性別
        const genderMap = { '男': 'male', '女': 'female', '其他': 'other' };
        await User.update(userId, { gender: genderMap[text] });
        return await this.replyText(replyToken, `已將你的性別設定為：${text}`);
      } else {
        return await this.handleHelp(replyToken);
      }
    } catch (error) {
      console.error('處理訊息時發生錯誤:', error);
      return await this.replyText(replyToken, '抱歉，系統發生錯誤，請稍後再試。');
    }
  }

  /**
   * 處理打卡
   */
  static async handleCheckIn(replyToken, userId, user) {
    try {
      // 檢查今天是否已打卡
      const todayRecord = await SleepRecord.getTodayRecord(userId);
      if (todayRecord) {
        const beautyInfo = this.getBeautyInfo(todayRecord.beauty_level);
        return await this.replyText(
          replyToken,
          `你今天已經打卡過了！\n` +
          `打卡時間：${formatSleepTime(todayRecord.sleep_time)}\n` +
          `評價：${beautyInfo.emoji} ${beautyInfo.message}`
        );
      }

      // 獲取當前時間並判定漂亮度
      const sleepTime = getCurrentTaiwanTime();
      const beautyInfo = determineBeautyLevel(sleepTime);

      // 創建打卡記錄
      await SleepRecord.create({
        userId: user.id,
        lineUserId: userId,
        sleepTime: sleepTime,
        beautyLevel: beautyInfo.level,
        city: user.city,
        gender: user.gender
      });

      // 回覆訊息
      let replyMessage = `${beautyInfo.emoji} ${beautyInfo.message}\n\n`;
      replyMessage += `${beautyInfo.description}\n\n`;
      replyMessage += `打卡時間：${formatSleepTime(sleepTime)}\n`;

      if (!user.city || !user.gender) {
        replyMessage += `\n提示：設定「縣市」和「性別」可以查看更詳細的統計喔！`;
      }

      return await this.replyText(replyToken, replyMessage);
    } catch (error) {
      console.error('打卡時發生錯誤:', error);
      return await this.replyText(replyToken, '打卡失敗，請稍後再試。');
    }
  }

  /**
   * 處理個人統計
   */
  static async handleUserStats(replyToken, userId) {
    try {
      const stats = await SleepRecord.getUserStats(userId);
      const history = await SleepRecord.getUserHistory(userId, 5);

      let message = `📊 你的睡眠統計\n\n`;
      message += `總打卡次數：${stats.total_records} 次\n`;
      message += `超級漂亮：${stats.super_beautiful_count} 次\n`;
      message += `普通漂亮：${stats.normal_beautiful_count} 次\n`;
      message += `漂亮再見：${stats.not_beautiful_count} 次\n`;

      if (history.length > 0) {
        message += `\n最近 5 次打卡：\n`;
        history.forEach((record, index) => {
          const beautyInfo = this.getBeautyInfo(record.beauty_level);
          message += `${index + 1}. ${formatSleepTime(record.sleep_time)} - ${beautyInfo.message}\n`;
        });
      }

      return await this.replyText(replyToken, message);
    } catch (error) {
      console.error('查詢統計時發生錯誤:', error);
      return await this.replyText(replyToken, '查詢統計失敗，請稍後再試。');
    }
  }

  /**
   * 處理全台統計
   */
  static async handleOverallStats(replyToken) {
    try {
      const total = await Statistics.getTotalRecords();
      const overallStats = await Statistics.getOverallStats();
      const genderStats = await Statistics.getStatsByGender();
      const mostBeautifulCity = await Statistics.getMostBeautifulCity();

      let message = `📈 全台睡眠統計\n\n`;
      message += `總打卡次數：${total} 次\n\n`;

      message += `整體分布：\n`;
      overallStats.forEach(stat => {
        const label = BEAUTY_LEVEL_LABELS[stat.beauty_level];
        message += `${label}：${stat.count} 次 (${stat.percentage}%)\n`;
      });

      if (genderStats.length > 0) {
        message += `\n性別統計：\n`;
        const grouped = this.groupByGender(genderStats);
        Object.keys(grouped).forEach(gender => {
          message += `\n${GENDER_LABELS[gender]}：\n`;
          grouped[gender].forEach(stat => {
            const label = BEAUTY_LEVEL_LABELS[stat.beauty_level];
            message += `  ${label}：${stat.count} 次 (${stat.percentage}%)\n`;
          });
        });
      }

      if (mostBeautifulCity) {
        message += `\n🏆 最漂亮的縣市：${mostBeautifulCity.city}\n`;
        message += `超級漂亮比例：${mostBeautifulCity.super_percentage}%`;
      }

      return await this.replyText(replyToken, message);
    } catch (error) {
      console.error('查詢全台統計時發生錯誤:', error);
      return await this.replyText(replyToken, '查詢統計失敗，請稍後再試。');
    }
  }

  /**
   * 處理設定縣市
   */
  static async handleSetCity(replyToken) {
    const cities = TAIWAN_CITIES.join('、');
    return await this.replyText(
      replyToken,
      `請直接輸入你的縣市名稱：\n\n${cities}`
    );
  }

  /**
   * 處理設定性別
   */
  static async handleSetGender(replyToken) {
    return await this.replyText(
      replyToken,
      `請直接輸入你的性別：\n男、女、其他`
    );
  }

  /**
   * 處理說明
   */
  static async handleHelp(replyToken) {
    const helpMessage = `🌙 Jolin 睡覺打卡 Bot 使用說明\n\n` +
      `指令列表：\n` +
      `• 打卡 / 睡覺 / 晚安 - 記錄睡覺時間\n` +
      `• 統計 / 我的統計 - 查看個人統計\n` +
      `• 全台統計 - 查看全台數據\n` +
      `• 設定縣市 - 設定你的縣市\n` +
      `• 設定性別 - 設定你的性別\n` +
      `• 說明 / 幫助 - 顯示此說明\n\n` +
      `漂亮度評分標準：\n` +
      `✨ 超級漂亮：18:00-21:30\n` +
      `😊 普通漂亮：21:30-00:00\n` +
      `😴 漂亮再見：00:00-06:00\n\n` +
      `快來打卡，看看你夠不夠漂亮！`;

    return await this.replyText(replyToken, helpMessage);
  }

  /**
   * 回覆文字訊息
   */
  static async replyText(replyToken, text) {
    return client.replyMessage(replyToken, {
      type: 'text',
      text: text
    });
  }

  /**
   * 取得漂亮度資訊
   */
  static getBeautyInfo(level) {
    const beautyMap = {
      'super_beautiful': { message: '超級漂亮！', emoji: '✨💖' },
      'normal_beautiful': { message: '普通漂亮', emoji: '😊💕' },
      'not_beautiful': { message: '漂亮再見', emoji: '😴💔' }
    };
    return beautyMap[level] || beautyMap['not_beautiful'];
  }

  /**
   * 按性別分組統計
   */
  static groupByGender(stats) {
    return stats.reduce((acc, stat) => {
      if (!acc[stat.gender]) {
        acc[stat.gender] = [];
      }
      acc[stat.gender].push(stat);
      return acc;
    }, {});
  }
}

module.exports = LineService;
