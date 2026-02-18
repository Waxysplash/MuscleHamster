//
//  StreakFreezeView.swift
//  MuscleHamster
//
//  Streak freeze restore flow - allows users to spend points to restore a broken streak
//  Phase 06.3: Streak Freeze Restore Flow
//

import SwiftUI

struct StreakFreezeView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var authViewModel: AuthViewModel

    let brokenStreak: Int
    let userPoints: Int
    var onRestoreComplete: (() -> Void)?

    @State private var viewState: StreakFreezeState = .prompt
    @State private var restoreResult: StreakRestoreResult?
    @State private var errorMessage: String?

    private let activityService = MockActivityService.shared
    private let freezeCost = PointsConfig.streakFreezeCost

    var body: some View {
        NavigationStack {
            Group {
                switch viewState {
                case .prompt:
                    promptContent
                case .restoring:
                    restoringContent
                case .success:
                    successContent
                case .declined:
                    declinedContent
                case .error:
                    errorContent
                }
            }
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    if viewState == .prompt {
                        Button("Close") {
                            dismiss()
                        }
                    }
                }
            }
        }
        .interactiveDismissDisabled(viewState == .restoring)
    }

    // MARK: - Prompt Content

    private var promptContent: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 12) {
                    Image(systemName: "heart.slash.fill")
                        .font(.system(size: 60))
                        .foregroundStyle(.orange)
                        .accessibilityHidden(true)

                    Text("Uh oh! Your streak ended")
                        .font(.title2)
                        .fontWeight(.bold)
                        .multilineTextAlignment(.center)
                        .accessibilityAddTraits(.isHeader)

                    Text("But don't worry \u{2014} I can help!")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .padding(.top, 20)

                // Broken streak info
                VStack(spacing: 8) {
                    Text("Your streak was")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        Text("\(brokenStreak)")
                            .font(.system(size: 48, weight: .bold))
                            .foregroundStyle(.orange)
                        Text(brokenStreak == 1 ? "day" : "days")
                            .font(.title3)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color.orange.opacity(0.1))
                .cornerRadius(16)
                .accessibilityElement(children: .combine)
                .accessibilityLabel("Your streak was \(brokenStreak) days")

                // Hamster message
                VStack(spacing: 12) {
                    Image(systemName: "hare.fill")
                        .font(.system(size: 40))
                        .foregroundStyle(.blue)
                        .accessibilityHidden(true)

                    Text(hamsterEncouragementMessage)
                        .font(.body)
                        .multilineTextAlignment(.center)
                        .foregroundStyle(.primary)
                        .padding(.horizontal)
                }
                .padding()
                .background(Color.blue.opacity(0.08))
                .cornerRadius(16)

                Spacer(minLength: 20)

                // Action buttons
                VStack(spacing: 16) {
                    if canAffordRestore {
                        // Restore button
                        Button {
                            restoreStreak()
                        } label: {
                            VStack(spacing: 6) {
                                HStack {
                                    Image(systemName: "arrow.counterclockwise.circle.fill")
                                    Text("Restore My Streak")
                                        .fontWeight(.semibold)
                                }
                                .font(.headline)

                                HStack(spacing: 4) {
                                    Image(systemName: "star.fill")
                                        .font(.caption)
                                    Text("\(freezeCost) points")
                                        .font(.caption)
                                }
                                .foregroundStyle(.white.opacity(0.8))
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.accentColor)
                            .foregroundStyle(.white)
                            .cornerRadius(14)
                        }
                        .accessibilityLabel("Restore my streak for \(freezeCost) points")
                        .accessibilityHint("Uses \(freezeCost) of your \(userPoints) points to restore your \(brokenStreak)-day streak")
                    } else {
                        // Not enough points message
                        VStack(spacing: 8) {
                            HStack(spacing: 4) {
                                Image(systemName: "star.fill")
                                    .foregroundStyle(.yellow)
                                Text("Restoring costs \(freezeCost) points")
                                    .fontWeight(.medium)
                            }

                            Text("You have \(userPoints) points")
                                .font(.caption)
                                .foregroundStyle(.secondary)

                            Text("Complete a workout to earn more!")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(14)
                        .accessibilityElement(children: .combine)
                        .accessibilityLabel("Restoring costs \(freezeCost) points. You have \(userPoints) points. Complete a workout to earn more.")
                    }

                    // Start fresh button
                    Button {
                        startFresh()
                    } label: {
                        Text("Start Fresh")
                            .fontWeight(.medium)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .foregroundStyle(.primary)
                    }
                    .accessibilityLabel("Start fresh")
                    .accessibilityHint("Accept the streak reset and begin a new streak")
                }

                // Points balance
                HStack(spacing: 4) {
                    Text("Your balance:")
                        .foregroundStyle(.secondary)
                    Image(systemName: "star.fill")
                        .foregroundStyle(.yellow)
                    Text("\(userPoints) points")
                        .fontWeight(.medium)
                }
                .font(.footnote)
                .accessibilityElement(children: .combine)
                .accessibilityLabel("Your current balance is \(userPoints) points")
            }
            .padding()
        }
    }

    private var hamsterEncouragementMessage: String {
        if canAffordRestore {
            if brokenStreak >= 7 {
                return "Wow, \(brokenStreak) days is amazing! I really don't want to see that go. Let me help you get it back!"
            } else if brokenStreak >= 3 {
                return "You were doing so great! I can use some of your points to save your streak. What do you say?"
            } else {
                return "Hey, it happens to everyone! I can restore your streak if you'd like, or we can start fresh together."
            }
        } else {
            if brokenStreak >= 7 {
                return "I wish I could restore your \(brokenStreak)-day streak, but we need more points. But hey \u{2014} you did it once, you can do it again!"
            } else {
                return "We don't have quite enough points to restore, but that's okay! Every day is a chance to start something great."
            }
        }
    }

    private var canAffordRestore: Bool {
        userPoints >= freezeCost
    }

    // MARK: - Restoring Content

    private var restoringContent: some View {
        VStack(spacing: 24) {
            Spacer()

            ProgressView()
                .scaleEffect(1.5)
                .accessibilityLabel("Restoring your streak")

            Text("Restoring your streak...")
                .font(.headline)
                .foregroundStyle(.secondary)

            Spacer()
        }
        .padding()
    }

    // MARK: - Success Content

    private var successContent: some View {
        ScrollView {
            VStack(spacing: 24) {
                Spacer(minLength: 40)

                // Celebration
                VStack(spacing: 16) {
                    ZStack {
                        Circle()
                            .fill(Color.green.opacity(0.15))
                            .frame(width: 120, height: 120)

                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 70))
                            .foregroundStyle(.green)
                    }
                    .accessibilityHidden(true)

                    Text("Streak Restored!")
                        .font(.title)
                        .fontWeight(.bold)
                        .accessibilityAddTraits(.isHeader)

                    if let result = restoreResult {
                        VStack(spacing: 8) {
                            HStack(alignment: .firstTextBaseline, spacing: 4) {
                                Text("\(result.restoredStreak)")
                                    .font(.system(size: 48, weight: .bold))
                                    .foregroundStyle(.green)
                                Text(result.restoredStreak == 1 ? "day" : "days")
                                    .font(.title3)
                                    .foregroundStyle(.secondary)
                            }

                            Text("streak is back!")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        .accessibilityElement(children: .combine)
                        .accessibilityLabel("Your \(result.restoredStreak)-day streak is back!")
                    }
                }

                // Hamster reaction
                VStack(spacing: 12) {
                    Image(systemName: "hare.fill")
                        .font(.system(size: 40))
                        .foregroundStyle(.green)
                        .accessibilityHidden(true)

                    Text(restoreResult?.hamsterReaction ?? "Streak restored!")
                        .font(.body)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .padding()
                .background(Color.green.opacity(0.1))
                .cornerRadius(16)

                // Points spent
                if let result = restoreResult, result.pointsSpent > 0 {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .foregroundStyle(.yellow)
                        Text("-\(result.pointsSpent) points used")
                            .foregroundStyle(.secondary)
                    }
                    .font(.footnote)
                    .accessibilityLabel("\(result.pointsSpent) points used to restore streak")
                }

                // Reminder
                Text("Check in today to keep your streak going!")
                    .font(.subheadline)
                    .foregroundStyle(.orange)
                    .padding(.horizontal)
                    .multilineTextAlignment(.center)

                Spacer(minLength: 40)

                Button {
                    onRestoreComplete?()
                    dismiss()
                } label: {
                    Text("Let's Go!")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.accentColor)
                        .foregroundStyle(.white)
                        .cornerRadius(14)
                }
                .accessibilityLabel("Continue")
                .accessibilityHint("Closes this screen and returns to home")
            }
            .padding()
        }
    }

    // MARK: - Declined Content

    private var declinedContent: some View {
        ScrollView {
            VStack(spacing: 24) {
                Spacer(minLength: 40)

                // Fresh start message
                VStack(spacing: 16) {
                    ZStack {
                        Circle()
                            .fill(Color.blue.opacity(0.15))
                            .frame(width: 120, height: 120)

                        Image(systemName: "sunrise.fill")
                            .font(.system(size: 50))
                            .foregroundStyle(.orange)
                    }
                    .accessibilityHidden(true)

                    Text("Fresh Start!")
                        .font(.title)
                        .fontWeight(.bold)
                        .accessibilityAddTraits(.isHeader)

                    Text("Every journey begins with day one")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                // Hamster encouragement
                VStack(spacing: 12) {
                    Image(systemName: "hare.fill")
                        .font(.system(size: 40))
                        .foregroundStyle(.blue)
                        .accessibilityHidden(true)

                    Text("I'm so excited to start a new streak with you! Remember, what matters most is that you keep showing up. I'll be here cheering you on!")
                        .font(.body)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .padding()
                .background(Color.blue.opacity(0.08))
                .cornerRadius(16)

                Spacer(minLength: 40)

                Button {
                    onRestoreComplete?()
                    dismiss()
                } label: {
                    Text("Let's Do This!")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.accentColor)
                        .foregroundStyle(.white)
                        .cornerRadius(14)
                }
                .accessibilityLabel("Let's do this")
                .accessibilityHint("Closes this screen and starts your new streak journey")
            }
            .padding()
        }
    }

    // MARK: - Error Content

    private var errorContent: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 50))
                .foregroundStyle(.orange)
                .accessibilityHidden(true)

            Text("Oops!")
                .font(.title2)
                .fontWeight(.bold)
                .accessibilityAddTraits(.isHeader)

            Text(errorMessage ?? "Something went wrong. Let's try again!")
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            Spacer()

            VStack(spacing: 12) {
                Button {
                    viewState = .prompt
                } label: {
                    Text("Try Again")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.accentColor)
                        .foregroundStyle(.white)
                        .cornerRadius(14)
                }

                Button {
                    dismiss()
                } label: {
                    Text("Close")
                        .fontWeight(.medium)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .foregroundStyle(.primary)
                }
            }
        }
        .padding()
    }

    // MARK: - Actions

    private func restoreStreak() {
        guard let userId = authViewModel.currentUser?.id else { return }

        viewState = .restoring

        Task {
            do {
                let result = try await activityService.restoreStreak(userId: userId)

                await MainActor.run {
                    if result.success {
                        restoreResult = result
                        viewState = .success
                    } else {
                        errorMessage = result.message
                        viewState = .error
                    }
                }
            } catch let error as ActivityError {
                await MainActor.run {
                    errorMessage = error.friendlyMessage
                    viewState = .error
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Something went wrong. Let's try again!"
                    viewState = .error
                }
            }
        }
    }

    private func startFresh() {
        guard let userId = authViewModel.currentUser?.id else {
            dismiss()
            return
        }

        Task {
            // Acknowledge the reset (clears previousBrokenStreak)
            await activityService.acknowledgeStreakReset(userId: userId)

            await MainActor.run {
                viewState = .declined
            }
        }
    }
}

// MARK: - State Enum

private enum StreakFreezeState {
    case prompt       // Initial prompt asking user what to do
    case restoring    // Processing the restore
    case success      // Restore succeeded
    case declined     // User chose to start fresh
    case error        // Something went wrong
}

// MARK: - Preview

#Preview("Can Afford") {
    StreakFreezeView(
        brokenStreak: 7,
        userPoints: 250
    )
    .environmentObject(AuthViewModel())
}

#Preview("Cannot Afford") {
    StreakFreezeView(
        brokenStreak: 5,
        userPoints: 50
    )
    .environmentObject(AuthViewModel())
}
