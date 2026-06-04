"""
scrape_topcv_company.py  —  dùng DrissionPage 

"""

import time, re, random
from typing import Dict, List, Optional
from urllib.parse import urljoin, urlparse

from DrissionPage import ChromiumPage, ChromiumOptions
from bs4 import BeautifulSoup
import pandas as pd


BASE = "https://www.topcv.vn"


# ══════════════════════════════════════════════════════
# 1. HELPER
# ══════════════════════════════════════════════════════

def smart_sleep(min_s: float = 1.5, max_s: float = 3.0):
    time.sleep(random.uniform(min_s, max_s))


def text(el) -> Optional[str]:
    if not el:
        return None
    t = el.get_text(" ", strip=True)
    return re.sub(r"\s+", " ", t) if t else None


def is_blocked(driver: ChromiumPage) -> bool:
    title = driver.title.lower()
    return "blocked" in title or "attention required" in title


# ══════════════════════════════════════════════════════
# 2. BUILD DRIVER
# ══════════════════════════════════════════════════════

def build_driver(headless: bool = False) -> ChromiumPage:
    co = ChromiumOptions()
    co.set_argument("--lang=vi-VN")
    co.set_argument("--window-size=1920,1080")
    co.set_argument("--disable-popup-blocking")
    if headless:
        co.headless()

    driver = ChromiumPage(addr_or_opts=co)

    print("[INFO] Warm-up cookie trang chủ...")
    driver.get(BASE)
    driver.wait(4, 6)

    if is_blocked(driver):
        print("[WARN] Cloudflare đang chặn.")
        input(">>> Pass Cloudflare thủ công rồi nhấn Enter để tiếp tục...")

    print("[INFO] Browser sẵn sàng.\n")
    return driver


# ══════════════════════════════════════════════════════
# 3. GET SOUP
# ══════════════════════════════════════════════════════

def get_soup(driver: ChromiumPage, url: str,
             wait_ele: str = "tag:body",
             timeout: int = 20) -> BeautifulSoup:
    for attempt in range(1, 4):
        driver.get(url)
        driver.wait(3.5, 5.5)      # chờ Cloudflare + JS render

        if is_blocked(driver):
            wait = 12 * attempt
            print(f"  [WARN] Bị block {url} → chờ {wait}s (lần {attempt})")
            time.sleep(wait)
            continue

        try:
            driver.ele(wait_ele, timeout=timeout)
            smart_sleep(1.0, 2.0)
            return BeautifulSoup(driver.html, "lxml")
        except Exception:
            print(f"  [WARN] Timeout {url} (lần {attempt})")
            smart_sleep(5 * attempt, 8 * attempt)

    print(f"  [ERROR] Bỏ qua {url} sau 3 lần thử.")
    return BeautifulSoup("", "lxml")


# ══════════════════════════════════════════════════════
# 4. PARSE SEARCH PAGE
# ══════════════════════════════════════════════════════

def parse_search_page(driver: ChromiumPage, url: str) -> List[Dict]:
    soup = get_soup(driver, url,
                    wait_ele="css:div.job-item-search-result",
                    timeout=25)
    jobs = []
    for job in soup.select("div.job-item-search-result"):
        a_title = job.select_one("h3.title a[href]")
        if not a_title:
            continue
        comp_a = job.select_one("a.company[href]")
        jobs.append({
            "title":        text(a_title),
            "job_url":      urljoin(BASE, a_title.get("href")),
            "company":      text(job.select_one("a.company .company-name")),
            "company_url":  urljoin(BASE, comp_a.get("href")) if comp_a else None,
            "salary_list":  text(job.select_one("label.title-salary")),
            "address_list": text(job.select_one("label.address .city-text")),
            "exp_list":     text(job.select_one("label.exp span")),
        })
    return jobs


# ══════════════════════════════════════════════════════
# 5. PARSE JOB DETAIL
# ══════════════════════════════════════════════════════

def _pick_info(soup, title):
    for sec in soup.select(".job-detail__info--section"):
        t = text(sec.select_one(".job-detail__info--section-content-title")) or ""
        if t.lower() == title.lower():
            v = sec.select_one(".job-detail__info--section-content-value")
            return text(v) if v else text(sec)
    return None

def _deadline(soup):
    for el in soup.select(".job-detail__info--deadline, "
                          ".job-detail__information-detail--actions-label"):
        t = text(el)
        if t and "Hạn nộp" in t:
            m = re.search(r"(\d{1,2}/\d{1,2}/\d{4})", t)
            return m.group(1) if m else t
    return None

def _tags(soup):
    return [text(a) for a in soup.select(".job-tags a.item") if text(a)]

def _desc_blocks(soup):
    data = {}
    for item in soup.select(".job-description .job-description__item"):
        h3 = text(item.select_one("h3")) or ""
        c  = item.select_one(".job-description__item--content")
        if c:
            data[h3] = text(c)
    return data

