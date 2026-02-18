# Phase 10.2: HamsterView Component Architecture

## Overview

This phase establishes the core component architecture for displaying the hamster throughout the app.

---

## Files Created

### 1. HamsterConfiguration.swift

**Location:** `Views/Shared/HamsterConfiguration.swift`

Configuration struct that bundles all display options for the hamster.

```swift
struct HamsterConfiguration: Equatable {
    let state: HamsterState
    let growthStage: GrowthStage
    var outfit: ShopItem?
    var accessory: ShopItem?
    var baseSize: CGFloat

    // Computed properties
    var effectiveSize: CGFloat
    var accessibilityLabel: String
    var stateColor: Color
    var enclosureBackgroundTint: Color

    // Factory method
    static func fromEquippedItems(
        state: HamsterState,
        growthStage: GrowthStage,
        equipped: EquippedItems,
        size: CGFloat
    ) -> HamsterConfiguration
}
```

### 2. HamsterView.swift

**Location:** `Views/Shared/HamsterView.swift`

Main reusable component for displaying the hamster with all customizations.

```swift
struct HamsterView: View {
    let state: HamsterState
    let growthStage: GrowthStage
    var outfit: ShopItem? = nil
    var accessory: ShopItem? = nil
    var size: CGFloat = 100

    var body: some View {
        ZStack {
            hamsterBase          // Layer 1: Real asset or placeholder
            OutfitOverlay(...)   // Layer 2: If equipped
            AccessoryOverlay(...) // Layer 3: If equipped
        }
        .frame(width: effectiveSize, height: effectiveSize)
        .accessibilityLabel(accessibilityDescription)
    }
}
```

**Key Features:**
- Automatically scales based on `GrowthStage.sizeMultiplier`
- Tries to load real assets first, falls back to SwiftUI placeholder
- Full VoiceOver accessibility support
- Multiple convenience initializers

---

## Layering System

The hamster is composed of three layers rendered in a ZStack:

```
┌─────────────────────────────────────┐
│  Layer 3: Accessory Overlay         │
│  ┌─────────────────────────────────┐│
│  │ Layer 2: Outfit Overlay         ││
│  │ ┌─────────────────────────────┐ ││
│  │ │ Layer 1: Base Hamster       │ ││
│  │ │ (Asset or Placeholder)      │ ││
│  │ └─────────────────────────────┘ ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## Usage Examples

### Basic Usage
```swift
HamsterView(state: .happy, growthStage: .adult)
```

### With Customization
```swift
HamsterView(
    state: .excited,
    growthStage: .juvenile,
    outfit: myOutfit,
    accessory: myAccessory,
    size: 150
)
```

### From Configuration
```swift
let config = HamsterConfiguration.fromEquippedItems(
    state: hamsterState,
    growthStage: currentGrowthStage,
    equipped: equippedItems
)
HamsterView(configuration: config)
```

### From Equipped Items
```swift
HamsterView(
    state: .happy,
    growthStage: .adult,
    equipped: equippedItems
)
```

---

## Size Calculations

The effective size is calculated as:

```
effectiveSize = baseSize × growthStage.sizeMultiplier
```

| Growth Stage | Multiplier | Example (100pt base) |
|-------------|------------|---------------------|
| Baby | 0.7 | 70pt |
| Juvenile | 0.85 | 85pt |
| Adult | 1.0 | 100pt |
| Mature | 1.1 | 110pt |

---

## Asset Loading Strategy

1. **Try Real Asset First:**
   - Looks for `hamster_{state}_{growthStage}` in asset catalog
   - Example: `hamster_happy_adult`

2. **Fall Back to Placeholder:**
   - Uses `HamsterPlaceholder` SwiftUI component
   - Renders cute hamster with shapes and expressions

---

## Accessibility

The component provides comprehensive accessibility support:

- **Label:** Describes hamster state, growth stage, and equipped items
- **Example:** "A grown up hamster, feeling happy, wearing Superhero Cape with Golden Crown"

---

## Testing Checklist

- [ ] HamsterView renders correctly for all 5 states
- [ ] HamsterView renders correctly for all 4 growth stages
- [ ] Size multiplier is applied correctly
- [ ] Outfit overlay appears when equipped
- [ ] Accessory overlay appears when equipped
- [ ] Both overlays can be shown simultaneously
- [ ] Accessibility labels are comprehensive
- [ ] Falls back to placeholder gracefully
