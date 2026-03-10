# Phase 10.5: View Integration

## Overview

This phase integrates the new HamsterView and EnclosureView components into existing views throughout the app.

---

## Files Modified

### 1. HomeView.swift

**Location:** `Views/Home/HomeView.swift`

**Changes:**
- Replaced SF Symbol hamster with EnclosureView
- Moved hamster name and badges outside of enclosure
- Simplified the hamster section structure

**Before:**
```swift
ZStack {
    RoundedRectangle(cornerRadius: 20)
        .fill(hamsterBackgroundColor)

    VStack {
        Image(systemName: "hare.fill")
            .font(.system(size: 80))
        // ... badges and overlays
    }
}
```

**After:**
```swift
VStack(spacing: 12) {
    Text(hamsterState.greeting)

    EnclosureView(
        state: hamsterState,
        growthStage: currentGrowthStage,
        equipped: equippedItems,
        height: 280,
        showCustomizeButton: true,
        onCustomizeTapped: { showInventory = true }
    )

    // Name and badges below enclosure
    Text(hamsterName)
    // Growth stage and state badges
}
```

**Removed Functions:**
- `hamsterBackgroundColor(for:)` - Now handled by EnclosureView
- `hamsterIconColor(for:)` - No longer needed
- `hamsterAccessibilityLabel(name:state:)` - Handled by EnclosureView

---

### 2. GrowthCelebrationView.swift

**Location:** `Views/Home/GrowthCelebrationView.swift`

**Changes:**
- Replaced SF Symbol with HamsterView
- Uses proud state to celebrate achievement

**Before:**
```swift
Image(systemName: "hare.fill")
    .font(.system(size: 70 * milestone.stage.sizeMultiplier))
    .foregroundStyle(stageColor)
```

**After:**
```swift
HamsterView(
    state: .proud,
    growthStage: milestone.stage,
    size: 120
)
```

---

### 3. OnboardingMeetHamsterView.swift

**Location:** `Views/Onboarding/OnboardingMeetHamsterView.swift`

**Changes:**
- Replaced custom shape-based hamster with EnclosureView
- Simplified the enclosureView computed property
- Uses baby growth stage and happy state for first meeting

**Before:**
```swift
// ~60 lines of custom shapes
ZStack {
    RoundedRectangle(cornerRadius: 24)
    // Ground layer
    VStack(spacing: 8) {
        ZStack {
            Circle()
            // Eyes, nose, mouth shapes
        }
        // Paws
    }
    // Decorative elements
}
```

**After:**
```swift
EnclosureView(
    state: .happy,
    growthStage: .baby,
    enclosureItems: [],
    height: 200
)
.overlay(
    RoundedRectangle(cornerRadius: 20)
        .strokeBorder(Color.accentColor.opacity(0.3), lineWidth: 3)
)
```

---

### 4. InventoryView.swift

**Location:** `Views/Inventory/InventoryView.swift`

**Changes:**
- Replaced current look preview with EnclosureView
- Simplified badge display below enclosure

**Before:**
```swift
ZStack {
    RoundedRectangle(cornerRadius: 20)
        .fill(LinearGradient(...))

    VStack {
        ZStack {
            Image(systemName: "hare.fill")
            // Outfit/accessory indicators
        }
        // Item labels
    }
}
```

**After:**
```swift
VStack(spacing: 16) {
    Text("Current Look")

    EnclosureView(
        state: .happy,
        growthStage: .adult,
        equipped: equippedItems,
        height: 200
    )

    // Badges below
}
```

---

### 5. InventoryItemPreviewView.swift

**Location:** `Views/Inventory/InventoryItemPreviewView.swift`

**Changes:**
- Preview section now shows hamster wearing the item
- Category-specific preview: outfits and accessories show on hamster
- Enclosure items show the item itself
- Success overlay uses HamsterView

**Before:**
```swift
Image(systemName: item.defaultIcon)
    .font(.system(size: 80))
```

**After:**
```swift
switch category {
case .outfits:
    HamsterView(
        state: .happy,
        growthStage: .adult,
        outfit: item,
        size: 140
    )
case .accessories:
    HamsterView(
        state: .happy,
        growthStage: .adult,
        accessory: item,
        size: 140
    )
case .enclosure:
    EnclosureItemView(item: item, size: 120)
}
```

**Success Overlay:**
```swift
// Before
Image(systemName: "hare.fill")
    .font(.system(size: 30))

// After
HamsterView(
    state: .excited,
    growthStage: .adult,
    size: 60
)
```

---

## Integration Pattern

When replacing SF Symbol hamsters with HamsterView/EnclosureView:

1. **Identify the current display context:**
   - Just hamster? → Use HamsterView
   - Hamster in home setting? → Use EnclosureView

2. **Determine required data:**
   - State from user stats
   - Growth stage from activity service
   - Equipped items from shop service

3. **Choose appropriate size:**
   - Small (60-80pt): Inline indicators, success messages
   - Medium (100-140pt): Cards, previews
   - Large (200+ as enclosure): Main display areas

4. **Add customize button if needed:**
   - Set `showCustomizeButton: true`
   - Provide `onCustomizeTapped` callback

---

## Testing Checklist

### HomeView
- [ ] Enclosure renders with correct state
- [ ] Equipped items appear on hamster
- [ ] Enclosure items appear in scene
- [ ] Customize button opens inventory
- [ ] Name and badges appear below enclosure

### GrowthCelebrationView
- [ ] HamsterView renders in celebration
- [ ] Size scales with growth stage
- [ ] Proud expression shows

### OnboardingMeetHamsterView
- [ ] Baby hamster renders correctly
- [ ] Happy expression for first meeting
- [ ] Border overlay appears

### InventoryView
- [ ] Current look shows enclosure
- [ ] Equipped items visible

### InventoryItemPreviewView
- [ ] Outfits show on hamster
- [ ] Accessories show on hamster
- [ ] Enclosure items show as standalone
- [ ] Success animation uses HamsterView
