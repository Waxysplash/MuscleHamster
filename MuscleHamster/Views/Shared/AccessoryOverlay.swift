//
//  AccessoryOverlay.swift
//  MuscleHamster
//
//  Renders accessory overlays on the hamster
//  Positioned on head/neck area
//  Phase 10.2: HamsterView Component Architecture
//

import SwiftUI

/// Overlay view for hamster accessories
struct AccessoryOverlay: View {
    let accessory: ShopItem
    let size: CGFloat

    /// Accessory position relative to hamster center
    private var accessoryOffset: CGSize {
        switch accessory.id {
        case "crown", "accessory_crown", "halo", "accessory_halo", "flower", "accessory_flower", "bandana", "accessory_bandana":
            // Top of head
            return CGSize(width: 0, height: -size * 0.35)
        case "sunglasses", "accessory_sunglasses", "glasses", "accessory_glasses":
            // Eye level
            return CGSize(width: 0, height: -size * 0.18)
        case "headphones", "accessory_headphones", "bowtie", "accessory_bowtie":
            // Ear level
            return CGSize(width: 0, height: -size * 0.25)
        default:
            return CGSize(width: 0, height: -size * 0.25)
        }
    }

    var body: some View {
        ZStack {
            // Try to load real asset first
            if let image = loadAssetImage() {
                image
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: size * 0.4, height: size * 0.4)
                    .offset(accessoryOffset)
            } else {
                // Fall back to placeholder
                accessoryPlaceholder
                    .offset(accessoryOffset)
            }
        }
        .accessibilityHidden(true) // Parent view handles accessibility
    }

    /// Attempt to load the real asset image
    private func loadAssetImage() -> Image? {
        let imageName = "accessory_\(accessory.id)"
        if UIImage(named: imageName) != nil {
            return Image(imageName)
        }
        return nil
    }

    /// Placeholder visualization based on accessory type
    private var accessoryPlaceholder: some View {
        Group {
            switch accessory.id {
            case "sunglasses", "accessory_sunglasses":
                sunglassesPlaceholder
            case "crown", "accessory_crown":
                crownPlaceholder
            case "halo", "accessory_halo":
                haloPlaceholder
            case "headphones", "accessory_headphones":
                headphonesPlaceholder
            case "flower", "accessory_flower":
                flowerPlaceholder
            case "bandana", "accessory_bandana":
                bandanaPlaceholder
            case "bowtie", "accessory_bowtie":
                bowPlaceholder
            case "glasses", "accessory_glasses":
                glassesPlaceholder
            default:
                genericAccessoryPlaceholder
            }
        }
    }

    // MARK: - Accessory Placeholders

    private var sunglassesPlaceholder: some View {
        HStack(spacing: size * 0.03) {
            // Left lens
            RoundedRectangle(cornerRadius: size * 0.02)
                .fill(Color.black.opacity(0.8))
                .frame(width: size * 0.12, height: size * 0.08)

            // Bridge
            Rectangle()
                .fill(Color.black)
                .frame(width: size * 0.04, height: size * 0.015)

            // Right lens
            RoundedRectangle(cornerRadius: size * 0.02)
                .fill(Color.black.opacity(0.8))
                .frame(width: size * 0.12, height: size * 0.08)
        }
    }

    private var crownPlaceholder: some View {
        ZStack {
            // Crown base
            Path { path in
                let width = size * 0.3
                let height = size * 0.15
                let startX = -width / 2
                let startY = height / 2

                path.move(to: CGPoint(x: startX, y: startY))
                // Left spike
                path.addLine(to: CGPoint(x: startX + width * 0.15, y: -startY))
                // Left valley
                path.addLine(to: CGPoint(x: startX + width * 0.3, y: startY * 0.3))
                // Center spike
                path.addLine(to: CGPoint(x: 0, y: -startY * 1.2))
                // Right valley
                path.addLine(to: CGPoint(x: -startX - width * 0.3, y: startY * 0.3))
                // Right spike
                path.addLine(to: CGPoint(x: -startX - width * 0.15, y: -startY))
                // Right edge
                path.addLine(to: CGPoint(x: -startX, y: startY))
                path.closeSubpath()
            }
            .fill(Color.yellow)
            .overlay(
                Path { path in
                    let width = size * 0.3
                    let height = size * 0.15
                    let startX = -width / 2
                    let startY = height / 2

                    path.move(to: CGPoint(x: startX, y: startY))
                    path.addLine(to: CGPoint(x: startX + width * 0.15, y: -startY))
                    path.addLine(to: CGPoint(x: startX + width * 0.3, y: startY * 0.3))
                    path.addLine(to: CGPoint(x: 0, y: -startY * 1.2))
                    path.addLine(to: CGPoint(x: -startX - width * 0.3, y: startY * 0.3))
                    path.addLine(to: CGPoint(x: -startX - width * 0.15, y: -startY))
                    path.addLine(to: CGPoint(x: -startX, y: startY))
                    path.closeSubpath()
                }
                .stroke(Color.orange, lineWidth: size * 0.01)
            )

            // Gems
            Circle()
                .fill(Color.red)
                .frame(width: size * 0.03, height: size * 0.03)
                .offset(y: size * 0.01)
        }
    }

    private var haloPlaceholder: some View {
        Ellipse()
            .stroke(Color.yellow, lineWidth: size * 0.025)
            .frame(width: size * 0.25, height: size * 0.08)
            .shadow(color: .yellow.opacity(0.5), radius: size * 0.02)
    }

    private var headphonesPlaceholder: some View {
        ZStack {
            // Headband
            Path { path in
                path.addArc(
                    center: CGPoint(x: 0, y: size * 0.05),
                    radius: size * 0.18,
                    startAngle: .degrees(180),
                    endAngle: .degrees(0),
                    clockwise: false
                )
            }
            .stroke(Color.gray, lineWidth: size * 0.025)

            // Left ear cup
            Circle()
                .fill(Color.pink)
                .frame(width: size * 0.1, height: size * 0.1)
                .offset(x: -size * 0.17, y: size * 0.05)

            // Right ear cup
            Circle()
                .fill(Color.pink)
                .frame(width: size * 0.1, height: size * 0.1)
                .offset(x: size * 0.17, y: size * 0.05)
        }
    }

    private var flowerPlaceholder: some View {
        ZStack {
            // Petals
            ForEach(0..<5, id: \.self) { i in
                Ellipse()
                    .fill(Color.pink)
                    .frame(width: size * 0.06, height: size * 0.08)
                    .offset(y: -size * 0.04)
                    .rotationEffect(.degrees(Double(i) * 72))
            }

            // Center
            Circle()
                .fill(Color.yellow)
                .frame(width: size * 0.04, height: size * 0.04)
        }
    }

    private var bandanaPlaceholder: some View {
        ZStack {
            // Bandana band
            RoundedRectangle(cornerRadius: size * 0.01)
                .fill(Color.red)
                .frame(width: size * 0.35, height: size * 0.05)

            // Knot on side
            Circle()
                .fill(Color.red.opacity(0.8))
                .frame(width: size * 0.04, height: size * 0.04)
                .offset(x: size * 0.15, y: size * 0.02)
        }
    }

    private var bowPlaceholder: some View {
        ZStack {
            // Left loop
            Ellipse()
                .fill(Color.pink)
                .frame(width: size * 0.08, height: size * 0.05)
                .offset(x: -size * 0.05)

            // Right loop
            Ellipse()
                .fill(Color.pink)
                .frame(width: size * 0.08, height: size * 0.05)
                .offset(x: size * 0.05)

            // Center knot
            Circle()
                .fill(Color.pink.opacity(0.9))
                .frame(width: size * 0.03, height: size * 0.03)
        }
    }

    private var glassesPlaceholder: some View {
        HStack(spacing: size * 0.02) {
            // Left lens
            Circle()
                .stroke(Color.brown, lineWidth: size * 0.015)
                .frame(width: size * 0.1, height: size * 0.1)

            // Bridge
            Rectangle()
                .fill(Color.brown)
                .frame(width: size * 0.03, height: size * 0.01)

            // Right lens
            Circle()
                .stroke(Color.brown, lineWidth: size * 0.015)
                .frame(width: size * 0.1, height: size * 0.1)
        }
    }

    private var genericAccessoryPlaceholder: some View {
        Image(systemName: "sparkles")
            .font(.system(size: size * 0.15))
            .foregroundStyle(.pink)
    }
}

// MARK: - Preview

#Preview("Accessory Overlays") {
    let accessories = ["sunglasses", "crown", "halo", "headphones", "flower", "bandana", "bowtie", "glasses"]

    ScrollView {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 20) {
            ForEach(accessories, id: \.self) { accessoryId in
                VStack {
                    ZStack {
                        // Background
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.orange.opacity(0.2))

                        // Hamster placeholder
                        HamsterPlaceholder(state: .happy, growthStage: .adult, size: 100)

                        // Accessory overlay
                        AccessoryOverlay(
                            accessory: ShopItem(
                                id: accessoryId,
                                name: accessoryId.capitalized,
                                description: "",
                                category: .accessories,
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

                    Text(accessoryId.capitalized)
                        .font(.caption)
                }
            }
        }
        .padding()
    }
}