def _list_items(soup, heading):
    out = []
    for h3 in soup.select(".job-description__item h3"):
        if heading in (text(h3) or ""):
            wrap = h3.find_parent(class_="job-description__item")
            if wrap:
                for d in wrap.select(".job-description__item--content div,"
                                     ".job-description__item--content li"):
                    v = text(d)
                    if v:
                        out.append(v)
    return out

def scrape_job_detail(driver: ChromiumPage, job_url: str) -> Dict:
    soup  = get_soup(driver, job_url,
                     wait_ele="css:.job-detail__info--title",
                     timeout=25)
    smart_sleep()
    desc  = _desc_blocks(soup)
    tags  = _tags(soup)
    addrs = _list_items(soup, "Địa điểm làm việc")
    times = _list_items(soup, "Thời gian làm việc")

    cand = soup.select_one("a.company[href]") or \
           soup.select_one("a[href*='/cong-ty/']")
    comp_url = urljoin(BASE, cand["href"]) \
        if cand and cand.has_attr("href") else None

    return {
        "detail_title":         text(soup.select_one(".job-detail__info--title, h1")),
        "detail_salary":        _pick_info(soup, "Mức lương"),
        "detail_location":      _pick_info(soup, "Địa điểm"),
        "detail_experience":    _pick_info(soup, "Kinh nghiệm"),
        "deadline":             _deadline(soup),
        "tags":                 "; ".join(tags) if tags else None,
        "desc_mota":            desc.get("Mô tả công việc"),
        "desc_yeucau":          desc.get("Yêu cầu ứng viên"),
        "desc_quyenloi":        desc.get("Quyền lợi"),
        "working_addresses":    "; ".join(addrs) if addrs else None,
        "working_times":        "; ".join(times) if times else None,
        "company_url_from_job": comp_url,
    }


# ══════════════════════════════════════════════════════
# 6. PARSE COMPANY
# ══════════════════════════════════════════════════════

_EMPTY_COMP = {k: None for k in [
    "company_name_full", "company_website", "company_size",
    "company_industry",  "company_address", "company_description"
]}

def scrape_company(driver: ChromiumPage,
                   company_url: Optional[str]) -> Dict:
    if not company_url:
        return dict(_EMPTY_COMP)

    soup = get_soup(driver, company_url,
                    wait_ele="css:h1",
                    timeout=25)
    smart_sleep()

    name = None
    for css in ["h1.company-name", "h1.title", "div.company-header h1",
                "meta[property='og:title']", "title"]:
        el = soup.select_one(css)
        if el:
            name = el.get("content") if el.name == "meta" else text(el)
            if name:
                name = re.sub(r"\s*\|\s*TopCV.*$", "", name, flags=re.I)
                break

    website = size = industry = address = description = None
    for row in soup.select("li, .row, .item, .info-item, .company-info-item"):
        m = re.match(r"^([^:：]+)[:：]\s*(.+)$", text(row) or "")
        if not m:
            continue
        lbl, val = m.group(1).strip().lower(), m.group(2).strip()
        if "website"  in lbl or "trang web" in lbl: website  = val
        elif "quy mô" in lbl or "nhân sự"   in lbl: size     = val
        elif "lĩnh vực" in lbl or "ngành"   in lbl: industry = val
        elif "địa chỉ" in lbl:                       address  = val

    for css in ["div.company-description", "div#readmore-content",
                "div.company-introduction", "div.description"]:
        el = soup.select_one(css)
        if el:
            description = text(el)
            break

    return {
        "company_name_full":   name,
        "company_website":     website,
        "company_size":        size,
        "company_industry":    industry,
        "company_address":     address,
        "company_description": description,
    }


# ══════════════════════════════════════════════════════
# 7. REAL-TIME PIPELINE & CONFIGURATION
# ══════════════════════════════════════════════════════
import os

 
_DETAIL_KEYS = [
    "detail_title", "detail_salary", "detail_location", "detail_experience",
    "deadline", "tags", "desc_mota", "desc_yeucau", "desc_quyenloi",
    "working_addresses", "working_times", "company_url_from_job",
]

_COL_ORDER = [
    "title", "detail_title", "job_url",
    "company", "company_name_full",
    "company_url", "company_url_from_job",
    "salary_list", "detail_salary",
    "address_list", "detail_location",
    "exp_list", "detail_experience",
    "deadline", "tags",
    "working_addresses", "working_times",
    "desc_mota", "desc_yeucau", "desc_quyenloi",
    "company_website", "company_size", "company_industry",
    "company_address", "company_description",
]


def append_to_excel_and_csv(new_row: Dict, csv_path: str, excel_path: str):
    """Ghi đính kèm dữ liệu của từng Job vào file ngay khi vừa cào xong"""
    df_new = pd.DataFrame([new_row])
    
    # 1. Ghi vào file CSV
    if not os.path.exists(csv_path):
        df_new.to_csv(csv_path, index=False, encoding="utf-8-sig")
    else:
        df_new.to_csv(csv_path, mode='a', header=False, index=False, encoding="utf-8-sig")
        
    # 2. Ghi vào file Excel
    if not os.path.exists(excel_path):
        df_new.to_excel(excel_path, index=False)
    else:
        with pd.ExcelWriter(excel_path, mode='a', engine='openpyxl', if_sheet_exists='overlay') as writer:
            start_row = writer.sheets['Sheet1'].max_row
            df_new.to_excel(writer, startrow=start_row, header=False, index=False)


