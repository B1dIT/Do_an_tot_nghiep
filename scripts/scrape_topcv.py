# scrape_topcv.py
import time, re, random
from urllib.parse import urljoin, urlparse
from DrissionPage import ChromiumPage, ChromiumOptions
from bs4 import BeautifulSoup
import database

BASE = "https://www.topcv.vn"
_DETAIL_KEYS = [
    "detail_title", "detail_salary", "detail_location", "detail_experience",
    "deadline", "tags", "desc_mota", "desc_yeucau", "desc_quyenloi",
    "working_addresses", "working_times", "company_url_from_job",
]

def smart_sleep(min_s=1.5, max_s=3.0):
    time.sleep(random.uniform(min_s, max_s))

def text(el):
    if not el: return None
    t = el.get_text(" ", strip=True)
    return re.sub(r"\s+", " ", t) if t else None

def build_driver(headless=False):
    co = ChromiumOptions()
    co.set_argument("--lang=vi-VN")
    co.set_argument("--window-size=1920,1080")
    if headless: co.headless()
    driver = ChromiumPage(addr_or_opts=co)
    driver.get(BASE)
    return driver

def get_soup(driver, url, wait_ele="tag:body"):
    driver.get(url)
    driver.wait(3.5, 5.5)
    try:
        driver.ele(wait_ele, timeout=20)
        smart_sleep(1.0, 2.0)
        return BeautifulSoup(driver.html, "lxml")
    except Exception:
        return BeautifulSoup("", "lxml")

def parse_search_page(driver, url):
    soup = get_soup(driver, url, wait_ele="css:div.job-item-search-result")
    jobs = []
    for job in soup.select("div.job-item-search-result"):
        a_title = job.select_one("h3.title a[href]")
        if not a_title: continue
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

def _pick_info(soup, title):
    for sec in soup.select(".job-detail__info--section"):
        t = text(sec.select_one(".job-detail__info--section-content-title")) or ""
        if title.lower() in t.lower():
            v = sec.select_one(".job-detail__info--section-content-value")
            return text(v) if v else text(sec)
    return None

def scrape_job_detail(driver, job_url):
    soup = get_soup(driver, job_url, wait_ele="css:.job-detail__info--title")
    desc = {}
    for item in soup.select(".job-description .job-description__item"):
        h3 = text(item.select_one("h3")) or ""
        c = item.select_one(".job-description__item--content")
        if c: desc[h3] = text(c)
        
    tags = [text(a) for a in soup.select(".job-tags a.item") if text(a)]
    addrs, times = [], []
    for h3 in soup.select(".job-description__item h3"):
        t_h3 = text(h3) or ""
        wrap = h3.find_parent(class_="job-description__item")
        if wrap:
            items = [text(d) for d in wrap.select(".job-description__item--content div, .job-description__item--content li") if text(d)]
            if "Địa điểm" in t_h3: addrs.extend(items)
            if "Thời gian" in t_h3: times.extend(items)

    cand = soup.select_one("a.company[href]") or soup.select_one("a[href*='/cong-ty/']")
    comp_url = urljoin(BASE, cand["href"]) if cand else None

    return {
        "detail_title":         text(soup.select_one(".job-detail__info--title, h1")),
        "detail_salary":        _pick_info(soup, "Mức lương"),
        "detail_location":      _pick_info(soup, "Địa điểm"),
        "detail_experience":    _pick_info(soup, "Kinh nghiệm"),
        "deadline":             None,
        "tags":                 "; ".join(tags) if tags else None,
        "desc_mota":            desc.get("Mô tả công việc"),
        "desc_yeucau":          desc.get("Yêu cầu ứng viên"),
        "desc_quyenloi":        desc.get("Quyền lợi"),
        "working_addresses":    "; ".join(addrs) if addrs else None,
        "working_times":        "; ".join(times) if times else None,
        "company_url_from_job": comp_url,
    }

def scrape_company(driver, company_url):
    if not company_url: return {}
    soup = get_soup(driver, company_url, wait_ele="css:h1")
    name = text(soup.select_one("h1.company-name, h1.title"))
    website = size = industry = address = description = None
    for row in soup.select("li, .info-item, .company-info-item"):
        m = re.match(r"^([^:：]+)[:：]\s*(.+)$", text(row) or "")
        if not m: continue
        lbl, val = m.group(1).strip().lower(), m.group(2).strip()
        if "website" in lbl: website = val
        elif "quy mô" in lbl: size = val
        elif "ngành" in lbl or "lĩnh vực" in lbl: industry = val
        elif "địa chỉ" in lbl: address = val

    el_desc = soup.select_one("div.company-description, div#readmore-content")
    if el_desc: description = text(el_desc)

    return {
        "company_name_full":   name,
        "company_website":     website,
        "company_size":        size,
        "company_industry":    industry,
        "company_address":     address,
        "company_description": description,
    }

def run_topcv_crawler(keywords, headless=False):
    print("\n🦊 [TOPCV] Bắt đầu quét tuần tra...")
    seen = database.get_all_seen_keys()
    driver = build_driver(headless=headless)
    try:
        for kw in keywords:
            url = f"https://www.topcv.vn/tim-viec-lam-{kw.lower().replace(' ', '-')}-?page=1"
            print(f" 🔍 TopCV -> Từ khóa: '{kw}'")
            jobs = parse_search_page(driver, url)
            for idx, j in enumerate(jobs, 1):
                jid = "topcv_" + urlparse(j["job_url"]).path
                if jid in seen: continue
                seen.add(jid)
                print(f"   [+] Job mới: {j['title']}")
                try: detail = scrape_job_detail(driver, j["job_url"])
                except Exception: detail = {k: None for k in _DETAIL_KEYS}
                comp_url = detail.get("company_url_from_job") or j.get("company_url")
                try: comp = scrape_company(driver, comp_url)
                except Exception: comp = {}
                
                full_row = {**j, **detail, **comp, "source": "TopCV", "keyword": kw}
                database.insert_job_to_postgres(full_row)
                smart_sleep(1.5, 3.0)
    finally:
        driver.quit()