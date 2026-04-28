# Requirement Prioritization (MoSCoW Method)

## Overview
Using the MoSCoW method to prioritize features for the 9-week development sprint.

---

## MUST HAVE (MVP — Weeks 1-5)

| ID | Requirement | Rationale |
|----|------------|-----------|
| M1 | User registration & login (all 4 roles) | Core — nothing works without auth |
| M2 | JWT-based authentication & route protection | Security baseline |
| M3 | Restaurant listing with basic filters | Core customer flow |
| M4 | Restaurant detail page with full menu | Core browsing experience |
| M5 | Menu item dietary tags (Halal, Vegan, etc.) | FairBite differentiator |
| M6 | Shopping cart (single restaurant) | Required for ordering |
| M7 | Order placement with pricing breakdown | Core revenue function |
| M8 | Order status tracking (8 stages) | Core trust feature |
| M9 | Restaurant order management dashboard | Core for restaurant owners |
| M10 | 15% commission rate enforcement | Core USP of FairBite |
| M11 | Transparent pricing display (subtotal + fees) | Core differentiator |
| M12 | Menu CRUD for restaurant owners | Operational necessity |
| M13 | Basic admin panel (user/restaurant management) | Platform governance |

---

## SHOULD HAVE (Weeks 5-7)

| ID | Requirement | Rationale |
|----|------------|-----------|
| S1 | Rating & review system | Trust building feature |
| S2 | Restaurant response to reviews | Engagement feature |
| S3 | Order history for all roles | Expected UX feature |
| S4 | Order cancellation with reason | Customer protection |
| S5 | Rider assignment to orders | Delivery workflow |
| S6 | Advanced dietary filters (Keto, GF, Allergens) | Extended differentiator |
| S7 | Restaurant analytics dashboard | Restaurant owner value |
| S8 | Fair wage calculator display for riders | Rider USP |
| S9 | Promo/discount code system | Customer acquisition |
| S10 | Pagination on restaurant listings | Performance at scale |

---

## COULD HAVE (Weeks 7-8, if time permits)

| ID | Requirement | Rationale |
|----|------------|-----------|
| C1 | Real-time order tracking map | Nice UX feature |
| C2 | Push notifications | Enhanced engagement |
| C3 | Multiple delivery addresses saved | Convenience |
| C4 | Restaurant featured/promoted listings | Monetization |
| C5 | Email notifications (order updates) | Professional touch |
| C6 | Dark mode UI | UX preference |
| C7 | Order re-order (one-click) | Convenience |
| C8 | Rider earnings history | Rider empowerment |

---

## WON'T HAVE (Out of Scope for Academic Project)

| ID | Requirement | Reason Out of Scope |
|----|------------|---------------------|
| W1 | Real payment processing | Stripe live mode requires business registration |
| W2 | Real-time WebSocket chat | Complexity vs. time ratio too high |
| W3 | Native mobile app (iOS/Android) | React web app only |
| W4 | Multi-language support | Out of course scope |
| W5 | Machine learning recommendations | Beyond SE course requirements |
| W6 | Multi-restaurant cart | Complex UX problem; deferred |
| W7 | Subscription/loyalty programs | Post-launch feature |
| W8 | Restaurant POS integration | External system dependency |

---

## Priority Matrix

```
HIGH VALUE
    │ [M1-M13 Must Haves]
    │
    │ [S1-S10 Should Haves]
    │
    │                [C1-C8 Could Haves]
    │
LOW VALUE ──────────────────────────► HIGH EFFORT
                        [W1-W8 Won't Haves]
```

## Sprint Allocation

| Sprint | Duration | Focus | Features |
|--------|----------|-------|---------|
| Sprint 1 | Week 1-2 | Foundation | M1, M2, M3, M10, M11 |
| Sprint 2 | Week 3-4 | Core Backend | M4, M5, M6, M7, M8 |
| Sprint 3 | Week 5-6 | Frontend + Integration | M9, M12, M13, S1, S2 |
| Sprint 4 | Week 7-8 | Should Haves | S3-S10, C1 if time |
| Sprint 5 | Week 9 | Testing & Docs | All documentation, QA |

---
*FairBite Software Engineering Documentation — Version 1.0*
