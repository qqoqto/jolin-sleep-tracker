# 快速啟動 - 5 分鐘開始使用

## 前置準備

確保你已經安裝：
- Node.js 16+
- PostgreSQL 12+
- 已建立 Line Bot（如果還沒有，請參考 SETUP.md）

## 開始使用

### 1️⃣ 安裝依賴（已完成）

```bash
npm install
```

✅ 這一步已經完成了！

### 2️⃣ 設定環境變數

```bash
# 複製環境變數範例檔案
cp .env.example .env
```

然後編輯 `.env` 檔案，填入你的設定：

```env
LINE_CHANNEL_ACCESS_TOKEN=你的Token
LINE_CHANNEL_SECRET=你的Secret
DB_PASSWORD=你的PostgreSQL密碼
```

### 3️⃣ 建立資料庫

```bash
# 連接到 PostgreSQL
psql -U postgres

# 在 psql 中執行
CREATE DATABASE jolin_sleep_tracker;
\q
```

### 4️⃣ 執行資料庫遷移

```bash
npm run db:migrate
```

### 5️⃣ 檢查設定

```bash
npm run check
```

如果看到 "所有檢查都通過了"，表示設定成功！

### 6️⃣ 啟動伺服器

```bash
npm run dev
```

### 7️⃣ 設定 Webhook（本地開發）

開啟新的終端機視窗：

```bash
# 安裝 ngrok (如果還沒安裝)
# 下載：https://ngrok.com/download

# 啟動 ngrok
ngrok http 3000
```

複製 ngrok 提供的 https URL（例如：`https://abc123.ngrok.io`）

前往 [Line Developers Console](https://developers.line.biz/console/)：
1. 選擇你的 Channel
2. 進入 Messaging API 頁籤
3. 在 Webhook settings 中設定：`https://你的ngrok網址.ngrok.io/webhook`
4. 啟用 "Use webhook"
5. 點選 "Verify" 測試（應該會顯示 Success）

### 8️⃣ 測試 Bot

1. 在 Line Developers Console 掃描 QR Code 加入 Bot 好友
2. 傳送「說明」查看指令列表
3. 傳送「打卡」測試打卡功能

## 🎉 完成！

現在你可以開始使用 Jolin 睡覺打卡 Bot 了！

## 常用指令

| 指令 | 功能 |
|------|------|
| `打卡` | 記錄睡覺時間 |
| `統計` | 查看個人統計 |
| `全台統計` | 查看全台數據 |
| `設定縣市` | 設定你的縣市 |
| `設定性別` | 設定你的性別 |

## 遇到問題？

### Webhook 驗證失敗
- 確認 ngrok 和伺服器都在運行
- 確認 `.env` 中的 `LINE_CHANNEL_SECRET` 正確

### 資料庫連接失敗
- 確認 PostgreSQL 正在運行
- 確認 `.env` 中的資料庫設定正確
- 執行 `npm run check` 查看詳細錯誤

### Bot 沒有回應
- 確認 Webhook 驗證成功
- 查看伺服器 console 的錯誤訊息
- 確認 Line Bot 的自動回覆已停用

## 更多資訊

- 完整文件：`README.md`
- 詳細設定指南：`SETUP.md`
- 專案總覽：`PROJECT_SUMMARY.md`

## 下一步

- 邀請朋友一起使用
- 查看全台統計
- 部署到正式環境（參考 SETUP.md）

祝你每天都超級漂亮！✨💖
