// End-to-end verification of the shared admin/staff portal features.
// Run with: node e2e/portal-features-playwright.cjs
// Uses the Playwright installation available in the portfolio workspace.
const { chromium } = require("/Users/terry/Projects/Terence/portfolio/node_modules/playwright");

const ADMIN_URL = process.env.ADMIN_URL || "https://prescripto-admin-thatdevterry.vercel.app";
const REQUEST_DATE = "2026-12-15";
const REQUEST_REASON = "Portal QA verification";

(async () => {
  const results = [];
  const check = (name, ok, detail = "") => {
    results.push({ name, ok: Boolean(ok), detail });
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  };

  const browser = await chromium.launch({ headless: true });

  const attachConsole = (page, bucket) => {
    page.on("console", (msg) => {
      if (msg.type() === "error") bucket.push(msg.text());
    });
    page.on("pageerror", (error) => bucket.push(`pageerror: ${error.message}`));
  };

  const adminErrors = [];
  const staffErrors = [];

  try {
    // ---------------- Admin ----------------
    const admin = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    attachConsole(admin, adminErrors);
    await admin.goto(ADMIN_URL, { waitUntil: "domcontentloaded" });
    await admin.getByRole("button", { name: "Sign in as demo admin" }).click();
    await admin.getByTestId("pending-orders").waitFor({ timeout: 30000 });
    check("admin login reaches dashboard", admin.url().includes("admin-dashboard"), admin.url());
    check(
      "admin pending orders widget shows",
      (await admin.getByTestId("pending-orders-title").innerText()).trim() === "Pending orders"
    );

    await admin.getByRole("link", { name: "Orders", exact: true }).click();
    await admin.getByTestId("orders-table").waitFor({ timeout: 30000 });
    const adminSelect = admin.locator('[data-testid^="order-status-"]').first();
    const adminOrderId = await adminSelect.getAttribute("data-testid");
    await adminSelect.selectOption("completed");
    check("admin status control advances order", (await adminSelect.inputValue()) === "completed");
    await admin.reload({ waitUntil: "domcontentloaded" });
    await admin.getByTestId("orders-table").waitFor({ timeout: 30000 });
    check(
      "admin status persists after reload",
      (await admin.locator(`[data-testid="${adminOrderId}"]`).inputValue()) === "completed"
    );

    await admin.getByRole("link", { name: "Messages", exact: true }).click();
    await admin.getByTestId("messages-inbox").waitFor({ timeout: 30000 });
    const adminInboxCount = await admin.locator('[data-testid="messages-inbox"] > li').count();
    check("admin messages inbox renders", adminInboxCount >= 3, `${adminInboxCount} messages`);
    await admin.locator('[data-testid="messages-inbox"] button').first().click();
    check(
      "admin message detail opens",
      !(await admin.getByTestId("message-detail").innerText()).includes("Select a message")
    );

    await admin.getByRole("link", { name: "Schedule", exact: true }).click();
    await admin.getByTestId("schedule-heading").waitFor({ timeout: 30000 });
    check("admin schedule requests visible", (await admin.getByText("Schedule requests").count()) > 0);

    // ---------------- Staff ----------------
    const staff = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    attachConsole(staff, staffErrors);
    await staff.goto(ADMIN_URL, { waitUntil: "domcontentloaded" });
    await staff.getByRole("button", { name: "Try demo staff" }).click();
    await staff.getByTestId("staff-name").waitFor({ timeout: 30000 });
    check("staff login reaches portal", staff.url().includes("/staff"), staff.url());
    check(
      "staff pending orders widget shows",
      await staff.getByTestId("pending-orders").isVisible()
    );

    const staffTab = (label) =>
      staff.locator('nav[aria-label="Staff portal sections"] button', { hasText: label });

    await staffTab("Orders").click();
    await staff.getByTestId("orders-table").waitFor({ timeout: 30000 });
    const staffSelect = staff.locator('[data-testid^="order-status-"]').first();
    const staffOrderId = await staffSelect.getAttribute("data-testid");
    await staffSelect.selectOption("confirmed");
    check("staff status control advances order", (await staffSelect.inputValue()) === "confirmed");
    await staff.reload({ waitUntil: "domcontentloaded" });
    await staffTab("Orders").click();
    await staff.getByTestId("orders-table").waitFor({ timeout: 30000 });
    check(
      "staff status persists after reload",
      (await staff.locator(`[data-testid="${staffOrderId}"]`).inputValue()) === "confirmed"
    );

    await staffTab("Messages").click();
    await staff.getByTestId("messages-inbox").waitFor({ timeout: 30000 });
    const staffInboxCount = await staff.locator('[data-testid="messages-inbox"] > li').count();
    check("staff messages inbox renders", staffInboxCount >= 2, `${staffInboxCount} messages`);

    await staffTab("Schedule").click();
    await staff.getByTestId("schedule-heading").waitFor({ timeout: 30000 });
    await staff.getByLabel("Request date").fill(REQUEST_DATE);
    await staff.getByLabel("Request reason").fill(REQUEST_REASON);
    await staff.getByRole("button", { name: "Submit request" }).click();
    await staff.getByText(REQUEST_REASON).first().waitFor({ timeout: 10000 });
    await staff.reload({ waitUntil: "domcontentloaded" });
    await staffTab("Schedule").click();
    await staff.getByText(REQUEST_REASON).first().waitFor({ timeout: 15000 });
    check("staff schedule request persists after reload", true);
    check(
      "staff availability toggle present",
      await staff.getByTestId("schedule-availability").isVisible()
    );

    check("no admin console errors", adminErrors.length === 0, adminErrors.slice(0, 3).join(" | "));
    check("no staff console errors", staffErrors.length === 0, staffErrors.slice(0, 3).join(" | "));
  } catch (error) {
    check("verification completed without exceptions", false, error.message);
  } finally {
    await browser.close();
  }

  const failed = results.filter((result) => !result.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  process.exit(failed.length ? 1 : 0);
})();
