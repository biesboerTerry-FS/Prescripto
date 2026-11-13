// Accessibility (axe-core, WCAG 2.1 A/AA) and responsiveness audit.
// Run with the API, patient site and admin panel running:
//   npm run audit
// Env: FRONTEND_URL (default http://localhost:5190), ADMIN_URL (default http://localhost:5191),
//      BACKEND_URL (default http://localhost:3100), ADMIN_EMAIL, ADMIN_PASSWORD
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import { createRequire } from "module";
import fs from "fs";

const require = createRequire(import.meta.url);
const AXE_SOURCE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5190";
const ADMIN = process.env.ADMIN_URL || "http://localhost:5191";
const BACKEND = process.env.BACKEND_URL || "http://localhost:3100";
const WIDTHS = [375, 768, 1280];
const THEMES = ["light", "dark"];

const PUBLIC_PAGES = ["/", "/doctors", "/doctors/Neurologist", "/about", "/contact", "/login", "/faqs", "/privacy", "/terms", "/nope"];
const ADMIN_PAGES = ["/admin-dashboard", "/all-appointments", "/patients", "/add-doctor", "/doctor-list"];

const driver = await new Builder()
	.forBrowser("chrome")
	.setChromeOptions(new chrome.Options().addArguments("--headless=new", "--no-sandbox", "--disable-gpu"))
	.build();

const problems = [];
const summary = new Map();

const setTheme = async (theme) => {
	await driver.executeScript(`localStorage.setItem("prescripto-theme", arguments[0])`, theme);
};

const settle = async () => {
	await driver.wait(async () => driver.executeScript("return document.readyState === 'complete'"), 15000);
	await driver.sleep(600);
};

const runAxe = async () => {
	await driver.executeScript(AXE_SOURCE);
	return driver.executeAsyncScript(`
		const done = arguments[arguments.length - 1];
		axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } })
			.then(r => done(r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, sample: v.nodes[0] ? v.nodes[0].target.join(" ") : "" }))))
			.catch(e => done([{ id: "axe-error", impact: "critical", help: String(e), nodes: 0, sample: "" }]));
	`);
};

const overflow = () =>
	driver.executeScript(
		"return { doc: document.documentElement.scrollWidth, view: document.documentElement.clientWidth, offenders: [...document.querySelectorAll('body *')].filter(el => { const r = el.getBoundingClientRect(); return r.right > document.documentElement.clientWidth + 1 && r.width > 0 && getComputedStyle(el).position !== 'fixed'; }).slice(0, 3).map(el => el.tagName + '.' + String(el.className).split(' ').slice(0,2).join('.')) }"
	);

const audit = async (base, paths, label, prepare) => {
	for (const width of WIDTHS) {
		await driver.manage().window().setRect({ width, height: 900 });
		for (const theme of THEMES) {
			for (const path of paths) {
				await driver.get(base + path);
				await setTheme(theme);
				await driver.navigate().refresh();
				if (prepare) await prepare();
				await settle();
				const name = `${label} ${path} [${width}px, ${theme}]`;
				const { doc, view, offenders } = await overflow();
				if (doc > view) problems.push({ page: name, kind: "horizontal-overflow", detail: `${doc}px > ${view}px: ${offenders.join(", ") || "unknown"}` });
				const violations = await runAxe();
				for (const v of violations) {
					const key = `${v.id} (${v.impact})`;
					summary.set(key, (summary.get(key) || 0) + 1);
					problems.push({ page: name, kind: "axe", id: v.id, impact: v.impact, help: v.help, nodes: v.nodes, sample: v.sample });
				}
			}
		}
	}
};

const adminLogin = async () => {
	const email = process.env.ADMIN_EMAIL || "admin@prescripto.com";
	const password = process.env.ADMIN_PASSWORD;
	if (!password) throw new Error("Set ADMIN_PASSWORD to audit the admin panel");
	const token = await driver.executeAsyncScript(
		`const done = arguments[arguments.length - 1];
		fetch(arguments[0] + "/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: arguments[1], password: arguments[2] }) })
			.then(r => r.json()).then(d => done(d.token)).catch(() => done(null));`,
		BACKEND, email, password
	);
	if (!token) throw new Error("Admin login failed");
	await driver.executeScript("localStorage.setItem('adminToken', arguments[0])", token);
};

try {
	await audit(FRONTEND, PUBLIC_PAGES, "patient");
	await driver.get(ADMIN);
	await audit(ADMIN, ["/"], "admin-login");
	let signedIn = false;
	await audit(ADMIN, ADMIN_PAGES, "admin", async () => {
		// sign in once: the API limits logins, and the token persists in localStorage
		if (!signedIn) {
			await adminLogin();
			signedIn = true;
		}
	});

	console.log("\n== Accessibility summary (axe, WCAG 2.1 A/AA) ==");
	if (summary.size === 0) console.log("no violations");
	for (const [key, count] of [...summary.entries()].sort((a, b) => b[1] - a[1])) console.log(`${String(count).padStart(4)}  ${key}`);

	const overflowCount = problems.filter((p) => p.kind === "horizontal-overflow").length;
	console.log(`\n== Responsiveness: ${overflowCount} page/width combinations overflow horizontally ==`);
	const seen = new Set();
	for (const p of problems) {
		const key = p.kind === "axe" ? `${p.page}|${p.id}` : `${p.page}|overflow`;
		if (seen.has(key)) continue;
		seen.add(key);
		if (p.kind === "axe") console.log(`- ${p.page}: ${p.id} (${p.impact}, ${p.nodes} nodes) ${p.sample}`);
		else console.log(`- ${p.page}: ${p.detail}`);
	}
	fs.writeFileSync("audit-report.json", JSON.stringify(problems, null, 2));
	console.log("\nFull report: audit-report.json");
} finally {
	await driver.quit();
}
