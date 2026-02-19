//
//  EnclosureView.swift
//  MuscleHamster
//
//  Scene-based enclosure view for the hamster's home
//  Layers: background → ground → back items → hamster → front items
//  Phase 10.1: Updated to use official HamsterColorPalette and EnclosureItemPositioning
//  Phase 10.4: EnclosureView Component
//

import SwiftUI

/// The hamster's home enclosure with layered scene composition
struct EnclosureView: View {
    let hamsterConfig: HamsterConfiguration
    let enclosureItems: [ShopItem]
    var height: CGFloat = 280
    var showCustomizeButton: Bool = false
    var onCustomizeTapped: (() -> Void)? = nil

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    // MARK: - Layout Constants

    private var groundHeight: CGFloat { height * 0.18 }
    private var hamsterSize: CGFloat { height * 0.4 }
    private var enclosureItemSize: CGFloat { height * 0.2 }

    /// Whether the enclosure contains an exercise wheel
    private var hasWheel: Bool {
        enclosureItems.contains { ["wheel", "enc_wheel", "enclosure_wheel"].contains($0.id) }
    }

    /// Enclosure items excluding the wheel (rendered separately when animated)
    private var nonWheelItems: [ShopItem] {
        hasWheel ? enclosureItems.filter { !["wheel", "enc_wheel", "enclosure_wheel"].contains($0.id) } : enclosureItems
    }

    /// Predefined positions for enclosure items (normalized 0-1)
    private let itemPositions: [(x: CGFloat, y: CGFloat, layer: ItemLayer)] = [
        (0.15, 0.35, .back),    // Back left
        (0.5, 0.3, .back),      // Back center
        (0.85, 0.35, .back),    // Back right
        (0.12, 0.75, .front),   // Front left
        (0.5, 0.82, .front),    // Front center
        (0.88, 0.75, .front),   // Front right
        (0.3, 0.25, .back),     // Upper left
        (0.7, 0.25, .back),     // Upper right
    ]

    private enum ItemLayer {
        case back
        case front
    }

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Layer 1: Background
                enclosureBackground

                // Layer 2: Ground
                groundLayer

                // Layer 3: Back items (behind hamster)
                backItemsLayer(in: geometry)

                // Layer 4: Hamster (on wheel if available, otherwise standing)
                if hasWheel {
                    wheelRunningLayer
                } else {
                    hamsterLayer
                }

                // Layer 5: Front items (in front of hamster)
                frontItemsLayer(in: geometry)

