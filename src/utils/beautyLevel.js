const moment = require('moment-timezone');

/**
 * 判定睡覺時間的漂亮度
 * 根據用戶提供的時間區間：
 * - 超級漂亮：18:00-21:30
 * - 普通漂亮：21:30-00:00
 * - 漂亮再見：00:00-06:00
 */
function determineBeautyLevel(sleepTime) {
  const time = moment(sleepTime).tz('Asia/Taipei');
  const hour = time.hour();
  const minute = time.minute();
  const totalMinutes = hour * 60 + minute;

  // 超級漂亮：18:00 (1080分) - 21:30 (1290分)
  if (totalMinutes >= 1080 && totalMinutes < 1290) {
    return {
      level: 'super_beautiful',
      message: '超級漂亮！',
      description: '你跟 Jolin 一樣早睡，皮膚一定水嫩嫩！',
      emoji: '✨💖'
    };
  }

  // 普通漂亮：21:30 (1290分) - 23:59 (1439分)
  if (totalMinutes >= 1290 && totalMinutes <= 1439) {
    return {
      level: 'normal_beautiful',
      message: '普通漂亮',
      description: '還不錯喔，繼續保持！',
      emoji: '😊💕'
    };
  }

  // 漂亮再見：00:00 (0分) - 06:00 (360分)
  if (totalMinutes >= 0 && totalMinutes < 360) {
    return {
      level: 'not_beautiful',
      message: '漂亮再見',
      description: '都半夜了還不睡，Jolin 都睡醒了你還在熬夜！',
      emoji: '😴💔'
    };
  }

  // 其他時間 (06:00 - 18:00)
  return {
    level: 'not_beautiful',
    message: '漂亮再見',
    description: '這個時間才睡？你是日夜顛倒了嗎？',
    emoji: '🙈'
  };
}

/**
 * 格式化睡眠時間
 */
function formatSleepTime(sleepTime) {
  return moment(sleepTime).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 獲取當前台灣時間
 */
function getCurrentTaiwanTime() {
  return moment().tz('Asia/Taipei').toDate();
}

module.exports = {
  determineBeautyLevel,
  formatSleepTime,
  getCurrentTaiwanTime
};
