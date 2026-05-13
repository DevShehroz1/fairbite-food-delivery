# Rewards & Coupons — Feature Documentation

> **Owner:** Shehroz · **Phase 2 / M7 — Advanced Features**

## What it does, in one line
Customers earn coupons as they use the app, can claim public promo codes, and apply any coupon at checkout to lower the bill.

## Three ways a user gets a coupon

| Source | Trigger | Example |
|---|---|---|
| Auto-grant | Order delivered | 1st order → 25% off next · 5th order → Rs. 150 off · 10th → 40% off · every 20th → free delivery |
| Public promo | Claim a published code | `QUICKBITE50`, `WEEKEND30`, `SAVE100`, `FREEBITE` |
| Referral | Friend joined + ordered (see referral feature) | Rs. 200 / 50% off |

## User flow — applying a coupon at checkout

```mermaid
flowchart TD
    A[Customer opens Cart]
    A --> B[Taps Apply a voucher]
    B --> C{Has a code in mind?}
    C -- "Yes" --> D[Type the code]
    C -- "No"  --> E[Pick from My Rewards list]
    D --> F[Tap Apply]
    E --> F[Tap reward to apply]
    F --> G[Backend validates: code exists, min order met, not used]
    G --> H{Valid?}
    H -- "No"  --> I[Show error - cart unchanged]
    H -- "Yes" --> J[Discount shows in summary]
    J --> K[Customer confirms order]
    K --> L[Coupon marked Used in user.rewards]
    L --> M[Order saved with applied coupon details]
```

## User flow — earning a coupon

```mermaid
flowchart LR
    A[Customer places order] --> B[Restaurant marks Ready]
    B --> C[Rider delivers]
    C --> D[Order status = Delivered]
    D --> E[System counts customer's delivered orders]
    E --> F{Hits a milestone?}
    F -- "1st order"     --> G[Welcome 25% off]
    F -- "5th order"     --> H[Streak Rs. 150 off]
    F -- "10th order"    --> I[40% off coupon]
    F -- "every 20th"    --> J[Free delivery coupon]
    F -- "No"            --> K[Nothing extra]
    G --> L[Added to user.rewards]
    H --> L
    I --> L
    J --> L
```

## Backend data flow — applying a coupon

```mermaid
sequenceDiagram
    autonumber
    participant UI as Frontend (Cart)
    participant API as Backend (Express)
    participant DB as Supabase (Postgres)

    UI->>API: GET /api/coupons/validate<br/>?code=Q...&subtotal=850
    API->>DB: SELECT users.rewards WHERE id = me
    DB-->>API: Array of coupons + public templates
    API->>API: Find code · check min order · compute discount
    API-->>UI: { code, label, discount: 250 }
    UI->>UI: Show discount in price summary

    Note over UI,DB: Customer confirms order
    UI->>API: POST /api/orders<br/>{ items, couponCode }
    API->>API: Re-validate coupon (defense in depth)
    API->>DB: INSERT order with pricing.discount + coupon
    API->>DB: UPDATE user.rewards — mark coupon as used
    API-->>UI: Created order
```

## Backend data flow — auto-grant on delivery

```mermaid
sequenceDiagram
    autonumber
    participant UI as Frontend
    participant API as Backend
    participant DB as Supabase

    UI->>API: PUT /api/orders/:id/status<br/>{ status: "delivered" }
    API->>DB: UPDATE orders SET status = 'delivered'
    API->>DB: SELECT orders WHERE customer_id = X AND status = 'delivered'
    DB-->>API: All delivered orders for this customer
    API->>API: count = orders.length
    API->>API: Check milestone rules (1, 5, 10, 20…)
    API->>DB: APPEND coupon to user.rewards (if a rule matched)
    API-->>UI: Order updated
```

## What's in the database
Reuses the `users.rewards` JSONB column added by the referral feature. **No new tables.**

Each coupon row looks like:
```json
{
  "id": "c_1715800123_a8f3qr",
  "code": "MILESTONEK4F2X",
  "type": "percent",
  "value": 25,
  "minOrder": 300,
  "maxDiscount": 150,
  "label": "25% off your next order",
  "source": "welcome",
  "redeemed": false,
  "redeemed_at": null,
  "created_at": "2026-05-13T08:00:00Z"
}
```

## API endpoints we added

| Method | Path | What it does |
|---|---|---|
| `GET` | `/api/coupons/me` | Returns the user's active + used rewards + the public-promo catalog |
| `GET` | `/api/coupons/validate?code=X&subtotal=N` | Validates a code and returns the discount it would give |

`POST /api/orders` now also accepts `couponCode` and stores `pricing.discount` + `pricing.coupon` on the order row.

## Files touched

```
backend/
├── src/controllers/couponController.js     ← new — rules, validate, redeem, auto-grant
├── src/controllers/orderController.js      ← applies on create, grants on delivered
├── src/routes/couponRoutes.js              ← new
└── src/app.js                              ← mounts /api/coupons

frontend/
├── src/App.js                              ← /rewards route
├── src/pages/customer/RewardsPage.jsx      ← new — My Rewards screen
├── src/pages/customer/CartPage.jsx         ← real coupon picker + discount line
└── src/pages/customer/ProfilePage.jsx      ← My Rewards menu link
```

## How to test
1. Login as a customer. Profile → **My Rewards** shows your active coupons + public promo codes.
2. Add items totalling ≥ Rs. 500 to your cart. Tap **Apply a voucher** → enter `QUICKBITE50` → see 50% off applied (capped at Rs. 300).
3. Confirm the order. Open My Rewards → the same coupon is now under **Used**.
4. Mark the order **Delivered** as a rider. If it was your 1st delivered order, a new 25% off coupon appears in **Active**.
5. Try an expired/min-order-not-met code → backend rejects with a friendly toast.

## Notes
- Public promo codes (`QUICKBITE50` etc.) are kept in `couponController.js` for easy editing — no DB write needed to add or rename a public promo.
- Milestone rules are in the same file (`MILESTONE_RULES`); change a number to tune the schedule.
- The validation is double-checked on order creation, so a tampered frontend can't claim a fake discount.
