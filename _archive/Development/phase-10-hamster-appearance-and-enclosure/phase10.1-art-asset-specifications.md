# Phase 10.1: Art Asset Specification Document

## Overview

This document provides detailed specifications for creating the visual assets for MuscleHamster. The art style should be **flat/vector 2D**, similar to Duolingo, with warm and friendly aesthetics.

---

## Art Style Guidelines

### General Style
- **Flat/Vector 2D** - Clean shapes, no gradients or 3D effects
- **Soft, rounded edges** - Approachable and friendly
- **Warm color palette** - Orange as primary, with supporting pastels
- **Consistent stroke weight** - 2pt at @1x scale
- **Transparent backgrounds** - PNG format for all assets

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Hamster Orange | #F5A623 | Primary body color |
| Hamster Cream | #FFE4B5 | Belly, inner ears |
| Nose Pink | #FFB6C1 | Nose, blush |
| Eye Black | #2C2C2C | Eyes |
| Eye Highlight | #FFFFFF | Eye sparkle |
| Outline | #D4892E | Subtle outline stroke |

---

## Asset Requirements

### 1. Hamster Base (20 assets)

**5 states x 4 growth stages = 20 unique poses**

#### Dimensions
| Scale | Size |
|-------|------|
| @1x | 100x100 |
| @2x | 200x200 |
| @3x | 300x300 |

#### Naming Convention
```
hamster_{state}_{growthStage}.png
hamster_{state}_{growthStage}@2x.png
hamster_{state}_{growthStage}@3x.png
```

**Examples:**
- `hamster_happy_baby.png`
- `hamster_excited_adult@2x.png`
- `hamster_proud_mature@3x.png`

#### Expression Matrix

| State | Pose | Expression | Details |
|-------|------|------------|---------|
| hungry | Standing, paws on belly | Pleading eyes, droopy ears, pout | Eyebrows angled up, slightly hunched posture |
| chillin | Laying relaxed | Half-closed eyes, gentle smile | Arms at sides, relaxed posture, content expression |
| happy | Standing upright, arms out | Sparkly eyes, open smile | Arms slightly raised, welcoming pose |
| excited | Jumping pose, arms raised | Wide eyes, huge grin | Both feet off ground, maximum enthusiasm |
| proud | Standing tall, chin up | Confident smirk, chest out | One paw on hip or arms crossed, triumphant |

#### Growth Stage Proportions

| Stage | sizeMultiplier | Visual Characteristics |
|-------|----------------|------------------------|
| baby | 0.7 | Large head ratio (1:1.5 head:body), round cheeks, bigger eyes relative to face |
| juvenile | 0.85 | Intermediate proportions (1:1.8), slightly less round |
| adult | 1.0 | Standard athletic build (1:2), defined features |
| mature | 1.1 | Distinguished, fuller body (1:2.2), wise expression, slightly larger |

---

### 2. Outfits (8 assets)

Each outfit as a **transparent overlay** that fits over the hamster.

#### Dimensions
| Scale | Size |
|-------|------|
| @1x | 100x100 |
| @2x | 200x200 |
| @3x | 300x300 |

#### Naming Convention
```
outfit_{itemId}.png
outfit_{itemId}@2x.png
outfit_{itemId}@3x.png
```

#### Outfit List

| ID | Name | Description | Visual |
|----|------|-------------|--------|
| superhero | Superhero Cape | Red cape with gold clasp | Cape flows behind, visible from front |
| wizard | Wizard Robe | Purple robe with stars | Mystical robe, starry pattern |
| athlete | Athletic Gear | Sporty tank and headband | Bright colors, sporty look |
| cozy | Cozy Hoodie | Soft gray hoodie | Oversized, comfortable, hood down |
| formal | Bow Tie | Fancy red bow tie | Classic style, centered at neck |
| pirate | Pirate Outfit | Striped shirt, eyepatch | Nautical stripes, fun eyepatch |
| space | Space Suit | White astronaut suit | Helmet optional, NASA-style |
| ninja | Ninja Outfit | Black ninja garb | Stealthy look, mask |

**Design Note:** Each outfit should be designed to work with all 5 poses. The overlay aligns to the same 100x100 canvas as the base hamster.

---

### 3. Accessories (8 assets)

Positioned on head/neck area of the hamster.

#### Dimensions
| Scale | Size |
|-------|------|
| @1x | 40x40 |
| @2x | 80x80 |
| @3x | 120x120 |

#### Naming Convention
```
accessory_{itemId}.png
accessory_{itemId}@2x.png
accessory_{itemId}@3x.png
```

#### Accessory List

| ID | Name | Description | Position |
|----|------|-------------|----------|
| sunglasses | Cool Sunglasses | Stylish shades | Eyes |
| crown | Golden Crown | Royal gold crown | Top of head |
| halo | Sparkly Halo | Glowing halo | Above head |
| headphones | DJ Headphones | Big colorful headphones | Ears |
| flower | Flower Crown | Pretty flower wreath | Top of head |
| bandana | Workout Bandana | Sporty sweatband | Forehead |
| bowtie | Cute Bow | Pink decorative bow | Ear/neck |
| glasses | Nerd Glasses | Round scholarly glasses | Eyes |

