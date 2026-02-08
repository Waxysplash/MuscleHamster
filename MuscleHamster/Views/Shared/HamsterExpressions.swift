//
//  HamsterExpressions.swift
//  MuscleHamster
//
//  Reusable expression components for the hamster placeholder
//  Phase 10.1: Updated to use official HamsterColorPalette
//  Phase 10.3: Improved SwiftUI Placeholders
//

import SwiftUI

// MARK: - Expression Components

/// Eye component with customizable expression
struct HamsterEye: View {
    let isHalfClosed: Bool
    let isWide: Bool
    let hasSparkle: Bool
    let size: CGFloat

    var body: some View {
        ZStack {
            // Eye base (using official palette)
            Ellipse()
                .fill(HamsterColorPalette.eyeBlack)
                .frame(
                    width: size,
                    height: isHalfClosed ? size * 0.4 : (isWide ? size * 1.2 : size)
                )

            // Sparkle highlight (using official palette)
            if hasSparkle && !isHalfClosed {
                Circle()
                    .fill(HamsterColorPalette.eyeHighlight)
                    .frame(width: size * 0.35, height: size * 0.35)
                    .offset(x: -size * 0.15, y: -size * 0.15)
            }
        }
    }
}

/// Nose component
struct HamsterNose: View {
    let size: CGFloat

    var body: some View {
        Ellipse()
            .fill(HamsterColorPalette.nosePink)
            .frame(width: size, height: size * 0.7)
    }
}

/// Cheek blush component
struct HamsterCheek: View {
    let size: CGFloat
    let intensity: Double

    var body: some View {
        Circle()
            .fill(Color.pink.opacity(intensity))
            .frame(width: size, height: size)
    }
}

// MARK: - Mouth Shapes

/// Base mouth shape that can be configured
struct HamsterMouth: Shape {
    let mouthType: MouthType

    enum MouthType {
        case smile       // Happy, gentle curve up
        case bigSmile    // Excited, wide open smile
        case pout        // Hungry, sad downturn
        case smirk       // Proud, one-sided upturn
        case relaxed     // Chillin, subtle curve
    }

    func path(in rect: CGRect) -> Path {
        var path = Path()
        let midX = rect.midX
        let midY = rect.midY

        switch mouthType {
        case .smile:
            // Gentle upward curve
            path.move(to: CGPoint(x: rect.minX, y: midY - rect.height * 0.2))
            path.addQuadCurve(
                to: CGPoint(x: rect.maxX, y: midY - rect.height * 0.2),
                control: CGPoint(x: midX, y: rect.maxY)
            )

        case .bigSmile:
            // Wide open smile (like a "D" shape)
            path.move(to: CGPoint(x: rect.minX + rect.width * 0.1, y: rect.minY))
            path.addQuadCurve(
                to: CGPoint(x: rect.maxX - rect.width * 0.1, y: rect.minY),
                control: CGPoint(x: midX, y: rect.maxY + rect.height * 0.3)
            )
            path.addLine(to: CGPoint(x: rect.minX + rect.width * 0.1, y: rect.minY))

        case .pout:
            // Downward curve (sad)
            path.move(to: CGPoint(x: rect.minX, y: midY + rect.height * 0.2))
            path.addQuadCurve(
                to: CGPoint(x: rect.maxX, y: midY + rect.height * 0.2),
                control: CGPoint(x: midX, y: rect.minY - rect.height * 0.3)
            )

        case .smirk:
            // One-sided upturn (confident)
            path.move(to: CGPoint(x: rect.minX, y: midY))
            path.addQuadCurve(
                to: CGPoint(x: rect.maxX, y: midY - rect.height * 0.4),
                control: CGPoint(x: midX + rect.width * 0.2, y: midY + rect.height * 0.3)
            )

        case .relaxed:
            // Subtle gentle curve
            path.move(to: CGPoint(x: rect.minX + rect.width * 0.2, y: midY))
            path.addQuadCurve(
                to: CGPoint(x: rect.maxX - rect.width * 0.2, y: midY),
                control: CGPoint(x: midX, y: midY + rect.height * 0.3)
            )
        }

        return path
    }
}

