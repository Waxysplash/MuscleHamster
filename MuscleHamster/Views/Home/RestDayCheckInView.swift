//
//  RestDayCheckInView.swift
//  MuscleHamster
//
//  Phase 06.1: Rest-day micro-tasks for maintaining streaks
//  Provides quick hamster interactions and activity logging options
//

import SwiftUI

struct RestDayCheckInView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var viewState: RestDayCheckInState = .selection
    @State private var selectedActivity: RestDayActivity?
    @State private var completedCheckIn: RestDayCheckIn?
    @State private var errorMessage: String?
    @State private var showError = false

    private let activityService = MockActivityService.shared

    enum RestDayCheckInState {
        case selection
        case confirming
        case success
    }

    var body: some View {
        NavigationStack {
            Group {
                switch viewState {
                case .selection:
                    selectionContent
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
                    if let activity = selectedActivity {
                        performCheckIn(activity: activity)
                    }
                }
                Button("Cancel", role: .cancel) {
                    viewState = .selection
                }
            } message: {
                Text(errorMessage ?? "Something went wrong. Let's try again!")
            }
        }
    }

    private var navigationTitle: String {
        switch viewState {
        case .selection: return "Rest Day Check-in"
        case .confirming: return "Just a moment..."
        case .success: return "You did it!"
        }
    }

    // MARK: - Selection Content

    private var selectionContent: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 8) {
                    Image(systemName: "moon.stars.fill")
                        .font(.system(size: 50))
                        .foregroundStyle(.purple)

                    Text("Take it easy today!")
                        .font(.title2)
                        .fontWeight(.semibold)

                    Text("Rest days are important. Choose a quick activity to keep your streak going.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .padding(.top)

                // Quick Interactions Section
                VStack(alignment: .leading, spacing: 12) {
                    Label("Hang with your hamster", systemImage: "hare.fill")
                        .font(.headline)
                        .foregroundStyle(.primary)
                        .accessibilityAddTraits(.isHeader)

                    ForEach(RestDayActivity.quickInteractions) { activity in
                        ActivityOptionButton(
                            activity: activity,
                            isSelected: selectedActivity == activity
                        ) {
                            selectAndConfirm(activity)
                        }
                    }
                }

                // Divider
                HStack {
                    Rectangle()
                        .fill(Color.secondary.opacity(0.3))
                        .frame(height: 1)
                    Text("or")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Rectangle()
                        .fill(Color.secondary.opacity(0.3))
                        .frame(height: 1)
                }
                .padding(.horizontal)

                // Log Activity Section
                VStack(alignment: .leading, spacing: 12) {
                    Label("Log something positive", systemImage: "checkmark.circle.fill")
                        .font(.headline)
                        .foregroundStyle(.primary)
                        .accessibilityAddTraits(.isHeader)

                    ForEach(RestDayActivity.loggableActivities) { activity in
                        ActivityOptionButton(
                            activity: activity,
                            isSelected: selectedActivity == activity
                        ) {
                            selectAndConfirm(activity)
                        }
                    }
                }

                Spacer(minLength: 40)
            }
            .padding()
        }
    }

    // MARK: - Confirming Content

    private var confirmingContent: some View {
        VStack(spacing: 24) {
            Spacer()

            ProgressView()
                .scaleEffect(1.5)

            if let activity = selectedActivity {
                Text(activity.isHamsterInteraction ? "Your hamster is so happy..." : "Recording your activity...")
                    .font(.headline)
                    .foregroundStyle(.secondary)
            }

            Spacer()
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Recording your check-in")
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

                    Text("Check-in Complete!")
                        .font(.title)
                        .fontWeight(.bold)
                }

                // Hamster Reaction
                if let activity = selectedActivity {
                    VStack(spacing: 12) {
                        // Hamster avatar
                        ZStack {
                            Circle()
                                .fill(Color.blue.opacity(0.15))
                                .frame(width: 100, height: 100)

                            Image(systemName: "hare.fill")
                                .font(.system(size: 50))
                                .foregroundStyle(.blue)
                        }

                        // Speech bubble
                        Text(activity.hamsterReaction)
                            .font(.body)
                            .multilineTextAlignment(.center)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(Color.blue.opacity(0.1))
                            )
                            .padding(.horizontal)
                    }
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

    private func selectAndConfirm(_ activity: RestDayActivity) {
        selectedActivity = activity
        performCheckIn(activity: activity)
    }

    private func performCheckIn(activity: RestDayActivity) {
        viewState = .confirming

        Task {
            do {
                guard let userId = authViewModel.currentUser?.id else {
                    throw ActivityError.saveFailed
                }

                let checkIn = try await activityService.recordRestDayCheckIn(
                    activity: activity,
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
                    viewState = .selection
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Something went a little wrong. Let's try again!"
                    showError = true
                    viewState = .selection
                }
            }
        }
    }
}

// MARK: - Activity Option Button

struct ActivityOptionButton: View {
    let activity: RestDayActivity
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                // Icon
                Image(systemName: activity.icon)
                    .font(.title2)
                    .foregroundStyle(activity.isHamsterInteraction ? .purple : .blue)
                    .frame(width: 44, height: 44)
                    .background(
                        Circle()
                            .fill(activity.isHamsterInteraction ? Color.purple.opacity(0.1) : Color.blue.opacity(0.1))
                    )

                // Text
                VStack(alignment: .leading, spacing: 2) {
                    Text(activity.displayName)
                        .font(.body)
                        .fontWeight(.medium)
                        .foregroundStyle(.primary)

                    Text(activity.description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                // Points badge
                Text("+\(activity.pointsAwarded)")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(.yellow)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(
                        Capsule()
                            .fill(Color.yellow.opacity(0.15))
                    )

                // Chevron
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(isSelected ? Color.accentColor.opacity(0.1) : Color.gray.opacity(0.08))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.accentColor : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(activity.displayName): \(activity.description). Earn \(activity.pointsAwarded) points.")
        .accessibilityHint("Double-tap to complete this activity")
        .accessibilityAddTraits(isSelected ? [.isSelected] : [])
    }
}

// MARK: - Previews

#Preview("Selection") {
    RestDayCheckInView()
        .environmentObject(AuthViewModel())
}

#Preview("Success") {
    // This would need state manipulation to show success
    RestDayCheckInView()
        .environmentObject(AuthViewModel())
}
