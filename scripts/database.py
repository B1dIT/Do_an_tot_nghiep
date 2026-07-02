# database.py
from sqlalchemy import create_engine, text
import pandas as pd
from urllib.parse import urlparse


DB_USER = "postgres"                   
DB_PASS = "160105"      
DB_HOST = "localhost"
DB_PORT = "5432"                       
DB_NAME = "do_an_tot_nghiep"           


CONNECTION_STR = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def init_database():
    """Hàm tự động khởi tạo bảng dữ liệu chuẩn hóa trong Postgres"""
    engine = create_engine(CONNECTION_STR)
    
    create_table_query = """
    CREATE TABLE IF NOT EXISTS jobs_data (
        id SERIAL PRIMARY KEY,              -- Tự động tăng tăng định dạng Postgres
        job_key VARCHAR(100) UNIQUE,        -- Khóa duy nhất dùng đuôi URL để chặn trùng
        title VARCHAR(255),
        detail_title VARCHAR(255),
        job_url TEXT,
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
        source VARCHAR(50),                  -- Nhãn nhận diện: 'TopCV', 'ITViec', 'Glints'
        keyword VARCHAR(50),                 -- Nhãn phân loại ngành: 'Frontend', 'Flutter'...
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    with engine.connect() as conn:
        with conn.begin():
            conn.execute(text(create_table_query))
    print(f"✅ [POSTGRES] Đã đồng bộ cấu trúc bảng 'jobs_data' trong database '{DB_NAME}'!")


def get_all_seen_keys() -> set:
    """Đọc nhanh danh sách khóa cũ trong Postgres để kích hoạt bộ lọc trùng real-time"""
    engine = create_engine(CONNECTION_STR)
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT job_key FROM jobs_data"))
            return set(row[0] for row in result)
    except Exception:
        return set()


def insert_job_to_postgres(job_dict: dict) -> bool:
    """Chèn một bản ghi Job sạch vào Postgres, tự bỏ qua nếu dính trùng khóa UNIQUE"""
    engine = create_engine(CONNECTION_STR)
    try:
        src_label = job_dict.get("source", "").lower() + "_"
        job_key = src_label + urlparse(job_dict.get("job_url", "")).path
        job_dict["job_key"] = job_key
    except Exception:
        return False

    df = pd.DataFrame([job_dict])
    try:
        df.to_sql("jobs_data", con=engine, if_exists="append", index=False)
        return True
    except Exception:
        return False

if __name__ == "__main__":
    init_database()