# Selenium E2E tests

Run from the repo root:

```bash
# 1. Start the stack (3 terminals)
cd backend && npm start
cd frontend && npm run dev
cd admin && npm run dev

# 2. Run tests
npm install          # root: selenium-webdriver + chromedriver
npm run e2e
```

## Browser

- **Chrome (default):** install Google Chrome. The matching chromedriver is
  fetched automatically by selenium-webdriver's bundled Selenium Manager —
  no manual driver setup.
- **Safari (no Chrome needed):** enable Safari's WebDriver once, then
  `npm run e2e:safari`.

```bash
safaridriver -p      # allow control (one-time, prompts for approval)
```

## URLs

Override with `FRONTEND_URL` / `BACKEND_URL` env vars. The spec covers:
`/health`, homepage title + hero, `/doctors`, and the login form.

If port 5173 is already taken on your machine (e.g. another Vite app),
start ours elsewhere and point the tests at it:

```bash
cd frontend && npm run dev -- --port 5177 --strictPort
FRONTEND_URL=http://localhost:5177 npm run e2e
```
