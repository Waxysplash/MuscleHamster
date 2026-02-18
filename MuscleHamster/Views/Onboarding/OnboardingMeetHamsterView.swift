//
//  OnboardingMeetHamsterView.swift
//  MuscleHamster
//
//  The emotional "first meet" moment where users see their named hamster for the first time
//  Phase 10: Replaced custom shapes with EnclosureView component
//

import SwiftUI

struct OnboardingMeetHamsterView: View {
    @EnvironmentObject private var viewModel: OnboardingViewModel
    @State private var showWelcome = false
    @State private var showName = false
    @State private var showMessage = false
    @State private var showEnclosure = false

    private var hamsterName: String {
        viewModel.profile.hamsterName ?? "Your Hamster"
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Spacer()
                    .frame(height: 20)

                // Hamster enclosure area
                enclosureView
                    .opacity(showEnclosure ? 1 : 0)
                    .scaleEffect(showEnclosure ? 1 : 0.8)
                    .animation(.spring(response: 0.6, dampingFraction: 0.7), value: showEnclosure)

                // Hamster name reveal
                if showName {
                    VStack(spacing: 8) {
                        Text("Say hello to")
                            .font(.title3)
                            .foregroundStyle(.secondary)
                            .opacity(showName ? 1 : 0)

                        Text(hamsterName)
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundStyle(.accentColor)
                    }
                    .transition(.opacity.combined(with: .move(edge: .bottom)))
                }

                // Welcome message from hamster
                if showMessage {
                    hamsterSpeechBubble
                        .transition(.opacity.combined(with: .scale(scale: 0.9)))
                }

                // Next step preview
                if showMessage {
                    nextStepPreview
                        .transition(.opacity.combined(with: .move(edge: .bottom)))
                }

                Spacer()
            }
            .padding(.horizontal, 24)
        }
        .onAppear {
            animateEntrance()
        }
    }

    // MARK: - Enclosure View (Phase 10: Using EnclosureView component)

    private var enclosureView: some View {
        EnclosureView(
            state: .happy,
            growthStage: .baby,
            enclosureItems: [],
            height: 200
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .strokeBorder(Color.accentColor.opacity(0.3), lineWidth: 3)
        )
        .accessibilityLabel("\(hamsterName) in their cozy enclosure")
    }

    // MARK: - Speech Bubble

    private var hamsterSpeechBubble: some View {
        VStack(spacing: 12) {
            // Speech bubble pointer
            Triangle()
                .fill(Color(.systemGray6))
                .frame(width: 20, height: 10)
                .rotationEffect(.degrees(180))

            // Bubble content
            VStack(spacing: 12) {
                Text(welcomeMessage)
                    .font(.body)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.primary)

                // Hamster mood indicator
                HStack(spacing: 4) {
                    Image(systemName: "heart.fill")
                        .foregroundStyle(.pink)
                    Text("Fed & Happy")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(20)
            .frame(maxWidth: .infinity)
            .background(Color(.systemGray6))
            .cornerRadius(16)
        }
        .accessibilityLabel("\(hamsterName) says: \(welcomeMessage)")
    }

    private var welcomeMessage: String {
        let messages = [
            "Hi! I'm \(hamsterName)! I can't wait to work out with you!",
            "Yay! You're here! I'm \(hamsterName), your new fitness buddy!",
            "*happy squeaks* I'm \(hamsterName)! Let's get moving together!"
        ]
        // Use a consistent message based on name length for predictability
        return messages[hamsterName.count % messages.count]
    }

    // MARK: - Next Step Preview

    private var nextStepPreview: some View {
        VStack(spacing: 16) {
            Text("Ready to get started?")
                .font(.headline)
                .foregroundStyle(.primary)

            Text("Tap below to find your first workout. \(hamsterName) will be cheering you on!")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            // Preview of what's next
            HStack(spacing: 16) {
                nextStepItem(icon: "figure.run", title: "Browse Workouts")
                nextStepItem(icon: "star.fill", title: "Earn Points")
                nextStepItem(icon: "flame.fill", title: "Build Streaks")
            }
        }
        .padding(20)
        .background(Color.accentColor.opacity(0.1))
        .cornerRadius(16)
    }

    private func nextStepItem(icon: String, title: String) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(.accentColor)

            Text(title)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(title)
    }

    // MARK: - Animation

    private func animateEntrance() {
        withAnimation(.easeOut(duration: 0.4)) {
            showEnclosure = true
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            withAnimation(.easeOut(duration: 0.4)) {
                showName = true
            }
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            withAnimation(.easeOut(duration: 0.4)) {
                showMessage = true
            }
        }
    }
}

// MARK: - Triangle Shape

struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.midX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
        path.closeSubpath()
        return path
    }
}

#Preview {
    OnboardingMeetHamsterView()
        .environmentObject({
            let vm = OnboardingViewModel()
            vm.setHamsterName("Peanut")
            return vm
        }())
}
