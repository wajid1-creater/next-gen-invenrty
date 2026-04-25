# NGIM — QA Test Scenarios

**Project:** Next-Gen Inventory Management (NGIM)
**Stack:** NestJS 11 (backend) · Next.js 16 (frontend) · PostgreSQL 16
**Version under test:** 0.1.0
**Document owner:** Faizan Akram

This document is the master QA test plan. Execute test cases module-by-module, mark each row Pass / Fail / Blocked / N/A, and attach screenshots or HAR files for any failure.

---

## 1. Test environment

| Component       | Value                                                                |
| --------------- | -------------------------------------------------------------------- |
| Frontend URL    | `http://localhost:3001` (dev) / staging URL TBD                      |
| Backend API     | `http://localhost:4000/api`                                          |
| Swagger docs    | `http://localhost:4000/api/docs`                                     |
| Health probe    | `http://localhost:4000/api/health`                                   |
| Readiness probe | `http://localhost:4000/api/health/ready`                             |
| Database        | PostgreSQL 16, schema seeded via `npm run seed`                      |
| Browsers        | Chrome (latest), Firefox (latest), Safari 17+, Edge (latest)         |
| Devices         | Desktop ≥1280px, tablet 768–1279px, mobile 375–767px                 |
| Test data       | Seeded by `npm run seed` (3 users, 3 suppliers, sample products/POs) |

### Demo accounts (seeded)

| Role     | Email               | Password      |
| -------- | ------------------- | ------------- |
| Admin    | `admin@ngim.com`    | `password123` |
| Manager  | `manager@ngim.com`  | `password123` |
| Supplier | `supplier@ngim.com` | `password123` |

### Test priorities

- **P0 — Blocker:** must pass before release. Failure = no-go.
- **P1 — High:** core feature; failure significantly impacts users.
- **P2 — Medium:** edge case, polish, or nice-to-have.
- **P3 — Low:** cosmetic.

---

## 2. Authentication & session

### Login