**Design Note:** Accessories are positioned at offset (x: 0.35 * width, y: -0.3 * height) from hamster center, scaled relative to hamster size.

---

### 4. Enclosure Items (8 assets)

Individual decoration items for the hamster's home.

#### Dimensions
| Scale | Size |
|-------|------|
| @1x | 60x60 |
| @2x | 120x120 |
| @3x | 180x180 |

#### Naming Convention
```
enclosure_{itemId}.png
enclosure_{itemId}@2x.png
enclosure_{itemId}@3x.png
```

#### Enclosure Item List

| ID | Name | Description | Placement Zone |
|----|------|-------------|----------------|
| wheel | Exercise Wheel | Classic hamster wheel | Back left |
| tunnel | Play Tunnel | Colorful tube tunnel | Back right |
| house | Cozy House | Small wooden house | Back center |
| plants | Potted Plants | Decorative greenery | Front left/right |
| treats | Treat Bowl | Bowl of snacks | Front center |
| ball | Exercise Ball | Clear hamster ball | Front right |
| hammock | Comfy Hammock | Hanging rest spot | Back (elevated) |
| toys | Toy Collection | Assorted small toys | Scattered front |

---

### 5. Enclosure Background (1+ assets)

Scene backdrop for the hamster's home.

#### Dimensions
| Scale | Size |
|-------|------|
| @1x | 375x280 |
| @2x | 750x560 |
| @3x | 1125x840 |

#### Naming Convention
```
enclosure_bg_{theme}.png
enclosure_bg_{theme}@2x.png
enclosure_bg_{theme}@3x.png
```

#### Default Background

**ID:** `enclosure_bg_default`

**Layers:**
1. **Sky/Wall** (top 60%): Soft gradient, warm cream to light peach
2. **Ground/Bedding** (bottom 40%): Textured bedding, wood shavings look, warm brown tones

**Design Notes:**
- Should feel cozy and inviting
- Subtle texture for visual interest
- Ample space for items and hamster in foreground
- No hard edges - soft transition between ground and wall

---

## Anchor Points & Positioning

### Hamster Canvas (100x100 @1x)
- Center: (50, 50)
- Ground line: y = 85 (feet touch here)

### Outfit Overlay Alignment
- Align to same canvas (100x100)
- Outfit should match hamster pose exactly
- Use transparency for non-outfit areas

### Accessory Positioning (relative to hamster center)
- **Head items** (crown, halo, flower, bandana): offset (0, -35)
- **Eye items** (sunglasses, glasses): offset (0, -20)
- **Ear items** (headphones, bow): offset (0, -30)

### Enclosure Item Positions (in 375x280 @1x canvas)

| Zone | Position | Items |
|------|----------|-------|
| Back Left | (60, 80) | wheel |
| Back Center | (187, 70) | house, hammock |
| Back Right | (300, 80) | tunnel |
| Front Left | (50, 220) | plants |
| Front Center | (187, 230) | treats |
| Front Right | (310, 220) | ball, toys |

---

## File Delivery

### Directory Structure
```
Assets.xcassets/
├── Hamsters/
│   ├── hamster_hungry_baby.imageset/
│   ├── hamster_hungry_juvenile.imageset/
│   ├── hamster_hungry_adult.imageset/
│   ├── hamster_hungry_mature.imageset/
│   ├── hamster_chillin_baby.imageset/
│   ├── ... (20 total)
├── Outfits/
│   ├── outfit_superhero.imageset/
│   ├── outfit_wizard.imageset/
│   ├── ... (8 total)
├── Accessories/
│   ├── accessory_sunglasses.imageset/
│   ├── accessory_crown.imageset/
│   ├── ... (8 total)
├── Enclosure/
│   ├── enclosure_wheel.imageset/
│   ├── enclosure_tunnel.imageset/
│   ├── ... (8 total)
└── Backgrounds/
    └── enclosure_bg_default.imageset/
```

### Format Requirements
- **Format:** PNG with transparency
- **Color Space:** sRGB
- **Bit Depth:** 24-bit with 8-bit alpha

---

## Reference Mood Board

### Inspiration
- Duolingo owl character (flat, friendly, expressive)
- Headspace bear (warm, approachable)
- Fitness app mascots with personality

### Key Emotions to Convey
1. **Supportive** - The hamster is your workout buddy
2. **Celebratory** - Joy in achievements
3. **Empathetic** - Understanding on tough days
4. **Encouraging** - Motivating without being pushy
5. **Playful** - Fun and light-hearted

---

## Technical Notes for Artists

1. **All assets should be created at @3x first**, then downscaled for @2x and @1x
2. **Test assets on device** - colors may appear differently on screen
3. **Maintain consistent lighting** - light source from top-left
4. **Keep stroke weight consistent** - 2pt at @1x (6pt at @3x)
5. **Expressions should be readable at all sizes** - especially important for baby stage
