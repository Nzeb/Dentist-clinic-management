from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Navigate to the login page
        page.goto("http://localhost:3000/login")

        # Wait for the page to be fully loaded
        page.wait_for_load_state('networkidle')

        # Wait for the login form to be visible
        expect(page.get_by_role("heading", name="Login")).to_be_visible()

        # 2. Fill in the username and password
        page.get_by_label("Username").fill("admin")
        page.get_by_label("Password").fill("password")

        # 3. Click the login button
        page.get_by_role("button", name="Login").click()

        # Wait for navigation to the home page (or any other page that indicates a successful login)
        expect(page).to_have_url("http://localhost:3000/")

        # 4. Navigate to the patients page
        page.goto("http://localhost:3000/patients")

        # 5. Click on the first patient in the table
        first_patient_row = page.locator("table > tbody > tr").first
        expect(first_patient_row).to_be_visible()
        first_patient_row.click()

        # 6. Click on the "History" tab
        history_tab = page.locator('button[role="tab"]:has-text("History")')
        expect(history_tab).to_be_visible()
        history_tab.click()

        # Wait for the history content to be visible
        history_content = page.locator('div[role="tabpanel"][data-state="active"]')
        expect(history_content).to_be_visible()

        # 7. Take a screenshot of the history tab
        page.screenshot(path="jules-scratch/verification/verification.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
