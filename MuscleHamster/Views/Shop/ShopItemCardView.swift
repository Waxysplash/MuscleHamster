//
//  ShopItemCardView.swift
//  MuscleHamster
//
//  Reusable card component for displaying shop items
//  Phase 07.2: Shop MVP and Purchase Flow
//

import SwiftUI

struct ShopItemCardView: View {
    let item: ShopItem
    let isOwned: Bool
    var showCategory: Bool = false
    var size: CardSize = .regular

    enum CardSize {
        case compact    // For horizontal scrolls
        case regular    // For grids
        case large      // For featured section

        var width: CGFloat {
            switch self {
            case .compact: return 140
            case .regular: return 160
            case .large: return 280
            }
        }

        var height: CGFloat {
            switch self {
            case .compact: return 160
            case .regular: return 180
            case .large: return 200
            }
        }

        var iconSize: CGFloat {
            switch self {
            case .compact: return 32
            case .regular: return 40
            case .large: return 50
            }
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Image/Icon area
            itemPreview
                .frame(height: size == .large ? 120 : 80)

            // Item info
            VStack(alignment: .leading, spacing: 4) {
                // Name with badges
                HStack(spacing: 4) {
                    Text(item.name)
                        .font(size == .large ? .headline : .subheadline)
                        .fontWeight(.medium)
                        .lineLimit(1)

                    if item.isNew {
                        newBadge
                    }
                }

                // Price or owned status
                if isOwned {
                    ownedBadge
                } else {
                    priceDisplay
                }
            }
            .padding(.horizontal, 12)
            .padding(.bottom, 12)
        }
        .frame(width: size.width, height: size.height)
        .background(cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(rarityBorder)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityLabel)
        .accessibilityHint(isOwned ? "You own this item" : "Double tap to view details")
    }

    // MARK: - Subviews

    private var itemPreview: some View {
        ZStack {
            // Background gradient based on category
            LinearGradient(
                colors: categoryGradientColors,
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            // Placeholder icon (would be actual image in production)
            Image(systemName: item.defaultIcon)
                .font(.system(size: size.iconSize))
                .foregroundStyle(.white.opacity(0.9))

            // Rarity badge (only if rarity system enabled)
            if FeatureFlags.raritySystem && item.rarity != .common {
                VStack {
                    HStack {
                        Spacer()
                        rarityBadge
                            .padding(8)
                    }
                    Spacer()
                }
            }

            // Owned overlay
            if isOwned {
                Color.black.opacity(0.3)
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 24))
                    .foregroundStyle(.white)
            }
        }
    }

    private var rarityBadge: some View {
        Image(systemName: item.rarity.badgeIcon)
            .font(.caption)
            .foregroundStyle(rarityColor)
            .padding(4)
            .background(Color.white.opacity(0.9))
            .clipShape(Circle())
    }

    private var newBadge: some View {
        Text("NEW")
            .font(.system(size: 8, weight: .bold))
            .foregroundStyle(.white)
            .padding(.horizontal, 4)
            .padding(.vertical, 2)
            .background(Color.red)
            .clipShape(Capsule())
    }

    private var ownedBadge: some View {
        HStack(spacing: 4) {
            Image(systemName: "checkmark.circle.fill")
                .font(.caption2)
            Text("Owned")
                .font(.caption)
        }
        .foregroundStyle(.green)
    }

    private var priceDisplay: some View {
        HStack(spacing: 4) {
            Image(systemName: "star.fill")
                .font(.caption2)
                .foregroundStyle(.yellow)
            Text(item.displayPrice)
                .font(.caption)
                .fontWeight(.medium)
        }
    }

    private var cardBackground: some View {
        RoundedRectangle(cornerRadius: 16)
            .fill(Color(.systemBackground))
            .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
    }

    private var rarityBorder: some View {
        RoundedRectangle(cornerRadius: 16)
            .strokeBorder(
                FeatureFlags.raritySystem && (item.rarity == .legendary || item.rarity == .rare)
                    ? rarityColor.opacity(0.5)
                    : Color.clear,
                lineWidth: 2
            )
    }

    // MARK: - Helpers

    private var categoryGradientColors: [Color] {
        switch item.category {
        case .outfits:
            return [.purple.opacity(0.6), .pink.opacity(0.6)]
        case .accessories:
            return [.pink.opacity(0.6), .orange.opacity(0.5)]
        case .enclosure:
            return [.orange.opacity(0.6), .yellow.opacity(0.5)]
        }
    }

    private var rarityColor: Color {
        switch item.rarity {
        case .common: return .gray
        case .uncommon: return .green
        case .rare: return .blue
        case .legendary: return .purple
        }
    }

    private var accessibilityLabel: String {
        var label = item.accessibilityLabel
        if isOwned {
            label += ", owned"
        }
        return label
    }
}

