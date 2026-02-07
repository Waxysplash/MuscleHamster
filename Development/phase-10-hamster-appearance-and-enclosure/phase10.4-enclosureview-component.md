# Phase 10.4: EnclosureView Component

## Overview

The EnclosureView provides a scene-based home for the hamster with layered composition for items and decorations.

---

## Files Created

### 1. EnclosureItemView.swift

**Location:** `Views/Shared/EnclosureItemView.swift`

Renders individual enclosure decoration items.

**Supported Items:**

| ID | Name | Visual |
|----|------|--------|
| wheel | Exercise Wheel | Circular wheel with spokes on stand |
| tunnel | Play Tunnel | Horizontal tube with openings |
| house | Cozy House | Small house with roof and door |
| plants | Potted Plants | Pot with green leaves |
| treats | Treat Bowl | Bowl with round treats |
| ball | Exercise Ball | Translucent sphere with holes |
| hammock | Comfy Hammock | Hanging fabric between ropes |
| toys | Toy Collection | Scattered small toys |

---

### 2. EnclosureView.swift

**Location:** `Views/Shared/EnclosureView.swift`

Complete scene composition with 5 layers.

---

## Layer Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: Front Items (in front of hamster)                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Layer 4: Hamster (HamsterView)                          │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Layer 3: Back Items (behind hamster)                │ │ │
│ │ │ ┌─────────────────────────────────────────────────┐ │ │ │
│ │ │ │ Layer 2: Ground (bedding texture)               │ │ │ │
│ │ │ │ ┌─────────────────────────────────────────────┐ │ │ │ │
│ │ │ │ │ Layer 1: Background (gradient/image)        │ │ │ │ │
│ │ │ │ └─────────────────────────────────────────────┘ │ │ │ │
│ │ │ └─────────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Item Positioning

Items are placed at predefined positions based on layer:

### Back Layer Positions
| Zone | Normalized Position (x, y) |
|------|---------------------------|
| Back Left | (0.15, 0.35) |
| Back Center | (0.5, 0.3) |
| Back Right | (0.85, 0.35) |
| Upper Left | (0.3, 0.25) |
| Upper Right | (0.7, 0.25) |

### Front Layer Positions
| Zone | Normalized Position (x, y) |
|------|---------------------------|
| Front Left | (0.12, 0.75) |
| Front Center | (0.5, 0.82) |
| Front Right | (0.88, 0.75) |

---

## Layout Constants

| Element | Size (relative to height) |
|---------|---------------------------|
| Ground Height | 18% |
| Hamster Size | 40% |
| Enclosure Item | 20% |
| Front Item Scale | 90% of back items |

---

## Background

The background uses a gradient placeholder or tries to load a real asset:

**Placeholder Gradient:**
```swift
LinearGradient(
    colors: [
        Color(warm cream),
        hamsterConfig.enclosureBackgroundTint,
        Color(light peach)
    ],
    startPoint: .top,
    endPoint: .bottom
)
```

**Real Asset:** `enclosure_bg_default`

---

## Ground Layer

The ground represents bedding with:
- Brown gradient fill (0.5 → 0.6 opacity)
- Subtle texture dots when Reduce Motion is disabled
- Height: 18% of total enclosure height

---

## Usage

### Basic
```swift
EnclosureView(
    state: .happy,
    growthStage: .adult,
    enclosureItems: []
)
```

### With Items
```swift
EnclosureView(
    state: .excited,
    growthStage: .juvenile,
    enclosureItems: myItems,
    height: 280
)
```

### From Equipped Items
```swift
EnclosureView(
    state: hamsterState,
    growthStage: currentGrowthStage,
    equipped: equippedItems,
    showCustomizeButton: true,
    onCustomizeTapped: { showInventory = true }
)
```

### Full Configuration
```swift
EnclosureView(
    hamsterConfig: HamsterConfiguration(...),
    enclosureItems: items,
    height: 280,
    showCustomizeButton: true,
    onCustomizeTapped: { ... }
)
```

---

## UI Overlays

### Item Count Badge
- Position: Bottom right
- Shows when enclosure items present
- Format: house icon + count

### Customize Button
- Position: Top right
- Shows when `showCustomizeButton: true`
- Triggers `onCustomizeTapped` callback

---

## Accessibility

The enclosure provides comprehensive accessibility:
- Combines hamster configuration accessibility label
- Lists all placed enclosure items by name
- Example: "A grown up hamster, feeling happy. Home decorated with: Exercise Wheel, Cozy House"

---

## Testing Checklist

- [ ] Background gradient renders correctly
- [ ] Ground layer shows at correct height
- [ ] Hamster is centered in enclosure
- [ ] Back items appear behind hamster
- [ ] Front items appear in front of hamster
- [ ] Items are distributed across available positions
- [ ] Customize button appears when enabled
- [ ] Item count badge shows correct count
- [ ] Clips to rounded rectangle correctly
- [ ] State color tints background appropriately
- [ ] Accessibility label includes all elements
