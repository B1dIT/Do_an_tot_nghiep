# data_cleaner.py
import re
from sqlalchemy import create_engine, text
import pandas as pd


DB_USER = "postgres"
DB_PASS = "160105"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "do_an_tot_nghiep"

CONNECTION_STR = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def parse_salary(salary_str):
    if not salary_str:
        return None, None
    
    salary_str = salary_str.lower().strip()
    
    
    if any(x in salary_str for x in ["thỏa thuận", "thương lượng", "cạnh tranh", "sign in", "đăng nhập"]):
        return None, None
        
    
    numbers = [float(n) for n in re.findall(r"\d+\.?\d*", salary_str)]
    
    if not numbers:
        return None, None
        
    
    if "triệu" in salary_str or "tr" in salary_str:
        if len(numbers) >= 2:
            return numbers[0], numbers[1]
        elif len(numbers) == 1:
            if "từ" in salary_str: return numbers[0], None
            if "lên đến" in salary_str or "tới" in salary_str: return None, numbers[0]
            return numbers[0], numbers[0]
            
    
    if "usd" in salary_str or "$" in salary_str:
        
        usd_to_vnd = 0.0255 
        if len(numbers) >= 2:
            return round(numbers[0] * numbers[1] * usd_to_vnd if numbers[0] < 100 else numbers[0] * usd_to_vnd, 1), round(numbers[1] * usd_to_vnd, 1)
        elif len(numbers) == 1:
            
            actual_val = numbers[0]
            if len(re.findall(r"\d+,\d+", salary_str)) > 0:
                actual_val = float(salary_str.replace(",", "").replace("$", "").replace("usd", "").strip())
            return round(actual_val * usd_to_vnd, 1), round(actual_val * usd_to_vnd, 1)

    return None, None

def clean_database_salaries():
    engine = create_engine(CONNECTION_STR)
    
    query = "SELECT id, salary_list FROM jobs_data WHERE salary_min IS NULL AND salary_max IS NULL"
    df = pd.read_sql(query, con=engine)
    
    if df.empty:
        print("✨ Không có dữ liệu lương mới nào cần làm sạch!")
        return
        
    print(f"🔄 Đang xử lý làm sạch dữ liệu lương cho {len(df)} dòng...")
    
    
    with engine.connect() as conn:
        with conn.begin():
            for idx, row in df.iterrows():
                s_min, s_max = parse_salary(row['salary_list'])
                if s_min or s_max:
                    update_query = text("""
                        UPDATE jobs_data 
                        SET salary_min = :s_min, salary_max = :s_max 
                        WHERE id = :id
                    """)
                    conn.execute(update_query, {"s_min": s_min, "s_max": s_max, "id": int(row['id'])})
                    
    print("✅ Đã cập nhật các cột số `salary_min` và `salary_max` thành công!")

if __name__ == "__main__":
    clean_database_salaries()