// MARK: - Featured Card Variant

struct FeaturedShopItemCard: View {
    let item: ShopItem
    let isOwned: Bool

    var body: some View {
        HStack(spacing: 16) {
            // Preview area
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(gradientColors)
                    .frame(width: 100, height: 100)

                Image(systemName: item.defaultIcon)
                    .font(.system(size: 36))
                    .foregroundStyle(.white.opacity(0.9))

                if isOwned {
                    Color.black.opacity(0.3)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 24))
                        .foregroundStyle(.white)
                }
            }

            // Info
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(item.name)
                        .font(.headline)
                        .fontWeight(.semibold)

                    if item.isNew {
                        Text("NEW")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.red)
                            .clipShape(Capsule())
                    }

                    Spacer()

                    // Rarity (only if rarity system enabled)
                    if FeatureFlags.raritySystem {
                        Image(systemName: item.rarity.badgeIcon)
                            .font(.caption)
                            .foregroundStyle(rarityColor)
                    }
                }

                Text(item.description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)

                Spacer()

                // Price or owned
                if isOwned {
                    HStack(spacing: 4) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.caption)
                        Text("Owned")
                            .font(.subheadline)
                            .fontWeight(.medium)
                    }
                    .foregroundStyle(.green)
                } else {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.caption)
                            .foregroundStyle(.yellow)
                        Text("\(item.price) points")
                            .font(.subheadline)
                            .fontWeight(.medium)
                    }
                }
            }
        }
        .padding(12)
        .frame(height: 124)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .strokeBorder(
                    FeatureFlags.raritySystem && item.rarity == .legendary ? Color.purple.opacity(0.4) : Color.clear,
                    lineWidth: 2
                )
        )
        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(item.accessibilityLabel + (isOwned ? ", owned" : ""))
        .accessibilityHint("Double tap to view details")
    }

    private var gradientColors: LinearGradient {
        switch item.category {
        case .outfits:
            return LinearGradient(colors: [.purple.opacity(0.7), .pink.opacity(0.6)], startPoint: .topLeading, endPoint: .bottomTrailing)
        case .accessories:
            return LinearGradient(colors: [.pink.opacity(0.7), .orange.opacity(0.5)], startPoint: .topLeading, endPoint: .bottomTrailing)
        case .enclosure:
            return LinearGradient(colors: [.orange.opacity(0.7), .yellow.opacity(0.5)], startPoint: .topLeading, endPoint: .bottomTrailing)
        }
    }

    private var rarityColor: Color {
        switch item.rarity {
        case .common: return .gray
        case .uncommon: return .green
        case .rare: return .blue
        case .legendary: return .purple
        }
    }
}

// MARK: - Previews

#Preview("Regular Card") {
    HStack(spacing: 12) {
        ShopItemCardView(
            item: ShopItem(
                id: "test",
                name: "Superhero Cape",
                description: "A cool cape",
                category: .outfits,
                rarity: .uncommon,
                price: 150,
                previewImageName: "test",
                isNew: true,
                isFeatured: true
            ),
            isOwned: false
        )

        ShopItemCardView(
            item: ShopItem(
                id: "test2",
                name: "Golden Crown",
                description: "A royal crown",
                category: .accessories,
                rarity: .legendary,
                price: 450,
                previewImageName: "test",
                isNew: false,
                isFeatured: true
            ),
            isOwned: true
        )
    }
    .padding()
}

#Preview("Featured Card") {
    VStack(spacing: 12) {
        FeaturedShopItemCard(
            item: ShopItem(
                id: "test",
                name: "Astronaut Suit",
                description: "To infinity and beyond! A mini spacesuit for cosmic adventures.",
                category: .outfits,
                rarity: .legendary,
                price: 500,
                previewImageName: "test",
                isNew: false,
                isFeatured: true
            ),
            isOwned: false
        )

        FeaturedShopItemCard(
            item: ShopItem(
                id: "test2",
                name: "Wizard Robe",
                description: "A mystical purple robe with stars.",
                category: .outfits,
                rarity: .rare,
                price: 300,
                previewImageName: "test",
                isNew: true,
                isFeatured: true
            ),
            isOwned: true
        )
    }
    .padding()
}
