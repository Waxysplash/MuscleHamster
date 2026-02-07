//
//  HamsterView.swift
//  MuscleHamster
//
//  Main reusable component for displaying the hamster
//  Supports state, growth stage, outfit, and accessory overlays
//  Phase 10.2: HamsterView Component Architecture
//

import SwiftUI

/// Main reusable component for rendering the hamster with all customizations
struct HamsterView: View {
    let state: HamsterState
    let growthStage: GrowthStage
    var outfit: ShopItem? = nil
    var accessory: ShopItem? = nil
    var size: CGFloat = 100

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    /// Effective size after applying growth stage multiplier
    var effectiveSize: CGFloat {
        size * growthStage.sizeMultiplier
    }

    var body: some View {
        ZStack {
            // Layer 1: Base hamster (real asset or placeholder)
            hamsterBase

            // Layer 2: Outfit overlay (if equipped)
            if let outfit = outfit {
                OutfitOverlay(outfit: outfit, size: effectiveSize)
            }

            // Layer 3: Accessory overlay (if equipped)
            if let accessory = accessory {
                AccessoryOverlay(accessory: accessory, size: effectiveSize)
            }
        }
        .frame(width: effectiveSize, height: effectiveSize)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityDescription)
    }

    // MARK: - Hamster Base

    @ViewBuilder
    private var hamsterBase: some View {
        // Try to load real asset first
        if let image = loadAssetImage() {
            image
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: effectiveSize, height: effectiveSize)
        } else {
            // Fall back to placeholder
            HamsterPlaceholder(
                state: state,
                growthStage: growthStage,
                size: effectiveSize
            )
        }
    }

    /// Attempt to load the real asset image for the current state and growth stage
    private func loadAssetImage() -> Image? {
        let imageName = "hamster_\(state.rawValue)_\(growthStage.rawValue)"
        // UIImage returns nil if asset doesn't exist
        if UIImage(named: imageName) != nil {
            return Image(imageName)
        }
        return nil
    }

    // MARK: - Accessibility

    private var accessibilityDescription: String {
        var parts: [String] = []

        // Growth stage and state
        parts.append("A \(growthStage.displayName.lowercased()) hamster")
        parts.append("feeling \(state.displayName.lowercased())")

        // Outfit
        if let outfit = outfit {
            parts.append("wearing \(outfit.name)")
        }

        // Accessory
        if let accessory = accessory {
            if outfit != nil {
                parts.append("with \(accessory.name)")
            } else {
                parts.append("wearing \(accessory.name)")
            }
        }

        return parts.joined(separator: ", ")
    }
}

// MARK: - Convenience Initializers

extension HamsterView {
    /// Initialize from a HamsterConfiguration
    init(configuration: HamsterConfiguration) {
        self.state = configuration.state
        self.growthStage = configuration.growthStage
        self.outfit = configuration.outfit
        self.accessory = configuration.accessory
        self.size = configuration.baseSize
    }

    /// Initialize from equipped items
    init(
        state: HamsterState,
        growthStage: GrowthStage,
        equipped: EquippedItems,
        size: CGFloat = 100
    ) {
        self.state = state
        self.growthStage = growthStage
        self.outfit = equipped.outfit
        self.accessory = equipped.accessory
        self.size = size
    }
}

// MARK: - Previews

#Preview("Basic States") {
    VStack(spacing: 20) {
        ForEach(HamsterState.allCases, id: \.self) { state in
            HStack {
                HamsterView(state: state, growthStage: .adult)
                    .frame(width: 80, height: 80)

                VStack(alignment: .leading) {
                    Text(state.displayName)
                        .font(.headline)
                    Text(state.greeting)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
            }
            .padding(.horizontal)
        }
    }
    .padding()
}

#Preview("Growth Stages") {
    HStack(spacing: 20) {
        ForEach(GrowthStage.allCases, id: \.self) { stage in
            VStack {
                HamsterView(state: .happy, growthStage: stage, size: 80)
                Text(stage.displayName)
                    .font(.caption)
            }
        }
    }
    .padding()
}

#Preview("With Outfit") {
    let outfit = ShopItem(
        id: "superhero",
        name: "Superhero Cape",
        description: "A heroic cape",
        category: .outfits,
        rarity: .rare,
        price: 200,
        previewImageName: "",
        isNew: false,
        isFeatured: false
    )

    HamsterView(
        state: .excited,
        growthStage: .adult,
        outfit: outfit,
        size: 150
    )
    .padding()
}

#Preview("With Accessory") {
    let accessory = ShopItem(
        id: "crown",
        name: "Golden Crown",
        description: "A royal crown",
        category: .accessories,
        rarity: .legendary,
        price: 500,
        previewImageName: "",
        isNew: false,
        isFeatured: false
    )

    HamsterView(
        state: .proud,
        growthStage: .mature,
        accessory: accessory,
        size: 150
    )
    .padding()
}

#Preview("Fully Customized") {
    let outfit = ShopItem(
        id: "wizard",
        name: "Wizard Robe",
        description: "A mystical robe",
        category: .outfits,
        rarity: .rare,
        price: 300,
        previewImageName: "",
        isNew: false,
        isFeatured: false
    )

    let accessory = ShopItem(
        id: "halo",
        name: "Sparkly Halo",
        description: "A glowing halo",
        category: .accessories,
        rarity: .uncommon,
        price: 150,
        previewImageName: "",
        isNew: false,
        isFeatured: false
    )

    VStack {
        HamsterView(
            state: .happy,
            growthStage: .adult,
            outfit: outfit,
            accessory: accessory,
            size: 200
        )

        Text("Wizard Hamster with Halo")
            .font(.caption)
    }
    .padding()
}

#Preview("Configuration Based") {
    let config = HamsterConfiguration(
        state: .excited,
        growthStage: .juvenile,
        outfit: nil,
        accessory: nil,
        baseSize: 120
    )

    HamsterView(configuration: config)
        .padding()
}
