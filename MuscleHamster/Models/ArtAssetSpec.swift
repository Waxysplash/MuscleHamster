//
//  ArtAssetSpec.swift
//  MuscleHamster
//
//  Central specifications for all art assets including naming conventions,
//  dimensions, colors, and positioning.
//  Phase 10.1: Art Asset Specifications
//

import SwiftUI

// MARK: - Art Style Color Palette

/// Official color palette for all hamster art assets
/// Matches the Duolingo-inspired flat/vector 2D style
enum HamsterColorPalette {
    /// Primary hamster body color - warm orange
    static let hamsterOrange = Color(hex: "F5A623")

    /// Belly and inner ear color - soft cream
    static let hamsterCream = Color(hex: "FFE4B5")

    /// Nose and blush color - soft pink
    static let nosePink = Color(hex: "FFB6C1")

    /// Eye color - near black
    static let eyeBlack = Color(hex: "2C2C2C")

    /// Eye sparkle/highlight - white
    static let eyeHighlight = Color.white

    /// Subtle outline stroke color
    static let outline = Color(hex: "D4892E")

    // MARK: - Enclosure Background Colors

    /// Sky/wall background - warm cream
    static let enclosureSkyStart = Color(hex: "FFFAF5")

    /// Sky/wall background - light peach
    static let enclosureSkyEnd = Color(hex: "FFF0E0")

    /// Ground/bedding - warm brown
    static let enclosureGround = Color(hex: "C08050")

    /// Ground/bedding darker - wood shavings
    static let enclosureGroundDark = Color(hex: "A06830")
}

// MARK: - Color Extension for Hex Support

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Asset Dimensions

/// Dimensions for all asset types at different scales
enum AssetDimensions {

    // MARK: - Hamster Base

    enum Hamster {
        static let size1x: CGFloat = 100
        static let size2x: CGFloat = 200
        static let size3x: CGFloat = 300
    }

    // MARK: - Outfits

    enum Outfit {
        static let size1x: CGFloat = 100
        static let size2x: CGFloat = 200
        static let size3x: CGFloat = 300
    }

    // MARK: - Accessories

    enum Accessory {
        static let size1x: CGFloat = 40
        static let size2x: CGFloat = 80
        static let size3x: CGFloat = 120
    }

    // MARK: - Enclosure Items

    enum EnclosureItem {
        static let size1x: CGFloat = 60
        static let size2x: CGFloat = 120
        static let size3x: CGFloat = 180
    }

    // MARK: - Enclosure Background

    enum EnclosureBackground {
        static let width1x: CGFloat = 375
        static let height1x: CGFloat = 280
        static let width2x: CGFloat = 750
        static let height2x: CGFloat = 560
        static let width3x: CGFloat = 1125
        static let height3x: CGFloat = 840
    }

    // MARK: - Stroke Weight

    /// Standard stroke weight at 1x scale (2pt)
    static let strokeWeight1x: CGFloat = 2.0
    static let strokeWeight2x: CGFloat = 4.0
    static let strokeWeight3x: CGFloat = 6.0
}

// MARK: - Asset Naming Conventions

/// Naming conventions for all asset files
enum AssetNames {

    // MARK: - Hamster Base Assets

    /// Generate hamster asset name for a given state and growth stage
    /// Format: hamster_{state}_{growthStage}
    static func hamster(state: HamsterState, growthStage: GrowthStage) -> String {
        "hamster_\(state.rawValue)_\(growthStage.rawValue)"
    }

    /// All possible hamster asset names (5 states × 4 growth stages = 20)
    static var allHamsterAssets: [String] {
        HamsterState.allCases.flatMap { state in
            GrowthStage.allCases.map { growthStage in
                hamster(state: state, growthStage: growthStage)
            }
        }
    }

    // MARK: - Outfit Assets

    /// All outfit IDs defined in the spec
    static let outfitIds = [
        "superhero",
        "wizard",
        "athlete",
        "cozy",
        "formal",
        "pirate",
        "space",
        "ninja"
    ]

    /// Generate outfit asset name
    /// Format: outfit_{itemId}
    static func outfit(id: String) -> String {
        "outfit_\(id)"
    }

    /// All outfit asset names
    static var allOutfitAssets: [String] {
        outfitIds.map { outfit(id: $0) }
    }

    // MARK: - Accessory Assets

    /// All accessory IDs defined in the spec
    static let accessoryIds = [
        "sunglasses",
        "crown",
        "halo",
        "headphones",
        "flower",
        "bandana",
        "bowtie",
        "glasses"
    ]

    /// Generate accessory asset name
    /// Format: accessory_{itemId}
    static func accessory(id: String) -> String {
        "accessory_\(id)"
    }

    /// All accessory asset names
    static var allAccessoryAssets: [String] {
        accessoryIds.map { accessory(id: $0) }
    }

    // MARK: - Enclosure Item Assets

