# Jolin 睡覺打卡 Line Bot - 專案總覽

## 專案簡介

這是一個 Line Bot 應用程式，靈感來自 Jolin 分享的睡眠秘訣（晚上 9:30 睡覺保持漂亮）。用戶可以打卡記錄睡覺時間，系統會根據時間評價「漂亮度」，並提供統計分析功能。

## 核心功能

### 1. 睡眠打卡
- 用戶輸入「打卡」、「睡覺」或「晚安」記錄當前時間
- 系統自動判定漂亮度等級
- 每日限制一次打卡

### 2. 漂亮度評分標準（根據用戶需求定義）
- **超級漂亮** (18:00-21:30): 與 Jolin 睡眠時間接近，最健康
- **普通漂亮** (21:30-00:00): 還算正常的睡眠時間
- **漂亮再見** (00:00-06:00 & 其他時間): 熬夜或作息不正常

### 3. 個人統計
- 總打卡次數
- 各漂亮度等級的次數統計
- 最近 5 次打卡記錄

### 4. 全台統計
- 全台用戶的整體分布
- 按性別分析
- 按縣市分析
- 最漂亮的縣市排名

### 5. 用戶資料管理
- 設定縣市
- 設定性別
- 用於後續統計分析

## 技術架構

### 後端技術棧
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Line SDK**: @line/bot-sdk 9.3.0
- **Database**: PostgreSQL
- **Time Handling**: moment-timezone (Asia/Taipei)

### 專案結構

```
jolin/
├── src/
│   ├── config/
│   │   └── database.js          # PostgreSQL 連接池設定
│   ├── controllers/
│   │   └── webhookController.js # Line Webhook 控制器
│   ├── models/
│   │   ├── User.js              # 用戶資料模型
│   │   ├── SleepRecord.js       # 睡眠記錄模型
│   │   └── Statistics.js        # 統計查詢模型
│   ├── services/
│   │   └── lineService.js       # Line Bot 業務邏輯
│   ├── utils/
│   │   ├── beautyLevel.js       # 漂亮度判定邏輯
│   │   └── constants.js         # 常數定義
│   ├── database/
│   │   ├── schema.sql           # 資料庫結構定義
│   │   └── migrate.js           # 資料庫遷移腳本
│   └── index.js                 # 應用程式入口
├── check-setup.js               # 環境檢查腳本
├── .env.example                 # 環境變數範例
├── package.json                 # 專案設定
├── README.md                    # 完整文件
└── SETUP.md                     # 快速啟動指南
```

## 資料庫設計

### users 表
用於儲存 Line 用戶的基本資料

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | SERIAL | 主鍵 |
| line_user_id | VARCHAR(100) | Line 用戶 ID（唯一） |
| display_name | VARCHAR(255) | 顯示名稱 |
| gender | VARCHAR(10) | 性別 (male/female/other) |
| city | VARCHAR(50) | 縣市 |
| created_at | TIMESTAMP | 建立時間 |
| updated_at | TIMESTAMP | 更新時間 |

### sleep_records 表
用於儲存每次打卡記錄

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | SERIAL | 主鍵 |
| user_id | INTEGER | 用戶 ID（外鍵） |
| line_user_id | VARCHAR(100) | Line 用戶 ID |
| sleep_time | TIMESTAMP | 睡眠時間 |
| beauty_level | VARCHAR(20) | 漂亮度等級 |
| city | VARCHAR(50) | 縣市（快照，用於統計） |
| gender | VARCHAR(10) | 性別（快照，用於統計） |
| created_at | TIMESTAMP | 建立時間 |

**設計考量**：
- `city` 和 `gender` 在 sleep_records 中保留快照，避免用戶修改個人資料後影響歷史統計
- 使用索引優化常用查詢（時間、縣市、性別、漂亮度）

### daily_statistics 表
用於預先計算的每日統計（未來擴充）

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | SERIAL | 主鍵 |
| date | DATE | 日期 |
| city | VARCHAR(50) | 縣市 |
| gender | VARCHAR(10) | 性別 |
| beauty_level | VARCHAR(20) | 漂亮度等級 |
| count | INTEGER | 計數 |
| created_at | TIMESTAMP | 建立時間 |

## 核心邏輯

### 漂亮度判定算法
位置：`src/utils/beautyLevel.js`

```javascript
function determineBeautyLevel(sleepTime) {
  const time = moment(sleepTime).tz('Asia/Taipei');
  const hour = time.hour();
  const minute = time.minute();
  const totalMinutes = hour * 60 + minute;

  // 超級漂亮：18:00 (1080分) - 21:30 (1290分)
  if (totalMinutes >= 1080 && totalMinutes < 1290) {
    return 'super_beautiful';
  }

  // 普通漂亮：21:30 (1290分) - 23:59 (1439分)
  if (totalMinutes >= 1290 && totalMinutes <= 1439) {
    return 'normal_beautiful';
  }

  // 漂亮再見：其他時間
  return 'not_beautiful';
}
```

### Line Bot 訊息流程

1. **接收訊息**
   - Line Platform → Webhook → `webhookController.js`
   - 驗證請求簽章（Line SDK middleware）

2. **路由處理**
   - `lineService.js` 的 `handleTextMessage` 根據指令路由

3. **業務邏輯**
   - 打卡：檢查今日是否已打卡 → 判定漂亮度 → 寫入資料庫 → 回覆結果
   - 統計：查詢資料庫 → 格式化數據 → 回覆訊息

4. **回應用戶**
   - 使用 Line SDK 的 `replyMessage` API