| ID       | Pri | Title                                | Steps                                                                              | Expected                                                                                                                                                                                                       |
| -------- | --- | ------------------------------------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AUTH-001 | P0  | Login with valid credentials         | 1. Open `/login`. 2. Enter `admin@ngim.com` / `password123`. 3. Click **Sign in**. | Redirect to `/dashboard`. Three cookies set on `localhost:4000`: `access_token` (HttpOnly), `refresh_token` (HttpOnly), `csrf_token` (NOT HttpOnly). `user` key present in `localStorage`, `token` key absent. |
| AUTH-002 | P0  | Login with wrong password            | Login as `admin@ngim.com` with `WrongPass1`.                                       | Toast: "Invalid credentials". Stays on `/login`. No cookies set.                                                                                                                                               |
| AUTH-003 | P0  | Login with unknown email             | Login with `nobody@x.com` / `whatever`.                                            | Toast: "Invalid credentials" (same generic message — must NOT leak that the user doesn't exist). Stays on `/login`.                                                                                            |
| AUTH-004 | P1  | Email format validation              | Enter `not-an-email` in email field, submit.                                       | Inline error under email field: "Enter a valid email address". No network request fired.                                                                                                                       |
| AUTH-005 | P1  | Empty password validation            | Enter valid email, leave password blank, submit.                                   | Inline error under password field: "Password is required". No network request fired.                                                                                                                           |
| AUTH-006 | P1  | Password visibility toggle           | On `/login`, click the eye icon next to password.                                  | Password field switches between `text` and `password` types. Icon swaps between Eye / EyeOff.                                                                                                                  |
| AUTH-007 | P2  | Demo credentials disclosure          | On `/login`, click "View demo credentials".                                        | Box expands with admin/manager/supplier creds. Click again → hides. Should NOT be visible by default.                                                                                                          |
| AUTH-008 | P1  | Auto-redirect when already logged in | While logged in, manually navigate to `/login`.                                    | Edge proxy bounces to `/dashboard` (no flash of login form).                                                                                                                                                   |

### Register

| ID       | Pri | Title                             | Steps                                                                                                                     | Expected                                                                 |
| -------- | --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| AUTH-010 | P0  | Register valid new user           | At `/register`, enter unique email, name "QA Test", `Password1` (≥8 chars + letter + digit), select Manager role, submit. | User created, cookies set, redirect to `/dashboard`.                     |
| AUTH-011 | P0  | Duplicate email rejected          | Register again with the same email used in AUTH-010.                                                                      | Toast: "Email already registered". HTTP 409 in network tab.              |
| AUTH-012 | P1  | Weak password rejected            | Try password `short` (< 8 chars).                                                                                         | Inline error: "Password must be at least 8 characters". No request sent. |
| AUTH-013 | P1  | Password without digit rejected   | Try password `lettersonly`.                                                                                               | Inline error: "Password must contain a number".                          |
| AUTH-014 | P1  | Password without letter rejected  | Try password `12345678`.                                                                                                  | Inline error: "Password must contain a letter".                          |
| AUTH-015 | P1  | Role selector defaults to Manager | Open `/register`.                                                                                                         | "Manager" tab visually selected (dark fill).                             |

### Session lifetime, refresh & rotation (security-critical)

| ID       | Pri | Title                                      | Steps                                                                                                                                                                                    | Expected                                                                                                                                                                                 |
| -------- | --- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AUTH-020 | P0  | Access token auto-refreshes silently       | 1. Log in. 2. In DevTools → Application → Cookies, delete `access_token`. 3. Click any protected link (e.g. **Products**).                                                               | Network tab shows `POST /api/auth/refresh` returning 200, then the original GET retried. Page renders without bouncing to login. New `access_token` and `refresh_token` cookies present. |
| AUTH-021 | P0  | Refresh token rotates on every refresh     | Capture `refresh_token` value before triggering AUTH-020. After refresh, capture again.                                                                                                  | New refresh token value differs from old. Old value will not work again.                                                                                                                 |
| AUTH-022 | P0  | **Token-reuse triggers family revocation** | 1. Log in (Session A). 2. Capture refresh cookie. 3. Trigger refresh (rotates token). 4. Open a separate `curl` and hit `POST /api/auth/refresh` using the OLD captured cookie.          | Old cookie call returns 401 "Refresh token revoked". The newly-rotated cookie ALSO returns 401 — entire token family is killed. User is forced to re-login.                              |
| AUTH-023 | P0  | Logout clears server cookies               | Click avatar → Sign out.                                                                                                                                                                 | `POST /api/auth/logout` returns 204. `Set-Cookie: access_token=; Expires=...past...` and same for `refresh_token` and `csrf_token`. Local `user` key removed. Redirect to `/login`.      |
| AUTH-024 | P1  | Logout-all kills every session             | 1. Log in from Browser A. 2. Log in same user from Browser B (incognito). 3. From Browser A call `POST /api/auth/logout-all` (via Swagger or DevTools). 4. In Browser B, click any link. | Browser B is bounced to `/login`. All refresh tokens for that user are revoked.                                                                                                          |
| AUTH-025 | P1  | Refresh token honours configured TTL       | Inspect `refresh_token` cookie in DevTools.                                                                                                                                              | `Max-Age` ≈ 7 days (matches `JWT_REFRESH_EXPIRATION=7d`).                                                                                                                                |
| AUTH-026 | P1  | Access token honours configured TTL        | Inspect `access_token` cookie.                                                                                                                                                           | `Max-Age` ≈ 15 minutes.                                                                                                                                                                  |
| AUTH-027 | P0  | Cookies are HttpOnly + SameSite=Lax        | Inspect `access_token` and `refresh_token` cookies.                                                                                                                                      | `HttpOnly` flag set. `SameSite=Lax` set. (`Secure` flag set when `NODE_ENV=production`.)                                                                                                 |
| AUTH-028 | P0  | CSRF cookie is readable by JS              | Inspect `csrf_token`.                                                                                                                                                                    | `HttpOnly` flag NOT set (the SPA needs to read it).                                                                                                                                      |

### `/auth/me` and authorization

| ID       | Pri | Title                                    | Steps                                                                                                                                           | Expected                                                                                            |
| -------- | --- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| AUTH-030 | P0  | `/api/auth/me` requires auth             | `curl http://localhost:4000/api/auth/me` (no cookies).                                                                                          | HTTP 401.                                                                                           |
| AUTH-031 | P0  | `/api/auth/me` returns current user      | Hit `/api/auth/me` from a logged-in browser.                                                                                                    | 200, returns `{ id, email, role, name }`.                                                           |
| AUTH-032 | P0  | Protected pages redirect when logged out | While logged out, visit `/dashboard`, `/products`, `/suppliers`, `/purchase-orders`, `/deliveries`, `/tasks`, `/forecasting`, `/notifications`. | Each redirects to `/login?next=<originalPath>`. After login, user lands back on the requested page. |
| AUTH-033 | P1  | Public pages stay public                 | Visit `/login` and `/register` while logged out.                                                                                                | Pages render without redirect.                                                                      |

---

## 3. CSRF protection

| ID       | Pri | Title                                                             | Steps                                                                                                                                       | Expected                                                                    |
| -------- | --- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| CSRF-001 | P0  | Write without CSRF header is rejected                             | `curl -b "cookies-from-browser" -X POST http://localhost:4000/api/products -H 'Content-Type: application/json' -d '{"name":"X","sku":"X"}'` | HTTP 403 `{"message":"Invalid CSRF token"}`.                                |
| CSRF-002 | P0  | Write with mismatched header is rejected                          | Same as CSRF-001 but with `-H "X-CSRF-Token: wrongvalue"`.                                                                                  | HTTP 403.                                                                   |
| CSRF-003 | P0  | Write with matching header succeeds                               | Same with `-H "X-CSRF-Token: <value-from-csrf_token-cookie>"`.                                                                              | HTTP 201 / 200 — request succeeds.                                          |
| CSRF-004 | P0  | Frontend always echoes CSRF on writes                             | Open DevTools → Network. Create any product/supplier/PO/etc.                                                                                | Request shows `X-CSRF-Token` header equal to the `csrf_token` cookie value. |
| CSRF-005 | P1  | Safe methods don't require CSRF                                   | `curl http://localhost:4000/api/products` (GET, no header).                                                                                 | HTTP 200 (auth permitting). GET / HEAD / OPTIONS exempt.                    |
| CSRF-006 | P0  | `/auth/login`, `/auth/register`, `/auth/refresh` exempt from CSRF | These are called pre-session. Submitting login form without CSRF header.                                                                    | Request succeeds (403 would be a regression).                               |

---

## 4. Rate limiting (Throttler)

| ID       | Pri | Title                                 | Steps                                           | Expected                                                   |
| -------- | --- | ------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| RATE-001 | P1  | Auth endpoints throttled to 10/min/IP | Send 11 `POST /api/auth/login` in one minute.   | 11th request returns HTTP 429 `Too Many Requests`.         |
| RATE-002 | P1  | Refresh endpoint throttled to 30/min  | Send 31 `POST /api/auth/refresh` in one minute. | 31st returns 429.                                          |
| RATE-003 | P2  | Default 120/min on other endpoints    | Send 121 `GET /api/products` in one minute.     | 121st returns 429.                                         |
| RATE-004 | P2  | Health endpoints NOT throttled        | Spam `GET /api/health` 200 times.               | All return 200 (load balancer probes must always succeed). |

---

## 5. Health & observability

| ID         | Pri | Title                                  | Steps                                                                       | Expected                                                                                         |
| ---------- | --- | -------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| HEALTH-001 | P0  | Liveness endpoint                      | `GET /api/health`.                                                          | 200 `{"status":"ok"}`.                                                                           |
| HEALTH-002 | P0  | Readiness endpoint with DB check       | `GET /api/health/ready`.                                                    | 200 `{"status":"ok","info":{"database":{"status":"up"}}}`.                                       |
| HEALTH-003 | P1  | Readiness fails when DB is down        | Stop Postgres, hit `/api/health/ready`.                                     | HTTP 503 `{"status":"error","error":{"database":{"status":"down"}}}`.                            |
| HEALTH-004 | P1  | Logs are structured JSON in production | Set `NODE_ENV=production`, run backend, hit any endpoint.                   | Stdout shows JSON-line logs (one object per line), not pretty-printed colours.                   |
| HEALTH-005 | P1  | Request correlation ID is honoured     | `curl -H 'X-Request-Id: smoke-test-42' http://localhost:4000/api/products`. | Backend logs show `"reqId":"smoke-test-42"` for the request entry.                               |
| HEALTH-006 | P0  | Secrets are redacted in logs           | Send a login request, inspect backend logs.                                 | Logged request body shows `password: "[REDACTED]"`. Cookie / Authorization headers redacted too. |

---

## 6. Products module

### CRUD

| ID       | Pri | Title                                     | Steps                                                                                                                     | Expected                                                                                             |
| -------- | --- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| PROD-001 | P0  | Create product (happy path)               | At `/products` click **New product**, fill all required fields (name, sku) + price 99.99 + stock 50 + reorder 10, submit. | Product appears in table. Toast "Product created". Form closes.                                      |
| PROD-002 | P0  | Required fields enforced                  | Submit form with empty name.                                                                                              | HTML5 `required` blocks submission.                                                                  |
| PROD-003 | P1  | SKU may be duplicated (current behaviour) | Try creating two products with same SKU.                                                                                  | Both succeed — confirm whether this is intended business behaviour.                                  |
| PROD-004 | P0  | List paginated                            | API: `GET /api/products?page=1&pageSize=2`.                                                                               | Returns `{items, page, pageSize, total, totalPages}` with `items.length=2` (when ≥2 products exist). |
| PROD-005 | P0  | Pagination cap enforced                   | `GET /api/products?pageSize=101`.                                                                                         | HTTP 400 — `pageSize` must be ≤ 100.                                                                 |
| PROD-006 | P1  | Search by name                            | `GET /api/products?q=widget`.                                                                                             | Only items whose name OR SKU contains "widget" (case-insensitive) returned.                          |
| PROD-007 | P0  | Edit product                              | Click pencil icon on a row, change unit price to 12.34, save.                                                             | Row updates inline. Toast "Product updated".                                                         |
| PROD-008 | P0  | Delete product (confirm dialog)           | Click trash icon.                                                                                                         | Custom confirm dialog appears with product name. Click **Cancel** → product remains.                 |
| PROD-009 | P0  | Delete product (confirm)                  | Click trash → **Delete**.                                                                                                 | Product removed from list. Toast "Product deleted". HTTP 200 `{deleted:true}`.                       |
| PROD-010 | P0  | Delete uses CSRF + confirm                | Try `curl -X DELETE http://localhost:4000/api/products/<id>` without CSRF header.                                         | HTTP 403.                                                                                            |

### Stock indicators

| ID       | Pri | Title                                                | Steps                                    | Expected                                                                     |
| -------- | --- | ---------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------- |
| PROD-020 | P0  | Low-stock badge appears when stock ≤ reorder         | Create product with stock 5, reorder 10. | Row shows red "Low stock" badge. Header subtitle increments low-stock count. |
| PROD-021 | P0  | In-stock badge when stock > reorder                  | Stock 50, reorder 10.                    | Green "In stock" badge.                                                      |
| PROD-022 | P1  | `GET /api/products/low-stock` returns only low items | API call.                                | Returns array of products where `currentStock <= reorderLevel`.              |

### Audit log

| ID       | Pri | Title                                                 | Steps                                                                                                                   | Expected                                                                                                |
| -------- | --- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| PROD-030 | P0  | Create logged in audit_logs                           | Create a product as admin. Query DB: `SELECT * FROM audit_logs WHERE "entityType"='products' ORDER BY at DESC LIMIT 1;` | Row exists with `action='insert'`, `userId` matches admin's id, `after` JSONB contains the product.     |
| PROD-031 | P0  | Update logged with diff                               | Edit a product (change price). Query audit_logs.                                                                        | Row with `action='update'`. `before.unitPrice` ≠ `after.unitPrice`. Other unchanged fields not in diff. |
| PROD-032 | P0  | Delete logged                                         | Delete a product. Query audit_logs.                                                                                     | Row with `action='delete'`, `before` populated, `after` is null.                                        |
| PROD-033 | P1  | Audit captures unauthenticated actions as null userId | (manual) Force-write a product without auth.                                                                            | userId column is null.                                                                                  |

---

## 7. Suppliers module

| ID      | Pri | Title                              | Steps                                                                               | Expected                                                              |
| ------- | --- | ---------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| SUP-001 | P0  | Create supplier                    | Fill name, email, status=Active, ESG=4.2, submit.                                   | Card appears in grid.                                                 |
| SUP-002 | P0  | Email validation                   | Submit with `not-email`.                                                            | HTML5 type=email blocks submission.                                   |
| SUP-003 | P0  | ESG score clamped 0–5              | Try entering 6.                                                                     | HTML5 max=5 blocks submission.                                        |
| SUP-004 | P0  | List paginated + searchable        | `GET /api/suppliers?page=1&pageSize=2&q=acme`.                                      | Same shape as products list.                                          |
| SUP-005 | P0  | Edit supplier                      | Edit a supplier's status to Suspended.                                              | Card status badge turns red "suspended".                              |
| SUP-006 | P0  | Delete supplier (confirm dialog)   | Click delete.                                                                       | Custom modal appears with supplier name + warning that POs lose link. |
| SUP-007 | P1  | Status badge colours               | Active=green, Inactive=neutral, Suspended=red.                                      | Visual check.                                                         |
| SUP-008 | P1  | ESG score colour bands             | ESG ≥3.5 green bar, 2–3.4 amber, <2 red.                                            | Visual check across multiple suppliers.                               |
| SUP-009 | P0  | Audit log captures supplier writes | Create/update/delete a supplier. Query `audit_logs` where `entityType='suppliers'`. | Rows present with userId.                                             |

---

## 8. Purchase Orders module

### CRUD + workflow

| ID     | Pri | Title                                | Steps                                                                                           | Expected                                                                       |
| ------ | --- | ------------------------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| PO-001 | P0  | Create PO with one line item         | Click **New order**, pick a supplier, add 1 line item (qty 5, $10), submit.                     | PO appears in list. `orderNumber` auto-generated like `PO-00001`. Total = $50. |
| PO-002 | P0  | Multiple line items roll up to total | Add 2 items: 3×$10 + 2×$15.                                                                     | PO total = $60. Total bar in form updates live.                                |
| PO-003 | P1  | Remove line item                     | Add 2 items, click trash on one.                                                                | Item removed. Total recalculates.                                              |
| PO-004 | P1  | Cannot remove last line item         | Single item PO — trash button hidden.                                                           | Visual check.                                                                  |
| PO-005 | P0  | Status workflow                      | Create PO (Draft). Use status dropdown to change to Submitted → Approved → Shipped → Delivered. | Each change shows toast "Status updated". DB `status` column updates.          |
| PO-006 | P0  | Cancel a PO                          | Set status to Cancelled.                                                                        | Status badge turns red.                                                        |
| PO-007 | P1  | Status counters update               | Watch the 6-card row at the top.                                                                | Count for old status decrements, new status increments.                        |
| PO-008 | P1  | Item preview in row                  | After creating PO with 5 items, look at row.                                                    | Shows first 4 as chips + "+1 more".                                            |
| PO-009 | P1  | Pagination + search by orderNumber   | `GET /api/purchase-orders?q=PO-001`.                                                            | Returns matching POs only.                                                     |
| PO-010 | P0  | Audit log captures PO writes         | Create + update + delete a PO.                                                                  | Three rows in `audit_logs` with `entityType='purchase_orders'`.                |

---

## 9. Deliveries module

| ID      | Pri | Title                                | Steps                                                                                                    | Expected                                                                                |
| ------- | --- | ------------------------------------ | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| DEL-001 | P0  | Create delivery linked to PO         | At `/deliveries`, click **New delivery**, pick a PO, set carrier "DHL", est. arrival = tomorrow, submit. | Delivery appears in list. Linked to PO.                                                 |
| DEL-002 | P0  | Status counter cards                 | Confirm 5 cards: Pending, In transit, Delivered, Delayed, Returned with correct counts.                  | Visual check matches DB.                                                                |
| DEL-003 | P0  | Status workflow                      | Change status from Pending → In transit → Delivered.                                                     | Each change toast "Delivery updated". On "Delivered", `actualArrival` auto-fills today. |
| DEL-004 | P1  | Delayed status surfaces in dashboard | Mark a delivery Delayed.                                                                                 | Dashboard "Delayed" stat increments.                                                    |
| DEL-005 | P1  | Audit log captures delivery writes   | Same as above.                                                                                           | Rows in `audit_logs` with `entityType='deliveries'`.                                    |

---

## 10. Tasks module

| ID       | Pri | Title                                          | Steps                                                                                 | Expected                                                   |
| -------- | --- | ---------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| TASK-001 | P0  | Create task                                    | Title "Audit Q2 inventory", priority High, assign to Manager, due date set, submit.   | Card appears in **To do** column.                          |
| TASK-002 | P0  | Move task across columns                       | Use the status dropdown on a card to change To do → In progress → Review → Completed. | Card moves between Kanban columns. Column counters update. |
| TASK-003 | P1  | Priority badge colour                          | Verify Low=neutral, Medium=blue, High=amber, Urgent=red.                              | Visual check.                                              |
| TASK-004 | P1  | Assignee avatar shows initials                 | Assign task to "Faizan Akram".                                                        | Card footer shows "FA" initials avatar + name.             |
| TASK-005 | P1  | Unassigned tasks show "Unassigned" placeholder | Create task without assignee.                                                         | Footer shows "Unassigned".                                 |
| TASK-006 | P1  | Header subtitle counts                         | Create 3 tasks, complete 1.                                                           | Header shows "3 total · 1 completed".                      |

---

## 11. Forecasting module

| ID      | Pri | Title                                  | Steps                                                                                           | Expected                                                                                   |
| ------- | --- | -------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| FOR-001 | P0  | Empty state when no product selected   | Visit `/forecasting`.                                                                           | Shows "No product selected" empty state.                                                   |
| FOR-002 | P0  | Generate forecast                      | Pick a product, click **Generate forecast**.                                                    | Loading state on button. After ~1s, area chart + table appear. Toast "Forecast generated". |
| FOR-003 | P0  | Generated data persists across reloads | Generate, reload page, re-select same product.                                                  | Forecast still shown (loaded from DB, not re-generated).                                   |
| FOR-004 | P1  | Confidence colour bands                | Low confidence (<60%) shows red bar, 60–80% amber, ≥80% green.                                  | Visual check across forecast rows.                                                         |
| FOR-005 | P1  | Selected product info card             | After picking a product, info card shows name, current stock, reorder level, healthy/low badge. | Matches DB values.                                                                         |
| FOR-006 | P1  | Shortage alerts panel                  | If shortages exist (`GET /api/forecasting/shortages` returns data).                             | Card lists products with severity badge.                                                   |
| FOR-007 | P1  | Generate without product selected      | Click Generate without picking one.                                                             | Toast: "Select a product". No request fired.                                               |

---

## 12. Notifications module

| ID      | Pri | Title                            | Steps                                                                                                                                                                                | Expected                                                                                           |
| ------- | --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| NOT-001 | P0  | Unread count in TopBar           | Visit any page. Look at bell icon in top bar.                                                                                                                                        | Red badge with unread count if >0. Capped display at "9+".                                         |
| NOT-002 | P0  | Mark single read                 | At `/notifications`, click an unread notification (left has subtle emerald background).                                                                                              | Background changes to white, dot disappears, unread count decrements.                              |
| NOT-003 | P0  | Mark all read                    | Click **Mark all read** button (only visible when unread > 0).                                                                                                                       | All notifications become read. Button disappears. Toast "All marked as read".                      |
| NOT-004 | P1  | Notification type icons + badges | Verify each type has correct icon and colour: low_stock=red ⚠, delivery_delay=amber 🚚, esg_non_compliance=amber 🌿, task_assigned=blue 📋, order_status=blue 🛒, general=neutral ℹ. | Visual check.                                                                                      |
| NOT-005 | P2  | Relative timestamps              | Hover any notification timestamp.                                                                                                                                                    | Tooltip shows full datetime ("Apr 25, 2026 · 14:23"). Visible label uses relative time ("2h ago"). |
| NOT-006 | P1  | Empty state                      | DB has zero notifications.                                                                                                                                                           | Card shows "You're all caught up" empty state.                                                     |

---

## 13. Dashboard

| ID       | Pri | Title                           | Steps                                                  | Expected                                                                                                                          |
| -------- | --- | ------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| DASH-001 | P0  | KPI cards render correct totals | Visit `/dashboard`.                                    | 8 stat cards: Products, Suppliers, Open POs, Order Value, Low Stock, Delayed, Tasks Done, Avg ESG. Each value matches DB.         |
| DASH-002 | P0  | Monthly spend chart             | Has data when POs exist with various createdAt months. | Area chart renders with emerald fill, X-axis = month, Y-axis = $K.                                                                |
| DASH-003 | P0  | Order status pie chart          | Has data when POs across various statuses.             | Pie segments + legend with counts matching DB.                                                                                    |
| DASH-004 | P0  | Delivery performance bars       | Has data.                                              | Bar per status. Delayed bar is red, Delivered green, others neutral.                                                              |
| DASH-005 | P0  | Top suppliers list              | Has data.                                              | Top 10 suppliers ranked by total order value. ESG badge colour matches score thresholds (≥3.5 success, 2–3.4 warning, <2 danger). |
| DASH-006 | P1  | Low-stock count is highlighted  | When low_stock > 0.                                    | Stat card icon turns amber.                                                                                                       |
| DASH-007 | P1  | Delayed count is highlighted    | When delayed > 0.                                      | Stat card icon turns red.                                                                                                         |
| DASH-008 | P1  | All chart palettes restricted   | Visual check across all 4 charts.                      | Only emerald + zinc shades + semantic red/amber for status. No rainbow.                                                           |

---

## 14. UI / UX cross-cutting

### Responsive design

| ID       | Pri | Title                                 | Steps                                | Expected                                                          |
| -------- | --- | ------------------------------------- | ------------------------------------ | ----------------------------------------------------------------- |
| RESP-001 | P0  | Sidebar collapses on mobile (<1024px) | Resize to 800px width.               | Sidebar disappears. Hamburger icon appears in top-left.           |
| RESP-002 | P0  | Sidebar opens via hamburger           | Tap hamburger on mobile.             | Sidebar slides in from left with backdrop.                        |
| RESP-003 | P0  | Sidebar closes on backdrop click      | With sidebar open, tap backdrop.     | Sidebar slides out.                                               |
| RESP-004 | P0  | Sidebar closes on Esc                 | With sidebar open, press Esc.        | Sidebar slides out.                                               |
| RESP-005 | P0  | Sidebar closes on route change        | With sidebar open, tap any nav link. | Sidebar closes after navigation.                                  |
| RESP-006 | P0  | Search bar hidden on small mobile     | <640px width.                        | TopBar search input is hidden, hamburger + bell + avatar visible. |
| RESP-007 | P0  | Tables scroll horizontally on mobile  | Open `/products` on 375px width.     | Table is horizontally scrollable. No layout breakage.             |
| RESP-008 | P1  | Forms stack on mobile                 | Open product form on 375px.          | Two-column grid collapses to single column.                       |
| RESP-009 | P1  | Modal usable on mobile                | Open PO create modal on 375px.       | Modal fits viewport, content scrollable, close button reachable.  |
| RESP-010 | P1  | Login/register fits mobile            | Open `/login` on 375px.              | Single-column layout, no horizontal scroll.                       |

### Loading & error states

| ID       | Pri | Title                                       | Steps                                                                         | Expected                                                                    |
| -------- | --- | ------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| LOAD-001 | P0  | Route skeleton shows during navigation      | Click any nav link.                                                           | Content-shaped skeleton appears instantly during fetch. No blank screen.    |
| LOAD-002 | P0  | 500 error shows error.tsx UI                | Stop the backend, refresh `/products`.                                        | Friendly error card: "Something went wrong" + Try again + Go home buttons.  |
| LOAD-003 | P0  | "Try again" recovers after backend returns  | With backend stopped → error.tsx shown → start backend → click **Try again**. | Page reloads with data successfully.                                        |
| LOAD-004 | P0  | 404 page renders for unknown routes         | Visit `/this-does-not-exist`.                                                 | not-found.tsx renders with "404 · Page not found" + Back to dashboard link. |
| LOAD-005 | P1  | Empty states render with CTA                | Truncate `products` table → visit `/products`.                                | "No products yet" empty state with **New product** button.                  |
| LOAD-006 | P1  | Login button shows spinner while submitting | Slow down network in DevTools, submit login.                                  | Button shows spinner, becomes disabled.                                     |

### Accessibility

| ID       | Pri | Title                                      | Steps                                                         | Expected                                                                            |
| -------- | --- | ------------------------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| A11Y-001 | P1  | Keyboard navigation works                  | Tab through `/login`.                                         | Focus visible on every interactive element (visible outline). Tab order is logical. |
| A11Y-002 | P1  | Form inline errors have aria-describedby   | Submit empty login form. Inspect input.                       | `aria-invalid="true"` set, `aria-describedby` points to the error `<p>` id.         |
| A11Y-003 | P1  | Modal close on Esc                         | Open any modal, press Esc.                                    | Modal closes.                                                                       |
| A11Y-004 | P1  | ConfirmDialog: Enter confirms, Esc cancels | Trigger product delete.                                       | Enter triggers Delete, Esc cancels.                                                 |
| A11Y-005 | P1  | Avatar has aria-label                      | Inspect avatar in TopBar.                                     | `aria-label` and `title` attributes show user's full name.                          |
| A11Y-006 | P2  | Reduced-motion respected                   | Set OS preference to reduce motion. Refresh app.              | All animations are disabled or near-instant.                                        |
| A11Y-007 | P2  | Color contrast meets WCAG AA               | Run axe DevTools or Lighthouse on dashboard, products, login. | Zero contrast violations.                                                           |

### Toasts

| ID        | Pri | Title                 | Steps                                            | Expected                                                                   |
| --------- | --- | --------------------- | ------------------------------------------------ | -------------------------------------------------------------------------- |
| TOAST-001 | P1  | Success toast styling | Create any entity.                               | Toast appears top-center, dark background, green check icon, ~3s duration. |
| TOAST-002 | P1  | Error toast styling   | Trigger any 4xx (e.g. duplicate email register). | Dark red background, white X icon, ~4.5s duration.                         |
| TOAST-003 | P2  | Multiple toasts stack | Trigger 3 toasts in quick succession.            | All visible, stacked top-center, no overlap.                               |

---

## 15. API contract

### Pagination shape (P0)

`GET /api/products`, `GET /api/suppliers`, `GET /api/purchase-orders`:

```json
{
  "items": [...],
  "page": 1,
  "pageSize": 20,
  "total": 42,
  "totalPages": 3
}
```

| ID      | Pri | Title                                                    | Expected                                                                     |
| ------- | --- | -------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| API-001 | P0  | Default page=1, pageSize=20                              | `GET /api/products` returns at most 20 items, totalPages computed correctly. |
| API-002 | P0  | Page beyond total returns empty items but valid metadata | `GET /api/products?page=999`.                                                | `items=[]`, `total` correct. |
| API-003 | P0  | Negative or zero page rejected                           | `GET /api/products?page=0`.                                                  | HTTP 400 validation error.   |

### Error responses

| ID      | Pri | Title                       | Expected                                                         |
| ------- | --- | --------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| API-010 | P0  | 401 shape                   | Hit any protected endpoint without auth.                         | `{"message":"Unauthorized","statusCode":401}`.                                      |
| API-011 | P0  | 403 shape                   | Trigger CSRF rejection.                                          | `{"message":"Invalid CSRF token","error":"Forbidden","statusCode":403}`.            |
| API-012 | P0  | 404 shape                   | `GET /api/products/nonexistent-uuid`.                            | `{"message":"Product not found","error":"Not Found","statusCode":404}`.             |
| API-013 | P0  | 400 shape                   | POST create product with empty body.                             | `{"message":["...validation messages..."],"error":"Bad Request","statusCode":400}`. |
| API-014 | P0  | 5xx caught by Sentry filter | Cause an unhandled error (e.g. force a DB constraint violation). | 500 with generic message; if `SENTRY_DSN` is set, error appears in Sentry.          |

### Swagger

| ID      | Pri | Title                                   | Expected                       |
| ------- | --- | --------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------ |
| API-020 | P1  | Swagger UI loads                        | Visit `/api/docs`.             | Page renders with all endpoint groups: auth, health, products, suppliers, etc. |
| API-021 | P1  | "Try it out" works for public endpoints | Use Swagger to call `/health`. | 200 returned in UI.                                                            |

---

## 16. Configuration & deployability

| ID      | Pri | Title                                              | Steps                                                              | Expected                                                                                   |
| ------- | --- | -------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| CFG-001 | P0  | Boot fails when `JWT_SECRET` missing               | Unset `JWT_SECRET`, start backend.                                 | Process exits with `Invalid environment configuration: JWT_SECRET: ...`.                   |
| CFG-002 | P0  | Boot fails when `JWT_SECRET` < 32 chars            | Set `JWT_SECRET=short`, start.                                     | Same fail-fast error.                                                                      |
| CFG-003 | P0  | Boot fails when `JWT_SECRET == JWT_REFRESH_SECRET` | Set both to same value.                                            | Fail-fast: "JWT_REFRESH_SECRET must be different from JWT_SECRET".                         |
| CFG-004 | P0  | Boot fails on `DB_SYNCHRONIZE=true` in production  | `NODE_ENV=production DB_SYNCHRONIZE=true`.                         | Fail-fast: must use migrations in prod.                                                    |
| CFG-005 | P0  | Migrations apply cleanly to a fresh DB             | Drop DB, recreate, run `npm run migration:run`.                    | `migrations` table records `InitialSchema...` and `AddAuditLog...`. All 11 tables created. |
| CFG-006 | P1  | Docker compose up works end-to-end                 | `cp .env.example .env`, fill secrets, `docker compose up --build`. | All 3 services healthy. Frontend reachable on `:3000`, backend on `:4000`.                 |

---

## 17. Browser & device matrix

Run the **smoke set** (login + create product + view dashboard + logout) on each:

| Browser / device         | Chrome (latest) | Firefox (latest) | Safari 17+ | Edge (latest) |
| ------------------------ | :-------------: | :--------------: | :--------: | :-----------: |
| Desktop 1440px           |        ☐        |        ☐         |     ☐      |       ☐       |
| Tablet 768px             |        ☐        |        ☐         |     ☐      |       ☐       |
| Mobile 375px (iPhone SE) |        ☐        |        —         |     ☐      |       —       |
| Mobile 414px (iPhone 14) |        ☐        |        —         |     ☐      |       —       |
| Mobile 360px (Galaxy)    |        ☐        |        ☐         |     —      |       —       |

---

## 18. Performance smoke

| ID       | Pri | Title                      | Method                                            | Pass criteria                                              |
| -------- | --- | -------------------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| PERF-001 | P1  | TTI on /login              | Chrome DevTools → Performance → Record cold load. | Time to interactive < 2.5s on broadband.                   |
| PERF-002 | P1  | Dashboard initial paint    | Same on `/dashboard` (logged in).                 | First contentful paint < 1.5s.                             |
| PERF-003 | P1  | Products list query budget | `/api/products` with 100 rows.                    | Server-side response < 200ms (p95).                        |
| PERF-004 | P2  | Lighthouse desktop score   | Run Lighthouse on dashboard.                      | Performance ≥ 85, Accessibility ≥ 90, Best Practices ≥ 90. |

---

## 19. Security smoke

| ID      | Pri | Title                                                | Steps                                                                              | Expected                                                                                                                        |
| ------- | --- | ---------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| SEC-001 | P0  | XSS in product name                                  | Create product with name `<script>alert(1)</script>`. View list.                   | Name renders as escaped text, no alert fires.                                                                                   |
| SEC-002 | P0  | SQL injection attempt in search                      | `GET /api/products?q=' OR 1=1 --`.                                                 | Returns 0 results (or matches literal string). No 500. No data leak.                                                            |
| SEC-003 | P0  | Helmet headers present                               | `curl -I http://localhost:4000/api/health`.                                        | Response includes `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `X-Frame-Options`. |
| SEC-004 | P0  | CORS rejects unknown origin                          | `curl -H 'Origin: http://evil.com' -X OPTIONS http://localhost:4000/api/products`. | Response missing `Access-Control-Allow-Origin` for evil.com (browser would block).                                              |
| SEC-005 | P0  | CORS allows configured origins                       | Same with `Origin: http://localhost:3001`.                                         | `Access-Control-Allow-Origin: http://localhost:3001` set, `Access-Control-Allow-Credentials: true`.                             |
| SEC-006 | P0  | Password not stored in plaintext                     | After registering, `SELECT password FROM users WHERE email='qa@example.com';`.     | Value is bcrypt hash starting with `$2b$10$...`.                                                                                |
| SEC-007 | P0  | Refresh tokens hashed in DB                          | `SELECT "tokenHash" FROM refresh_tokens LIMIT 1;`.                                 | 64-char hex (SHA-256). Never the raw value.                                                                                     |
| SEC-008 | P1  | Audit log retains user attribution after user delete | (manual) Delete a user via SQL, check existing audit_log rows.                     | `userId` column still references the (now-deleted) UUID.                                                                        |

---

## 20. Regression checklist before each release

After every PR that touches a feature, re-run:

- [ ] All P0 tests in the affected module
- [ ] AUTH-001, AUTH-020, AUTH-022 (auth + token rotation)
- [ ] CSRF-001 + CSRF-003 (CSRF still enforced)
- [ ] DASH-001 (dashboard renders)
- [ ] HEALTH-001 + HEALTH-002 (health endpoints)
- [ ] CFG-005 (migrations apply cleanly)
- [ ] One smoke set on Chrome desktop + iPhone mobile

---

## Appendix A — How to run the automated test suite

```bash
# Backend
cd backend
npm test                # 23 unit tests
npm run test:e2e        # 12 integration tests against next_gen_inventory_test DB

# Frontend
cd frontend
npm test                # 14 unit tests (Vitest + RTL)
npm run lint            # ESLint
npm run build           # Production build (also catches type errors)
```

CI runs all of the above on every push / pull request — see `.github/workflows/ci.yml`.

---

## Appendix B — Defect report template

For every failed test case, file a defect with:

- **Test ID:** (e.g. PROD-009)
- **Severity:** Critical / High / Medium / Low
- **Environment:** browser, OS, screen size, backend commit SHA
- **Steps to reproduce:** numbered, exact
- **Expected vs Actual:** quote both
- **Evidence:** screenshot, screen recording, or HAR file
- **Logs:** relevant backend log entries (with reqId if visible)

---

_End of document._
