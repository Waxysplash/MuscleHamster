# Phase 07.2 — Shop MVP and Purchase Flow

## Header
- **Goal:** Users can browse items, preview them, and purchase with points; purchased items appear in inventory.
- **Status:** Implemented
- **Priority:** HIGH
- **Dependencies:** Phase 07.1
- **Platforms:** iOS (15+)

---

## UX & Screens (Mobile-First)

### Key screens/views
- Shop browse with categories (poses, outfits, enclosure items)
- Item detail / preview experience
- Purchase confirmation and post-purchase feedback

### States
- Loading (shop inventory)
- Empty (no items in category; should be rare)
- Error (fetch failure, purchase failure)
- Insufficient points (gentle explanation + suggested next step)

### Accessibility
- Item names/prices readable by VoiceOver
- Purchase confirmation is clear and avoids accidental purchase

---

## Data Requirements (high-level)
- Items have costs and categories
- Purchases are recorded and add items to the user’s owned inventory

---

## Edge Cases
- Purchase attempt under poor network conditions (safe retry without double-charge)
- User buys the same item twice (define expected behavior)

---

## Testing Requirements
- Purchase with sufficient points; verify inventory update
- Attempt purchase with insufficient points
- Retry behavior after a simulated failure

---

## Deliverables
- A working shop purchase loop that motivates earning points.

