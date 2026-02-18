//
//  HamsterConfiguration.swift
//  MuscleHamster
//
//  Configuration struct bundling all hamster display options
//  Phase 10.2: HamsterView Component Architecture
//

import SwiftUI

/// Configuration for displaying a hamster with all customization options
struct HamsterConfiguration: Equatable {
    let state: HamsterState
    let growthStage: GrowthStage
    var outfit: ShopItem?
    var accessory: ShopItem?
    var baseSize: CGFloat

    /// Computed effective size after applying growth stage multiplier
    var effectiveSize: CGFloat {
        baseSize * growthStage.sizeMultiplier
    }

    /// Default configuration with chillin state and baby stage
    static let `default` = HamsterConfiguration(
        state: .chillin,
        growthStage: .baby,
        outfit: nil,
        accessory: nil,
        baseSize: 100
    )

    /// Create configuration from equipped items
    /// - Parameters:
    ///   - state: Current hamster emotional state
    ///   - growthStage: Current growth stage
    ///   - equipped: Currently equipped items
    ///   - size: Base size before growth multiplier
    /// - Returns: Configured HamsterConfiguration
    static func fromEquippedItems(
        state: HamsterState,
        growthStage: GrowthStage,
        equipped: EquippedItems,
        size: CGFloat = 100
    ) -> HamsterConfiguration {
        HamsterConfiguration(
            state: state,
            growthStage: growthStage,
            outfit: equipped.outfit,
            accessory: equipped.accessory,
            baseSize: size
        )
    }

    /// Accessibility label describing the hamster's current appearance
    var accessibilityLabel: String {
        var parts: [String] = []

        // Growth stage
        parts.append("A \(growthStage.displayName.lowercased()) hamster")

        // State
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

    /// Color for the hamster based on state
    var stateColor: Color {
        switch state {
        case .hungry: return .orange
        case .chillin: return .blue
        case .happy: return .green
        case .excited: return .yellow
        case .proud: return .purple
        }
    }

    /// Background color tint for enclosure based on state
    var enclosureBackgroundTint: Color {
        stateColor.opacity(0.15)
    }
}