                // UI Overlays
                overlayElements
            }
        }
        .frame(height: height)
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .accessibilityElement(children: .contain)
        .accessibilityLabel(enclosureAccessibilityLabel)
    }

    // MARK: - Background Layer

    private var enclosureBackground: some View {
        ZStack {
            // Try to load real background asset
            if let bgImage = loadBackgroundImage() {
                bgImage
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else {
                // Placeholder gradient background (using official Phase 10.1 palette)
                LinearGradient(
                    colors: [
                        HamsterColorPalette.enclosureSkyStart,
                        hamsterConfig.enclosureBackgroundTint,
                        HamsterColorPalette.enclosureSkyEnd
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
            }
        }
    }

    /// Load background image using Phase 10.1 asset naming
    private func loadBackgroundImage() -> Image? {
        if AssetLoader.backgroundAssetExists() {
            return Image(AssetNames.defaultBackground)
        }
        return nil
    }

    // MARK: - Ground Layer

    private var groundLayer: some View {
        VStack {
            Spacer()

            // Ground/bedding (using official Phase 10.1 palette)
            ZStack {
                // Main ground
                RoundedRectangle(cornerRadius: 0)
                    .fill(
                        LinearGradient(
                            colors: [
                                HamsterColorPalette.enclosureGround.opacity(0.5),
                                HamsterColorPalette.enclosureGroundDark.opacity(0.6)
                            ],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .frame(height: groundHeight)

                // Texture dots (bedding effect)
                if !reduceMotion {
                    GeometryReader { geo in
                        ForEach(0..<15, id: \.self) { i in
                            Circle()
                                .fill(HamsterColorPalette.enclosureGroundDark.opacity(0.15))
                                .frame(width: 4, height: 4)
                                .offset(
                                    x: CGFloat.random(in: 0...geo.size.width),
                                    y: CGFloat.random(in: 0...groundHeight - 10)
                                )
                        }
                    }
                    .frame(height: groundHeight)
                }
            }
        }
    }

    // MARK: - Item Layers

    private func backItemsLayer(in geometry: GeometryProxy) -> some View {
        ZStack {
            ForEach(Array(backItems.enumerated()), id: \.element.id) { index, item in
                if index < itemPositions.count {
                    let position = backPositions[index % backPositions.count]
                    EnclosureItemView(item: item, size: enclosureItemSize)
                        .position(
                            x: position.x * geometry.size.width,
                            y: position.y * geometry.size.height
                        )
                }
            }
        }
    }

    private func frontItemsLayer(in geometry: GeometryProxy) -> some View {
        ZStack {
            ForEach(Array(frontItems.enumerated()), id: \.element.id) { index, item in
                if index < frontPositions.count {
                    let position = frontPositions[index % frontPositions.count]
                    EnclosureItemView(item: item, size: enclosureItemSize * 0.9)
                        .position(
                            x: position.x * geometry.size.width,
                            y: position.y * geometry.size.height
                        )
                }
            }
        }
    }

    private var backPositions: [(x: CGFloat, y: CGFloat)] {
        itemPositions.filter { $0.layer == .back }.map { (x: $0.x, y: $0.y) }
    }

    private var frontPositions: [(x: CGFloat, y: CGFloat)] {
        itemPositions.filter { $0.layer == .front }.map { (x: $0.x, y: $0.y) }
    }

    /// Split items between front and back layers (excluding wheel when animated)
    private var backItems: [ShopItem] {
        let items = nonWheelItems
        let count = min(items.count, backPositions.count)
        return Array(items.prefix(count))
    }

    private var frontItems: [ShopItem] {
        let items = nonWheelItems
        let backCount = min(items.count, backPositions.count)
        let remaining = Array(items.dropFirst(backCount))
        return Array(remaining.prefix(frontPositions.count))
    }

    // MARK: - Hamster Layer

    private var hamsterLayer: some View {
        VStack {
            Spacer()

            HamsterView(configuration: hamsterConfig)
                .frame(width: hamsterSize, height: hamsterSize)

            Spacer()
                .frame(height: groundHeight * 0.3)
        }
    }

    // MARK: - Wheel Running Layer

    private var wheelRunningLayer: some View {
        VStack {
            Spacer()
                .frame(height: height * 0.02)

            WheelRunningView(
                hamsterConfig: hamsterConfig,
                size: height * 0.65
            )

            Spacer()
                .frame(height: groundHeight * 0.1)
        }
    }

    // MARK: - Overlay Elements

    private var overlayElements: some View {
        ZStack {
            // Enclosure items count badge (bottom right)
            if !enclosureItems.isEmpty {
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        itemCountBadge
                            .padding(12)
                    }
                }
            }

            // Customize button (top right)
            if showCustomizeButton {
                VStack {
                    HStack {
                        Spacer()
                        customizeButton
                            .padding(12)
                    }
                    Spacer()
                }
            }
        }
    }

    private var itemCountBadge: some View {
        HStack(spacing: 4) {
            Image(systemName: "house.fill")
                .font(.caption2)
            Text("\(enclosureItems.count)")
                .font(.caption)
                .fontWeight(.medium)
        }
        .foregroundStyle(.orange)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(Color.white.opacity(0.9))
        .clipShape(Capsule())
        .accessibilityLabel("\(enclosureItems.count) items in enclosure")
    }

    private var customizeButton: some View {
        Button {
            onCustomizeTapped?()
        } label: {
            HStack(spacing: 4) {
                Image(systemName: "paintbrush.fill")
                    .font(.caption)
                Text("Customize")
                    .font(.caption)
                    .fontWeight(.medium)
            }
            .foregroundStyle(.accentColor)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color.white.opacity(0.95))
            .clipShape(Capsule())
            .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        }
        .accessibilityLabel("Customize your hamster")
        .accessibilityHint("Open your collection to change outfit, accessories, and enclosure items")
    }

    // MARK: - Accessibility

    private var enclosureAccessibilityLabel: String {
        var parts = [hamsterConfig.accessibilityLabel]

        if !enclosureItems.isEmpty {
            let itemNames = enclosureItems.map { $0.name }.joined(separator: ", ")
            parts.append("Home decorated with: \(itemNames)")
        }

        return parts.joined(separator: ". ")
    }
}

// MARK: - Convenience Initializers

extension EnclosureView {
    /// Initialize with separate parameters instead of configuration
    init(
        state: HamsterState,
        growthStage: GrowthStage,
        outfit: ShopItem? = nil,
        accessory: ShopItem? = nil,
        enclosureItems: [ShopItem] = [],
        height: CGFloat = 280,
        showCustomizeButton: Bool = false,
        onCustomizeTapped: (() -> Void)? = nil
    ) {
        self.hamsterConfig = HamsterConfiguration(
            state: state,
            growthStage: growthStage,
            outfit: outfit,
            accessory: accessory,
            baseSize: height * 0.4
        )
        self.enclosureItems = enclosureItems
        self.height = height
        self.showCustomizeButton = showCustomizeButton
        self.onCustomizeTapped = onCustomizeTapped
    }

    /// Initialize from equipped items
    init(
        state: HamsterState,
        growthStage: GrowthStage,
        equipped: EquippedItems,
        height: CGFloat = 280,
        showCustomizeButton: Bool = false,
        onCustomizeTapped: (() -> Void)? = nil
    ) {
        self.hamsterConfig = HamsterConfiguration.fromEquippedItems(
            state: state,
            growthStage: growthStage,
            equipped: equipped,
            size: height * 0.4
        )
        self.enclosureItems = equipped.enclosureItems
        self.height = height
        self.showCustomizeButton = showCustomizeButton
        self.onCustomizeTapped = onCustomizeTapped
    }
}

// MARK: - Previews

#Preview("Basic Enclosure") {
    EnclosureView(
        state: .happy,
        growthStage: .adult,
        enclosureItems: []
    )
    .padding()
}

