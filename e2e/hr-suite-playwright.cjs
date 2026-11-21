// End-to-end verification of the admin-only HR suite.
// Run with: node e2e/hr-suite-playwright.cjs
// Uses the Playwright installation available in the portfolio workspace.
const { chromium } = require("/Users/terry/Projects/Terence/portfolio/node_modules/playwright");

const ADMIN_URL = process.env.ADMIN_URL || "https://prescripto-admin-thatdevterry.vercel.app";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://prescripto-frontend-thatdevterry.vercel.app";
const API_URL = process.env.API_URL || "https://prescripto-api-thatdevterry.vercel.app";
const stamp = Date.now();
const QA_EMAIL = `hr.qa.${stamp}@prescripto.com`;
const QA_NOTE = `HR QA performance note ${stamp}`;
const QA_DEPARTMENT = `QA Department ${stamp}`;
const QA_ROLE = `QA Role ${stamp}`;

(async () => {
  const results = [];
  const check = (name, ok, detail = "") => {
    results.push({ name, ok: Boolean(ok), detail });
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  };

  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const attachConsole = (page, label) => {
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(`${label}: ${msg.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`${label}: pageerror: ${error.message}`));
  };

  try {
    // --- Backend authorization -------------------------------------------
    const unauth = await browser.newPage();
    const response = await unauth.request.get(`${API_URL}/api/admin/hr/staff`);
    check("HR API rejects requests without an admin token", response.status() === 401, `status ${response.status()}`);
    const doctorList = await (await unauth.request.get(`${API_URL}/api/doctor/list`)).json();
    check("public doctor browse still works", doctorList.success && doctorList.doctors.length === 60, `${doctorList.doctors?.length} doctors`);
    await unauth.close();

    // --- Admin login and HR nav -----------------------------------------
    const admin = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    attachConsole(admin, "admin");
    await admin.goto(ADMIN_URL, { waitUntil: "domcontentloaded" });
    await admin.getByRole("button", { name: "Sign in as demo admin" }).click();
    await admin.getByTestId("hr-nav-group").waitFor({ timeout: 30000 });
    check("demo admin login reaches admin layout", admin.url().includes("admin-dashboard"), admin.url());
    check("HR nav group is present", (await admin.getByTestId("hr-nav-group").innerText()).trim() === "HR");
    for (const label of ["Staff directory", "Staff management", "Roles & departments", "Payroll", "Time-off approvals", "Performance notes"]) {
      check(`HR nav link: ${label}`, await admin.getByRole("link", { name: label, exact: true }).isVisible());
    }

    // --- Directory: search, filter, detail -------------------------------
    await admin.getByRole("link", { name: "Staff directory", exact: true }).click();
    await admin.getByTestId("hr-staff-table").waitFor({ timeout: 30000 });
    await admin.getByTestId("hr-staff-row").first().waitFor({ timeout: 30000 });
    const allRows = await admin.getByTestId("hr-staff-row").count();
    check("staff directory lists staff", allRows >= 8, `${allRows} rows`);
    await admin.getByTestId("hr-staff-search").fill("Richard James");
    await admin.waitForTimeout(250);
    const searched = await admin.getByTestId("hr-staff-row").count();
    check("staff directory search filters", searched >= 1 && searched < allRows, `${searched} of ${allRows}`);
    await admin.getByTestId("hr-staff-search").fill("");
    await admin.getByTestId("hr-status-filter").selectOption("inactive");
    await admin.waitForTimeout(250);
    const inactive = await admin.getByTestId("hr-staff-row").count();
    check("staff directory status filter works", inactive >= 1 && inactive < allRows, `${inactive} inactive`);
    await admin.getByTestId("hr-status-filter").selectOption("all");
    await admin.waitForTimeout(250);
    await admin.getByTestId("hr-department-filter").selectOption({ label: "Neurology" });
    await admin.waitForTimeout(250);
    check("staff directory department filter works", (await admin.getByTestId("hr-staff-row").count()) >= 1);
    await admin.getByTestId("hr-department-filter").selectOption("all");
    await admin.waitForTimeout(250);
    await admin.getByTestId("hr-staff-row").first().getByRole("button", { name: "View" }).click();
    await admin.getByTestId("hr-staff-detail").waitFor({ timeout: 15000 });
    check("staff detail view opens", (await admin.getByTestId("hr-staff-detail").getByRole("heading").first().innerText()).length > 2);
    await admin.getByTestId("hr-detail-close").click();

    // --- Staff management: add, edit, deactivate -------------------------
    await admin.getByRole("link", { name: "Staff management", exact: true }).click();
    await admin.getByTestId("hr-staff-form").waitFor({ timeout: 30000 });
    await admin.getByTestId("hr-staff-name").fill("Dr. Priya Raman");
    await admin.getByTestId("hr-staff-email").fill(QA_EMAIL);
    await admin.getByTestId("hr-staff-password").fill("Demo123456");
    await admin.getByTestId("hr-staff-role").selectOption("General Physician");
    await admin.getByTestId("hr-staff-department").selectOption("Primary Care");
    await admin.getByTestId("hr-staff-phone").fill("+1 555 0199");
    await admin.getByTestId("hr-staff-address1").fill("9 Harbour Street");
    await admin.getByTestId("hr-staff-rate").fill("65");
    await admin.getByTestId("hr-add-staff").click();
    await admin.getByText("Dr. Priya Raman", { exact: true }).first().waitFor({ timeout: 30000 });
    check("admin can add staff", (await admin.getByText("Dr. Priya Raman", { exact: true }).count()) > 0);

    // Find the new row and its id from the edit button test id.
    const newRow = admin.getByTestId("hr-manage-row").filter({ hasText: "Dr. Priya Raman" }).first();
    const newIdAttr = await newRow.locator('[data-testid^="hr-edit-staff-"]').getAttribute("data-testid");
    const newId = newIdAttr.replace("hr-edit-staff-", "");
    check("new staff has a detail/edit id", Boolean(newId), newId || "none");

    await newRow.locator(`[data-testid="hr-edit-staff-${newId}"]`).click();
    await admin.getByTestId("hr-staff-phone").fill("+1 555 0200");
    await admin.getByTestId("hr-staff-rate").fill("70");
    await admin.getByTestId("hr-save-staff").click();
    await admin.waitForTimeout(1200);
    check("admin can edit staff", (await admin.getByTestId("hr-staff-form").getByTestId("hr-staff-name").inputValue()) === "");

    check("edited staff record is retained", (await admin.getByTestId("hr-manage-row").filter({ hasText: "Dr. Priya Raman" }).count()) > 0);

    await admin.getByTestId(`hr-deactivate-staff-${newId}`).click();
    await admin.waitForTimeout(1200);
    check("admin can deactivate staff (no delete)", (await admin.getByTestId(`hr-activate-staff-${newId}`).count()) === 1 && (await admin.getByTestId("hr-manage-row")).count() >= 1);

    // --- Roles & departments --------------------------------------------
    await admin.getByRole("link", { name: "Roles & departments", exact: true }).click();
    await admin.getByTestId("hr-departments").waitFor({ timeout: 30000 });
    await admin.getByTestId("hr-department-input").fill(QA_DEPARTMENT);
    await admin.getByTestId("hr-department-add").click();
    await admin.getByText(QA_DEPARTMENT, { exact: true }).first().waitFor({ timeout: 15000 });
    check("admin can add a department", (await admin.getByText(QA_DEPARTMENT, { exact: true }).count()) > 0);
    await admin.getByTestId("hr-role-input").fill(QA_ROLE);
    await admin.getByTestId("hr-role-add").click();
    await admin.getByText(QA_ROLE, { exact: true }).first().waitFor({ timeout: 15000 });
    check("admin can add a role label", (await admin.getByText(QA_ROLE, { exact: true }).count()) > 0);

    // --- Payroll ----------------------------------------------------------
    await admin.getByRole("link", { name: "Payroll", exact: true }).click();
    await admin.getByTestId("hr-payroll-table").waitFor({ timeout: 30000 });
    const beforeRuns = await admin.getByTestId("hr-payroll-row").count();
    await admin.getByTestId("hr-payroll-period").fill("2026-11");
    await admin.getByTestId("hr-payroll-staff").selectOption(newId).catch(async () => {
      await admin.getByTestId("hr-payroll-staff").selectOption({ label: "Dr. Priya Raman" });
    });
    await admin.getByTestId("hr-run-payroll").click();
    await admin.waitForTimeout(1500);
    const afterRuns = await admin.getByTestId("hr-payroll-row").count();
    check("run payroll adds a pay-run record", afterRuns > beforeRuns, `${beforeRuns} → ${afterRuns}`);

    // --- Time-off approval ------------------------------------------------
    await admin.getByRole("link", { name: "Time-off approvals", exact: true }).click();
    await admin.getByTestId("hr-timeoff-table").waitFor({ timeout: 30000 });
    const pendingRow = admin.getByTestId("hr-timeoff-table").locator('[data-testid^="hr-timeoff-row-"]').filter({ has: admin.locator('[data-testid^="hr-timeoff-approve-"]') }).first();
    await pendingRow.waitFor({ timeout: 15000 });
    const requestId = (await pendingRow.locator('[data-testid^="hr-timeoff-approve-"]').getAttribute("data-testid")).replace("hr-timeoff-approve-", "");
    await admin.getByTestId(`hr-timeoff-approve-${requestId}`).click();
    await admin.waitForTimeout(1200);
    await admin.getByTestId("hr-timeoff-filter").selectOption("all");
    await admin.waitForTimeout(300);
    const approvedRow = admin.getByTestId(`hr-timeoff-row-${requestId}`);
    check("admin can approve time-off", (await approvedRow.innerText()).toLowerCase().includes("approved"));

    // --- Performance note -------------------------------------------------
    await admin.getByRole("link", { name: "Performance notes", exact: true }).click();
    await admin.getByTestId("hr-note-form").waitFor({ timeout: 30000 });
    await admin.getByTestId("hr-note-staff").selectOption(newId).catch(async () => {
      await admin.getByTestId("hr-note-staff").selectOption({ label: "Dr. Priya Raman" });
    });
    await admin.getByTestId("hr-note-author").fill("Dr. Richard James");
    await admin.getByTestId("hr-note-text").fill(QA_NOTE);
    await admin.getByTestId("hr-add-note").click();
    await admin.getByText(QA_NOTE, { exact: true }).first().waitFor({ timeout: 15000 });
    check("admin can add a performance note", (await admin.getByText(QA_NOTE, { exact: true }).count()) > 0);

    check("no admin console errors", errors.filter((e) => e.startsWith("admin:")).length === 0, errors.slice(0, 3).join(" | "));

    // --- Existing demos still work --------------------------------------
    const staff = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    attachConsole(staff, "staff");
    await staff.goto(ADMIN_URL, { waitUntil: "domcontentloaded" });
    await staff.getByRole("button", { name: "Try demo staff" }).click();
    await staff.getByTestId("staff-name").waitFor({ timeout: 30000 });
    check("demo doctor/staff login still works", staff.url().includes("/staff"), staff.url());
    check("staff portal has no HR navigation", (await staff.getByTestId("hr-nav-group").count()) === 0);
    check("no staff console errors", errors.filter((e) => e.startsWith("staff:")).length === 0, errors.slice(0, 3).join(" | "));
    await staff.close();

    const patient = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    attachConsole(patient, "patient");
    await patient.goto(`${FRONTEND_URL}/login`, { waitUntil: "domcontentloaded" });
    await patient.getByRole("button", { name: "Enter demo patient account" }).click();
    await patient.waitForTimeout(2500);
    check("demo patient login still works", !patient.url().endsWith("/login"), patient.url());
    check("no patient console errors", errors.filter((e) => e.startsWith("patient:")).length === 0, errors.slice(0, 3).join(" | "));
    await patient.close();
  } catch (error) {
    check("verification completed without exceptions", false, error.message);
  } finally {
    await browser.close();
  }

  const failed = results.filter((result) => !result.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  process.exit(failed.length ? 1 : 0);
})();
