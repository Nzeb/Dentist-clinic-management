import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Login
    try:
        page.goto("http://localhost:3000/login", timeout=60000)
        page.screenshot(path="jules-scratch/verification/login_before_expect.png")
        expect(page.get_by_role("button", name="Log In")).to_be_visible(timeout=30000)
        page.get_by_placeholder("Username").fill("doctor")
        page.get_by_placeholder("Password").fill("password")
        page.get_by_role("button", name="Log In").click()
        expect(page).to_have_url("http://localhost:3000/", timeout=30000)
    except Exception as e:
        print(f"Login failed: {e}")
        page.screenshot(path="jules-scratch/verification/login_error.png")
        browser.close()
        return

    # Navigate to My Patients and take screenshot
    page.goto("http://localhost:3000/my-patients")
    expect(page.get_by_role("heading", name="My Patients")).to_be_visible(timeout=30000)
    page.screenshot(path="jules-scratch/verification/my_patients_page.png")

    # Navigate to Patients and take screenshot
    page.goto("http://localhost:3000/patients")
    expect(page.get_by_role("heading", name="Patients")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/patients_page.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
