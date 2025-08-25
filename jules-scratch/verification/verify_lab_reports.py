import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    print("Navigating to login page...")
    page.goto("http://localhost:3000/login", timeout=60000)
    print("Login page loaded.")

    print("Filling in username...")
    page.get_by_placeholder("Username").fill("doctor@example.com", timeout=60000)
    print("Username filled.")

    print("Filling in password...")
    page.get_by_placeholder("Password").fill("password", timeout=60000)
    print("Password filled.")

    print("Clicking login button...")
    page.get_by_role("button", name="Log In").click(timeout=60000)
    print("Login button clicked.")

    print("Waiting for navigation to my-patients...")
    expect(page).to_have_url("http://localhost:3000/my-patients", timeout=60000)
    print("Navigated to my-patients.")

    # Open patient details
    print("Opening patient details...")
    page.get_by_role("row").filter(has_text="John Doe").get_by_role("button", name="View").click()
    print("Patient details opened.")

    # Go to Lab Reports tab and take a screenshot
    print("Going to Lab Reports tab...")
    page.get_by_role("tab", name="Lab Reports").click()
    print("Lab Reports tab opened.")
    page.screenshot(path="jules-scratch/verification/lab_reports_tab.png")
    print("Screenshot of Lab Reports tab taken.")

    # Add a new report
    print("Adding a new report...")
    page.get_by_role("button", name="Add New Report").click()
    print("Add New Report button clicked.")
    page.get_by_label("Title").fill("Test Report")
    print("Title filled.")
    page.get_by_label("Date").fill("2025-08-25")
    print("Date filled.")
    page.get_by_label("File").set_input_files("public/sample.dcm")
    print("File selected.")
    page.get_by_role("button", name="Add").click()
    print("Add button clicked.")

    # Verify the new report is there and take a screenshot
    print("Verifying new report...")
    expect(page.get_by_text("Test Report")).to_be_visible()
    print("New report verified.")
    page.screenshot(path="jules-scratch/verification/lab_reports_after_add.png")
    print("Screenshot of new report taken.")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
