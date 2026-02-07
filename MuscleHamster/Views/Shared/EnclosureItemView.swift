//
//  EnclosureItemView.swift
//  MuscleHamster
//
//  Renders individual enclosure items (decorations for hamster's home)
//  Tries to load real asset, falls back to placeholder
//  Phase 10.4: EnclosureView Component
//

import SwiftUI

/// View for rendering a single enclosure decoration item
struct EnclosureItemView: View {
    let item: ShopItem
    let size: CGFloat

    var body: some View {
        Group {
            // Try to load real asset first
            if let image = loadAssetImage() {
                image
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: size, height: size)
            } else {
                // Fall back to placeholder
                itemPlaceholder
            }
        }
        .accessibilityLabel(item.name)
    }

    /// Attempt to load the real asset image
    private func loadAssetImage() -> Image? {
        let imageName = "enclosure_\(item.id)"
        if UIImage(named: imageName) != nil {
            return Image(imageName)
        }
        return nil
    }

    /// Placeholder visualization based on item type
    @ViewBuilder
    private var itemPlaceholder: some View {
        switch item.id {
        case "wheel", "enc_wheel", "enclosure_wheel":
            wheelPlaceholder
        case "tunnel", "enc_tunnel", "enclosure_tunnel":
            tunnelPlaceholder
        case "house", "enc_house", "enclosure_house":
            housePlaceholder
        case "plants", "enc_plants", "enclosure_plants":
            plantsPlaceholder
        case "treats", "enc_treats", "enclosure_treats":
            treatsPlaceholder
        case "ball", "enc_ball", "enclosure_ball":
            ballPlaceholder
        case "hammock", "enc_hammock", "enclosure_hammock":
            hammockPlaceholder
        case "toys", "enc_toys", "enclosure_toys":
            toysPlaceholder
        default:
            genericItemPlaceholder
        }
    }

    // MARK: - Item Placeholders

    private var wheelPlaceholder: some View {
        ZStack {
            // Outer wheel
            Circle()
                .stroke(Color.gray, lineWidth: size * 0.08)
                .frame(width: size * 0.9, height: size * 0.9)

            // Inner spokes
            ForEach(0..<6, id: \.self) { i in
                Rectangle()
                    .fill(Color.gray.opacity(0.6))
                    .frame(width: size * 0.03, height: size * 0.35)
                    .rotationEffect(.degrees(Double(i) * 30))
            }

            // Center hub
            Circle()
                .fill(Color.gray)
                .frame(width: size * 0.15, height: size * 0.15)

            // Stand
            Rectangle()
                .fill(Color.gray.opacity(0.8))
                .frame(width: size * 0.08, height: size * 0.25)
                .offset(y: size * 0.45)
        }
    }

    private var tunnelPlaceholder: some View {
        ZStack {
            // Tunnel tube
            Capsule()
                .fill(
                    LinearGradient(
                        colors: [.blue.opacity(0.4), .cyan.opacity(0.3)],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .frame(width: size * 0.9, height: size * 0.45)

            // Openings
            HStack(spacing: size * 0.55) {
                Circle()
                    .fill(Color.black.opacity(0.3))
                    .frame(width: size * 0.25, height: size * 0.25)
                Circle()
                    .fill(Color.black.opacity(0.3))
                    .frame(width: size * 0.25, height: size * 0.25)
            }
        }
    }

    private var housePlaceholder: some View {
        ZStack {
            // House body
            RoundedRectangle(cornerRadius: size * 0.05)
                .fill(Color.brown.opacity(0.6))
                .frame(width: size * 0.7, height: size * 0.5)
                .offset(y: size * 0.15)

            // Roof
            Path { path in
                path.move(to: CGPoint(x: size * 0.1, y: size * 0.4))
                path.addLine(to: CGPoint(x: size * 0.5, y: size * 0.1))
                path.addLine(to: CGPoint(x: size * 0.9, y: size * 0.4))
                path.closeSubpath()
            }
            .fill(Color.red.opacity(0.7))

            // Door
            RoundedRectangle(cornerRadius: size * 0.03)
                .fill(Color.brown.opacity(0.8))
                .frame(width: size * 0.2, height: size * 0.28)
                .offset(y: size * 0.24)
        }
    }

    private var plantsPlaceholder: some View {
        ZStack {
            // Pot
            Path { path in
                path.move(to: CGPoint(x: size * 0.25, y: size * 0.55))
                path.addLine(to: CGPoint(x: size * 0.3, y: size * 0.9))
                path.addLine(to: CGPoint(x: size * 0.7, y: size * 0.9))
                path.addLine(to: CGPoint(x: size * 0.75, y: size * 0.55))
                path.closeSubpath()
            }
            .fill(Color.orange.opacity(0.7))

            // Pot rim
            Capsule()
                .fill(Color.orange.opacity(0.8))
                .frame(width: size * 0.55, height: size * 0.08)
                .offset(y: size * 0.04)

            // Leaves
            ForEach(0..<3, id: \.self) { i in
                Ellipse()
                    .fill(Color.green.opacity(0.7))
                    .frame(width: size * 0.2, height: size * 0.35)
                    .rotationEffect(.degrees(Double(i - 1) * 25))
                    .offset(y: -size * 0.15)
            }
        }
    }

    private var treatsPlaceholder: some View {
        ZStack {
            // Bowl
            Ellipse()
                .fill(Color.pink.opacity(0.5))
                .frame(width: size * 0.7, height: size * 0.35)
                .offset(y: size * 0.2)

            // Bowl rim
            Ellipse()
                .stroke(Color.pink.opacity(0.7), lineWidth: size * 0.04)
                .frame(width: size * 0.7, height: size * 0.15)
                .offset(y: size * 0.05)

            // Treats (little circles)
            ForEach(0..<4, id: \.self) { i in
                Circle()
                    .fill(Color.brown.opacity(0.7))
                    .frame(width: size * 0.12, height: size * 0.12)
                    .offset(
                        x: CGFloat(i - 2) * size * 0.12 + size * 0.06,
                        y: size * 0.08
                    )
            }
        }
    }

    private var ballPlaceholder: some View {
        ZStack {
            // Ball sphere
            Circle()
                .fill(
                    RadialGradient(
                        colors: [.yellow.opacity(0.3), .orange.opacity(0.4)],
                        center: .topLeading,
                        startRadius: 0,
                        endRadius: size * 0.5
                    )
                )
                .frame(width: size * 0.8, height: size * 0.8)

            // Highlight
            Circle()
                .fill(Color.white.opacity(0.4))
                .frame(width: size * 0.2, height: size * 0.2)
                .offset(x: -size * 0.15, y: -size * 0.15)

            // Ventilation holes pattern
            ForEach(0..<3, id: \.self) { row in
                ForEach(0..<3, id: \.self) { col in
                    Circle()
                        .fill(Color.black.opacity(0.2))
                        .frame(width: size * 0.05, height: size * 0.05)
                        .offset(
                            x: CGFloat(col - 1) * size * 0.15,
                            y: CGFloat(row - 1) * size * 0.15
                        )
                }
            }
        }
    }

    private var hammockPlaceholder: some View {
        ZStack {
            // Ropes
            ForEach([true, false], id: \.self) { isLeft in
                Path { path in
                    let startX = isLeft ? size * 0.15 : size * 0.85
                    path.move(to: CGPoint(x: startX, y: 0))
                    path.addLine(to: CGPoint(x: size * 0.5 + (isLeft ? -size * 0.2 : size * 0.2), y: size * 0.3))
                }
                .stroke(Color.brown, lineWidth: size * 0.02)
            }

            // Hammock fabric
            Path { path in
                path.move(to: CGPoint(x: size * 0.2, y: size * 0.3))
                path.addQuadCurve(
                    to: CGPoint(x: size * 0.8, y: size * 0.3),
                    control: CGPoint(x: size * 0.5, y: size * 0.65)
                )
                path.addLine(to: CGPoint(x: size * 0.75, y: size * 0.35))
                path.addQuadCurve(
                    to: CGPoint(x: size * 0.25, y: size * 0.35),
                    control: CGPoint(x: size * 0.5, y: size * 0.6)
                )
                path.closeSubpath()
            }
            .fill(Color.purple.opacity(0.5))
        }
    }

    private var toysPlaceholder: some View {
        ZStack {
            // Small ball
            Circle()
                .fill(Color.red.opacity(0.6))
                .frame(width: size * 0.25, height: size * 0.25)
                .offset(x: -size * 0.2, y: size * 0.15)

            // Block
            RoundedRectangle(cornerRadius: size * 0.02)
                .fill(Color.blue.opacity(0.6))
                .frame(width: size * 0.2, height: size * 0.2)
                .offset(x: size * 0.1, y: size * 0.2)

            // Ring
            Circle()
                .stroke(Color.green.opacity(0.7), lineWidth: size * 0.04)
                .frame(width: size * 0.25, height: size * 0.25)
                .offset(x: size * 0.15, y: -size * 0.1)

            // Star
            Image(systemName: "star.fill")
                .font(.system(size: size * 0.15))
                .foregroundStyle(.yellow)
                .offset(x: -size * 0.15, y: -size * 0.15)
        }
    }

    private var genericItemPlaceholder: some View {
        ZStack {
            RoundedRectangle(cornerRadius: size * 0.1)
                .fill(Color.gray.opacity(0.3))
                .frame(width: size * 0.7, height: size * 0.7)

            Image(systemName: "cube.fill")
                .font(.system(size: size * 0.3))
                .foregroundStyle(.gray)
        }
    }
}

// MARK: - Preview

#Preview("All Enclosure Items") {
    let items = ["wheel", "tunnel", "house", "plants", "treats", "ball", "hammock", "toys"]

    ScrollView {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 20) {
            ForEach(items, id: \.self) { itemId in
                VStack {
                    EnclosureItemView(
                        item: ShopItem(
                            id: itemId,
                            name: itemId.capitalized,
                            description: "",
                            category: .enclosure,
                            rarity: .common,
                            price: 100,
                            previewImageName: "",
                            isNew: false,
                            isFeatured: false
                        ),
                        size: 80
                    )
                    .frame(width: 100, height: 100)
                    .background(Color.brown.opacity(0.1))
                    .cornerRadius(12)

                    Text(itemId.capitalized)
                        .font(.caption)
                }
            }
        }
        .padding()
    }
}
