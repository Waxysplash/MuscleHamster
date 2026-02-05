# Phase 07.1 — Points Wallet and Transaction Expectations

## Header
- **Goal:** Establish a clear, trustworthy points balance and basic transaction expectations for earning/spending.
- **Status:** Planning
- **Priority:** HIGH
- **Dependencies:** Phase 05.2, Phase 06
- **Platforms:** iOS (15+)

---

## Required Functionality (high-level)
- Points balance is visible where decisions are made (completion, shop, restore streak)
- Points earnings and spend are reflected immediately (with safe retry behavior)
- Basic transaction history expectations exist for troubleshooting and user trust

---

## UX & Screens
- Points balance display patterns (consistent placement)
- Friendly messaging for insufficient points (no shame)

---

## Edge Cases
- Duplicate awards or charges under retries (idempotency expectation)
- Points balance temporarily out of sync (define safe reconciliation behavior)

---

## Testing Requirements
- Earn points from workout completion and micro-tasks
- Spend points in shop and on streak freeze restore
- Verify balance updates correctly and consistently

---

## Deliverables
- A points wallet foundation that makes the economy feel fair and reliable.

