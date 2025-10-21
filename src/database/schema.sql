-- Jolin 睡覺打卡 Line Bot 資料庫架構

-- 用戶表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    line_user_id VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    city VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 睡眠打卡記錄表
CREATE TABLE IF NOT EXISTS sleep_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    line_user_id VARCHAR(100) NOT NULL,
    sleep_time TIMESTAMP WITH TIME ZONE NOT NULL,
    beauty_level VARCHAR(20) CHECK (beauty_level IN ('super_beautiful', 'normal_beautiful', 'not_beautiful')),
    city VARCHAR(50),
    gender VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 統計表（可選，用於快速查詢）
CREATE TABLE IF NOT EXISTS daily_statistics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    city VARCHAR(50),
    gender VARCHAR(10),
    beauty_level VARCHAR(20),
    count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, city, gender, beauty_level)
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_users_line_user_id ON users(line_user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_records_user_id ON sleep_records(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_records_line_user_id ON sleep_records(line_user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_records_sleep_time ON sleep_records(sleep_time);
CREATE INDEX IF NOT EXISTS idx_sleep_records_city ON sleep_records(city);
CREATE INDEX IF NOT EXISTS idx_sleep_records_gender ON sleep_records(gender);
CREATE INDEX IF NOT EXISTS idx_sleep_records_beauty_level ON sleep_records(beauty_level);
CREATE INDEX IF NOT EXISTS idx_daily_statistics_date ON daily_statistics(date);

-- 更新 updated_at 的觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
