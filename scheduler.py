import schedule
import time
from scraper import run_bot

def job():
    print("running tee time checker")
    run_bot()

schedule.every(15).minutes.do(job)

print("schedule started")
while True:
    schedule.run_pending()
    time.sleep(60)
    