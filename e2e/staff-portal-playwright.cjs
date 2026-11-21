// End-to-end verification of the scoped staff self-service portal.
// Run with: node e2e/staff-portal-playwright.cjs
// Uses the Playwright installation available in the portfolio workspace.
const { chromium } = require("/Users/terry/Projects/Terence/portfolio/node_modules/playwright");

const ADMIN_URL = process.env.ADMIN_URL || "https://prescripto-admin-thatdevterry.vercel.app";
const ORIGINAL_NAME = "Dr. Richard James";
const EDITED_NAME = "Dr. Richard James (Staff Portal QA)";

(async () => {
  const results = [];
  const check = (name, ok, detail = "") => {
    results.push({ name, ok: Boolean(ok), detail });
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  };

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));

  try {
    await page.goto(ADMIN_URL, { waitUntil: "domcontentloaded" });

    // 1. Demo staff login
    await page.getByRole("button", { name: "Try demo staff" }).click();
    await page.waitForURL("**/staff", { timeout: 30000 });
    await page.getByTestId("staff-name").waitFor({ timeout: 30000 });
    check("demo staff login lands on /staff", page.url().includes("/staff"), page.url());

    // 2. Portal shows only the signed-in staff member's limited info
    const name0 = (await page.getByTestId("staff-name").innerText()).trim();
    check("own name is shown", name0.includes("Richard James"), name0);
    const body = await page.locator("body").innerText();
    for (const label of ["Role:", "Specialization:", "Email", "Phone", "Address", "My upcoming appointments"]) {
      check(
        `limited-info section present: ${label}`,
        body.toLowerCase().includes(label.toLowerCase())
      );
    }

    // 3. No admin data anywhere in the rendered portal
    const adminMarkers = [
      "All Appointments", "Add Doctor", "Doctors List", "All Patients",
      "Revenue", "Earnings", "Dashboard", "Announcements", "Admin Settings",
    ];
    const leaked = adminMarkers.filter((marker) => body.includes(marker));
    check("no admin data is rendered", leaked.length === 0, leaked.join(", "));
    check("no admin sidebar is rendered", (await page.locator("aside").count()) === 0);

    // 4. Editing own name persists
    await page.getByRole("button", { name: "Edit my details" }).click();
    await page.getByLabel("Full name").fill(EDITED_NAME);
    await page.getByRole("button", { name: "Save changes" }).click();
    await page.getByText(EDITED_NAME, { exact: true }).first().waitFor({ timeout: 30000 });
    check("name updates after save", (await page.getByTestId("staff-name").innerText()).trim() === EDITED_NAME);

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByText(EDITED_NAME, { exact: true }).first().waitFor({ timeout: 30000 });
    const persisted = (await page.getByTestId("staff-name").innerText()).trim();
    check("name persists after reload", persisted === EDITED_NAME, persisted);

    const bodyAfter = await page.locator("body").innerText();
    const leakedAfter = adminMarkers.filter((marker) => bodyAfter.includes(marker));
    check("still no admin data after reload", leakedAfter.length === 0, leakedAfter.join(", "));

    // 5. Restore the original demo name so the live demo stays tidy.
    await page.getByRole("button", { name: "Edit my details" }).click();
    await page.getByLabel("Full name").fill(ORIGINAL_NAME);
    await page.getByRole("button", { name: "Save changes" }).click();
    await page.getByText(ORIGINAL_NAME, { exact: true }).first().waitFor({ timeout: 30000 });
    check("demo name restored", (await page.getByTestId("staff-name").innerText()).trim() === ORIGINAL_NAME);

    // 6. No console errors
    check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" | "));
  } catch (error) {
    check("verification completed without exceptions", false, error.message);
  } finally {
    await browser.close();
  }

  const failed = results.filter((result) => !result.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  process.exit(failed.length ? 1 : 0);
})();
