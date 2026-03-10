# Phase 07.3 — Customization MVP (Equip and Place)

## Header
- **Goal:** Users can equip outfits/poses and place enclosure items; changes reflect immediately on Home and persist across relaunch.
- **Status:** Planning
- **Priority:** HIGH
- **Dependencies:** Phase 07.2
- **Platforms:** iOS (15+)

---

## UX & Screens (Mobile-First)

### Key screens/views
- Customization hub (outfits, poses, enclosure)
- Inventory browsing for owned items
- Preview + apply/equip controls

### States
- Empty (no owned items in category; guide user back to shop)
- Error (save failure with retry)
- Success (applied changes are visible immediately)

### Accessibility
- Clear labels for “equipped” vs “owned”
- Controls accessible via VoiceOver and large touch targets

---

## Data Requirements (high-level)
- Track equipped outfit and pose
- Track owned enclosure items and placement state (high-level)
- Persist selections so Home reflects the latest customization

---

## Edge Cases
- User rapidly switches items (avoid inconsistent state)
- User applies customization while offline (queue or gracefully defer)

---

## Testing Requirements
- Purchase item → equip → verify Home updates → relaunch → verify persistence
- Verify empty inventory guidance and recovery path

---

## Deliverables
- A satisfying customization loop that reinforces the reward economy.

