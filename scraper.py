# scraper.py
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import config

def setup_driver():
    """Initialize and return a Selenium WebDriver."""
    options = webdriver.ChromeOptions()
    #options.add_argument("--headless")  # Run in the background
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    return driver

def login(driver):
    """Logs into the golf course website."""
    driver.get(config.LOGIN_URL)
    time.sleep(2)  # Allow page to load

    driver.find_element(By.ID, "dnn2177Username").send_keys(config.USERNAME)
    driver.find_element(By.ID, "dnn2177Password").send_keys(config.PASSWORD)
    driver.find_element(By.ID, "dnn2177Login").click()
    time.sleep(3)  # Wait for login to complete

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def check_and_book(driver):
    """Checks for available tee times and books one if found."""
    driver.get(config.TEE_TIME_URL)
    time.sleep(2)

    # Find all available tee time elements based on the time display (using 'span' tags)
    available_times = driver.find_elements(By.CSS_SELECTOR, "span[id^='dnn_ctr'][id*='lblTeeTime']")

    print(f"🔍 Found {len(available_times)} available tee times")

    for time_slot in available_times:
        time_text = time_slot.text.strip()  # Extract the time text (e.g., "7:09 AM")
        print(f"⏰ Available time: {time_text}")  # Print the available time for debugging

        if time_text in config.PREFERRED_TIMES:
            print(f"🎯 Found preferred tee time: {time_text}. Booking now...")
            time_slot.click()
            time.sleep(2)

            # Wait for the number of players dropdown to be visible and select "1"
            num_players_dropdown = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "ddlNumPlayers"))
            )

            # Select 1 player (assumed choice)
            num_players_dropdown.click()
            option_1_player = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//option[text()='1']"))
            )
            option_1_player.click()

            # Now, wait for the BOOK button to be clickable
            book_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.ID, "dnn_ctr3370_DefaultView_ctl01_dlTeeTimes_lnkBook_0"))
            )
            book_button.click()
            time.sleep(2)

            print(f"✅ Tee time at {time_text} successfully booked!")
            return True

    print("❌ No preferred tee times available.")
    return False


def run_bot():
    """Runs the bot to book a tee time if available."""
    driver = setup_driver()
    try:
        login(driver)
        booked = check_and_book(driver)
        if booked:
            print("🎉 Booking complete!")
        else:
            print("🔄 No tee times available. Try running again later.")
    finally:
        driver.quit()

if __name__ == "__main__":
    run_bot()
