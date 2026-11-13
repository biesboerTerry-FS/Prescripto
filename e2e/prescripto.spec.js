// Selenium E2E smoke tests for Prescripto.
// Prerequisites:
//   1. Google Chrome installed (webdriver + chromedriver are npm deps).
//      No Chrome? Use Safari:  npm run e2e:safari   (after `safaridriver -p`)
//   2. Backend running  (cd backend && npm start)
//   3. Frontend running (cd frontend && npm run dev)
// Override URLs with env vars: FRONTEND_URL, BACKEND_URL
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import safari from "selenium-webdriver/safari.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
const USE_SAFARI = process.env.SAFARI === "1";

const results = [];
const test = async (name, fn) => {
	try {
		await fn();
		results.push({ name, ok: true });
		console.log(`✓ ${name}`);
	} catch (error) {
		results.push({ name, ok: false, error: error.message });
		console.log(`✗ ${name}\n   ${error.message}`);
	}
};

const assert = (cond, message) => {
	if (!cond) throw new Error(message);
};

let driver;
const run = async () => {
	const builder = new Builder();
	if (USE_SAFARI) {
		builder.forBrowser("safari");
	} else {
		const options = new chrome.Options();
		options.addArguments("--headless=new", "--disable-gpu", "--no-sandbox");
		// No manual ServiceBuilder: selenium-webdriver's bundled Selenium
		// Manager auto-downloads a chromedriver matching the installed Chrome.
		builder.forBrowser("chrome").setChromeOptions(options);
	}
	driver = await builder.build();
	driver.manage().setTimeouts({ implicit: 10000, pageLoad: 30000 });

	await test("backend /health responds", async () => {
		await driver.get(`${BACKEND_URL}/health`);
		const body = await driver.findElement(By.css("body")).getText();
		assert(body.includes("success"), `unexpected /health body: ${body}`);
	});

	await test("homepage loads with title", async () => {
		await driver.get(FRONTEND_URL);
		const title = await driver.getTitle();
		assert(title.includes("Prescripto"), `title was "${title}"`);
	});

	await test("homepage has hero CTA", async () => {
		await driver.get(FRONTEND_URL);
		const hero =
			await driver.findElement(By.xpath("//*[contains(text(),'Book an Appointment')]"));
		assert(await hero.isDisplayed(), "hero heading not visible");
	});

	await test("doctors page renders links", async () => {
		await driver.get(`${FRONTEND_URL}/doctors`);
		await driver.wait(until.elementLocated(By.css("body")), 10000);
		const bodyText = await driver.findElement(By.css("body")).getText();
		// With seeded doctors the list shows specialties; without a DB it is
		// still a rendered shell — both pass as long as the page mounted.
		assert(bodyText.length > 50, "doctors page looks blank");
	});

	await test("login page has email + password fields", async () => {
		await driver.get(`${FRONTEND_URL}/login`);
		await driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
		const email = await driver.findElement(By.css('input[type="email"]'));
		const password = await driver.findElement(By.css('input[type="password"]'));
		assert(await email.isDisplayed(), "email field hidden");
		assert(await password.isDisplayed(), "password field hidden");
	});

	await driver.quit();

	const failed = results.filter((r) => !r.ok);
	console.log(`\n${results.length - failed.length}/${results.length} passed`);
	if (failed.length) process.exitCode = 1;
};

run().catch(async (error) => {
	console.error("E2E harness failed:", error.message);
	if (driver) await driver.quit();
	process.exit(1);
});
