# Product Requirements

This document specifies functional and non-functional requirements for the Mini Cart API and a future Login UI. It is intended to guide development and test automation (Cucumber.js), including UI and API coverage.

## 1. Scope
- API: Node/Express shopping cart service.
- Login UI: A simple web UI to authenticate and interact with the API.

## 2. Definitions
- User Token: Opaque string returned by `/login`, required to authorize cart operations.
- Cart: A per-user token cart containing line items and an optional coupon.
- Coupons:
  - `SAVE10`: 10% discount on subtotal.
  - `FREESHIP`: Free shipping.

## 3. Functional Requirements — API

### 3.1 System Reset
- Endpoint: `POST /reset`
- Purpose: Reset in-memory state to defaults (users, products, carts).
- Request: no body.
- Response: `200` with `{ ok: true }`.

### 3.2 Login
- Endpoint: `POST /login`
- Request: JSON `{ email: string, password: string }`.
- Success Response: `200` with `{ token: string }`.
- Failure Response: `401` with `{ error: 'invalid' }` for bad credentials.
- Notes: A default user exists: `user@example.com / secret` (see `app.js`).

### 3.3 List Products
- Endpoint: `GET /products`
- Request: none.
- Response: `200` with array of products: `[{ sku, name, price, stock }]`.

### 3.4 Add to Cart
- Endpoint: `POST /cart/add`
- Request: JSON `{ token: string, sku: string, qty: number }`.
- Authorization: Valid `token` required.
- Validation/Errors:
  - `401 { error: 'auth' }` if token is missing/invalid.
  - `404 { error: 'sku' }` if product not found.
  - `400 { error: 'qty' }` if `qty <= 0`.
- Success Response: `200` with cart object `{ items: [{ sku, qty }], coupon: string|null }`.
- Behavior: If line already exists, quantity is incremented by `qty`.

### 3.5 Apply Coupon
- Endpoint: `POST /cart/apply-coupon`
- Request: JSON `{ token: string, code: string }`.
- Authorization: Valid `token` required.
- Validation/Errors:
  - `401 { error: 'auth' }` for invalid token.
  - `400 { error: 'bad_coupon' }` for unknown codes.
- Success Response: `200` with updated cart.

### 3.6 Get Cart Total
- Endpoint: `GET /cart/total?token={token}`
- Authorization: Valid `token` required.
- Response:
  - `401 { error: 'auth' }` if invalid token.
  - `200` with breakdown object:
    ```json
    {
      "subtotal": number,
      "discount": number,
      "tax": number,
      "shipping": number,
      "total": number,
      "taxableBase": number
    }
    ```
  - Pricing Rules (expected behavior):
    - Free shipping threshold is applied on the post-discount subtotal. Orders ship free when `post-discount subtotal >= 50`.
    - `FREESHIP` coupon is case-insensitive and conditional: it does not override the threshold. If the post-discount subtotal is below 50, shipping charges apply even if `FREESHIP` is used.
    - Tax is calculated on the post-discount subtotal (`subtotal - discount`).
  - Current Implementation Notes (intentional quirks in `app.js`):
    - The implementation grants free shipping if `subtotal >= 50` OR the coupon is `FREESHIP` (unconditional free shipping), and calculates tax on the pre-discount subtotal.
  - Test Guidance:
    - Author scenarios to assert the expected behavior above. These scenarios will intentionally fail against the current implementation until the defects are addressed.

### 3.7 Checkout
- Endpoint: `POST /checkout`
- Request: JSON `{ token: string }`.
- Authorization: Valid `token` required.
- Behavior:
  - Validate stock for all cart items; if insufficient, respond `409 { error: 'out_of_stock', sku }`.
  - On success: decrement product stock, compute `total`, clear cart.
- Success Response: `200 { orderId: string, total: number }`.
- Errors:
  - `401 { error: 'auth' }` for invalid token.
  - `409 { error: 'out_of_stock', sku }` as noted.

## 4. Functional Requirements — Login UI (to be implemented)

### 4.1 Login Page
- Fields:
  - Email (required, valid email format).
  - Password (required).
- Controls:
  - Submit button (disabled until both fields are non-empty and email is valid format).
- Behaviors:
  - On submit: POST `/login` with email and password.
  - On success: store `token` securely (in-memory state; if persisted, use secure storage), redirect to Cart page.
  - On failure (`401 invalid`): show inline error: "Invalid email or password".
- Accessibility:
  - Proper labels, focus management, and ARIA for error messaging.
  - Keyboard-accessible; visible focus states.

### 4.2 Cart Page (authenticated)
- Access requires valid `token`; otherwise redirect to Login.
- UI elements:
  - Products list (from `GET /products`) with Add-to-Cart controls (quantity input; default 1).
  - Coupon input and Apply action (posts to `/cart/apply-coupon`).
  - Cart summary (line items, quantities) and price breakdown fetched from `/cart/total`.
  - Checkout button that calls `POST /checkout` and displays result `orderId` and `total`.
- Validation/Errors:
  - Quantity must be positive integer.
  - Display server errors: `auth`, `sku`, `qty`, `bad_coupon`, `out_of_stock` as user-friendly messages.
- State Handling:
  - After successful checkout: show confirmation and clear UI cart state.

## 5. Non-Functional Requirements
- Security: Do not expose the token in URL except where API requires (`/cart/total?token=`); UI should prefer headers/body where possible. Avoid logging sensitive data.
- Reliability: API is in-memory; reset endpoint facilitates deterministic tests.
- Performance: Typical cart operations respond within 200ms on localhost for <= 20 items.
- Accessibility: WCAG 2.1 AA considerations for the Login and Cart pages.
- Observability: Console logging minimized; errors surfaced to UI; enable trace/screenshots in test runs.

## 6. Validation and Test Requirements
- BDD Scenarios in Cucumber for both API and UI.
- Artifact outputs per run:
  - Cucumber JSON and HTML report summarizing pass/fail.
  - Screenshots on UI step failure; optional videos/traces.
- Suggested Test Coverage:
  - Login success/failure; validation states.
  - Products listing; add-to-cart happy and edge cases (qty <= 0, invalid sku).
  - Coupons: valid/invalid; interaction with totals.
  - Totals math including tax, shipping, discount; verify expected behavior per spec.
  - Checkout success; out-of-stock handling and stock decrement.

## 7. Open Questions / Clarifications
- Shipping and tax base: Resolved per section 3.6. Expected is post-discount subtotal; current code deviates (pre-discount tax; unconditional `FREESHIP`).
- Token storage/persistence policy in the UI (memory vs. localStorage/sessionStorage).
- Error copy and localization requirements.
- Minimum browser support for the UI.
