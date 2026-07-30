#!/usr/bin/env python3
"""
cleanup_company_names.py
=========================
Clean up company names in jobs_data table.

Usage:
  python cleanup_company_names.py           # Run update
  python cleanup_company_names.py --dry-run # Dry run, count only
"""

import sys
import psycopg2
from datetime import datetime

DB_CONFIG = {
    "dbname": "do_an_tot_nghiep",
    "user": "postgres",
    "password": "160105",
    "host": "localhost",
    "port": "5432",
}

FALLBACK_NAME = "Doanh nghiệp Hàng đầu"

BAD_COMPANY_VALUES = frozenset({
    "", "na", "n/a", "null", "none",
    "ẩn danh", "công ty ẩn danh", "khách hàng",
    "không rõ", "chưa xác định", "đang cập nhật",
    "n/a (công ty chưa cập nhật)",
})


def normalize(text):
    if text is None:
        return ""
    return text.strip().lower()


def needs_cleanup(value):
    return normalize(value) in BAD_COMPANY_VALUES


def run(dry_run=False):
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()

    # Step 1: Count records needing cleanup
    cursor.execute("""
        SELECT COUNT(*) FROM jobs_data
        WHERE company IS NULL
           OR TRIM(LOWER(company)) = ''
           OR TRIM(LOWER(company)) = 'na'
           OR TRIM(LOWER(company)) = 'n/a'
           OR TRIM(LOWER(company)) = 'null'
           OR TRIM(LOWER(company)) = 'none'
           OR TRIM(LOWER(company)) IN ('ẩn danh', 'công ty ẩn danh', 'khách hàng',
                                       'không rõ', 'chưa xác định', 'đang cập nhật',
                                       'n/a (công ty chưa cập nhật)')
    """)
    total = cursor.fetchone()[0]
    print(f"\n{'=' * 55}")
    print(f"  CLEANUP COMPANY NAMES — {datetime.now():%Y-%m-%d %H:%M:%S}")
    print(f"{'=' * 55}")
    print(f"  Total records to process: {total}")
    print(f"  Replacement name        : {FALLBACK_NAME}")
    print(f"  Mode                    : {'DRY RUN (count only)' if dry_run else 'LIVE'} ")
    print(f"{'=' * 55}\n")

    if total == 0:
        print("No records to clean up.")
        cursor.close()
        conn.close()
        return

    # Step 2: Preview samples
    cursor.execute("""
        SELECT id, company FROM jobs_data
        WHERE company IS NULL
           OR TRIM(LOWER(company)) = ''
           OR TRIM(LOWER(company)) = 'na'
           OR TRIM(LOWER(company)) = 'n/a'
           OR TRIM(LOWER(company)) = 'null'
           OR TRIM(LOWER(company)) IN ('ẩn danh', 'công ty ẩn danh', 'khách hàng',
                                       'không rõ', 'chưa xác định', 'đang cập nhật')
        LIMIT 10
    """)
    samples = cursor.fetchall()
    if samples:
        print("  Sample records:")
        for sid, scompany in samples:
            print(f"    ID {sid}: '{scompany or 'NULL'}'")
    print()

    if dry_run:
        print(f"  DRY RUN — no updates performed.")
        print(f"  Would update {total} rows to '{FALLBACK_NAME}'")
    else:
        cursor.execute("""
            UPDATE jobs_data
            SET company = %s,
                updated_at = NOW()
            WHERE company IS NULL
               OR TRIM(LOWER(company)) = ''
               OR TRIM(LOWER(company)) = 'na'
               OR TRIM(LOWER(company)) = 'n/a'
               OR TRIM(LOWER(company)) = 'null'
               OR TRIM(LOWER(company)) = 'none'
               OR TRIM(LOWER(company)) IN ('ẩn danh', 'công ty ẩn danh', 'khách hàng',
                                           'không rõ', 'chưa xác định', 'đang cập nhật',
                                           'n/a (công ty chưa cập nhật)')
        """, (FALLBACK_NAME,))
        conn.commit()
        print(f"  Updated {cursor.rowcount} rows to '{FALLBACK_NAME}'")

    cursor.close()
    conn.close()
    print()


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    run(dry_run=dry_run)
