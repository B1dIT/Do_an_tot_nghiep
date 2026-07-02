# scrape_itviec.py
import time, re, random
from urllib.parse import urljoin, urlparse
from DrissionPage import ChromiumPage, ChromiumOptions
from bs4 import BeautifulSoup
import database

BASE = "https://itviec.com"

def smart_sleep(min_s=1.5, max_s=3.0):
    time.sleep(random.uniform(min_s, max_s))

def text(el):
    if not el: return None
    t = el.get_text(" ", strip=True)
    return re.sub(r"\s+", " ", t) if t else None

def build_driver(headless=False):
    co = ChromiumOptions()
    co.set_argument("--window-size=1920,1080")
    if headless: co.headless()
    driver = ChromiumPage(addr_or_opts=co)
    driver.get(BASE)
    return driver

def parse_search_page(driver, url):
    driver.get(url)
    driver.wait(4, 6) # Đợi trang tải xong hoàn toàn cấu trúc chia đôi
    
    soup = BeautifulSoup(driver.html, "lxml")
    jobs = []
    
    # 🎯 ĐÃ CẬP NHẬT: Nhắm thẳng vào container chứa danh sách job bên trái (id="search-results-list")
    # để tránh bị cào nhầm sang phần chi tiết bên phải hoặc phần quảng cáo ở trên.
    job_cards = soup.select("#search-results-list div[data-testid='job-card'], #search-results-list .job-card")
    
    # Nếu bộ chọn id không ăn, ta dự phòng quét qua class job-card tổng quát
    if not job_cards:
        job_cards = soup.select("div[data-testid='job-card'], div[class*='job-card'], div.job_item")

    print(f"   [Search] Tìm thấy {len(job_cards)} thẻ job trên giao diện.")

    for item in job_cards:
        # Lấy tiêu đề và Link Job từ thẻ h3/h2 nằm trong card
        a_title = item.select_one("h3 a[href], h2 a[href], a[href*='/it-jobs/']")
        if not a_title: continue
        
        # Bóc tách tên công ty
        comp_el = item.select_one("div.job-card__company-name a, [class*='company'] a, span[class*='company']")
        
        # Bóc tách mức lương công khai tại card
        salary_el = item.select_one(".job-card__salary-text, [class*='salary']")
        
        # Bóc tách địa điểm
        loc_el = item.select_one(".job-card__location, [class*='location']")

        jobs.append({
            "title":        text(a_title),
            "job_url":      urljoin(BASE, a_title.get("href")),
            "company":      text(comp_el) if comp_el else "Công ty ẩn danh",
            "company_url":  urljoin(BASE, comp_el.get("href")) if (comp_el and comp_el.get("href")) else None,
            "salary_list":  text(salary_el) if salary_el else "Sign in to view salary",
            "address_list": text(loc_el) if loc_el else "Việt Nam",
            "exp_list":     None
        })
    return jobs

def scrape_job_detail(driver, job_url):
    """Cào chi tiết Job khi click vào link cụ thể"""
    driver.get(job_url)
    driver.wait(2, 4)
    soup = BeautifulSoup(driver.html, "lxml")
    
    # Bóc tách 3 vùng nội dung lớn: Mô tả, Yêu cầu, Quyền lợi
    desc_mota = soup.select_one("div.job-description__details, [class*='description__details']")
    desc_yeucau = soup.select_one("div.job-description__requirements, [class*='description__requirements']")
    desc_quyenloi = soup.select_one("div.job-description__benefits, [class*='description__benefits']")
    
    # Gom các tag công nghệ (Java, Python, .Net...)
    tags = [text(t) for t in soup.select(".job-details__tags .tag, [class*='tags'] .tag")]
    
    return {
        "detail_title":         text(soup.select_one("h1.job-details__title, h1[class*='title']")),
        "detail_salary":        text(soup.select_one(".job-details__salary-text, [class*='salary']")),
        "detail_location":      text(soup.select_one(".job-details__address, [class*='address']")),
        "detail_experience":    None,
        "deadline":             None,
        "tags":                 "; ".join(tags) if tags else None,
        "desc_mota":            text(desc_mota) if desc_mota else None,
        "desc_yeucau":          text(desc_yeucau) if desc_yeucau else None,
        "desc_quyenloi":        text(desc_quyenloi) if desc_quyenloi else None,
        "working_addresses":    text(soup.select_one(".job-details__address")),
        "working_times":        None,
        "company_url_from_job": None
    }

def run_itviec_crawler(keywords, headless=False):
    print("\n🥷 [ITVIEC] Bắt đầu quét tuần tra...")
    seen = database.get_all_seen_keys()
    driver = build_driver(headless=headless)
    try:
        for kw in keywords:
            # Mã hóa dấu cách thành dấu cộng (+) chuẩn chỉ theo đúng ảnh screenshot của bạn
            query_str = kw.replace(" ", "+")
            url = f"https://itviec.com/it-jobs?q={query_str}"
            
            print(f" 🔍 ITViec -> Từ khóa: '{kw}' -> URL: {url}")
            jobs = parse_search_page(driver, url)
            
            for idx, j in enumerate(jobs, 1):
                jid = "itviec_" + urlparse(j["job_url"]).path
                if jid in seen: continue
                seen.add(jid)
                
                print(f"   [+] Job mới: {j['title']}")
                try: 
                    detail = scrape_job_detail(driver, j["job_url"])
                except Exception: 
                    detail = {}
                
                full_row = {**j, **detail, "source": "ITViec", "keyword": kw}
                database.insert_job_to_postgres(full_row)
                smart_sleep(1.5, 3.0)
    finally:
        driver.quit()