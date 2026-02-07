# Phase 10.3: Improved SwiftUI Placeholders

## Overview

This phase replaces the SF Symbol `hare.fill` with charming SwiftUI shape-based placeholders that accurately represent hamster characters with expressions varying by state.

---

## Files Created

### 1. HamsterExpressions.swift

**Location:** `Views/Shared/HamsterExpressions.swift`

Reusable expression components that create the hamster's face.

**Components:**

| Component | Purpose |
|-----------|---------|
| `HamsterEye` | Eye with half-closed, wide, and sparkle variants |
| `HamsterNose` | Small pink ellipse |
| `HamsterCheek` | Blush circles with intensity control |
| `HamsterMouth` | Bezier path with 5 mouth types |
| `HamsterFace` | Assembled face varying by HamsterState |
| `HamsterEyebrows` | Optional eyebrows for emphasis |

**Mouth Types:**

| Type | State | Visual |
|------|-------|--------|
| smile | Happy | Gentle upward curve |
| bigSmile | Excited | Wide open D-shape |
| pout | Hungry | Sad downward curve |
| smirk | Proud | One-sided upturn |
| relaxed | Chillin | Subtle gentle curve |

---

### 2. HamsterPlaceholder.swift

**Location:** `Views/Shared/HamsterPlaceholder.swift`

Complete hamster body drawn with SwiftUI shapes.

**Body Parts:**

1. **Body:** Orange ellipse (main torso)
2. **Belly:** Cream-colored inner ellipse
3. **Ears:** Two ellipses with inner pink
4. **Head:** Circle with face components
5. **Face:** Assembled from HamsterExpressions
6. **Arms:** Positioned based on state
7. **Feet:** Two small ellipses

---

## Color Palette

| Part | Color | Hex |
|------|-------|-----|
| Body/Head | Hamster Orange | #F5A623 |
| Belly | Moccasin Cream | #FFE4B5 |
| Ear Inner | Light Pink | #FFD5D5 |
| Nose | Pink | #FFB6C1 |
| Eyes | Near Black | #2C2C2C |
| Cheeks | Pink (varying opacity) | #FFC0CB |
| Outline | Darker Orange | #D4892E |

---

## State-Based Expressions

### Hungry
- **Eyes:** Normal size, no sparkle
- **Eyebrows:** Angled up (worried)
- **Mouth:** Pout (sad)
- **Cheeks:** Low blush (0.15)
- **Arms:** Paws on belly
- **Pose:** Standing, slightly hunched

### Chillin
- **Eyes:** Half-closed (relaxed)
- **Eyebrows:** None
- **Mouth:** Relaxed (subtle curve)
- **Cheeks:** Light blush (0.2)
- **Arms:** At sides
- **Pose:** Relaxed standing

### Happy
- **Eyes:** Normal with sparkle
- **Eyebrows:** Slight angle
- **Mouth:** Smile (gentle curve up)
- **Cheeks:** Medium blush (0.35)
- **Arms:** Slightly out
- **Pose:** Welcoming

### Excited
- **Eyes:** Wide with sparkle
- **Eyebrows:** Raised
- **Mouth:** Big smile (wide open)
- **Cheeks:** High blush (0.45)
- **Arms:** Raised high
- **Pose:** Jumping (feet offset)

### Proud
- **Eyes:** Normal with sparkle
- **Eyebrows:** Confident angle
- **Mouth:** Smirk (one-sided)
- **Cheeks:** Medium blush (0.3)
- **Arms:** One on hip
- **Pose:** Chest out, chin up

---

## Growth Stage Proportions

The head-to-body ratio changes with growth:

| Stage | Head:Body Ratio | Visual Effect |
|-------|-----------------|---------------|
| Baby | 0.65 | Big head, small body |
| Juvenile | 0.55 | Intermediate |
| Adult | 0.45 | Balanced proportions |
| Mature | 0.42 | Slightly fuller body |

---

## Usage

```swift
// Basic placeholder
HamsterPlaceholder(
    state: .happy,
    growthStage: .adult,
    size: 100
)

// Different expressions
ForEach(HamsterState.allCases, id: \.self) { state in
    HamsterPlaceholder(
        state: state,
        growthStage: .adult,
        size: 80
    )
}
```

---

## Testing Checklist

- [ ] All 5 expressions render correctly
- [ ] All 4 growth stages show different proportions
- [ ] Colors match design specification
- [ ] Body parts are properly layered
- [ ] Arms animate to correct positions per state
- [ ] Feet offset when excited (jumping effect)
- [ ] Cheek blush intensity varies by state
- [ ] Eyebrows only appear for hungry/proud states
- [ ] Renders smoothly at various sizes (60pt - 200pt)
