//
//  FriendStreakDetailView.swift
//  MuscleHamster
//
//  Dedicated view for viewing and managing a friend streak
//  Phase 09.4: Friend Streaks
//

import SwiftUI

// MARK: - Friend Streak Detail View

struct FriendStreakDetailView: View {
    let friendProfile: FriendProfile
    let currentUserId: String

    @Environment(\.dismiss) private var dismiss
    @State private var streak: FriendStreak?
    @State private var userStats: UserStats?
    @State private var isLoading = true
    @State private var showRestoreSheet = false
    @State private var restoreState: RestoreState = .idle
    @State private var restoreResult: FriendStreakRestoreResult?
    @State private var errorMessage: String?
    @State private var showError = false

    enum RestoreState {
        case idle
        case restoring
        case success
        case waitingForFriend
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                if isLoading {
                    LoadingView(message: "Loading streak...")
                        .frame(maxHeight: .infinity)
                } else if let streak = streak {
                    streakContent(streak: streak)
                } else {
                    noStreakContent
                }
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Streak Together")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .task {
                await loadData()
            }
            .sheet(isPresented: $showRestoreSheet) {
                if let streak = streak {
                    FriendStreakRestoreSheet(
                        streak: streak,
                        friendProfile: friendProfile,
                        currentUserId: currentUserId,
                        userPoints: userStats?.totalPoints ?? 0,
                        onRestore: { option in
                            await performRestore(option: option)
                        },
                        onDismiss: {
                            showRestoreSheet = false
                        }
                    )
                }
            }
            .alert("Oops!", isPresented: $showError) {
                Button("OK") {}
            } message: {
                Text(errorMessage ?? "Something went wrong. Please try again.")
            }
        }
    }

    // MARK: - Streak Content

    private func streakContent(streak: FriendStreak) -> some View {
        VStack(spacing: 24) {
            // Header with both avatars
            headerSection(streak: streak)

            // Streak count display
            streakCountSection(streak: streak)

            // Today's check-in status
            checkInStatusSection(streak: streak)

            // Streak stats
            streakStatsSection(streak: streak)

            // Restore section (if broken)
            if streak.status == .broken && FriendStreakConfig.canRestore(brokenStreak: streak) {
                restoreSection(streak: streak)
            }

            // Success feedback (after restore)
            if restoreState == .success, let result = restoreResult {
                restoreSuccessSection(result: result)
            }

            // Waiting for friend feedback
            if restoreState == .waitingForFriend, let result = restoreResult {
                waitingForFriendSection(result: result)
            }

            Spacer(minLength: 40)
        }
        .padding()
    }

    // MARK: - Header Section

    private func headerSection(streak: FriendStreak) -> some View {
        HStack(spacing: 24) {
            // Your avatar
            VStack(spacing: 8) {
                hamsterAvatar(
                    hasCheckedIn: streak.hasCheckedInToday(userId: currentUserId),
                    color: .accentColor
                )
                Text("You")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            // Connection heart
            ZStack {
                if streak.currentStreak >= 7 {
                    Image(systemName: "flame.fill")
                        .font(.title)
                        .foregroundStyle(.orange)
                } else {
                    Image(systemName: streak.bothCheckedInToday ? "heart.fill" : "heart")
                        .font(.title)
                        .foregroundStyle(streak.bothCheckedInToday ? .pink : .gray.opacity(0.4))
                }
            }

            // Friend's avatar
            VStack(spacing: 8) {
                let friendId = streak.otherUserId(from: currentUserId) ?? ""
                hamsterAvatar(
                    hasCheckedIn: streak.hasCheckedInToday(userId: friendId),
                    color: hamsterStateColor(friendProfile.hamsterState)
                )
                Text(friendProfile.displayName)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
        }
        .padding(.top, 8)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Streak between you and \(friendProfile.displayName)")
    }

    private func hamsterAvatar(hasCheckedIn: Bool, color: Color) -> some View {
        ZStack {
            Circle()
                .fill(color.opacity(0.2))
                .frame(width: 64, height: 64)

            Image(systemName: "hare.fill")
                .font(.title)
                .foregroundStyle(color)

            // Check-in indicator
            ZStack {
                Circle()
                    .fill(hasCheckedIn ? Color.green : Color.gray.opacity(0.5))
                    .frame(width: 24, height: 24)

                Image(systemName: hasCheckedIn ? "checkmark" : "clock")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(.white)
            }
            .offset(x: 22, y: 22)
        }
    }

    // MARK: - Streak Count Section

    private func streakCountSection(streak: FriendStreak) -> some View {
        VStack(spacing: 12) {
            // Large streak number
            HStack(spacing: 8) {
                Image(systemName: streak.status.icon)
                    .font(.system(size: 36))
                    .foregroundStyle(streakStatusColor(streak.status))

                Text("\(streak.currentStreak)")
                    .font(.system(size: 56, weight: .bold, design: .rounded))
                    .foregroundStyle(streakStatusColor(streak.status))
            }

            Text(streak.currentStreak == 1 ? "day together" : "days together")
                .font(.title3)
                .foregroundStyle(.secondary)

            // Status badge
            HStack(spacing: 6) {
                Image(systemName: streak.status.icon)
                    .font(.caption)
                Text(streak.status.displayName)
                    .font(.caption)
                    .fontWeight(.semibold)
            }
            .foregroundStyle(streakStatusColor(streak.status))
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(streakStatusColor(streak.status).opacity(0.15))
            .cornerRadius(12)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Friend streak: \(streak.currentStreak) days, status: \(streak.status.displayName)")
    }

    // MARK: - Check-in Status Section

    private func checkInStatusSection(streak: FriendStreak) -> some View {
        VStack(spacing: 12) {
            Text("Today's Check-in")
                .font(.headline)

            let friendId = streak.otherUserId(from: currentUserId) ?? ""
            let youCheckedIn = streak.hasCheckedInToday(userId: currentUserId)
            let friendCheckedIn = streak.hasCheckedInToday(userId: friendId)

            HStack(spacing: 32) {
                checkInStatusItem(
                    name: "You",
                    hasCheckedIn: youCheckedIn
                )

                checkInStatusItem(
                    name: friendProfile.displayName,
                    hasCheckedIn: friendCheckedIn
                )
            }

            // Status message
            Text(checkInStatusMessage(streak: streak))
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.top, 4)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }

    private func checkInStatusItem(name: String, hasCheckedIn: Bool) -> some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .fill(hasCheckedIn ? Color.green.opacity(0.15) : Color.gray.opacity(0.1))
                    .frame(width: 56, height: 56)

                Image(systemName: hasCheckedIn ? "checkmark.circle.fill" : "clock")
                    .font(.title)
                    .foregroundStyle(hasCheckedIn ? .green : .gray)
            }

            Text(name)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(1)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(name): \(hasCheckedIn ? "checked in" : "not yet checked in")")
    }

    private func checkInStatusMessage(streak: FriendStreak) -> String {
        let friendName = friendProfile.displayName
        let friendId = streak.otherUserId(from: currentUserId) ?? ""
        let youCheckedIn = streak.hasCheckedInToday(userId: currentUserId)
        let friendCheckedIn = streak.hasCheckedInToday(userId: friendId)

        if youCheckedIn && friendCheckedIn {
            if streak.currentStreak >= 7 {
                return "You two are unstoppable!"
            }
            return "You both crushed it today!"
        } else if youCheckedIn && !friendCheckedIn {
            return "You're in! Waiting for \(friendName)..."
        } else if !youCheckedIn && friendCheckedIn {
            return "\(friendName) is in! Time to check in!"
        } else {
            return "Neither of you have checked in yet. Let's go!"
        }
    }

    // MARK: - Streak Stats Section

    private func streakStatsSection(streak: FriendStreak) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Stats")
                .font(.headline)

            HStack(spacing: 16) {
                statCard(
                    value: "\(streak.currentStreak)",
                    label: "Current",
                    icon: "flame.fill",
                    color: .orange
                )

                statCard(
                    value: "\(streak.longestStreak)",
                    label: "Best Together",
                    icon: "trophy.fill",
                    color: .yellow
                )

                statCard(
                    value: daysSinceCreated(streak: streak),
                    label: "Partners",
                    icon: "calendar",
                    color: .blue
                )
            }
        }
    }

    private func statCard(value: String, label: String, icon: String, color: Color) -> some View {
        VStack(spacing: 6) {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.caption)
                    .foregroundStyle(color)
                Text(value)
                    .font(.title3)
                    .fontWeight(.bold)
            }

            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(label): \(value)")
    }

    private func daysSinceCreated(streak: FriendStreak) -> String {
        let days = Calendar.current.dateComponents([.day], from: streak.createdAt, to: Date()).day ?? 0
        if days == 0 {
            return "New"
        }
        return "\(days)d"
    }

    // MARK: - Restore Section

    private func restoreSection(streak: FriendStreak) -> some View {
        VStack(spacing: 16) {
            // Broken streak message
            VStack(spacing: 8) {
                Image(systemName: "heart.slash.fill")
                    .font(.largeTitle)
                    .foregroundStyle(.gray)

                Text("Your streak ended at \(streak.previousBrokenStreak) days")
                    .font(.headline)

                Text("But don't worry — you can save it!")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            // Restore button
            Button {
                showRestoreSheet = true
            } label: {
                HStack {
                    Image(systemName: "arrow.counterclockwise")
                    Text("Restore Streak")
                }
                .font(.headline)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.accentColor)
                .cornerRadius(14)
            }
            .accessibilityLabel("Restore streak")
            .accessibilityHint("Opens options to restore your friend streak")

            // Points balance
            if let points = userStats?.totalPoints {
                HStack(spacing: 4) {
                    Image(systemName: "star.fill")
                        .foregroundStyle(.yellow)
                        .font(.caption)
                    Text("You have \(points) points")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }

    // MARK: - Restore Success Section

    private func restoreSuccessSection(result: FriendStreakRestoreResult) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 50))
                .foregroundStyle(.green)

            Text("Streak Saved!")
                .font(.title2)
                .fontWeight(.bold)

            Text("You're back to \(result.restoredStreak) days together!")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            // Hamster reaction
            HStack {
                Image(systemName: "bubble.left.fill")
                    .foregroundStyle(.accentColor.opacity(0.2))
                    .font(.caption)
                Text(result.hamsterReaction)
                    .font(.subheadline)
                    .italic()
            }
            .padding()
            .background(Color.accentColor.opacity(0.1))
            .cornerRadius(12)

            // Points spent
            PointsBalanceView(balance: result.pointsSpent, style: .change, changeAmount: -result.pointsSpent)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }

    // MARK: - Waiting for Friend Section

    private func waitingForFriendSection(result: FriendStreakRestoreResult) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "clock.fill")
                .font(.system(size: 50))
                .foregroundStyle(.blue)

            Text("Your Side is Fixed!")
                .font(.title2)
                .fontWeight(.bold)

            Text("Waiting for \(friendProfile.displayName) to restore their side...")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            // Hamster reaction
            HStack {
                Image(systemName: "bubble.left.fill")
                    .foregroundStyle(.accentColor.opacity(0.2))
                    .font(.caption)
                Text(result.hamsterReaction)
                    .font(.subheadline)
                    .italic()
            }
            .padding()
            .background(Color.accentColor.opacity(0.1))
            .cornerRadius(12)

            // Points spent
            PointsBalanceView(balance: result.pointsSpent, style: .change, changeAmount: -result.pointsSpent)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }

    // MARK: - No Streak Content

    private var noStreakContent: some View {
        VStack(spacing: 20) {
            Image(systemName: "sparkles")
                .font(.system(size: 60))
                .foregroundStyle(.purple.opacity(0.6))

            Text("No streak yet!")
                .font(.title2)
                .fontWeight(.bold)

            Text("When you and \(friendProfile.displayName) both check in on the same day, your streak will begin!")
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
        }
        .frame(maxHeight: .infinity)
        .padding()
    }

    // MARK: - Helpers

    private func streakStatusColor(_ status: FriendStreakStatus) -> Color {
        switch status {
        case .active: return .orange
        case .waiting: return .blue
        case .atRisk: return .yellow
        case .broken: return .gray
        case .none: return .purple
        }
    }

    private func hamsterStateColor(_ state: HamsterState) -> Color {
        switch state {
        case .hungry: return .orange
        case .chillin: return .blue
        case .happy: return .green
        case .excited: return .yellow
        case .proud: return .purple
        }
    }

    // MARK: - Data Loading

    private func loadData() async {
        isLoading = true

        // Load friend streak
        streak = await MockFriendService.shared.getFriendStreak(
            userId1: currentUserId,
            userId2: friendProfile.id
        )

        // Load user stats for points balance
        userStats = await MockActivityService.shared.getUserStats(userId: currentUserId)

        isLoading = false
    }

    private func performRestore(option: FriendStreakRestoreOption) async {
        guard let streak = streak else { return }

        restoreState = .restoring

        do {
            let result: FriendStreakRestoreResult

            switch option {
            case .selfOnly:
                result = try await MockFriendService.shared.restoreFriendStreakSelf(
                    streakId: streak.id,
                    userId: currentUserId
                )
            case .forBoth:
                result = try await MockFriendService.shared.restoreFriendStreakBoth(
                    streakId: streak.id,
                    userId: currentUserId
                )
            }

            restoreResult = result

            if result.friendNeedsToRestore {
                restoreState = .waitingForFriend
            } else {
                restoreState = .success
            }

            // Reload data to reflect updated streak
            await loadData()

        } catch let error as FriendError {
            restoreState = .idle
            errorMessage = error.friendlyMessage
            showError = true
        } catch {
            restoreState = .idle
            errorMessage = "Something went wrong. Please try again."
            showError = true
        }
    }
}

