//
//  GrowthCelebrationView.swift
//  MuscleHamster
//
//  Celebration modal shown when the hamster reaches a new growth stage
//  Phase 07.4: Growth progression milestones
//  Phase 10: Replaced SF Symbol with HamsterView component
//

import SwiftUI

struct GrowthCelebrationView: View {
    let milestone: GrowthMilestone
    let hamsterName: String
    let onDismiss: () -> Void

    @State private var showContent = false
    @State private var showHamster = false
    @State private var showSpeech = false
    @State private var showButton = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                colors: [stageColor.opacity(0.3), stageColor.opacity(0.1)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            // Confetti effect (simple version)
            if showContent && !reduceMotion {
                ConfettiView()
                    .ignoresSafeArea()
            }

            VStack(spacing: 24) {
                Spacer()

                // Headline
                if showContent {
                    VStack(spacing: 8) {
                        Image(systemName: "sparkles")
                            .font(.system(size: 40))
                            .foregroundStyle(.yellow)

                        Text(hamsterName)
                            .font(.title)
                            .fontWeight(.bold)
                        + Text(" \(milestone.stage.celebrationHeadline)")
                            .font(.title)
                            .fontWeight(.bold)
                    }
                    .multilineTextAlignment(.center)
                    .transition(.scale.combined(with: .opacity))
                    .accessibilityAddTraits(.isHeader)
                    .accessibilityLabel("\(hamsterName) \(milestone.stage.celebrationHeadline)")
                }

                // Hamster display
                if showHamster {
                    VStack(spacing: 16) {
                        // Stage transition indicator
                        HStack(spacing: 12) {
                            if let previousStage = previousStage {
                                stageBadge(stage: previousStage, isActive: false)
                            }

                            Image(systemName: "arrow.right")
                                .font(.title2)
                                .foregroundStyle(.secondary)

                            stageBadge(stage: milestone.stage, isActive: true)
                        }
                        .accessibilityElement(children: .combine)
                        .accessibilityLabel("Grew from \(previousStage?.displayName ?? "baby") to \(milestone.stage.displayName)")

                        // Hamster (Phase 10: Using HamsterView)
                        ZStack {
                            Circle()
                                .fill(stageColor.opacity(0.2))
                                .frame(width: 160, height: 160)

                            HamsterView(
                                state: .proud,
                                growthStage: milestone.stage,
                                size: 120
                            )
                        }
                        .scaleEffect(showHamster ? 1.0 : 0.5)
                        .animation(reduceMotion ? nil : .spring(response: 0.5, dampingFraction: 0.6), value: showHamster)
                    }
                    .transition(.scale.combined(with: .opacity))
                }

                // Speech bubble
                if showSpeech {
                    VStack(spacing: 8) {
                        Text(""\(milestone.stage.celebrationSpeech)"")
                            .font(.body)
                            .italic()
                            .multilineTextAlignment(.center)
                            .foregroundStyle(.primary)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(Color(.systemBackground))
                                    .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
                            )

                        // Achievement info
                        HStack(spacing: 4) {
                            Image(systemName: milestone.triggerType == .workouts ? "figure.run" : "flame.fill")
                                .font(.caption)
                            Text(milestone.triggerDescription)
                                .font(.caption)
                                .fontWeight(.medium)
                        }
                        .foregroundStyle(.secondary)
                        .accessibilityLabel("Achieved by \(milestone.triggerDescription)")
                    }
                    .padding(.horizontal, 24)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }

                Spacer()

                // Dismiss button
                if showButton {
                    Button {
                        onDismiss()
                    } label: {
                        Text("Hooray!")
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(stageColor)
                            .cornerRadius(12)
                    }
                    .padding(.horizontal, 24)
                    .padding(.bottom, 32)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                    .accessibilityLabel("Hooray! Dismiss celebration")
                }
            }
        }
        .onAppear {
            animateIn()
        }
    }

    // MARK: - Subviews

    private func stageBadge(stage: GrowthStage, isActive: Bool) -> some View {
        VStack(spacing: 4) {
            Image(systemName: stage.icon)
                .font(.title2)
            Text(stage.displayName)
                .font(.caption)
                .fontWeight(.medium)
        }
        .foregroundStyle(isActive ? stageColor : .secondary)
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(isActive ? stageColor.opacity(0.15) : Color.secondary.opacity(0.1))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .strokeBorder(isActive ? stageColor : Color.clear, lineWidth: 2)
        )
    }

    // MARK: - Helpers

    private var stageColor: Color {
        switch milestone.stage.color {
        case "green": return .green
        case "blue": return .blue
        case "purple": return .purple
        case "yellow": return .yellow
        default: return .accentColor
        }
    }

    private var previousStage: GrowthStage? {
        switch milestone.stage {
        case .baby: return nil
        case .juvenile: return .baby
        case .adult: return .juvenile
        case .mature: return .adult
        }
    }

    private func animateIn() {
        if reduceMotion {
            showContent = true
            showHamster = true
            showSpeech = true
            showButton = true
            return
        }

        withAnimation(.easeOut(duration: 0.4)) {
            showContent = true
        }

        withAnimation(.easeOut(duration: 0.5).delay(0.3)) {
            showHamster = true
        }

        withAnimation(.easeOut(duration: 0.4).delay(0.7)) {
            showSpeech = true
        }

        withAnimation(.easeOut(duration: 0.3).delay(1.0)) {
            showButton = true
        }
    }
}

