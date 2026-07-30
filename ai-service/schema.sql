-- ============================================================
-- schema.sql — Database schema cho hệ thống Crawl Job
-- Bảng: jobs
-- Dựa trên cấu trúc JSON mẫu từ jobs_sample.json
-- ============================================================

CREATE TABLE IF NOT EXISTS jobs (
    id              SERIAL PRIMARY KEY,
    job_key         VARCHAR(100),
    title           VARCHAR(500),
    detail_title    VARCHAR(500),
    job_url         TEXT NOT NULL,
    company         VARCHAR(255),
    company_name_full VARCHAR(255),
    company_url     TEXT,
    company_url_from_job TEXT,
    salary_list     VARCHAR(100),
    detail_salary   VARCHAR(255),
    address_list    VARCHAR(255),
    detail_location VARCHAR(255),
    exp_list        VARCHAR(100),
    detail_experience VARCHAR(100),
    deadline        VARCHAR(50),
    tags            TEXT,
    working_addresses TEXT,
    working_times   TEXT,
    desc_mota       TEXT,
    desc_yeucau     TEXT,
    desc_quyenloi   TEXT,
    company_website VARCHAR(255),
    company_size    VARCHAR(100),
    company_industry VARCHAR(255),
    company_address TEXT,
    company_description TEXT,
    source          VARCHAR(50),
    keyword         VARCHAR(100),
    salary_min      NUMERIC,
    salary_max      NUMERIC,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expired_at      TIMESTAMP,
    status          VARCHAR(20) DEFAULT 'ACTIVE',

    -- Ràng buộc UNIQUE trên job_url để chống cào trùng lặp (Deduplication)
    CONSTRAINT uq_jobs_job_url UNIQUE (job_url)
);

-- Index cho cặp (status, expired_at) để Cronjob quét job hết hạn nhanh
CREATE INDEX IF NOT EXISTS idx_jobs_status_expired ON jobs (status, expired_at);

-- Index hỗ trợ tra cứu theo nguồn (TopCV, ITViec, Glints...)
CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs (source);

-- Index hỗ trợ lọc theo keyword
CREATE INDEX IF NOT EXISTS idx_jobs_keyword ON jobs (keyword);

-- Index hỗ trợ sắp xếp theo thời gian tạo
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs (created_at);
