-- ============================================================
-- migration_crud.sql
-- Bảng cho Profile, Interview History, Saved Jobs
-- Chạy: psql -d do_an_tot_nghiep -f migration_crud.sql
-- ============================================================

-- 1. Bảng hồ sơ người dùng
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    skills TEXT,
    experience TEXT,
    cv_file_name VARCHAR(255),
    cv_file_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 2. Bảng lịch sử phỏng vấn
CREATE TABLE IF NOT EXISTS interview_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_title VARCHAR(255),
    company VARCHAR(255),
    overall_score INTEGER,
    summary TEXT,
    strengths TEXT,
    improvements TEXT,
    conversation JSONB,
    gemini_analysis JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng công việc đã lưu
CREATE TABLE IF NOT EXISTS saved_jobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_title VARCHAR(255),
    company VARCHAR(255),
    job_url TEXT,
    salary VARCHAR(100),
    location VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_url)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_interview_history_user ON interview_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs (user_id, created_at DESC);
