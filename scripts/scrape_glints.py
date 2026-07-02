# scrape_glints.py
import time, re, random
from urllib.parse import urljoin, urlparse
from DrissionPage import ChromiumPage, ChromiumOptions
from bs4 import BeautifulSoup
import database

BASE = "https://glints.com"

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
    driver.get(BASE + "/vn/vi")
    return driver

def parse_search_page(driver, url):
    driver.get(url)
    driver.wait(3, 5)
    soup = BeautifulSoup(driver.html, "lxml")
    jobs = []
    for card in soup.select("[class*='JobCardsc__JobCardContainer']"):
        title_a = card.select_one("[class*='JobCardsc__JobTitle'] a")
        if not title_a: continue
        comp_a = card.select_one("[class*='JobCardsc__CompanyName'] a")
        salary_el = card.select_one("[class*='JobCardsc__SalaryText']")
        jobs.append({
            "title":        text(title_a),
            "job_url":      urljoin(BASE, title_a.get("href")),
            "company":      text(comp_a),
            "company_url":  urljoin(BASE, comp_a.get("href")) if comp_a else None,
            "salary_list":  text(salary_el) if salary_el else "Cạnh tranh",
            "address_list": None,
            "exp_list":     None
        })
    return jobs

def scrape_job_detail(driver, job_url):
    driver.get(job_url)
    driver.wait(2, 4)
    soup = BeautifulSoup(driver.html, "lxml")
    mota_div = soup.select_one("[class*='JobDescriptionsc__DescriptionContainer']")
    return {
        "detail_title":         text(soup.select_one("h1[class*='JobHeaderTitle']")),
        "detail_salary":        text(soup.select_one("[class*='JobHeaderSalary']")),
        "detail_location":      text(soup.select_one("[class*='JobHeaderLocation']")),
        "detail_experience":    None,
        "deadline":             None,
        "tags":                 None,
        "desc_mota":            text(mota_div) if mota_div else None,
        "desc_yeucau":          None,
        "desc_quyenloi":        None,
        "working_addresses":    None,
        "working_times":        None,
        "company_url_from_job": None
    }

# Sửa lại cấu trúc URL trong hàm run_glints_crawler của file scrape_glints.py
def run_glints_crawler(keywords, headless=False):
    print("\n🚀 [GLINTS] Bắt đầu quét tuần tra...")
    seen = database.get_all_seen_keys()
    driver = build_driver(headless=headless)
    try:
        for kw in keywords:
            # 🎯 ĐÃ CẬP NHẬT: Đường link tìm kiếm chuẩn không bị 404 của Glints
            query_str = kw.replace(" ", "%20")
            url = f"https://glints.com/vn/vi/opportunities/jobs?q={query_str}"
            
            print(f" 🔍 Glints -> Từ khóa: '{kw}' -> URL: {url}")
            driver.get(url)
            driver.wait(4, 6)
            
            soup = BeautifulSoup(driver.html, "lxml")
            jobs = []
            
            # Cập nhật bộ chọn thẻ bao bọc Job Card của Glints
            cards = soup.select("[class*='JobCardsc__JobCardContainer'], [class*='CompactJobCardsc__CardContainer'], div[class*='Card']")
            
            for card in cards:
                title_a = card.select_one("a[href*='/opportunities/jobs/']")
                if not title_a: continue
                
                comp_a = card.select_one("[class*='CompanyName'] a, a[href*='/organizations/']")
                salary_el = card.select_one("[class*='SalaryText'], [class*='Salary']")
                
                jobs.append({
                    "title":        text(title_a.select_one("h3, h2, span")) or text(title_a),
                    "job_url":      urljoin(BASE, title_a.get("href")),
                    "company":      text(comp_a) if comp_a else "N/A",
                    "company_url":  urljoin(BASE, comp_a.get("href")) if comp_a else None,
                    "salary_list":  text(salary_el) if salary_el else "Cạnh tranh",
                    "address_list": None,
                    "exp_list":     None
                })
                
            for idx, j in enumerate(jobs, 1):
                jid = "glints_" + urlparse(j["job_url"]).path
                if jid in seen: continue
                seen.add(jid)
                print(f"   [+] Job mới: {j['title']}")
                try: detail = scrape_job_detail(driver, j["job_url"])
                except Exception: detail = {}
                
                full_row = {**j, **detail, "source": "Glints", "keyword": kw}
                database.insert_job_to_postgres(full_row)
                smart_sleep(2.0, 4.0)
    finally:
        driver.quit()