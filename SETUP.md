# 快速啟動指南

## 第一次使用請按照以下步驟操作

### 1. 建立 .env 檔案

```bash
cp .env.example .env
```

然後編輯 `.env` 檔案，填入你的設定。

### 2. 設定 Line Bot

#### 2.1 前往 Line Developers Console
https://developers.line.biz/console/

#### 2.2 建立 Provider
- 點選 "Create" 建立新的 Provider
- 輸入 Provider name（例如：My Company）

#### 2.3 建立 Messaging API Channel
- 在 Provider 頁面點選 "Create a Messaging API channel"
- 填寫以下資訊：
  - Channel name: Jolin 睡覺打卡
  - Channel description: 記錄睡眠時間的 Line Bot
  - Category: 選擇適當的分類
  - Subcategory: 選擇適當的子分類
- 同意條款後點選 "Create"

#### 2.4 取得認證資訊

在 Channel 設定頁面：

**Channel Secret:**
- 在 "Basic settings" 頁籤
- 複製 "Channel secret"
- 貼到 `.env` 的 `LINE_CHANNEL_SECRET`

**Channel Access Token:**
- 在 "Messaging API" 頁籤
- 找到 "Channel access token"
- 點選 "Issue" 產生 token
- 複製 token
- 貼到 `.env` 的 `LINE_CHANNEL_ACCESS_TOKEN`

#### 2.5 設定 Bot 基本資訊
- 在 "Messaging API" 頁籤
- 設定 Bot 圖片和顯示名稱
- **停用** "Auto-reply messages"（自動回覆訊息）
- **停用** "Greeting messages"（問候訊息）

### 3. 設定 PostgreSQL

#### 3.1 安裝 PostgreSQL
- Windows: https://www.postgresql.org/download/windows/
- macOS: `brew install postgresql`
- Linux: `sudo apt-get install postgresql`

#### 3.2 建立資料庫

```bash
# 啟動 PostgreSQL
# Windows: 服務會自動啟動
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql

# 連接到 PostgreSQL
psql -U postgres

# 建立資料庫
CREATE DATABASE jolin_sleep_tracker;

# 建立用戶（可選）
CREATE USER jolin_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE jolin_sleep_tracker TO jolin_user;

# 退出
\q
```

#### 3.3 執行資料庫遷移

```bash
npm run db:migrate
```

如果成功，你會看到訊息：「資料庫遷移完成！」

### 4. 啟動伺服器

#### 4.1 開發環境

```bash
npm run dev
```

#### 4.2 正式環境

```bash
npm start
```

### 5. 設定 Webhook（本地開發）

本地開發時，需要讓 Line 能夠訪問你的 localhost，推薦使用 ngrok：

#### 5.1 安裝 ngrok
https://ngrok.com/download

#### 5.2 啟動 ngrok

```bash
ngrok http 3000
```

你會看到類似這樣的輸出：

```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

#### 5.3 設定 Webhook URL

1. 複製 ngrok 提供的 https URL
2. 前往 Line Developers Console
3. 進入你的 Channel > Messaging API 頁籤
4. 找到 "Webhook settings"
5. 點選 "Edit"
6. 輸入：`https://your-ngrok-url.ngrok.io/webhook`
7. 點選 "Update"
8. 啟用 "Use webhook"
9. 點選 "Verify" 測試連接

如果看到 "Success"，表示設定成功！

### 6. 加入 Bot 好友並測試

1. 在 Line Developers Console 的 "Messaging API" 頁籤
2. 掃描 QR Code 加入 Bot 好友
3. 傳送「說明」查看使用說明
4. 傳送「打卡」測試功能

## 常見問題排解

### Webhook 驗證失敗

**檢查清單：**
- [ ] ngrok 是否正在運行
- [ ] Node.js 伺服器是否正在運行
- [ ] Webhook URL 是否正確（記得加 `/webhook`）
- [ ] `.env` 中的 `LINE_CHANNEL_SECRET` 是否正確

### 資料庫連接失敗

**檢查清單：**
- [ ] PostgreSQL 服務是否正在運行
- [ ] `.env` 中的資料庫設定是否正確
- [ ] 資料庫 `jolin_sleep_tracker` 是否已建立
- [ ] 資料庫密碼是否正確

### Bot 沒有回應

**檢查清單：**
- [ ] Webhook 是否設定成功
- [ ] 查看 console 是否有錯誤訊息
- [ ] Line Bot 的自動回覆是否已停用
- [ ] Channel Access Token 是否正確

### 查看 Log

伺服器啟動後，所有訊息都會在 console 中顯示，包括：
- 收到的事件類型
- 錯誤訊息
- 資料庫查詢

## 部署到正式環境

### 推薦平台

1. **Railway** (推薦新手)
   - 提供免費額度
   - 自動偵測 Node.js
   - 內建 PostgreSQL
   - 網址：https://railway.app

2. **Render**
   - 免費方案
   - 簡單部署
   - 支援 PostgreSQL
   - 網址：https://render.com

3. **Heroku**
   - 老牌 PaaS
   - 豐富的 Add-ons
   - 網址：https://heroku.com

### Railway 部署步驟

1. 註冊 Railway 帳號
2. 點選 "New Project" > "Deploy from GitHub repo"
3. 選擇你的 repository
4. 新增 PostgreSQL database
5. 設定環境變數（從 .env 複製）
6. 部署完成後，取得公開 URL
7. 在 Line Developers Console 更新 Webhook URL

### 部署後記得

- [ ] 執行資料庫遷移（Railway 可在設定中加入 `npm run db:migrate`）
- [ ] 更新 Line Webhook URL 為正式環境的 URL
- [ ] 測試所有功能
- [ ] 監控錯誤日誌

## 下一步

- 新增更多統計圖表
- 加入 Rich Menu
- 實作提醒功能
- 加入排行榜

祝你打卡愉快，每天都超級漂亮！✨
