# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jolin 睡覺打卡 Line Bot - A sleep tracking Line Bot inspired by Jolin's beauty sleep routine (9:30 PM bedtime). Users check in when they go to sleep and receive a "beauty rating" based on their sleep time.

## Commands

### Development
- `npm run dev` - Start development server with auto-reload (nodemon)
- `npm start` - Start production server
- `npm run check` - Run setup verification script
- `npm run db:migrate` - Run database migrations (creates tables and indexes)

### Database
The project uses PostgreSQL. Database schema is in `src/database/schema.sql`. Migration script is `src/database/migrate.js`.

## Architecture

### Core Flow
1. Line webhook receives user messages at `/webhook` endpoint
2. `webhookController.js` validates and routes to `LineService`
3. `LineService.handleTextMessage()` parses commands and coordinates business logic
4. Model classes (User, SleepRecord, Statistics) handle database operations
5. Responses are sent back via Line Messaging API

### Key Components

**Entry Point**: `src/index.js`
- Express server with Line webhook middleware
- Health check endpoints at `/` and `/health`

**Command Handler**: `src/services/lineService.js`
- Central message processing in `handleTextMessage()`
- Command routing logic: 打卡/睡覺/晚安, 統計, 全台統計, 設定縣市, 設定性別
- All Line API interactions go through this service

**Models** (all use PostgreSQL connection pool from `config/database.js`):
- `User.js` - User management with `getOrCreate()` pattern
- `SleepRecord.js` - Check-in records with timezone-aware date handling
- `Statistics.js` - Aggregate statistics queries

**Business Logic**:
- `utils/beautyLevel.js` - Core sleep time evaluation logic
  - Super Beautiful: 18:00-21:30
  - Normal Beautiful: 21:30-00:00
  - Not Beautiful: 00:00-06:00
  - All time calculations use `moment-timezone` with `Asia/Taipei`

**Database**:
- Connection pooling via `pg` library
- Three main tables: `users`, `sleep_records`, `daily_statistics`
- Timezone stored as `TIMESTAMP WITH TIME ZONE`
- Indexes on user_id, sleep_time, city, gender for statistics queries

### Important Patterns

**Timezone Handling**:
- ALL time operations MUST use `moment-timezone` with `Asia/Taipei`
- Database queries checking "today" use `AT TIME ZONE 'Asia/Taipei'`
- Example: `SleepRecord.getTodayRecord()` at line 36

**User Data Snapshots**:
- `sleep_records` table stores `city` and `gender` as snapshots (not foreign keys)
- This allows historical statistics even if user changes their profile
- Users can update their info anytime without affecting past records

**Daily Check-in Limit**:
- Users can only check in once per calendar day (Taiwan timezone)
- Check is performed in `SleepRecord.getTodayRecord()`

**Line User ID vs Database ID**:
- Line's `userId` (string) is stored as `line_user_id`
- Internal `id` (integer) is auto-incremented primary key
- Most queries use `line_user_id` for direct Line webhook integration

## Environment Variables

Required in `.env`:
- `LINE_CHANNEL_ACCESS_TOKEN` - Line Messaging API token
- `LINE_CHANNEL_SECRET` - Line channel secret for webhook validation
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - PostgreSQL connection
- `PORT` - Express server port (default: 3000)
- `TIMEZONE` - Should always be `Asia/Taipei`

## Database Setup

After creating a PostgreSQL database:
1. Run `npm run db:migrate` to create tables
2. Check `src/database/schema.sql` for the complete schema
3. Schema includes automatic `updated_at` trigger for `users` table

## Adding New Commands

To add a new bot command:
1. Add command detection in `LineService.handleTextMessage()` (around line 30-52)
2. Create handler method like `handleNewFeature(replyToken, ...args)`
3. Add model methods if database access is needed
4. Update help text in `handleHelp()` method
