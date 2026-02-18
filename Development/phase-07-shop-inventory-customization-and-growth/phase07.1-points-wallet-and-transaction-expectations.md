# Phase 07.1 — Points Wallet and Transaction Expectations

## Header
- **Goal:** Establish a clear, trustworthy points balance with transaction history and consistent display patterns across the app.
- **Status:** Planning
- **Priority:** HIGH
- **Dependencies:** Phase 05.2 (Completion Rewards), Phase 06.3 (Streak Freeze)
- **Platforms:** iOS (15+)

---

## Overview

### Current State
- ✅ Points are earned from workout completions (base + per-exercise + streak multiplier)
- ✅ Points are earned from rest-day micro-tasks
- ✅ Points are deducted for streak freeze restore
- ✅ `totalPoints` is stored in UserStats
- ✅ `pointsEarnedToday` computed property exists
- ❌ No transaction history — only final balance is stored
- ❌ Points balance display is inconsistent across screens
- ❌ No friendly "insufficient points" messaging pattern

### Problem / Motivation
Users need to trust the points economy. Without transaction history, users cannot:
- Understand how they earned or spent points
- Troubleshoot discrepancies ("Where did my points go?")
- Feel confident that points were correctly awarded/deducted

Additionally, points balance should be visible in the right places:
- When completing a workout (confirmation)
- When considering a purchase (shop, streak freeze)
- On the home screen (quick reference)

### Required Functionality (high-level)
1. Transaction history model that records every points earn and spend event
2. Consistent points balance display across key screens
3. Transaction history viewable from Settings or a dedicated screen
4. Friendly, no-shame messaging for insufficient points scenarios
5. Idempotent transaction recording (safe retries)

### Out of Scope
- Detailed analytics or charts of points over time
- Points gifting between users
- Premium currency or real-money purchases
- Transaction editing or refunds

### Assumptions
- All point transactions are server-side authoritative (future backend integration)
- For MVP, transactions persist locally in UserDefaults alongside UserStats
- Transaction history is capped to prevent unbounded growth (e.g., last 500 transactions)

---

## UX & Screens

### Points Balance Display Patterns

**Where points balance should appear:**

| Location | Context | Format |
|----------|---------|--------|
| Home screen header | Quick reference | Star icon + "{balance} points" |
| Workout completion screen | Reward feedback | "+{earned} points" with new balance |
| Rest-day check-in success | Reward feedback | "+{earned} points" with new balance |
| Streak freeze prompt | Decision context | Current balance + cost display |
| Shop header (Phase 07.2) | Purchase context | Star icon + "{balance} points" |
| Transaction history screen | Detail view | Full balance + transaction list |

**Display principles:**
- Points icon: Use consistent star icon (filled, accent color)
- Format: Always show number with "points" suffix for clarity
- Thousands separator: Use locale-appropriate formatting for large balances

### Key Screens

**Transaction History Screen**
- Accessible from Settings under a "Points & Rewards" section
- Shows current balance prominently at top
- Lists transactions in reverse chronological order (newest first)
- Each transaction shows:
  - Type icon (earn vs spend)
  - Description (e.g., "Completed Morning Stretch", "Streak Freeze")
  - Points change (+75 or -100)
  - Date/time
- Empty state for new users: "Your points journey starts here! Complete a workout to earn your first points."
- Loading state while fetching history
- Error state with retry option

### Navigation
- Transaction History accessible from Settings → "Points & Rewards"
- Tapping points balance on Home could optionally navigate to Transaction History (nice-to-have)

### States per Screen
- **Transaction History:**
  - Loading: Spinner with "Loading your points history..."
  - Empty: Friendly message encouraging first workout
  - Content: List of transactions with current balance header
  - Error: Retry button with friendly message

### Accessibility
- All points displays have VoiceOver labels including both amount and context
- Transaction list items have complete accessibility labels (e.g., "Earned 75 points from Morning Stretch on February 6")
- Earn vs spend icons have accessibility traits
- Balance updates announce changes to VoiceOver users

---

## Feature: Transaction History

### Purpose
Provide transparency into how points were earned and spent, building user trust in the economy.

### Functionality

**Transaction Model**
A transaction record should capture:
- Unique identifier (for idempotency)
- Transaction type: earn or spend
- Category: workout, rest_day, streak_freeze, shop_purchase, ad_reward (future)
- Amount: positive integer (the delta)
- Description: human-readable label (workout name, item name, etc.)
- Timestamp: when the transaction occurred
- Associated entity ID (optional): workout ID, item ID, etc.
- Running balance: the user's balance after this transaction

