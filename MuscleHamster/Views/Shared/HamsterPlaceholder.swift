//
//  HamsterPlaceholder.swift
//  MuscleHamster
//
//  SwiftUI shape-based cute hamster placeholder
//  Replaces SF Symbol "hare.fill" with a proper hamster character
//  Phase 10.1: Updated to use official HamsterColorPalette
//  Phase 10.3: Improved SwiftUI Placeholders
//

import SwiftUI

/// A cute hamster drawn with SwiftUI shapes
/// Expression and proportions vary by state and growth stage
struct HamsterPlaceholder: View {
    let state: HamsterState
    let growthStage: GrowthStage
    let size: CGFloat

    // MARK: - Colors (from official Phase 10.1 color palette)

    private var bodyColor: Color { HamsterColorPalette.hamsterOrange }
    private var bellyColor: Color { HamsterColorPalette.hamsterCream }
    private var earInnerColor: Color { HamsterColorPalette.nosePink.opacity(0.5) }
    private var outlineColor: Color { HamsterColorPalette.outline }

    // MARK: - Proportions based on growth stage

    /// Head to body ratio varies by growth stage
    private var headToBodyRatio: CGFloat {
        switch growthStage {
        case .baby: return 0.65      // Big head, small body
        case .juvenile: return 0.55
        case .adult: return 0.45
        case .mature: return 0.42
        }
    }

    /// Body width relative to size
    private var bodyWidth: CGFloat { size * 0.7 }

    /// Body height relative to size
    private var bodyHeight: CGFloat { size * 0.5 }

    /// Head size relative to body
    private var headSize: CGFloat { bodyHeight * headToBodyRatio * 2 }

    var body: some View {
        ZStack {
            // Layer 1: Body
            bodyShape
                .offset(y: size * 0.15)

            // Layer 2: Belly
            bellyShape
                .offset(y: size * 0.2)

            // Layer 3: Ears (behind head)
            earsShape
                .offset(y: -size * 0.12)

            // Layer 4: Head
            headShape
                .offset(y: -size * 0.05)

            // Layer 5: Face
            HamsterFace(state: state, size: headSize)
                .offset(y: -size * 0.02)

            // Layer 6: Eyebrows (for expression)
            if state == .hungry || state == .proud {
                HamsterEyebrows(state: state, size: headSize)
                    .offset(y: -size * 0.12)
            }

            // Layer 7: Arms based on state
            armsShape

            // Layer 8: Feet
            feetShape
                .offset(y: size * 0.38)
        }
        .frame(width: size, height: size)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("A \(growthStage.displayName.lowercased()) hamster feeling \(state.displayName.lowercased())")
    }

    // MARK: - Body Parts

    private var bodyShape: some View {
        Ellipse()
            .fill(bodyColor)
            .frame(width: bodyWidth, height: bodyHeight)
            .overlay(
                Ellipse()
                    .strokeBorder(outlineColor, lineWidth: size * 0.02)
            )
    }

    private var bellyShape: some View {
        Ellipse()
            .fill(bellyColor)
            .frame(width: bodyWidth * 0.6, height: bodyHeight * 0.7)
    }

    private var headShape: some View {
        Circle()
            .fill(bodyColor)
            .frame(width: headSize, height: headSize)
            .overlay(
                Circle()
                    .strokeBorder(outlineColor, lineWidth: size * 0.02)
            )
    }

    private var earsShape: some View {
        HStack(spacing: headSize * 0.5) {
            // Left ear
            earShape
                .rotationEffect(.degrees(-15))
            // Right ear
            earShape
                .rotationEffect(.degrees(15))
        }
    }

    private var earShape: some View {
        ZStack {
            // Outer ear
            Ellipse()
                .fill(bodyColor)
                .frame(width: headSize * 0.35, height: headSize * 0.45)
                .overlay(
                    Ellipse()
                        .strokeBorder(outlineColor, lineWidth: size * 0.015)
                )

            // Inner ear
            Ellipse()
                .fill(earInnerColor)
                .frame(width: headSize * 0.2, height: headSize * 0.28)
                .offset(y: headSize * 0.03)
        }
    }