def crawl_realtime_pipeline(query_url_template: str,
                            csv_path: str,
                            excel_path: str,
                            start_page: int = 1,
                            end_page: int = 1,
                            headless: bool = False):
    
    # Đọc file cũ để nạp link đã cào vào bộ nhớ, tránh cào trùng 
    seen = set()
    if os.path.exists(csv_path):
        try:
            df_old = pd.read_csv(csv_path)
            if 'job_url' in df_old.columns:
                seen = set(df_old['job_url'].apply(lambda x: urlparse(str(x)).path))
                print(f"[INFO] Đã nạp {len(seen)} job cũ từ file để kích hoạt bộ lọc trùng.")
        except Exception:
            pass

    driver = build_driver(headless=headless)

    try:
        for page in range(start_page, end_page + 1):
            url = query_url_template.format(page=page)
            print(f"\n[REALTIME] ── Đang quét Trang {page} ── {url}")
            jobs = parse_search_page(driver, url)

            if not jobs:
                print(f"[INFO] Trang {page} trống hoặc bị chặn — Chuyển chu kỳ sau.")
                break

            for idx, j in enumerate(jobs, 1):
                jid = urlparse(j["job_url"]).path
                
                # Bộ lọc trùng: Nếu link job đã cào rồi thì bỏ qua luôn
                if jid in seen:
                    print(f"  [{idx}/{len(jobs)}] Bỏ qua (Job cũ): {j.get('title','')[:25]}...")
                    continue
                
                seen.add(jid)
                print(f"  [{idx}/{len(jobs)}]  Phát hiện JOB MỚI: {j.get('title','')} ...")

                # Cào chi tiết Job
                try:
                    detail = scrape_job_detail(driver, j["job_url"])
                except Exception as e:
                    print(f"  [WARN] Lỗi job detail: {e}")
                    detail = {k: None for k in _DETAIL_KEYS} # Sử dụng _DETAIL_KEYS ở đây

                comp_url = detail.get("company_url_from_job") or j.get("company_url")

                # Cào thông tin Công ty
                try:
                    comp = scrape_company(driver, comp_url)
                except Exception as e:
                    print(f"  [WARN] Lỗi company: {e}")
                    comp = dict(_EMPTY_COMP)

                # Gom tất cả dữ liệu lại và sắp xếp chuẩn theo thứ tự cột 
                full_row = {**j, **detail, **comp}
                ordered_row = {c: full_row.get(c, None) for c in _COL_ORDER} # Sử dụng _COL_ORDER 
                
                # Ghi vào ổ cứng
                append_to_excel_and_csv(ordered_row, csv_path, excel_path)
                print(f"    ↳  Đã ghi dữ liệu job này vào file Excel & CSV.")
                
                smart_sleep(2.0, 4.0)

            smart_sleep(5.0, 10.0)

    finally:
        try:
            driver.quit()
            print("[INFO] Đã đóng trình duyệt an toàn.")
        except Exception:
            pass


# ══════════════════════════════════════════════════════
# 8. ENTRY POINT 
# ══════════════════════════════════════════════════════

if __name__ == "__main__":
    QUERY = "https://www.topcv.vn/tim-viec-lam-data-analyst?type_keyword=1&page={page}&sba=1"
    
    # Đường dẫn lưu file, bạn có thể sửa lại theo cấu trúc thư mục của mình
    CSV_FILE = "../data-files/topcv_data_analyst_jobs.csv"
    EXCEL_FILE = "../data-files/topcv_data_analyst_jobs.xlsx"
    
    # Tự động tạo thư mục chứa file nếu chưa có
    os.makedirs(os.path.dirname(CSV_FILE), exist_ok=True)

    print("=== KHỞI ĐỘNG HỆ THỐNG CÀO REAL-TIME ĐỒ ÁN TỐT NGHIỆP ===")
    
    Chu_ky = 1
    while True:
        print(f"\n BẮT ĐẦU CHU KỲ QUÉT THỨ #{Chu_ky} lúc: {time.strftime('%H:%M:%S')}")
        
        crawl_realtime_pipeline(
            query_url_template=QUERY,
            csv_path=CSV_FILE,
            excel_path=EXCEL_FILE,
            start_page=1, 
            end_page=1,      # Chỉ quét trang 1 để cập nhật job mới liên tục cực kỳ an toàn
            headless=False    # Để False để dễ quan sát tiến trình
        )
        
        print(f"\n💤 Chu kỳ #{Chu_ky} hoàn tất. Đợi 15 phút để tiếp tục quét chu kỳ sau...")
        Chu_ky += 1
        time.sleep(900)  # Nghỉ 15 phút giữa các chu kỳ
