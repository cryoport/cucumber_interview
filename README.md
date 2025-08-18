# QA Automation Challenge – Mini Cart API (Node + Cucumber.js)

Welcome!  
Your task is to write automated tests in **Cucumber.js** for this small Node/Express API that simulates a shopping cart.  
We’ve intentionally baked in some quirks — your job is to find them, write clear scenarios to expose them, and (if time allows) suggest a fix.

---

## 📦 Getting Started

### 1. Install & Run
```bash
npm install
npm run dev
# API runs at http://localhost:3000
```

### API Endpoints
Endpoints (happy-path only)
- POST /login {email, password} → {token} (valid: user@example.com / secret)
- POST /reset → clears in-memory state (use for test isolation)
- GET /products → list of {sku, name, price, stock}
- POST /cart/add {token, sku, qty} → {cart}
- POST /cart/apply-coupon {token, code} → {cart}

- Known codes: SAVE10 (10% off), FREESHIP (free shipping)

- GET /cart/total?token=... → {subtotal, discount, tax, shipping, total}

- POST /checkout {token} → {orderId, total} (decrements stock; fails if out of stock)


## ✅ Steps for this challenge

1) Scope
- Create automated tests for BOTH of the following, based on Requirements.md:
  - Registration UI: cover happy path
  - API endpoints (Mini Cart): checkout with out of stock validation

2) Framework & tooling
- Use Cucumber.js for BDD (already in this repo).

3) Reporting & evidence (required)
- Produce an artifact document showing pass/fail with supporting evidence.
- Minimum required artifacts:
  - Cucumber JSON output (e.g., ./artifacts/cucumber-report.json)
  - HTML report generated from the JSON (e.g., multiple-cucumber-html-reporter or cucumber-html-reporter) to ./artifacts/html
  - Screenshots for UI steps saved under ./artifacts/screenshots and attached/linked in the HTML report
  - (Optional) Videos or Playwright traces for failed scenarios saved under ./artifacts/videos or ./artifacts/traces
- Ensure the report is self-contained and can be reviewed offline.

5) Running tests (suggested commands)
- Run `npm run test`
- Ensure the commands run headless and create/update the ./artifacts directory.

6) Acceptance criteria
- Clear feature files that describe expected behavior for Login UI and Cart API.
- Stable step definitions with reliable selectors and API assertions.
- One-command execution that runs locally and in CI.
- Artifacts include: HTML report, JSON, and screenshots (at minimum) with pass/fail status for each scenario.