**Recording Transactions**
- Record a transaction whenever points are awarded or deducted
- Transaction ID should be deterministic for idempotency:
  - For workouts: derived from completion ID + date
  - For rest-day: derived from check-in ID + date
  - For streak freeze: derived from "freeze" + date
- Duplicate transaction IDs are silently ignored (safe retry)

**Viewing Transactions**
- Transactions are paginated or limited (e.g., show last 100, with "Load More" or "View All")
- Transactions grouped by date (optional, nice-to-have)
- Filter by type (optional, nice-to-have for MVP)

### User Flow: View Transaction History
1. User taps Settings on Home screen
2. User scrolls to "Points & Rewards" section
3. User taps "View Points History" (or similar label)
4. Transaction History screen loads
5. User sees current balance at top
6. User sees list of transactions (newest first)
7. User can scroll through history
8. User taps Back to return to Settings

### Data Requirements
- Transaction records stored in UserStats or a separate transactions array
- Each transaction includes: id, type, category, amount, description, timestamp, balanceAfter
- Transactions persist to UserDefaults alongside UserStats
- Transaction cap: keep only last 500 transactions (prune oldest when exceeded)

### Mobile Considerations
- Transaction list should be performant even with many items
- Use lazy loading / efficient list rendering
- Offline: Show cached transactions; new transactions sync when online (future)

### Edge Cases
- **Concurrent transactions:** If two transactions happen simultaneously, each should have unique IDs and apply correctly
- **App crash during transaction:** Transaction should either complete fully or not at all (atomic)
- **Clock manipulation:** Use server time for authoritative timestamps (future); for MVP, device time is acceptable
- **Balance goes negative:** Should never happen — validate before spend and block with friendly message

---

## Feature: Insufficient Points Messaging

### Purpose
When users don't have enough points for a purchase (streak freeze, shop item), provide clear, friendly feedback without shame or pressure.

### Functionality

**Messaging Principles (from Tone Guide):**
- Never guilt: "You don't have enough points!" → Bad
- Be warm: "You're {X} points away from this — keep it up!" → Good
- Offer alternatives: Suggest how to earn more points
- No pressure: Never imply the user should watch ads or grind

**Message Templates:**

| Scenario | Message |
|----------|---------|
| Streak freeze unaffordable | "This costs {cost} points, but you have {balance}. You'll earn more with your next workout!" |
| Shop item unaffordable | "Just {needed} more points to go! You're getting closer." |
| Generic insufficient | "Not quite enough points yet — keep up the great work!" |

**UI Behavior:**
- Unaffordable items should NOT be hidden — users should see what they're working toward
- Show a "locked" or muted state with point cost visible
- Disable purchase button but keep item browsable
- Optionally show progress indicator (e.g., "75/100 points")

### User Flow: Attempt Purchase with Insufficient Points
1. User views an item/action that costs points
2. System shows item with cost and current balance
3. If balance < cost:
   - Purchase button is disabled
   - Friendly message appears below explaining gap
   - Alternative earning suggestions (optional, not pushy)
4. User can browse other items or return to app

### Edge Cases
- **Balance exactly matches cost:** Allow purchase (not insufficient)
- **Balance drops to zero:** Still show balance as "0 points", not negative or empty
- **Points earned after viewing insufficient message:** If user returns to screen after earning, message should reflect new balance

---

## Feature: Points Balance Updates

### Purpose
Ensure points balance reflects changes immediately with appropriate feedback.

### Functionality

**Immediate Update Pattern:**
- When points are earned or spent, update the displayed balance immediately (optimistic UI)
- Show a brief animation or visual feedback for the change (e.g., number animates up/down)
- If the operation fails, revert the balance and show error message

**Update Triggers:**
- Workout completion (earn)
- Rest-day check-in (earn)
- Streak freeze restore (spend)
- Shop purchase (spend, Phase 07.2)
- Rewarded ad watched (earn, Post-MVP)

**Feedback Per Action:**

| Action | Visual Feedback |
|--------|----------------|
| Earn points | "+{amount}" floats up and fades, balance animates up |
| Spend points | "-{amount}" floats and fades, balance animates down |
| Failed transaction | Balance reverts, error message shown |

### Mobile Considerations
- Optimistic UI with rollback on failure
- Network-independent for MVP (all local)
- Future: queue transactions and sync when online

### Edge Cases
- **Rapid successive transactions:** Each should apply correctly in order
- **Background app during transaction:** Resume shows correct final balance
- **Memory pressure:** Transactions persist to disk, not just memory

---

## Data, Sync, and Integrations

