//
//  OutfitOverlay.swift
//  MuscleHamster
//
//  Renders outfit overlays on the hamster
//  Tries to load real asset, falls back to placeholder
//  Phase 10.2: HamsterView Component Architecture
//

import SwiftUI

/// Overlay view for hamster outfits
struct OutfitOverlay: View {
    let outfit: ShopItem
    let size: CGFloat

    var body: some View {
        ZStack {
            // Try to load real asset first
            if let image = loadAssetImage() {
                image
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: size, height: size)
            } else {
                // Fall back to placeholder
                outfitPlaceholder
            }
        }
        .accessibilityHidden(true) // Parent view handles accessibility
    }

    /// Attempt to load the real asset image
    private func loadAssetImage() -> Image? {
        let imageName = "outfit_\(outfit.id)"
        // UIImage returns nil if asset doesn't exist
        if UIImage(named: imageName) != nil {
            return Image(imageName)
        }
        return nil
    }

    /// Placeholder visualization based on outfit type
    private var outfitPlaceholder: some View {
        ZStack {
            // Visual representation varies by outfit
            switch outfit.id {
            case "superhero", "outfit_superhero":
                capeOverlay
            case "wizard", "outfit_wizard":
                robeOverlay
            case "athlete", "outfit_athlete":
                athleticOverlay
            case "cozy", "outfit_cozy":
                hoodieOverlay
            case "formal", "outfit_formal":
                bowtieOverlay
            case "pirate", "outfit_pirate":
                pirateOverlay
            case "space", "outfit_space":
                spaceOverlay
            case "ninja", "outfit_ninja":
                ninjaOverlay
            default:
                genericOutfitOverlay
            }
        }
    }

    // MARK: - Outfit Placeholders

    private var capeOverlay: some View {
        // Red cape flowing behind
        ZStack {
            // Cape body
            Path { path in
                let width = size * 0.6
                let height = size * 0.5
                let startX = size * 0.5 - width * 0.5
                let startY = size * 0.3

                path.move(to: CGPoint(x: startX, y: startY))
                path.addLine(to: CGPoint(x: startX + width, y: startY))
                path.addQuadCurve(
                    to: CGPoint(x: startX + width * 0.8, y: startY + height),
                    control: CGPoint(x: startX + width * 1.1, y: startY + height * 0.7)
                )
                path.addLine(to: CGPoint(x: startX + width * 0.2, y: startY + height))
                path.addQuadCurve(
                    to: CGPoint(x: startX, y: startY),
                    control: CGPoint(x: startX - width * 0.1, y: startY + height * 0.7)
                )
                path.closeSubpath()
            }
            .fill(Color.red.opacity(0.8))

            // Gold clasp
            Circle()
                .fill(Color.yellow)
                .frame(width: size * 0.08, height: size * 0.08)
                .offset(y: -size * 0.18)
        }
    }

    private var robeOverlay: some View {
        // Purple robe with stars
        ZStack {
            // Robe shape
            RoundedRectangle(cornerRadius: size * 0.05)
                .fill(Color.purple.opacity(0.7))
                .frame(width: size * 0.55, height: size * 0.45)
                .offset(y: size * 0.15)

            // Stars
            ForEach(0..<3, id: \.self) { i in
                Image(systemName: "star.fill")
                    .font(.system(size: size * 0.05))
                    .foregroundStyle(.yellow)
                    .offset(
                        x: CGFloat.random(in: -size * 0.15...size * 0.15),
                        y: size * 0.1 + CGFloat(i) * size * 0.08
                    )
            }
        }
    }

    private var athleticOverlay: some View {
        VStack(spacing: 0) {
            // Headband
            RoundedRectangle(cornerRadius: size * 0.02)
                .fill(Color.blue)
                .frame(width: size * 0.35, height: size * 0.04)
                .offset(y: -size * 0.15)

            // Tank top
            RoundedRectangle(cornerRadius: size * 0.03)
                .fill(Color.green.opacity(0.7))
                .frame(width: size * 0.4, height: size * 0.25)
                .offset(y: size * 0.1)
        }
    }

    private var hoodieOverlay: some View {
        // Cozy hoodie shape
        ZStack {
            // Hoodie body
            RoundedRectangle(cornerRadius: size * 0.08)
                .fill(Color.gray.opacity(0.6))
                .frame(width: size * 0.55, height: size * 0.4)
                .offset(y: size * 0.12)

            // Hood
            Ellipse()
                .fill(Color.gray.opacity(0.5))
                .frame(width: size * 0.35, height: size * 0.2)
                .offset(y: -size * 0.1)
        }
    }

    private var bowtieOverlay: some View {
        // Fancy bow tie
        ZStack {
            // Left bow
            Ellipse()
                .fill(Color.red)
                .frame(width: size * 0.1, height: size * 0.06)
                .offset(x: -size * 0.06)

            // Right bow
            Ellipse()
                .fill(Color.red)
                .frame(width: size * 0.1, height: size * 0.06)
                .offset(x: size * 0.06)

            // Center knot
            Circle()
                .fill(Color.red.opacity(0.9))
                .frame(width: size * 0.04, height: size * 0.04)
        }
        .offset(y: size * 0.05)
    }

    private var pirateOverlay: some View {
        VStack(spacing: 0) {
            // Eyepatch (simple)
            Circle()
                .fill(Color.black)
                .frame(width: size * 0.08, height: size * 0.08)
                .offset(x: size * 0.08, y: -size * 0.08)

            // Striped shirt indication
            HStack(spacing: size * 0.03) {
                ForEach(0..<3, id: \.self) { _ in
                    Rectangle()
                        .fill(Color.red)
                        .frame(width: size * 0.03, height: size * 0.2)
                }
            }
            .offset(y: size * 0.15)
        }
    }

    private var spaceOverlay: some View {
        // Space suit elements
        ZStack {
            // Suit body
            RoundedRectangle(cornerRadius: size * 0.1)
                .fill(Color.white.opacity(0.8))
                .frame(width: size * 0.5, height: size * 0.4)
                .overlay(
                    RoundedRectangle(cornerRadius: size * 0.1)
                        .strokeBorder(Color.gray, lineWidth: size * 0.01)
                )
                .offset(y: size * 0.12)

            // Badge
            Circle()
                .fill(Color.blue)
                .frame(width: size * 0.06, height: size * 0.06)
                .offset(x: -size * 0.12, y: size * 0.05)
        }
    }

    private var ninjaOverlay: some View {
        // Ninja mask and outfit
        ZStack {
            // Mask across face
            RoundedRectangle(cornerRadius: size * 0.02)
                .fill(Color.black.opacity(0.8))
                .frame(width: size * 0.35, height: size * 0.08)
                .offset(y: -size * 0.05)

            // Outfit body
            RoundedRectangle(cornerRadius: size * 0.05)
                .fill(Color.black.opacity(0.6))
                .frame(width: size * 0.45, height: size * 0.35)
                .offset(y: size * 0.15)
        }
    }

    private var genericOutfitOverlay: some View {
        // Generic outfit indicator
        Image(systemName: "tshirt.fill")
            .font(.system(size: size * 0.25))
            .foregroundStyle(Color.purple.opacity(0.6))
            .offset(y: size * 0.1)
    }
}

// MARK: - Preview

#Preview("Outfit Overlays") {
    let outfits = ["superhero", "wizard", "athlete", "cozy", "formal", "pirate", "space", "ninja"]

    ScrollView {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 20) {
            ForEach(outfits, id: \.self) { outfitId in
                VStack {
                    ZStack {
                        // Background
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.orange.opacity(0.2))

                        // Hamster placeholder
                        HamsterPlaceholder(state: .happy, growthStage: .adult, size: 100)

                        // Outfit overlay
                        OutfitOverlay(
                            outfit: ShopItem(
                                id: outfitId,
                                name: outfitId.capitalized,
                                description: "",
                                category: .outfits,
                                rarity: .common,
                                price: 100,
                                previewImageName: "",
                                isNew: false,
                                isFeatured: false
                            ),
                            size: 100
                        )
                    }
                    .frame(width: 120, height: 120)

                    Text(outfitId.capitalized)
                        .font(.caption)
                }
            }
        }
        .padding()
    }
}