    /// All enclosure item IDs defined in the spec
    static let enclosureItemIds = [
        "wheel",
        "tunnel",
        "house",
        "plants",
        "treats",
        "ball",
        "hammock",
        "toys"
    ]

    /// Generate enclosure item asset name
    /// Format: enclosure_{itemId}
    static func enclosureItem(id: String) -> String {
        "enclosure_\(id)"
    }

    /// All enclosure item asset names
    static var allEnclosureItemAssets: [String] {
        enclosureItemIds.map { enclosureItem(id: $0) }
    }

    // MARK: - Enclosure Background Assets

    /// Background theme IDs
    static let backgroundThemes = ["default"]

    /// Generate enclosure background asset name
    /// Format: enclosure_bg_{theme}
    static func enclosureBackground(theme: String) -> String {
        "enclosure_bg_\(theme)"
    }

    /// Default background asset name
    static let defaultBackground = "enclosure_bg_default"
}

// MARK: - Growth Stage Visual Proportions

extension GrowthStage {
    /// Head to body ratio for placeholder rendering
    var headToBodyRatio: CGFloat {
        switch self {
        case .baby: return 1.5      // 1:1.5 head:body
        case .juvenile: return 1.8  // 1:1.8 head:body
        case .adult: return 2.0     // 1:2 head:body (standard athletic)
        case .mature: return 2.2    // 1:2.2 head:body (distinguished)
        }
    }

    /// Eye size relative to head (bigger for baby)
    var relativeEyeSize: CGFloat {
        switch self {
        case .baby: return 1.3      // 30% larger eyes
        case .juvenile: return 1.15
        case .adult: return 1.0     // Standard
        case .mature: return 0.95
        }
    }

    /// Cheek roundness factor
    var cheekRoundness: CGFloat {
        switch self {
        case .baby: return 1.4      // Extra round cheeks
        case .juvenile: return 1.2
        case .adult: return 1.0
        case .mature: return 0.9
        }
    }
}

// MARK: - Hamster State Expression Details

extension HamsterState {
    /// Detailed expression description for artists
    var expressionDetails: (pose: String, expression: String, details: String) {
        switch self {
        case .hungry:
            return (
                pose: "Standing, paws on belly",
                expression: "Pleading eyes, droopy ears, pout",
                details: "Eyebrows angled up, slightly hunched posture"
            )
        case .chillin:
            return (
                pose: "Laying relaxed",
                expression: "Half-closed eyes, gentle smile",
                details: "Arms at sides, relaxed posture, content expression"
            )
        case .happy:
            return (
                pose: "Standing upright, arms out",
                expression: "Sparkly eyes, open smile",
                details: "Arms slightly raised, welcoming pose"
            )
        case .excited:
            return (
                pose: "Jumping pose, arms raised",
                expression: "Wide eyes, huge grin",
                details: "Both feet off ground, maximum enthusiasm"
            )
        case .proud:
            return (
                pose: "Standing tall, chin up",
                expression: "Confident smirk, chest out",
                details: "One paw on hip or arms crossed, triumphant"
            )
        }
    }
}

// MARK: - Accessory Positioning

/// Positioning offsets for accessories relative to hamster center
enum AccessoryPositioning {

    /// Standard positions at @1x scale (relative to 100x100 canvas)
    enum Offset {
        /// Head items: crown, halo, flower, bandana
        static let head = CGPoint(x: 0, y: -35)

        /// Eye items: sunglasses, glasses
        static let eyes = CGPoint(x: 0, y: -20)

        /// Ear items: headphones, bow
        static let ears = CGPoint(x: 0, y: -30)
    }

    /// Get position offset for an accessory
    static func offset(for accessoryId: String) -> CGPoint {
        switch accessoryId {
        case "crown", "halo", "flower", "bandana":
            return Offset.head
        case "sunglasses", "glasses":
            return Offset.eyes
        case "headphones", "bowtie":
            return Offset.ears
        default:
            return Offset.head
        }
    }

    /// Scale offset for a given size
    static func scaledOffset(for accessoryId: String, size: CGFloat) -> CGSize {
        let baseOffset = offset(for: accessoryId)
        let scale = size / 100.0
        return CGSize(
            width: baseOffset.x * scale,
            height: baseOffset.y * scale
        )
    }
}

// MARK: - Enclosure Item Positioning

/// Predefined positions for enclosure items in the 375x280 canvas
enum EnclosureItemPositioning {

    /// Position zones with coordinates
    enum Zone: CaseIterable {
        case backLeft
        case backCenter
        case backRight
        case frontLeft
        case frontCenter
        case frontRight

        /// Position in 375x280 @1x canvas
        var position: CGPoint {
            switch self {
            case .backLeft: return CGPoint(x: 60, y: 80)
            case .backCenter: return CGPoint(x: 187, y: 70)
            case .backRight: return CGPoint(x: 300, y: 80)
            case .frontLeft: return CGPoint(x: 50, y: 220)
            case .frontCenter: return CGPoint(x: 187, y: 230)
            case .frontRight: return CGPoint(x: 310, y: 220)
            }
        }