### Data Relationships
- Transactions belong to a user (keyed by userId)
- Each transaction references the action that caused it (workout ID, item ID, etc.)
- Running balance is stored per transaction for historical accuracy

### Local Persistence
- Transactions stored in UserDefaults as part of or alongside UserStats
- Consider using a separate key for transactions if list grows large
- Prune transactions older than 1 year or beyond cap (500)

### Sync Strategy (Future)
- For MVP: all transactions local-only
- Future backend: transactions sync to server; server is authoritative; local cache for offline viewing
- Conflict resolution: server balance wins; local transactions are advisory

---

## Edge Cases & Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| User completes workout, app crashes before saving | Points awarded on next launch if completion was recorded |
| User force-quits during transaction | Transaction either fully recorded or not at all |
| User changes device timezone | Transaction timestamps display in local time; no balance impact |
| Transaction cap exceeded | Oldest transactions pruned; balance remains accurate |
| User views history while transaction in progress | Show "Updating..." indicator; refresh after complete |
| Network error during spend (future) | Block the spend; show retry option; don't deduct points |
| Duplicate transaction ID submitted | Silently ignored; no duplicate points awarded |

---

## Testing Requirements

### Core Flows to Test
1. **Earn points from workout:** Complete workout → verify points added → verify transaction recorded
2. **Earn points from rest-day:** Complete check-in → verify points added → verify transaction recorded
3. **Spend points on streak freeze:** Use freeze → verify points deducted → verify transaction recorded
4. **View transaction history:** Open history → verify transactions display correctly
5. **Insufficient points message:** Attempt purchase with low balance → verify friendly message

### Edge Cases to Verify
- Transaction idempotency: submit same transaction ID twice → only one recorded
- Balance never goes negative
- Transaction cap enforced (oldest pruned when > 500)
- Balance updates immediately after each action
- History persists across app relaunch
- Empty state displays correctly for new users

### Regression Checks
- Existing workout completion still awards points correctly
- Existing rest-day check-in still awards points correctly
- Existing streak freeze still deducts points correctly
- HomeView points display updates correctly
- WorkoutPlayerView completion shows points correctly

---

## Implementation Considerations

### Security & Privacy
- Points balance is tied to authenticated user
- Transaction history is private to user
- No personally identifiable information in transaction descriptions

### Performance
- Transaction history list must be performant with many items
- Use efficient list rendering (lazy loading)
- Balance updates should be instant (<50ms perceived delay)

### Reliability
- Transaction recording must be atomic (all-or-nothing)
- Idempotency via transaction ID prevents duplicate awards
- UserDefaults persistence ensures no data loss on crash
- Graceful degradation: if history fails to load, balance still displays

### User Experience
- Points should feel rewarding, not transactional
- Keep UI simple — don't overwhelm with numbers
- Celebrate earnings, acknowledge spends gracefully
- Never show negative balance or confusing states

---

## Deliverables

1. **Transaction model:** Data structure for recording points transactions
2. **Transaction recording:** Methods to record earn/spend transactions with idempotency
3. **Transaction storage:** Persistence layer for transactions (UserDefaults for MVP)
4. **Transaction History screen:** View past transactions with current balance
5. **Points display component:** Reusable component for showing points balance consistently
6. **Insufficient points messaging:** Friendly messaging pattern for unaffordable items
7. **Updated screens:** Home, Workout Completion, Rest-Day Success, Streak Freeze — all showing balance/changes consistently

---

## Related Phases

- **Phase 05.2:** Completion Rewards (points earning exists, needs transaction logging)
- **Phase 06.1:** Rest-Day Check-ins (points earning exists, needs transaction logging)
- **Phase 06.3:** Streak Freeze (points spending exists, needs transaction logging)
- **Phase 07.2:** Shop MVP (will use points wallet for purchases)
- **Phase 07.3:** Customization MVP (requires purchased items from shop)

---

## Notes

### Complexity Estimate
- **Model layer:** Low — add Transaction struct and array to UserStats
- **Service layer:** Medium — update ActivityService to record transactions alongside points changes
- **UI layer:** Medium — add Transaction History screen, update balance displays
- **Testing:** Medium — verify idempotency and persistence edge cases

### Risks
- **Scope creep:** Keep Phase 07.1 focused on wallet foundation; shop purchases are Phase 07.2
- **Performance:** Large transaction history could slow down UserStats loading — mitigate with cap

### Future Enhancements (Post-MVP)
- Detailed transaction filtering (by type, date range)
- Points analytics/charts (earning trends)
- Push notification when points milestone reached
- Server-side balance validation and sync
