# Test Cases
## FairBite Food Delivery Platform

---

## AUTH-001 to AUTH-010: Authentication

| TC-ID | Description | Input | Expected Output | Priority |
|-------|-------------|-------|-----------------|----------|
| AUTH-001 | Register with valid data | name, email, password, phone, role=customer | 201, JWT token, user object | P1 |
| AUTH-002 | Register with duplicate email | Existing email | 400, "Email already registered" | P1 |
| AUTH-003 | Register missing required field | No phone | 400, validation error | P1 |
| AUTH-004 | Login with valid credentials | Correct email + password | 200, JWT token | P1 |
| AUTH-005 | Login with wrong password | Correct email, wrong password | 401, "Invalid credentials" | P1 |
| AUTH-006 | Login with non-existent email | Unknown email | 401, "Invalid credentials" | P1 |
| AUTH-007 | Access protected route without token | GET /api/auth/me (no header) | 401, "Not authorized" | P1 |
| AUTH-008 | Access protected route with expired token | Expired JWT | 401, "Token invalid or expired" | P1 |
| AUTH-009 | Customer tries to access restaurant-only route | Customer token + POST /restaurants | 403, "Role not authorized" | P1 |
| AUTH-010 | Get current user profile | Valid JWT | 200, user object without password | P2 |

---

## REST-001 to REST-015: Restaurant Management

| TC-ID | Description | Input | Expected Output | Priority |
|-------|-------------|-------|-----------------|----------|
| REST-001 | Get all restaurants (no filters) | GET /api/restaurants | 200, array of restaurants, pagination | P1 |
| REST-002 | Filter by city | GET /api/restaurants?city=Karachi | 200, only Karachi restaurants | P2 |
| REST-003 | Filter by cuisine | GET /api/restaurants?cuisine=Pizza | 200, Pizza restaurants only | P2 |
| REST-004 | Filter by min rating | GET /api/restaurants?minRating=4 | 200, restaurants with avg ≥ 4 | P2 |
| REST-005 | Get restaurant by valid ID | GET /api/restaurants/:id | 200, full restaurant with menu | P1 |
| REST-006 | Get restaurant by invalid ID | GET /api/restaurants/invalid | 404, "Restaurant not found" | P2 |
| REST-007 | Create restaurant (restaurant role) | POST /api/restaurants + valid data | 201, restaurant object | P1 |
| REST-008 | Create restaurant (customer role) | POST /api/restaurants + customer JWT | 403, "Not authorized" | P1 |
| REST-009 | Update own restaurant | PUT /api/restaurants/:id (owner JWT) | 200, updated restaurant | P2 |
| REST-010 | Update another owner's restaurant | PUT /api/restaurants/:otherId | 403, "Not authorized" | P1 |
| REST-011 | Delete own restaurant | DELETE /api/restaurants/:id | 200, "Restaurant deleted" | P2 |
| REST-012 | Add menu item to own restaurant | POST /api/restaurants/:id/menu | 201, menu item | P1 |
| REST-013 | Add menu item with invalid category | category: "sushi" | 400, validation error | P2 |
| REST-014 | Update menu item | PUT /api/restaurants/:id/menu/:itemId | 200, updated item | P2 |
| REST-015 | Delete menu item | DELETE /api/restaurants/:id/menu/:itemId | 200, success | P2 |

---

## ORD-001 to ORD-015: Order Management

| TC-ID | Description | Input | Expected Output | Priority |
|-------|-------------|-------|-----------------|----------|
| ORD-001 | Place order with valid items | POST /api/orders + items + address + payment | 201, order with orderNumber | P1 |
| ORD-002 | Pricing calculation accuracy | 2x PKR200 + delivery PKR50 | subtotal=400, deliveryFee=50, total=450 | P1 |
| ORD-003 | Platform fee calculation | subtotal=1000, commission=15% | platformFee=150 | P1 |
| ORD-004 | Order with invalid restaurant ID | restaurantId: "invalid" | 404, "Restaurant not found" | P2 |
| ORD-005 | Order with unavailable menu item | itemId of removed item | 500, "Menu item not found" | P2 |
| ORD-006 | Get own orders (customer) | GET /api/orders (customer JWT) | 200, only customer's orders | P1 |
| ORD-007 | Get orders (restaurant) | GET /api/orders (restaurant JWT) | 200, only restaurant's orders | P1 |
| ORD-008 | Get order detail (owner) | GET /api/orders/:id (customer JWT) | 200, full order detail | P1 |
| ORD-009 | Get order detail (non-owner) | GET /api/orders/:otherId | 403, "Not authorized" | P1 |
| ORD-010 | Update status: pending→confirmed | PUT /api/orders/:id/status (restaurant) | 200, status=confirmed | P1 |
| ORD-011 | Invalid status transition check | pending→delivered (skipping steps) | 200 (no validation in MVP) | P3 |
| ORD-012 | Cancel pending order | DELETE /api/orders/:id + reason | 200, status=cancelled | P1 |
| ORD-013 | Cancel delivered order | DELETE /api/orders/:deliveredId | 400, "Cannot cancel delivered order" | P1 |
| ORD-014 | Rider assigned to order | PUT status=picked-up (rider JWT) | 200, status updated | P2 |
| ORD-015 | Revenue update on delivery | PUT status=delivered | restaurant.stats.totalRevenue += order.total | P2 |

