from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Login as admin
    page.goto("http://localhost:3000/login")
    # Wait for the heading to appear, which indicates client-side rendering is complete
    page.wait_for_selector('h3:has-text("Login to Dental Clinic")')

    page.get_by_placeholder("Username").fill("admin")
    page.get_by_placeholder("Password").fill("password")
    page.get_by_role("button", name="Log In").click()
    page.wait_for_url("http://localhost:3000/dashboard")

    # Verify patients page
    page.goto("http://localhost:3000/patients")
    page.get_by_text("John Doe").click()
    page.wait_for_selector('div[role="dialog"]')
    page.get_by_role("tab", name="Management Plan").click()
    page.screenshot(path="jules-scratch/verification/patients-management-plan.png")

    # Close the dialog
    page.get_by_label("Close").click()

    # Logout
    page.get_by_role("button", name="Log out").click()
    page.wait_for_url("http://localhost:3000/login")

    # Login as doctor
    page.wait_for_selector('h3:has-text("Login to Dental Clinic")')
    page.get_by_placeholder("Username").fill("doctor")
    page.get_by_placeholder("Password").fill("password")
    page.get_by_role("button", name="Log In").click()
    page.wait_for_url("http://localhost:3000/dashboard")

    # Verify my-patients page
    page.goto("http://localhost:3000/my-patients")
    page.get_by_text("Jane Smith").click()
    page.wait_for_selector('div[role="dialog"]')
    page.get_by_role("tab", name="Management Plan").click()
    page.screenshot(path="jules-scratch/verification/my-patients-management-plan.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