    private var armsShape: some View {
        Group {
            switch state {
            case .hungry:
                // Paws on belly
                hungryArms
            case .chillin:
                // Arms at sides, relaxed
                relaxedArms
            case .happy:
                // Arms slightly out
                happyArms
            case .excited:
                // Arms raised high
                excitedArms
            case .proud:
                // One arm on hip
                proudArms
            }
        }
    }

    private var hungryArms: some View {
        // Both paws touching belly
        HStack(spacing: bodyWidth * 0.2) {
            pawShape
                .rotationEffect(.degrees(30))
            pawShape
                .rotationEffect(.degrees(-30))
        }
        .offset(y: size * 0.18)
    }

    private var relaxedArms: some View {
        HStack(spacing: bodyWidth * 0.7) {
            pawShape
                .rotationEffect(.degrees(10))
            pawShape
                .rotationEffect(.degrees(-10))
        }
        .offset(y: size * 0.15)
    }

    private var happyArms: some View {
        HStack(spacing: bodyWidth * 0.85) {
            pawShape
                .rotationEffect(.degrees(-25))
                .offset(y: -size * 0.05)
            pawShape
                .rotationEffect(.degrees(25))
                .offset(y: -size * 0.05)
        }
        .offset(y: size * 0.1)
    }

    private var excitedArms: some View {
        HStack(spacing: bodyWidth * 0.9) {
            pawShape
                .rotationEffect(.degrees(-60))
                .offset(y: -size * 0.15)
            pawShape
                .rotationEffect(.degrees(60))
                .offset(y: -size * 0.15)
        }
        .offset(y: size * 0.05)
    }

    private var proudArms: some View {
        HStack(spacing: bodyWidth * 0.75) {
            // Left paw on hip
            pawShape
                .rotationEffect(.degrees(45))
                .offset(y: size * 0.05)
            // Right paw relaxed
            pawShape
                .rotationEffect(.degrees(-15))
        }
        .offset(y: size * 0.12)
    }

    private var pawShape: some View {
        Ellipse()
            .fill(bodyColor)
            .frame(width: size * 0.12, height: size * 0.1)
            .overlay(
                Ellipse()
                    .strokeBorder(outlineColor, lineWidth: size * 0.01)
            )
    }

    private var feetShape: some View {
        HStack(spacing: bodyWidth * 0.25) {
            // Left foot
            footShape
            // Right foot
            footShape
        }
        .offset(y: state == .excited ? -size * 0.05 : 0) // Jumping offset
    }

    private var footShape: some View {
        Ellipse()
            .fill(bodyColor)
            .frame(width: size * 0.15, height: size * 0.08)
            .overlay(
                Ellipse()
                    .strokeBorder(outlineColor, lineWidth: size * 0.01)
            )
    }
}

// MARK: - Previews

#Preview("All States") {
    ScrollView {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 20) {
            ForEach(HamsterState.allCases, id: \.self) { state in
                VStack {
                    HamsterPlaceholder(
                        state: state,
                        growthStage: .adult,
                        size: 120
                    )
                    Text(state.displayName)
                        .font(.caption)
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
            }
        }
        .padding()
    }
}

#Preview("All Growth Stages") {
    HStack(spacing: 16) {
        ForEach(GrowthStage.allCases, id: \.self) { stage in
            VStack {
                HamsterPlaceholder(
                    state: .happy,
                    growthStage: stage,
                    size: 80 * stage.sizeMultiplier
                )
                .frame(width: 100, height: 100)

                Text(stage.displayName)
                    .font(.caption)
            }
        }
    }
    .padding()
}

#Preview("Size Comparison") {
    VStack(spacing: 20) {
        HamsterPlaceholder(state: .happy, growthStage: .baby, size: 60)
        HamsterPlaceholder(state: .happy, growthStage: .adult, size: 100)
        HamsterPlaceholder(state: .excited, growthStage: .mature, size: 140)
    }
    .padding()
}