---

## REV-001 to REV-010: Review System

| TC-ID | Description | Input | Expected Output | Priority |
|-------|-------------|-------|-----------------|----------|
| REV-001 | Create review for delivered order | POST /api/reviews + all ratings | 201, review created | P1 |
| REV-002 | Review on non-delivered order | orderId with status=preparing | 400, "Can only review delivered orders" | P1 |
| REV-003 | Duplicate review same order | Same orderId, second attempt | 400, "Order already reviewed" | P1 |
| REV-004 | Review by non-customer of that order | Different customer JWT | 403, "Not authorized" | P1 |
| REV-005 | Rating out of range | food: 6 | 400, validation error | P2 |
| REV-006 | Get restaurant reviews | GET /api/reviews/restaurant/:id | 200, array of reviews | P1 |
| REV-007 | Rating aggregation after review | Create 2 reviews: overall 4 and 2 | restaurant.rating.average = 3.0 | P1 |
| REV-008 | Restaurant responds to review | PUT /api/reviews/:id/respond (owner) | 200, response added | P2 |
| REV-009 | Non-owner responds to review | PUT /api/reviews/:id/respond (other JWT) | 403, "Not authorized" | P2 |
| REV-010 | Review includes verified purchase flag | Any review created via order | isVerifiedPurchase: true | P2 |

---

## SEC-001 to SEC-010: Security Tests

| TC-ID | Description | Input | Expected Output | Priority |
|-------|-------------|-------|-----------------|----------|
| SEC-001 | NoSQL injection in email field | email: { "$gt": "" } | 400 or no match (not bypass) | P1 |
| SEC-002 | XSS in review comment | comment: `<script>alert(1)</script>` | Stored as plain text, not executed | P1 |
| SEC-003 | Rate limit enforcement | 101 requests in 15 minutes | 429, "Too many requests" | P1 |
| SEC-004 | Password not returned in response | GET /api/auth/me | No password field in response | P1 |
| SEC-005 | CORS block non-whitelisted origin | Request from http://evil.com | 403/no response | P1 |
| SEC-006 | Forged JWT | Modified JWT payload | 401, "Token invalid" | P1 |
| SEC-007 | Accessing admin route as customer | GET /admin endpoint | 403 | P1 |
| SEC-008 | Long string input (overflow attempt) | name: 10000 chars | 400, max length validation | P2 |
| SEC-009 | Missing Content-Type header | POST with no Content-Type | 400 or handled gracefully | P2 |
| SEC-010 | Expired token on protected route | Token past 7 days | 401, "Token invalid or expired" | P1 |

---

## UI-001 to UI-010: Frontend UI Tests (Manual)

| TC-ID | Description | Steps | Expected Result | Priority |
|-------|-------------|-------|-----------------|----------|
| UI-001 | Login flow | Enter credentials → submit | Redirect to home; user name in navbar | P1 |
| UI-002 | Register flow | Fill form → submit | Success message; auto-login | P1 |
| UI-003 | Browse restaurants | Open home | Restaurant cards visible with ratings | P1 |
| UI-004 | Filter by dietary tag | Select "Halal" filter | Only Halal restaurants shown | P2 |
| UI-005 | Add to cart | Click item → Add to Cart | Cart badge increments | P1 |
| UI-006 | View cart | Click cart icon | Items listed with subtotal | P1 |
| UI-007 | Place order | Cart → Checkout → Confirm | Order confirmation with number | P1 |
| UI-008 | Track order status | Open order detail | Status timeline shown | P2 |
| UI-009 | Submit review | Delivered order → Review | Stars + comment submitted | P2 |
| UI-010 | Mobile responsive | Open on 375px width | No overflow; usable layout | P2 |

---

**Total Test Cases: 60**
- P1 Critical: 35
- P2 High: 22
- P3 Medium: 3

---
*FairBite Software Engineering Documentation — Version 1.0*