#Preview("With Items") {
    let items = [
        ShopItem(id: "wheel", name: "Exercise Wheel", description: "", category: .enclosure, rarity: .common, price: 100, previewImageName: "", isNew: false, isFeatured: false),
        ShopItem(id: "house", name: "Cozy House", description: "", category: .enclosure, rarity: .uncommon, price: 150, previewImageName: "", isNew: false, isFeatured: false),
        ShopItem(id: "plants", name: "Potted Plants", description: "", category: .enclosure, rarity: .common, price: 75, previewImageName: "", isNew: false, isFeatured: false),
    ]

    EnclosureView(
        state: .excited,
        growthStage: .juvenile,
        enclosureItems: items
    )
    .padding()
}

#Preview("Fully Decorated") {
    let outfit = ShopItem(id: "superhero", name: "Superhero Cape", description: "", category: .outfits, rarity: .rare, price: 200, previewImageName: "", isNew: false, isFeatured: false)
    let accessory = ShopItem(id: "crown", name: "Golden Crown", description: "", category: .accessories, rarity: .legendary, price: 500, previewImageName: "", isNew: false, isFeatured: false)
    let items = [
        ShopItem(id: "wheel", name: "Exercise Wheel", description: "", category: .enclosure, rarity: .common, price: 100, previewImageName: "", isNew: false, isFeatured: false),
        ShopItem(id: "tunnel", name: "Play Tunnel", description: "", category: .enclosure, rarity: .common, price: 80, previewImageName: "", isNew: false, isFeatured: false),
        ShopItem(id: "hammock", name: "Comfy Hammock", description: "", category: .enclosure, rarity: .uncommon, price: 120, previewImageName: "", isNew: false, isFeatured: false),
        ShopItem(id: "treats", name: "Treat Bowl", description: "", category: .enclosure, rarity: .common, price: 50, previewImageName: "", isNew: false, isFeatured: false),
    ]

    EnclosureView(
        state: .proud,
        growthStage: .mature,
        outfit: outfit,
        accessory: accessory,
        enclosureItems: items,
        showCustomizeButton: true
    )
    .padding()
}

#Preview("All States") {
    ScrollView {
        VStack(spacing: 20) {
            ForEach(HamsterState.allCases, id: \.self) { state in
                VStack(alignment: .leading) {
                    Text(state.displayName)
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    EnclosureView(
                        state: state,
                        growthStage: .adult,
                        height: 200
                    )
                }
            }
        }
        .padding()
    }
}
