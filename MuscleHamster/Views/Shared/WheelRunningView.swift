//
//  WheelRunningView.swift
//  MuscleHamster
//
//  Animated view showing the hamster running on an exercise wheel
//  The wheel spins, the hamster bobs, and motion lines add energy
//

import SwiftUI

/// Animated hamster-on-wheel scene for the enclosure
struct WheelRunningView: View {
    let hamsterConfig: HamsterConfiguration
    let size: CGFloat

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    @State private var wheelRotation: Double = 0
    @State private var hamsterBob: Bool = false
    @State private var legPhase: Bool = false
    @State private var motionLineOffset: CGFloat = 0

    private var wheelSize: CGFloat { size * 0.85 }
    private var hamsterSize: CGFloat { size * 0.38 }
    private var spokeCount: Int { 8 }

    // Colors from the palette
    private let wheelRimColor = Color.gray.opacity(0.7)
    private let wheelRimHighlight = Color(hex: "C0C0C0")
    private let spokeColor = Color.gray.opacity(0.5)
    private let hubColor = Color.gray
    private let standColor = Color(hex: "A0A0A0")

    var body: some View {
        ZStack {
            // Stand/support behind wheel
            wheelStand

            // The spinning wheel
            wheelShape
                .rotationEffect(.degrees(reduceMotion ? 0 : wheelRotation))

            // The hamster running inside the wheel
            runningHamster
                .offset(y: reduceMotion ? 0 : (hamsterBob ? -2 : 2))

            // Motion lines for speed effect
            if !reduceMotion {
                motionLines
            }
        }
        .frame(width: size, height: size * 1.1)
        .onAppear {
            guard !reduceMotion else { return }
            startAnimations()
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Your hamster running on the exercise wheel")
    }

    // MARK: - Wheel

    private var wheelShape: some View {
        ZStack {
            // Outer rim - thick ring
            Circle()
                .strokeBorder(
                    LinearGradient(
                        colors: [wheelRimHighlight, wheelRimColor, wheelRimHighlight],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: wheelSize * 0.06
                )
                .frame(width: wheelSize, height: wheelSize)

            // Inner tread surface
            Circle()
                .strokeBorder(wheelRimColor.opacity(0.2), lineWidth: wheelSize * 0.02)
                .frame(width: wheelSize * 0.88, height: wheelSize * 0.88)

            // Spokes
            ForEach(0..<spokeCount, id: \.self) { i in
                Rectangle()
                    .fill(spokeColor)
                    .frame(width: wheelSize * 0.015, height: wheelSize * 0.38)
                    .offset(y: -wheelSize * 0.02)
                    .rotationEffect(.degrees(Double(i) * (360.0 / Double(spokeCount))))
            }

            // Center hub
            Circle()
                .fill(
                    RadialGradient(
                        colors: [wheelRimHighlight, hubColor],
                        center: .center,
                        startRadius: 0,
                        endRadius: wheelSize * 0.06
                    )
                )
                .frame(width: wheelSize * 0.1, height: wheelSize * 0.1)

            // Hub bolt detail
            Circle()
                .fill(Color.gray.opacity(0.8))
                .frame(width: wheelSize * 0.04, height: wheelSize * 0.04)
        }
    }

    // MARK: - Stand

    private var wheelStand: some View {
        ZStack {
            // Left support leg
            Path { path in
                let centerX = size * 0.5
                let bottomY = size * 1.05
                let topY = size * 0.5
                path.move(to: CGPoint(x: centerX - wheelSize * 0.08, y: topY))
                path.addLine(to: CGPoint(x: centerX - wheelSize * 0.25, y: bottomY))
                path.addLine(to: CGPoint(x: centerX - wheelSize * 0.2, y: bottomY))
                path.addLine(to: CGPoint(x: centerX - wheelSize * 0.04, y: topY))
                path.closeSubpath()
            }
            .fill(standColor)

            // Right support leg
            Path { path in
                let centerX = size * 0.5
                let bottomY = size * 1.05
                let topY = size * 0.5
                path.move(to: CGPoint(x: centerX + wheelSize * 0.04, y: topY))
                path.addLine(to: CGPoint(x: centerX + wheelSize * 0.2, y: bottomY))
                path.addLine(to: CGPoint(x: centerX + wheelSize * 0.25, y: bottomY))
                path.addLine(to: CGPoint(x: centerX + wheelSize * 0.08, y: topY))
                path.closeSubpath()
            }
            .fill(standColor)

            // Base bar
            RoundedRectangle(cornerRadius: 2)
                .fill(standColor)
                .frame(width: wheelSize * 0.6, height: size * 0.03)
                .offset(y: size * 0.53)
        }
    }

    // MARK: - Running Hamster

    private var runningHamster: some View {
        let bodyColor = HamsterColorPalette.hamsterOrange
        let bellyColor = HamsterColorPalette.hamsterCream
        let outlineColor = HamsterColorPalette.outline
        let h = hamsterSize

        return ZStack {
            // Body (slightly tilted forward for running pose)
            Ellipse()
                .fill(bodyColor)
                .frame(width: h * 0.7, height: h * 0.55)
                .overlay(
                    Ellipse()
                        .strokeBorder(outlineColor, lineWidth: h * 0.02)
                )
                .rotationEffect(.degrees(-8))

            // Belly patch
            Ellipse()
                .fill(bellyColor)
                .frame(width: h * 0.4, height: h * 0.35)
                .offset(y: h * 0.02)
                .rotationEffect(.degrees(-8))

            // Head
            Circle()
                .fill(bodyColor)
                .frame(width: h * 0.4, height: h * 0.4)
                .overlay(
                    Circle()
                        .strokeBorder(outlineColor, lineWidth: h * 0.02)
                )
                .offset(x: h * 0.18, y: -h * 0.18)

            // Ears
            HStack(spacing: h * 0.12) {
                earView(size: h)
                    .rotationEffect(.degrees(-20))
                earView(size: h)
                    .rotationEffect(.degrees(10))
            }
            .offset(x: h * 0.18, y: -h * 0.35)

            // Eyes (determined, running expression)
            HStack(spacing: h * 0.06) {
                // Left eye
                ZStack {
                    Ellipse()
                        .fill(HamsterColorPalette.eyeBlack)
                        .frame(width: h * 0.07, height: h * 0.08)
                    Circle()
                        .fill(HamsterColorPalette.eyeHighlight)
                        .frame(width: h * 0.025, height: h * 0.025)
                        .offset(x: h * 0.01, y: -h * 0.015)
                }
                // Right eye
                ZStack {
                    Ellipse()
                        .fill(HamsterColorPalette.eyeBlack)
                        .frame(width: h * 0.07, height: h * 0.08)
                    Circle()
                        .fill(HamsterColorPalette.eyeHighlight)
                        .frame(width: h * 0.025, height: h * 0.025)
                        .offset(x: h * 0.01, y: -h * 0.015)
                }
            }
            .offset(x: h * 0.2, y: -h * 0.16)

            // Nose
            Ellipse()
                .fill(HamsterColorPalette.nosePink)
                .frame(width: h * 0.05, height: h * 0.035)
                .offset(x: h * 0.28, y: -h * 0.1)

            // Happy mouth (open smile while running)
            Path { path in
                let startX = h * 0.62
                let startY = h * 0.38
                path.move(to: CGPoint(x: startX - h * 0.04, y: startY))
                path.addQuadCurve(
                    to: CGPoint(x: startX + h * 0.04, y: startY),
                    control: CGPoint(x: startX, y: startY + h * 0.04)
                )
            }
            .stroke(HamsterColorPalette.outline, lineWidth: h * 0.015)
            .offset(x: -h * 0.12, y: -h * 0.3)

            // Cheek blush
            Circle()
                .fill(HamsterColorPalette.nosePink.opacity(0.35))
                .frame(width: h * 0.08, height: h * 0.08)
                .offset(x: h * 0.3, y: -h * 0.06)

            // Front running legs (alternate positions)
            runningLegs(size: h, bodyColor: bodyColor, outlineColor: outlineColor)

            // Headband (red and white striped, like the reference image)
            headband(size: h)
        }
        .offset(y: wheelSize * 0.08) // Position in lower half of wheel
    }

    private func earView(size h: CGFloat) -> some View {
        ZStack {
            Ellipse()
                .fill(HamsterColorPalette.hamsterOrange)
                .frame(width: h * 0.12, height: h * 0.16)
            Ellipse()
                .fill(HamsterColorPalette.nosePink.opacity(0.4))
                .frame(width: h * 0.07, height: h * 0.1)
        }
    }

    private func headband(size h: CGFloat) -> some View {
        // Red headband with white stripe like the reference image
        ZStack {
            Capsule()
                .fill(Color.red)
                .frame(width: h * 0.28, height: h * 0.05)
            Capsule()
                .fill(Color.white)
                .frame(width: h * 0.28, height: h * 0.015)
        }
        .rotationEffect(.degrees(-12))
        .offset(x: h * 0.18, y: -h * 0.33)
    }

    private func runningLegs(size h: CGFloat, bodyColor: Color, outlineColor: Color) -> some View {
        let frontPhase = legPhase
        let backPhase = !legPhase

        return ZStack {
            // Back legs
            Group {
                // Back left leg
                Capsule()
                    .fill(bodyColor)
                    .frame(width: h * 0.1, height: h * 0.2)
                    .overlay(Capsule().strokeBorder(outlineColor, lineWidth: h * 0.01))
                    .rotationEffect(.degrees(backPhase ? -45 : 15))
                    .offset(x: -h * 0.2, y: h * 0.22)

                // Back right leg
                Capsule()
                    .fill(bodyColor)
                    .frame(width: h * 0.1, height: h * 0.2)
                    .overlay(Capsule().strokeBorder(outlineColor, lineWidth: h * 0.01))
                    .rotationEffect(.degrees(backPhase ? 15 : -45))
                    .offset(x: -h * 0.08, y: h * 0.22)
            }

            // Front legs (arms)
            Group {
                // Front left arm
                Capsule()
                    .fill(bodyColor)
                    .frame(width: h * 0.08, height: h * 0.16)
                    .overlay(Capsule().strokeBorder(outlineColor, lineWidth: h * 0.01))
                    .rotationEffect(.degrees(frontPhase ? -55 : -15))
                    .offset(x: h * 0.1, y: h * 0.08)

                // Front right arm
                Capsule()
                    .fill(bodyColor)
                    .frame(width: h * 0.08, height: h * 0.16)
                    .overlay(Capsule().strokeBorder(outlineColor, lineWidth: h * 0.01))
                    .rotationEffect(.degrees(frontPhase ? -15 : -55))
                    .offset(x: h * 0.18, y: h * 0.08)
            }
        }
        .animation(reduceMotion ? nil : .easeInOut(duration: 0.15), value: legPhase)
    }

    // MARK: - Motion Lines

    private var motionLines: some View {
        ZStack {
            ForEach(0..<3, id: \.self) { i in
                RoundedRectangle(cornerRadius: 1)
                    .fill(Color.gray.opacity(0.3 - Double(i) * 0.08))
                    .frame(width: size * 0.08 - CGFloat(i) * 4, height: 2)
                    .offset(
                        x: -wheelSize * 0.55 + motionLineOffset,
                        y: CGFloat(i - 1) * size * 0.06
                    )
            }
        }
        .animation(
            .linear(duration: 0.6).repeatForever(autoreverses: false),
            value: motionLineOffset
        )
    }

    // MARK: - Animation Control

    private func startAnimations() {
        // Wheel spinning - continuous rotation
        withAnimation(.linear(duration: 2.0).repeatForever(autoreverses: false)) {
            wheelRotation = 360
        }

        // Hamster bobbing up and down
        withAnimation(.easeInOut(duration: 0.2).repeatForever(autoreverses: true)) {
            hamsterBob = true
        }

        // Leg alternation - fast for running
        Timer.scheduledTimer(withTimeInterval: 0.15, repeats: true) { _ in
            legPhase.toggle()
        }

        // Motion lines
        withAnimation(.linear(duration: 0.6).repeatForever(autoreverses: false)) {
            motionLineOffset = -10
        }
    }
}

// MARK: - Previews

#Preview("Wheel Running") {
    VStack {
        WheelRunningView(
            hamsterConfig: .default,
            size: 200
        )

        Text("Running on the wheel!")
            .font(.caption)
    }
    .padding()
    .background(Color(hex: "FFF0E0"))
}

#Preview("Wheel Running - Large") {
    WheelRunningView(
        hamsterConfig: HamsterConfiguration(
            state: .excited,
            growthStage: .adult,
            outfit: nil,
            accessory: nil,
            baseSize: 100
        ),
        size: 260
    )
    .padding()
    .background(Color(hex: "FFF0E0"))
}

#Preview("In Context") {
    ZStack {
        LinearGradient(
            colors: [Color(hex: "FFFAF5"), Color(hex: "FFF0E0")],
            startPoint: .top,
            endPoint: .bottom
        )
        .ignoresSafeArea()

        WheelRunningView(
            hamsterConfig: HamsterConfiguration(
                state: .happy,
                growthStage: .juvenile,
                outfit: nil,
                accessory: nil,
                baseSize: 100
            ),
            size: 220
        )
    }
}