// MARK: - Friend Streak Restore Sheet

struct FriendStreakRestoreSheet: View {
    let streak: FriendStreak
    let friendProfile: FriendProfile
    let currentUserId: String
    let userPoints: Int
    let onRestore: (FriendStreakRestoreOption) async -> Void
    let onDismiss: () -> Void

    @State private var selectedOption: FriendStreakRestoreOption?
    @State private var isRestoring = false
    @State private var showConfirmation = false

    private var canAffordSelfRestore: Bool {
        userPoints >= FriendStreakConfig.selfRestoreCost
    }

    private var canAffordBothRestore: Bool {
        userPoints >= FriendStreakConfig.bothRestoreCost
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 12) {
                    Image(systemName: "heart.slash.fill")
                        .font(.system(size: 50))
                        .foregroundStyle(.gray)

                    Text("Your \(streak.previousBrokenStreak)-day streak ended")
                        .font(.title3)
                        .fontWeight(.bold)

                    // Hamster encouragement
                    Text(encouragementMessage)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)
                }
                .padding(.top)

                Divider()

                // Restore options
                VStack(spacing: 16) {
                    Text("Restore Options")
                        .font(.headline)

                    // Restore for both
                    restoreOptionCard(
                        option: .forBoth,
                        isEnabled: canAffordBothRestore
                    )

                    // Restore self only
                    restoreOptionCard(
                        option: .selfOnly,
                        isEnabled: canAffordSelfRestore
                    )

                    // Start fresh
                    startFreshButton
                }

                Spacer()

                // Points balance
                HStack(spacing: 8) {
                    Image(systemName: "star.fill")
                        .foregroundStyle(.yellow)
                    Text("You have \(userPoints) points")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .padding(.bottom)
            }
            .padding()
            .navigationTitle("Restore Streak")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Cancel") {
                        onDismiss()
                    }
                }
            }
            .confirmationDialog(
                "Confirm Restore",
                isPresented: $showConfirmation,
                titleVisibility: .visible
            ) {
                if let option = selectedOption {
                    Button(option.displayName) {
                        performRestore(option: option)
                    }
                }
                Button("Cancel", role: .cancel) {
                    selectedOption = nil
                }
            } message: {
                if let option = selectedOption {
                    Text(confirmationMessage(for: option))
                }
            }
            .overlay {
                if isRestoring {
                    Color.black.opacity(0.3)
                        .ignoresSafeArea()
                        .overlay {
                            VStack(spacing: 12) {
                                ProgressView()
                                Text("Restoring streak...")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(24)
                            .background(.regularMaterial)
                            .cornerRadius(16)
                        }
                }
            }
        }
    }

    // MARK: - Restore Option Card

    private func restoreOptionCard(option: FriendStreakRestoreOption, isEnabled: Bool) -> some View {
        Button {
            if isEnabled {
                selectedOption = option
                showConfirmation = true
            }
        } label: {
            HStack {
                // Icon
                ZStack {
                    Circle()
                        .fill(isEnabled ? Color.accentColor.opacity(0.15) : Color.gray.opacity(0.1))
                        .frame(width: 48, height: 48)

                    Image(systemName: option.icon)
                        .font(.title3)
                        .foregroundStyle(isEnabled ? .accentColor : .gray)
                }

                // Info
                VStack(alignment: .leading, spacing: 4) {
                    Text(option.displayName)
                        .font(.headline)
                        .foregroundStyle(isEnabled ? .primary : .secondary)

                    Text(option.description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                Spacer()

                // Cost
                VStack(alignment: .trailing, spacing: 2) {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .foregroundStyle(.yellow)
                            .font(.caption)
                        Text("\(option.cost)")
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundStyle(isEnabled ? .primary : .secondary)
                    }

                    if !isEnabled {
                        Text("Not enough")
                            .font(.caption2)
                            .foregroundStyle(.red)
                    }
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(14)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(isEnabled ? Color.accentColor.opacity(0.3) : Color.clear, lineWidth: 2)
            )
        }
        .disabled(!isEnabled)
        .accessibilityLabel("\(option.displayName), costs \(option.cost) points")
        .accessibilityHint(isEnabled ? option.description : "You need more points for this option")
    }

    // MARK: - Start Fresh Button

    private var startFreshButton: some View {
        Button {
            onDismiss()
        } label: {
            HStack {
                Image(systemName: "arrow.right.circle")
                    .font(.title3)
                Text("Start Fresh")
                    .font(.headline)
            }
            .foregroundStyle(.secondary)
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color(.systemGray6))
            .cornerRadius(14)
        }
        .accessibilityLabel("Start fresh")
        .accessibilityHint("Accept the broken streak and start a new one together")
    }

    // MARK: - Helpers

    private var encouragementMessage: String {
        if !canAffordSelfRestore {
            return "You don't have enough points right now, but one more workout and you'll be there! Or you can start fresh."
        } else if streak.previousBrokenStreak >= 7 {
            return "That was an amazing streak! Want to keep it going?"
        } else {
            return "Life happens! You can restore your streak or start fresh together."
        }
    }

    private func confirmationMessage(for option: FriendStreakRestoreOption) -> String {
        switch option {
        case .selfOnly:
            return "This will spend \(option.cost) points to fix your side. \(friendProfile.displayName) will need to restore their side too."
        case .forBoth:
            return "This will spend \(option.cost) points to save the streak for both of you! \(friendProfile.displayName) will be notified."
        }
    }

    private func performRestore(option: FriendStreakRestoreOption) {
        isRestoring = true
        Task {
            await onRestore(option)
            await MainActor.run {
                isRestoring = false
                onDismiss()
            }
        }
    }
}

// MARK: - Preview

#Preview {
    FriendStreakDetailView(
        friendProfile: FriendProfile(
            id: "friend_1",
            email: "friend@example.com",
            hamsterName: "Peanut",
            currentStreak: 12,
            longestStreak: 28,
            totalWorkoutsCompleted: 45,
            hamsterState: .happy,
            growthStage: .juvenile,
            friendStreak: FriendStreak(
                userId1: "current_user",
                userId2: "friend_1",
                currentStreak: 5,
                longestStreak: 12
            )
        ),
        currentUserId: "current_user"
    )
}
