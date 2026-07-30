# database.py
from sqlalchemy import create_engine, text
import pandas as pd
from urllib.parse import urlparse
from datetime import datetime, timedelta


DB_USER = "postgres"
DB_PASS = "160105"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "do_an_tot_nghiep"

CONNECTION_STR = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

DATA_COLUMNS = [
    "job_key", "title", "detail_title", "job_url", "company",
    "company_name_full", "company_url", "company_url_from_job",
    "salary_list", "detail_salary", "address_list", "detail_location",
    "exp_list", "detail_experience", "deadline", "tags",
    "working_addresses", "working_times", "desc_mota", "desc_yeucau",
    "desc_quyenloi", "company_website", "company_size", "company_industry",
    "company_address", "company_description", "source", "keyword",
    "salary_min", "salary_max",
]


def init_database():
    engine = create_engine(CONNECTION_STR)

    create_table_query = """
    CREATE TABLE IF NOT EXISTS jobs_data (
        id SERIAL PRIMARY KEY,
        job_key VARCHAR(100),
        title VARCHAR(255),
        detail_title VARCHAR(255),
        job_url TEXT NOT NULL,
        company VARCHAR(255),
        company_name_full VARCHAR(255),
        company_url TEXT,
        company_url_from_job TEXT,
        salary_list VARCHAR(100),
        detail_salary VARCHAR(100),
        address_list VARCHAR(255),
        detail_location VARCHAR(255),
        exp_list VARCHAR(100),
        detail_experience VARCHAR(100),
        deadline VARCHAR(50),
        tags TEXT,
        working_addresses TEXT,
        working_times TEXT,
        desc_mota TEXT,
        desc_yeucau TEXT,
        desc_quyenloi TEXT,
        company_website VARCHAR(255),
        company_size VARCHAR(100),
        company_industry VARCHAR(255),
        company_address TEXT,
        company_description TEXT,
        source VARCHAR(50),
        keyword VARCHAR(50),
        salary_min NUMERIC,
        salary_max NUMERIC,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expired_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        CONSTRAINT uq_jobs_data_job_url UNIQUE (job_url)
    );
    """

    with engine.connect() as conn:
        conn.execute(text(create_table_query))
        for col, col_def in [
            ("updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"),
            ("expired_at", "TIMESTAMP"),
            ("status", "VARCHAR(20) DEFAULT 'ACTIVE'"),
            ("salary_min", "NUMERIC"),
            ("salary_max", "NUMERIC"),
        ]:
            try:
                conn.execute(text(f"ALTER TABLE jobs_data ADD COLUMN IF NOT EXISTS {col} {col_def}"))
            except Exception:
                pass
        try:
            conn.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'uq_jobs_data_job_url'
                    ) THEN
                        DELETE FROM jobs_data a
                        USING jobs_data b
                        WHERE a.id > b.id AND a.job_url = b.job_url;
                        ALTER TABLE jobs_data ADD CONSTRAINT uq_jobs_data_job_url UNIQUE (job_url);
                    END IF;
                END $$;
            """))
        except Exception:
            pass
        conn.execute(text(
            "CREATE INDEX IF NOT EXISTS idx_jobs_status_expired ON jobs_data (status, expired_at)"
        ))
        conn.commit()


def get_all_seen_keys():
    engine = create_engine(CONNECTION_STR)
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT job_key FROM jobs_data"))
            return set(row[0] for row in result)
    except Exception:
        return set()


def _parse_expired_at(job_dict: dict):
    deadline = job_dict.get("deadline")
    if deadline:
        try:
            return pd.to_datetime(deadline)
        except Exception:
            pass
    # Default: 30 days from insert
    return datetime.now() + timedelta(days=30)


def insert_job_to_postgres(job_dict: dict) -> bool:
    engine = create_engine(CONNECTION_STR)
    try:
        src_label = job_dict.get("source", "").lower() + "_"
        job_key = src_label + urlparse(job_dict.get("job_url", "")).path
        job_dict["job_key"] = job_key
    except Exception:
        return False

    expired_at = _parse_expired_at(job_dict)

    col_list = ", ".join(DATA_COLUMNS)
    val_list = ", ".join([f":{c}" for c in DATA_COLUMNS])

    upsert_query = f"""
        INSERT INTO jobs_data ({col_list}, created_at, updated_at, expired_at, status)
        VALUES ({val_list}, NOW(), NOW(), :expired_at, 'ACTIVE')
        ON CONFLICT (job_url) DO UPDATE SET
            updated_at = NOW(),
            expired_at = COALESCE(EXCLUDED.expired_at, jobs_data.expired_at),
            status = 'ACTIVE'
    """

    try:
        with engine.connect() as conn:
            params = {col: job_dict.get(col) for col in DATA_COLUMNS}
            params["expired_at"] = expired_at
            conn.execute(text(upsert_query), params)
            conn.commit()
        return True
    except Exception as e:
        print(f"   [DB] Upsert error for {job_dict.get('job_key', '?' )}: {e}")
        return False


def mark_expired_jobs() -> int:
    engine = create_engine(CONNECTION_STR)
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                UPDATE jobs_data
                SET status = 'EXPIRED', updated_at = NOW()
                WHERE expired_at IS NOT NULL
                  AND expired_at < NOW()
                  AND status = 'ACTIVE'
            """))
            conn.commit()
            count = result.rowcount
            if count > 0:
                print(f"   [Cron] Marked {count} jobs EXPIRED.")
            return count
    except Exception as e:
        print(f"   [DB] Error updating expired jobs: {e}")
        return 0


if __name__ == "__main__":
    init_database()