// MARK: - State-Based Face Views

/// Face configuration based on hamster state
struct HamsterFace: View {
    let state: HamsterState
    let size: CGFloat

    private var eyeSize: CGFloat { size * 0.15 }
    private var eyeSpacing: CGFloat { size * 0.25 }
    private var noseSize: CGFloat { size * 0.08 }
    private var mouthWidth: CGFloat { size * 0.25 }
    private var mouthHeight: CGFloat { size * 0.12 }
    private var cheekSize: CGFloat { size * 0.12 }

    var body: some View {
        VStack(spacing: size * 0.02) {
            // Eyes
            HStack(spacing: eyeSpacing) {
                HamsterEye(
                    isHalfClosed: state == .chillin,
                    isWide: state == .excited,
                    hasSparkle: state == .happy || state == .excited,
                    size: eyeSize
                )
                HamsterEye(
                    isHalfClosed: state == .chillin,
                    isWide: state == .excited,
                    hasSparkle: state == .happy || state == .excited,
                    size: eyeSize
                )
            }

            // Nose
            HamsterNose(size: noseSize)

            // Mouth
            HamsterMouth(mouthType: mouthType)
                .stroke(Color(red: 0.6, green: 0.3, blue: 0.3), lineWidth: size * 0.02)
                .frame(width: mouthWidth, height: mouthHeight)
        }
        .overlay(
            // Cheeks (positioned on sides)
            HStack(spacing: size * 0.35) {
                HamsterCheek(size: cheekSize, intensity: cheekIntensity)
                HamsterCheek(size: cheekSize, intensity: cheekIntensity)
            }
            .offset(y: size * 0.02)
        )
    }

    private var mouthType: HamsterMouth.MouthType {
        switch state {
        case .hungry: return .pout
        case .chillin: return .relaxed
        case .happy: return .smile
        case .excited: return .bigSmile
        case .proud: return .smirk
        }
    }

    private var cheekIntensity: Double {
        switch state {
        case .hungry: return 0.15
        case .chillin: return 0.2
        case .happy: return 0.35
        case .excited: return 0.45
        case .proud: return 0.3
        }
    }
}

// MARK: - Eyebrow Component

/// Eyebrows for additional expression
struct HamsterEyebrows: View {
    let state: HamsterState
    let size: CGFloat

    private var eyebrowWidth: CGFloat { size * 0.12 }
    private var eyebrowHeight: CGFloat { size * 0.02 }
    private var eyeSpacing: CGFloat { size * 0.25 }

    var body: some View {
        HStack(spacing: eyeSpacing) {
            // Left eyebrow (using outline color from palette)
            Capsule()
                .fill(HamsterColorPalette.outline)
                .frame(width: eyebrowWidth, height: eyebrowHeight)
                .rotationEffect(leftEyebrowRotation)

            // Right eyebrow (using outline color from palette)
            Capsule()
                .fill(HamsterColorPalette.outline)
                .frame(width: eyebrowWidth, height: eyebrowHeight)
                .rotationEffect(rightEyebrowRotation)
        }
    }

    private var leftEyebrowRotation: Angle {
        switch state {
        case .hungry: return .degrees(-15) // Worried, angled up in center
        case .chillin: return .degrees(0)
        case .happy: return .degrees(-5)
        case .excited: return .degrees(-10)
        case .proud: return .degrees(5) // Confident, angled down slightly
        }
    }

    private var rightEyebrowRotation: Angle {
        switch state {
        case .hungry: return .degrees(15) // Mirror of left
        case .chillin: return .degrees(0)
        case .happy: return .degrees(5)
        case .excited: return .degrees(10)
        case .proud: return .degrees(-5) // Confident, angled down slightly
        }
    }
}

// MARK: - Preview

#Preview("All Expressions") {
    VStack(spacing: 40) {
        ForEach(HamsterState.allCases, id: \.self) { state in
            VStack {
                HamsterFace(state: state, size: 100)
                    .frame(width: 100, height: 60)
                    .background(Color.orange.opacity(0.3))
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                Text(state.displayName)
                    .font(.caption)
            }
        }
    }
    .padding()
}
