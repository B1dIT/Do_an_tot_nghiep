
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
    
    print("\n=== REAL-TIME IT JOB PIPELINE (POSTGRES) READY ===")
    
    cycle = 1
    while True:
        print(f"\nStarting cycle #{cycle} at: {time.strftime('%H:%M:%S')}")
        
        print("   Scanning expired jobs...")
        database.mark_expired_jobs()
        
        try: run_topcv_crawler(KEYWORDS_IT, headless=False)
        except Exception as e: print(f"TopCV error: {e}")
        
        try: run_itviec_crawler(KEYWORDS_IT, headless=False)
        except Exception as e: print(f"ITViec error: {e}")
        
        try: run_glints_crawler(KEYWORDS_IT, headless=False)
        except Exception as e: print(f"Glints error: {e}")
        
        print(f"\nCycle #{cycle} complete. All new jobs saved to Postgres.")
        print("Sleeping 30 minutes before next cycle...")
        
        cycle += 1
        time.sleep(1800)  