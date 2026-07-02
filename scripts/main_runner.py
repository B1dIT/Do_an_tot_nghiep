
import time
import database
from scrape_topcv import run_topcv_crawler
from scrape_itviec import run_itviec_crawler
from scrape_glints import run_glints_crawler

KEYWORDS_IT = [
    "Data Analyst"
]

if __name__ == "__main__":
    database.init_database()
    
    print("\n=== ĐƯỜNG ỐNG REAL-TIME TOÀN NGÀNH IT (POSTGRES) SẴN SÀNG CHẠY ===")
    
    chu_ky = 1
    while True:
        print(f"\n🔔 KHỞI ĐỘNG CHU KỲ TUẦN TRA REAL-TIME THỨ #{chu_ky} lúc: {time.strftime('%H:%M:%S')}")
        
        # 1. Quét nguồn TopCV
        try: run_topcv_crawler(KEYWORDS_IT, headless=False)
        except Exception as e: print(f"❌ Lỗi chu kỳ TopCV: {e}")
        
        # 2. Quét nguồn ITViec
        try: run_itviec_crawler(KEYWORDS_IT, headless=False)
        except Exception as e: print(f"❌ Lỗi chu kỳ ITViec: {e}")
        
        # 3. Quét nguồn Glints
        try: run_glints_crawler(KEYWORDS_IT, headless=False)
        except Exception as e: print(f"❌ Lỗi chu kỳ Glints: {e}")
        
        print(f"\n💤 Hoàn tất chu kỳ #{chu_ky}. Toàn bộ job mới đã nằm an toàn trong Postgres!")
        print("Hệ thống nghỉ 30 phút nhằm bảo vệ IP máy chủ trước chu kỳ sau...")
        
        chu_ky += 1
        time.sleep(1800)  