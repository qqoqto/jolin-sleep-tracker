# Jolin 睡覺打卡 Line Bot

> 記錄你的睡眠時間，看看你夠不夠漂亮！

靈感來自 Jolin 在網路上分享的睡眠秘訣：每天晚上 9 點 30 分睡覺，保持漂亮。這個 Line Bot 讓你打卡記錄睡覺時間，並根據時間判定你的「漂亮度」，還能查看全台灣的睡眠統計數據。

## 功能特色

- **睡眠打卡**：記錄每天的睡覺時間
- **漂亮度評分**：根據睡眠時間給予評價
  - ✨ 超級漂亮：18:00-21:30
  - 😊 普通漂亮：21:30-00:00
  - 😴 漂亮再見：00:00-06:00
- **個人統計**：查看自己的打卡歷史和統計
- **全台統計**：查看全台使用者的睡眠數據
- **縣市分析**：分縣市統計睡眠習慣
- **性別分析**：比較不同性別的睡眠差異

## 技術架構

- **後端框架**：Node.js + Express
- **Line SDK**：@line/bot-sdk
- **資料庫**：PostgreSQL
- **時區處理**：moment-timezone (Asia/Taipei)

## 專案結構

```
jolin/
├── src/
│   ├── config/          # 配置檔案
│   │   └── database.js  # 資料庫連接設定
│   ├── controllers/     # 控制器
│   │   └── webhookController.js
│   ├── models/          # 資料模型
│   │   ├── User.js
│   │   ├── SleepRecord.js
│   │   └── Statistics.js
│   ├── services/        # 業務邏輯
│   │   └── lineService.js
│   ├── utils/           # 工具函數
│   │   ├── beautyLevel.js
│   │   └── constants.js
│   ├── database/        # 資料庫相關
│   │   ├── schema.sql
│   │   └── migrate.js
│   └── index.js         # 主程式入口
├── .env.example         # 環境變數範例
├── .gitignore
├── package.json
└── README.md
```

## 安裝與設定

### 1. 環境需求

- Node.js >= 16.x
- PostgreSQL >= 12.x
- Line Developer 帳號

### 2. Clone 專案

```bash
git clone <repository-url>
cd jolin
```

### 3. 安裝依賴

```bash
npm install
```

### 4. 設定環境變數

複製 `.env.example` 為 `.env`：

```bash
cp .env.example .env
```

編輯 `.env` 檔案，填入你的設定：

```env
# Line Bot 設定
LINE_CHANNEL_ACCESS_TOKEN=你的_channel_access_token
LINE_CHANNEL_SECRET=你的_channel_secret

# Server 設定
PORT=3000
NODE_ENV=development

# PostgreSQL 設定
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jolin_sleep_tracker
DB_USER=postgres
DB_PASSWORD=你的資料庫密碼

# 時區設定
TIMEZONE=Asia/Taipei
```

### 5. 建立資料庫

首先，在 PostgreSQL 中建立資料庫：

```bash
# 連接到 PostgreSQL
psql -U postgres

# 建立資料庫
CREATE DATABASE jolin_sleep_tracker;

# 退出
\q
```

然後執行資料庫遷移：

```bash
npm run db:migrate
```

### 6. Line Bot 設定

1. 前往 [Line Developers Console](https://developers.line.biz/)
2. 建立新的 Provider 或使用現有的
3. 建立新的 Messaging API Channel
4. 取得 **Channel Secret** 和 **Channel Access Token**
5. 在 Webhook settings 中：
   - 啟用 "Use webhook"
   - 設定 Webhook URL：`https://your-domain.com/webhook`
   - 啟用 "Verify" 並確認設定成功

### 7. 啟動服務

開發模式（自動重啟）：

```bash
npm run dev
```

正式環境：

```bash
npm start
```

## 使用說明

### Bot 指令

| 指令 | 說明 |
|------|------|
| `打卡` / `睡覺` / `晚安` | 記錄睡覺時間 |
| `統計` / `我的統計` | 查看個人統計 |
| `全台統計` | 查看全台數據 |
| `設定縣市` | 設定你的縣市 |
| `設定性別` | 設定你的性別 |
| `說明` / `幫助` / `help` | 顯示使用說明 |

### 使用流程

1. **加入好友**：掃描 QR Code 加入 Bot
2. **設定個人資料**：輸入「設定縣市」和「設定性別」
3. **睡前打卡**：輸入「打卡」記錄睡眠時間
4. **查看統計**：輸入「統計」或「全台統計」查看數據

## 資料庫結構

### users 表

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

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | SERIAL | 主鍵 |
| user_id | INTEGER | 用戶 ID（外鍵） |
| line_user_id | VARCHAR(100) | Line 用戶 ID |
| sleep_time | TIMESTAMP | 睡眠時間 |
| beauty_level | VARCHAR(20) | 漂亮度等級 |
| city | VARCHAR(50) | 縣市（快照） |
| gender | VARCHAR(10) | 性別（快照） |
| created_at | TIMESTAMP | 建立時間 |

### daily_statistics 表

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | SERIAL | 主鍵 |
| date | DATE | 日期 |
| city | VARCHAR(50) | 縣市 |
| gender | VARCHAR(10) | 性別 |
| beauty_level | VARCHAR(20) | 漂亮度等級 |
| count | INTEGER | 計數 |
| created_at | TIMESTAMP | 建立時間 |

## 部署建議

### 使用 Railway / Render / Heroku

1. 連接 GitHub repository
2. 設定環境變數
3. 新增 PostgreSQL Add-on
4. 部署後記得執行 `npm run db:migrate`

### 使用 Docker

```dockerfile
# Dockerfile 範例
FROM node:16

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 開發指南

### 新增功能

1. 在 `src/services/lineService.js` 新增處理函數
2. 在 `handleTextMessage` 中新增指令判斷
3. 如需資料庫操作，在 `src/models/` 新增相應方法

### 測試

使用 Line Bot Designer 或 Line App 直接測試：

1. 確保 Webhook URL 可從外部訪問（使用 ngrok 等工具）
2. 在 Line Developers Console 測試 Webhook
3. 加入 Bot 好友後直接對話測試

### 除錯

查看 console 輸出：

```bash
npm run dev
```

檢查資料庫記錄：

```bash
psql -U postgres -d jolin_sleep_tracker
SELECT * FROM sleep_records ORDER BY created_at DESC LIMIT 10;
```

## 常見問題

### Q: Webhook 驗證失敗？

A: 確認：
1. Webhook URL 正確且可從外部訪問
2. LINE_CHANNEL_SECRET 設定正確
3. 伺服器正在運行

### Q: 資料庫連接失敗？

A: 確認：
1. PostgreSQL 服務正在運行
2. .env 中的資料庫設定正確
3. 資料庫已建立（`jolin_sleep_tracker`）

### Q: 打卡後沒有回應？

A: 檢查：
1. Console 是否有錯誤訊息
2. 資料庫是否正確寫入
3. Line Bot 的回覆訊息權限是否開啟

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 致謝

- 感謝 Jolin 的睡眠秘訣分享
- Line Messaging API 文件
- 所有貢獻者

---

**免責聲明**：本專案僅供娛樂和學習用途，與 Jolin 本人無關。
