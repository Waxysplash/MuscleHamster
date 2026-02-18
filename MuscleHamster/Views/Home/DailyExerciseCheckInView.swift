//
//  DailyExerciseCheckInView.swift
//  MuscleHamster
//
//  Daily exercise check-in sheet — one-tap: read, do, tap "I Did It!", celebrate
//  Follows the RestDayCheckInView pattern with 3 states: ready, confirming, success
//

import SwiftUI

struct DailyExerciseCheckInView: View {
    let exercise: DailyExercise

    @EnvironmentObject private var authViewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var viewState: CheckInState = .ready
    @State private var completedCheckIn: DailyExerciseCheckIn?
    @State private var errorMessage: String?
    @State private var showError = false

    private let activityService = MockActivityService.shared

    enum CheckInState {
        case ready
        case confirming
        case success
    }

    var body: some View {
        NavigationStack {
            Group {
                switch viewState {
                case .ready:
                    readyContent
                case .confirming:
                    confirmingContent
                case .success:
                    successContent
                }
            }
            .navigationTitle(navigationTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    if viewState != .confirming {
                        Button("Close") {
                            dismiss()
                        }
                    }
                }
            }
            .alert("Oops!", isPresented: $showError) {
                Button("Try Again") {
                    performCheckIn()
                }
                Button("Cancel", role: .cancel) {
                    viewState = .ready
                }
            } message: {
                Text(errorMessage ?? "Something went wrong. Let's try again!")
            }
        }
    }

    private var navigationTitle: String {
        switch viewState {
        case .ready: return "Today's Exercise"
        case .confirming: return "Just a moment..."
        case .success: return "You did it!"
        }
    }

    // MARK: - Ready Content

    private var readyContent: some View {
        VStack(spacing: 32) {
            Spacer()

            // Exercise icon
            ZStack {
                Circle()
                    .fill(Color.accentColor.opacity(0.15))
                    .frame(width: 100, height: 100)

                Image(systemName: exercise.icon)
                    .font(.system(size: 44))
                    .foregroundStyle(.accentColor)
            }

            // Exercise name & rep count
            VStack(spacing: 12) {
                Text(exercise.displayPrompt)
                    .font(.system(size: 32, weight: .bold))
                    .multilineTextAlignment(.center)

                Text(exercise.instruction)
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)
            }

            Spacer()

            // Single "I Did It!" button
            Button {
                performCheckIn()
            } label: {
                Text("I Did It!")
                    .font(.title2)
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Color.accentColor)
                    .foregroundStyle(.white)
                    .cornerRadius(16)
            }
            .padding(.horizontal, 24)
            .accessibilityLabel("I did it! Complete the daily exercise")

            Spacer(minLength: 40)
        }
    }

    // MARK: - Confirming Content

    private var confirmingContent: some View {
        VStack(spacing: 24) {
            Spacer()

            ProgressView()
                .scaleEffect(1.5)

            Text("Recording your exercise...")
                .font(.headline)
                .foregroundStyle(.secondary)

            Spacer()
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Recording your daily exercise check-in")
    }

    // MARK: - Success Content

    private var successContent: some View {
        ScrollView {
            VStack(spacing: 24) {
                Spacer(minLength: 40)

                // Celebration
                VStack(spacing: 16) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 60))
                        .foregroundStyle(.yellow)

                    Text("Exercise Complete!")
                        .font(.title)
                        .fontWeight(.bold)
                }

                // Hamster Reaction
                VStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(Color.green.opacity(0.15))
                            .frame(width: 100, height: 100)

                        Image(systemName: "hare.fill")
                            .font(.system(size: 50))
                            .foregroundStyle(.green)
                    }

                    // Speech bubble with encouragement
                    Text(exercise.encouragement)
                        .font(.body)
                        .multilineTextAlignment(.center)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 16)
                                .fill(Color.green.opacity(0.1))
                        )
                        .padding(.horizontal)
                }

                // Points & Streak Card
                if let checkIn = completedCheckIn {
                    VStack(spacing: 16) {
                        // Points earned
                        HStack(spacing: 8) {
                            Image(systemName: "star.fill")
                                .foregroundStyle(.yellow)
                            Text("+\(checkIn.pointsEarned) points")
                                .fontWeight(.semibold)
                        }
                        .font(.title3)

                        // Streak maintained
                        HStack(spacing: 8) {
                            Image(systemName: "flame.fill")
                                .foregroundStyle(.orange)
                            Text("Streak maintained!")
                                .fontWeight(.medium)
                        }
                        .font(.subheadline)
                        .foregroundStyle(.orange)
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Color.accentColor.opacity(0.1))
                    )
                    .padding(.horizontal)
                }

                Spacer(minLength: 40)

                // Done Button
                Button {
                    dismiss()
                } label: {
                    Text("Done")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.accentColor)
                        .foregroundStyle(.white)
                        .cornerRadius(12)
                }
                .padding(.horizontal)
                .accessibilityLabel("Done, return to home")

                Spacer(minLength: 20)
            }
        }
    }

    // MARK: - Actions

    private func performCheckIn() {
        viewState = .confirming

        Task {
            do {
                guard let userId = authViewModel.currentUser?.id else {
                    throw ActivityError.saveFailed
                }

                let checkIn = try await activityService.recordDailyCheckIn(
                    exercise: exercise,
                    userId: userId
                )

                await MainActor.run {
                    completedCheckIn = checkIn
                    viewState = .success
                }
            } catch let error as ActivityError {
                await MainActor.run {
                    errorMessage = error.friendlyMessage
                    showError = true
                    viewState = .ready
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Something went a little wrong. Let's try again!"
                    showError = true
                    viewState = .ready
                }
            }
        }
    }
}

#Preview {
    DailyExerciseCheckInView(
        exercise: DailyExercise.pool[0]
    )
    .environmentObject(AuthViewModel())
}
