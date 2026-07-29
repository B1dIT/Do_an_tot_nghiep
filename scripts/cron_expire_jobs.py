#!/usr/bin/env python3
"""
cron_expire_jobs.py — Daily job expiration cron.

Usage:
  python cron_expire_jobs.py              # Run once
  python cron_expire_jobs.py --watch      # Run with live log
"""

import sys
from datetime import datetime
from database import mark_expired_jobs


def run_once():
    print(f"[{datetime.now():%Y-%m-%d %H:%M:%S}] Scanning expired jobs...")
    count = mark_expired_jobs()
    print(f"[{datetime.now():%Y-%m-%d %H:%M:%S}] Done. {count} jobs marked EXPIRED.")
    return count


def run_watch():
    print("=" * 60)
    print("  CRONJOB — EXPIRED JOB SCANNER")
    print(f"  Time: {datetime.now():%Y-%m-%d %H:%M:%S}")
    print("=" * 60)
    count = run_once()
    print("=" * 60)
    print(f"  Total processed: {count}")
    print("=" * 60)


if __name__ == "__main__":
    if "--watch" in sys.argv:
        run_watch()
    else:
        run_once()