// MARK: - Confetti View

struct ConfettiView: View {
    @State private var particles: [ConfettiParticle] = []

    var body: some View {
        TimelineView(.animation) { timeline in
            Canvas { context, size in
                for particle in particles {
                    let rect = CGRect(
                        x: particle.x * size.width - 4,
                        y: particle.y * size.height - 4,
                        width: 8,
                        height: 8
                    )
                    context.fill(
                        Path(ellipseIn: rect),
                        with: .color(particle.color)
                    )
                }
            }
        }
        .onAppear {
            createParticles()
        }
    }

    private func createParticles() {
        let colors: [Color] = [.yellow, .orange, .pink, .purple, .blue, .green]

        for i in 0..<30 {
            let particle = ConfettiParticle(
                x: CGFloat.random(in: 0...1),
                y: CGFloat.random(in: -0.2...0.3),
                color: colors[i % colors.count]
            )
            particles.append(particle)
        }

        // Animate particles falling
        Timer.scheduledTimer(withTimeInterval: 0.016, repeats: true) { timer in
            for i in particles.indices {
                particles[i].y += 0.005
                particles[i].x += CGFloat.random(in: -0.002...0.002)
            }

            // Stop when all particles are off screen
            if particles.allSatisfy({ $0.y > 1.2 }) {
                timer.invalidate()
            }
        }
    }
}

struct ConfettiParticle: Identifiable {
    let id = UUID()
    var x: CGFloat
    var y: CGFloat
    let color: Color
}

// MARK: - Previews

#Preview("Baby to Juvenile") {
    GrowthCelebrationView(
        milestone: GrowthMilestone(
            stage: .juvenile,
            achievedAt: Date(),
            triggerType: .workouts,
            triggerValue: 5
        ),
        hamsterName: "Squeaky",
        onDismiss: {}
    )
}

#Preview("Juvenile to Adult") {
    GrowthCelebrationView(
        milestone: GrowthMilestone(
            stage: .adult,
            achievedAt: Date(),
            triggerType: .streak,
            triggerValue: 21
        ),
        hamsterName: "Peanut",
        onDismiss: {}
    )
}

#Preview("Adult to Mature") {
    GrowthCelebrationView(
        milestone: GrowthMilestone(
            stage: .mature,
            achievedAt: Date(),
            triggerType: .workouts,
            triggerValue: 75
        ),
        hamsterName: "Whiskers",
        onDismiss: {}
    )
}