        /// Whether this zone is in the back layer (behind hamster)
        var isBackLayer: Bool {
            switch self {
            case .backLeft, .backCenter, .backRight: return true
            case .frontLeft, .frontCenter, .frontRight: return false
            }
        }
    }

    /// Recommended zone for each enclosure item
    static func recommendedZone(for itemId: String) -> Zone {
        switch itemId {
        case "wheel": return .backLeft
        case "tunnel": return .backRight
        case "house", "hammock": return .backCenter
        case "plants": return .frontLeft
        case "treats": return .frontCenter
        case "ball", "toys": return .frontRight
        default: return .frontCenter
        }
    }

    /// Get scaled position for a given canvas size
    static func scaledPosition(zone: Zone, canvasWidth: CGFloat, canvasHeight: CGFloat) -> CGPoint {
        let scaleX = canvasWidth / 375.0
        let scaleY = canvasHeight / 280.0
        return CGPoint(
            x: zone.position.x * scaleX,
            y: zone.position.y * scaleY
        )
    }
}

// MARK: - Asset Catalog Structure

/// Helper for generating asset catalog folder structure
enum AssetCatalogStructure {

    /// Root folders in Assets.xcassets
    static let rootFolders = [
        "Hamsters",
        "Outfits",
        "Accessories",
        "Enclosure",
        "Backgrounds"
    ]

    /// Generate folder path for an asset type
    static func folder(for assetType: AssetType) -> String {
        switch assetType {
        case .hamster: return "Hamsters"
        case .outfit: return "Outfits"
        case .accessory: return "Accessories"
        case .enclosureItem: return "Enclosure"
        case .enclosureBackground: return "Backgrounds"
        }
    }

    enum AssetType {
        case hamster
        case outfit
        case accessory
        case enclosureItem
        case enclosureBackground
    }
}

// MARK: - Asset Loading Helpers

/// Utilities for loading and checking asset availability
enum AssetLoader {

    /// Check if an asset exists in the asset catalog
    static func assetExists(_ name: String) -> Bool {
        UIImage(named: name) != nil
    }

    /// Check if hamster asset exists for a given state and growth stage
    static func hamsterAssetExists(state: HamsterState, growthStage: GrowthStage) -> Bool {
        let name = AssetNames.hamster(state: state, growthStage: growthStage)
        return assetExists(name)
    }

    /// Check if outfit asset exists
    static func outfitAssetExists(id: String) -> Bool {
        let name = AssetNames.outfit(id: id)
        return assetExists(name)
    }

    /// Check if accessory asset exists
    static func accessoryAssetExists(id: String) -> Bool {
        let name = AssetNames.accessory(id: id)
        return assetExists(name)
    }

    /// Check if enclosure item asset exists
    static func enclosureItemAssetExists(id: String) -> Bool {
        let name = AssetNames.enclosureItem(id: id)
        return assetExists(name)
    }

    /// Check if enclosure background asset exists
    static func backgroundAssetExists(theme: String = "default") -> Bool {
        let name = AssetNames.enclosureBackground(theme: theme)
        return assetExists(name)
    }

    /// Get a report of all missing assets
    static func missingAssetsReport() -> [String: [String]] {
        var missing: [String: [String]] = [:]

        // Check hamster assets
        let missingHamsters = AssetNames.allHamsterAssets.filter { !assetExists($0) }
        if !missingHamsters.isEmpty {
            missing["Hamsters"] = missingHamsters
        }

        // Check outfit assets
        let missingOutfits = AssetNames.allOutfitAssets.filter { !assetExists($0) }
        if !missingOutfits.isEmpty {
            missing["Outfits"] = missingOutfits
        }

        // Check accessory assets
        let missingAccessories = AssetNames.allAccessoryAssets.filter { !assetExists($0) }
        if !missingAccessories.isEmpty {
            missing["Accessories"] = missingAccessories
        }

        // Check enclosure items
        let missingEnclosure = AssetNames.allEnclosureItemAssets.filter { !assetExists($0) }
        if !missingEnclosure.isEmpty {
            missing["Enclosure Items"] = missingEnclosure
        }

        // Check background
        if !backgroundAssetExists() {
            missing["Backgrounds"] = [AssetNames.defaultBackground]
        }

        return missing
    }
}

// MARK: - Shop Item Extensions

extension ShopItem {
    /// Get the proper asset name for this shop item
    var assetName: String {
        switch category {
        case .outfits:
            return AssetNames.outfit(id: id)
        case .accessories:
            return AssetNames.accessory(id: id)
        case .enclosure:
            return AssetNames.enclosureItem(id: id)
        }
    }

    /// Check if this item's asset exists
    var hasAsset: Bool {
        AssetLoader.assetExists(assetName)
    }
}
