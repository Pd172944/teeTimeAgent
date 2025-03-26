# config.py
import os
from dotenv import load_dotenv # type: ignore
load_dotenv()

# Golf course login details (update with your actual credentials)
USERNAME = os.getenv("USERNAME")
PASSWORD = os.getenv("PASSWORD")

# Preferred tee times (24-hour format)
PREFERRED_TIMES = ["7:09 AM", "9:00 AM", "3:30 PM"]

# Website URLs (Update with actual URLs)
LOGIN_URL = "https://playcrystalsprings.totaleintegrated.com/Account-Login?returnurl=%2F"
TEE_TIME_URL = "https://playcrystalsprings.totaleintegrated.com/Tee-Time/Public-Tee-Time"