## Bot 指令清單

| 指令 | 功能 | 實作位置 |
|------|------|---------|
| 打卡 / 睡覺 / 晚安 | 記錄睡眠時間 | `lineService.js:handleCheckIn` |
| 統計 / 我的統計 | 查看個人統計 | `lineService.js:handleUserStats` |
| 全台統計 | 查看全台數據 | `lineService.js:handleOverallStats` |
| 設定縣市 | 顯示縣市列表 | `lineService.js:handleSetCity` |
| 設定性別 | 顯示性別選項 | `lineService.js:handleSetGender` |
| 說明 / 幫助 / help | 顯示使用說明 | `lineService.js:handleHelp` |
| (縣市名稱) | 設定用戶縣市 | `User.update` |
| 男 / 女 / 其他 | 設定用戶性別 | `User.update` |

## 環境變數說明

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| LINE_CHANNEL_ACCESS_TOKEN | Line Bot Channel Access Token | (從 Line Developers Console 取得) |
| LINE_CHANNEL_SECRET | Line Bot Channel Secret | (從 Line Developers Console 取得) |
| PORT | 伺服器埠號 | 3000 |
| NODE_ENV | 運行環境 | development / production |
| DB_HOST | PostgreSQL 主機位址 | localhost |
| DB_PORT | PostgreSQL 埠號 | 5432 |
| DB_NAME | 資料庫名稱 | jolin_sleep_tracker |
| DB_USER | 資料庫用戶名稱 | postgres |
| DB_PASSWORD | 資料庫密碼 | (你的密碼) |
| TIMEZONE | 時區設定 | Asia/Taipei |

## NPM 腳本

```bash
npm start          # 啟動正式環境伺服器
npm run dev        # 啟動開發環境（自動重啟）
npm run db:migrate # 執行資料庫遷移
npm run check      # 檢查環境設定
```

## API 端點

| 端點 | 方法 | 說明 |
|------|------|------|
| `/` | GET | 健康檢查（顯示歡迎訊息） |
| `/health` | GET | 健康檢查（JSON 格式） |
| `/webhook` | POST | Line Bot Webhook（需要 Line 簽章） |

## 安全性考量

1. **環境變數保護**
   - 敏感資訊（Token、密碼）儲存在 `.env`
   - `.env` 加入 `.gitignore` 避免提交到版本控制

2. **Line Webhook 驗證**
   - 使用 Line SDK middleware 驗證請求簽章
   - 防止偽造的 webhook 請求

3. **資料庫安全**
   - 使用參數化查詢防止 SQL Injection
   - 適當的索引和權限設定

4. **錯誤處理**
   - Try-catch 包裹關鍵邏輯
   - 避免洩漏敏感錯誤訊息給用戶

## 效能優化

1. **資料庫索引**
   - 在常用查詢欄位建立索引（line_user_id, sleep_time, city, gender）

2. **連接池管理**
   - 使用 pg Pool 管理資料庫連接
   - 設定適當的 max connections

3. **快取策略（未來可加入）**
   - Redis 快取熱門統計數據
   - 減少資料庫查詢壓力

## 未來擴充方向

### 短期
- [ ] 加入 Rich Menu 提供更好的操作介面
- [ ] 實作 Flex Message 美化統計報表
- [ ] 加入每週/每月統計報表
- [ ] 加入個人排行榜（連續打卡天數）

### 中期
- [ ] 定時提醒功能（提醒用戶該睡覺了）
- [ ] 朋友互相監督功能
- [ ] 成就系統（徽章、稱號）
- [ ] 匯出個人睡眠報告（PDF/圖表）

### 長期
- [ ] 建立網頁版儀表板
- [ ] 加入睡眠品質追蹤
- [ ] AI 個人化睡眠建議
- [ ] 與智慧手環/手錶整合

## 部署建議

### 推薦平台
1. **Railway** - 最簡單，有免費額度
2. **Render** - 免費方案，自動部署
3. **Heroku** - 老牌穩定，但免費方案已取消
4. **VPS** - 完全控制，需自行維護

### 部署檢查清單
- [ ] 設定所有環境變數
- [ ] 執行資料庫遷移
- [ ] 更新 Line Webhook URL
- [ ] 測試所有功能
- [ ] 設定監控和日誌
- [ ] 設定自動備份（資料庫）

## 常見問題

### 為什麼選擇 PostgreSQL 而不是 MongoDB？
- 需要複雜的統計查詢（GROUP BY, JOIN）
- 資料結構相對固定
- 需要 ACID 保證

### 時區如何處理？
- 所有時間都使用 `moment-timezone` 轉換為 `Asia/Taipei`
- 資料庫儲存 `TIMESTAMP WITH TIME ZONE`
- 判定邏輯基於台北時間

### 如何防止用戶一天打卡多次？
- `SleepRecord.getTodayRecord` 檢查當日是否已有記錄
- 使用台北時區的日期比對

### 如果用戶修改縣市或性別，歷史記錄會受影響嗎？
- 不會，sleep_records 保留打卡當下的 city 和 gender 快照
- users 表的修改只影響未來的打卡記錄

## 授權與貢獻

- **授權**: MIT License
- **貢獻**: 歡迎提交 Issue 和 Pull Request

## 聯絡資訊

- **問題回報**: GitHub Issues
- **功能建議**: GitHub Discussions
- **技術支援**: 參考 SETUP.md 的故障排除章節

---

**免責聲明**: 本專案僅供娛樂和學習用途，與 Jolin 蔡依林本人無關。
