//
//  HomeView.swift
//  MuscleHamster
//
//  Home screen - Displays the hamster and primary daily actions
//  Phase 01.2: Tone baseline — copy is hamster-voiced, warm, no guilt
//  Phase 05.2: Dynamic hamster state, points, and streak display
//  Phase 06.1: Rest-day check-in integration
//  Phase 06.2: Streak status validation and display
//  Phase 07.1: Consistent points balance display using PointsBalanceView
//  Phase 07.3: Display equipped items and customize button
//  Phase 07.4: Growth stage display and celebration
//  Phase 08.3: Notification tap routing with contextual banners
//

import SwiftUI

struct HomeView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @ObservedObject private var routingState = AppRoutingState.shared
    @State private var viewState: ViewState = .loading
    @State private var userStats: UserStats?
    @State private var streakStatus: StreakStatus = .none
    @State private var showRestDayCheckIn = false
    @State private var showStreakFreeze = false
    @State private var hasShownStreakFreezeThisSession = false
    @State private var showInventory = false
    @State private var equippedItems: EquippedItems = .empty
    @State private var showGrowthCelebration = false
    @State private var pendingGrowthMilestone: GrowthMilestone?
    @State private var currentGrowthStage: GrowthStage = .baby
    @State private var showNotificationBanner = false

    private let activityService = MockActivityService.shared
    private let shopService = MockShopService.shared

    var body: some View {
        NavigationStack {
            Group {
                switch viewState {
                case .loading:
                    LoadingView(message: "Waking up your hamster...")

                case .empty:
                    EmptyStateView(
                        icon: "pawprint.fill",
                        title: "Hi, I'm your hamster!",
                        message: "I just woke up and I'm so excited to meet you. Let's get started together!",
                        actionTitle: "Let's Go!",
                        action: { viewState = .content }
                    )

                case .error(let message):
                    ErrorView(
                        message: message,
                        retryAction: { loadContent() }
                    )

                case .content:
                    homeContent
                }
            }
            .navigationTitle("Home")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    NavigationLink {
                        SettingsView()
                    } label: {
                        Image(systemName: "gearshape.fill")
                            .accessibilityLabel("Settings")
                    }
                }
            }
        }
        .onAppear {
            loadContent()
        }
        .sheet(isPresented: $showRestDayCheckIn) {
            RestDayCheckInView()
                .onDisappear {
                    // Reload content when returning from rest-day check-in
                    loadContent()
                }
        }
        .sheet(isPresented: $showStreakFreeze) {
            if case .broken(let previousStreak) = streakStatus, previousStreak > 0 {
                StreakFreezeView(
                    brokenStreak: previousStreak,
                    userPoints: userStats?.totalPoints ?? 0,
                    onRestoreComplete: {
                        // Reload content after restore or decline
                        loadContent()
                    }
                )
            }
        }
        .sheet(isPresented: $showInventory) {
            InventoryView()
                .onDisappear {
                    // Reload to reflect any customization changes
                    loadContent()
                }
        }
        .fullScreenCover(isPresented: $showGrowthCelebration) {
            if let milestone = pendingGrowthMilestone {
                GrowthCelebrationView(
                    milestone: milestone,
                    hamsterName: authViewModel.userProfile?.hamsterName ?? "Your hamster",
                    onDismiss: {
                        showGrowthCelebration = false
                        // Clear the pending celebration
                        Task {
                            if let userId = authViewModel.currentUser?.id {
                                await activityService.clearPendingGrowthCelebration(userId: userId)
                            }
                        }
                    }
                )
            }
        }
    }

    private var homeContent: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Notification context banner (Phase 08.3)
                notificationBannerSection

                hamsterSection
                todayStatusSection
                dailyActionsSection
                streakSection
            }
            .padding()
        }
        .onAppear {
            // Check for notification context and show banner
            if routingState.notificationContext != nil {
                showNotificationBanner = true
            }
        }
        .onChange(of: routingState.notificationContext) { context in
            showNotificationBanner = context != nil
        }
    }

    // MARK: - Notification Banner Section (Phase 08.3)

    @ViewBuilder
    private var notificationBannerSection: some View {
        if let context = routingState.notificationContext, showNotificationBanner {
            NotificationContextBanner(
                context: context,
                onDismiss: {
                    withAnimation {
                        showNotificationBanner = false
                    }
                    routingState.clearNotificationContext()
                },
                onAction: context.hasActionButton ? {
                    // Open rest-day check-in sheet
                    showRestDayCheckIn = true
                    // Dismiss the banner
                    withAnimation {
                        showNotificationBanner = false
                    }
                    routingState.clearNotificationContext()
                } : nil
            )
            .onAppear {
                // Trigger the banner's appear animation
                // Access the view's onAppear method through a wrapper
            }
            .transition(.asymmetric(
                insertion: .move(edge: .top).combined(with: .opacity),
                removal: .opacity
            ))
        }
    }

    // MARK: - Hamster Section (Phase 07.3: Shows equipped items)

    private var hamsterSection: some View {
        let hamsterState = userStats?.hamsterState ?? .chillin
        let hamsterName = authViewModel.userProfile?.hamsterName ?? "Your hamster"

        return VStack(spacing: 12) {
            Text(hamsterState.greeting)
                .font(.headline)
                .foregroundStyle(.primary)
                .accessibilityAddTraits(.isHeader)

            // Hamster enclosure with equipped items
            ZStack {
                RoundedRectangle(cornerRadius: 20)
                    .fill(hamsterBackgroundColor(for: hamsterState))
                    .frame(height: 280)

                VStack(spacing: 12) {
                    // Hamster with equipped items
                    ZStack {
                        // Base hamster
                        Image(systemName: "hare.fill")
                            .font(.system(size: 80))
                            .foregroundStyle(hamsterIconColor(for: hamsterState))

                        // Outfit indicator (if equipped)
                        if let outfit = equippedItems.outfit {
                            Image(systemName: "tshirt.fill")
                                .font(.system(size: 22))
                                .foregroundStyle(.purple)
                                .offset(x: -35, y: 25)
                                .accessibilityHidden(true)
                        }

                        // Accessory indicator (if equipped)
                        if let accessory = equippedItems.accessory {
                            Image(systemName: "sparkles")
                                .font(.system(size: 18))
                                .foregroundStyle(.pink)
                                .offset(x: 35, y: -30)
                                .accessibilityHidden(true)
                        }
                    }

                    // Hamster name
                    Text(hamsterName)
                        .font(.title3)
                        .fontWeight(.semibold)

                    // Growth stage badge (Phase 07.4)
                    HStack(spacing: 4) {
                        Image(systemName: currentGrowthStage.icon)
                            .font(.caption2)
                        Text(currentGrowthStage.displayName)
                            .font(.caption2)
                            .fontWeight(.medium)
                    }
                    .foregroundStyle(growthStageColor)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(growthStageColor.opacity(0.15))
                    .clipShape(Capsule())
                    .accessibilityLabel("Growth stage: \(currentGrowthStage.displayName)")

                    // Equipped items badges
                    if equippedItems.outfit != nil || equippedItems.accessory != nil {
                        HStack(spacing: 8) {
                            if let outfit = equippedItems.outfit {
                                equippedBadge(name: outfit.name, icon: "tshirt.fill", color: .purple)
                            }
                            if let accessory = equippedItems.accessory {
                                equippedBadge(name: accessory.name, icon: "sparkles", color: .pink)
                            }
                        }
                    }

                    // State badge
                    HStack(spacing: 4) {
                        Image(systemName: hamsterState.icon)
                            .font(.caption)
                        Text(hamsterState.displayName)
                            .font(.caption)
                            .fontWeight(.medium)
                    }
                    .foregroundStyle(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(hamsterBadgeColor(for: hamsterState))
                    .cornerRadius(12)
                }

                // Enclosure items indicator (bottom right)
                if !equippedItems.enclosureItems.isEmpty {
                    VStack {
                        Spacer()
                        HStack {
                            Spacer()
                            HStack(spacing: 4) {
                                Image(systemName: "house.fill")
                                    .font(.caption2)
                                Text("\(equippedItems.enclosureItems.count)")
                                    .font(.caption)
                                    .fontWeight(.medium)
                            }
                            .foregroundStyle(.orange)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.white.opacity(0.9))
                            .clipShape(Capsule())
                            .padding(12)
                        }
                    }
                    .accessibilityLabel("\(equippedItems.enclosureItems.count) items in enclosure")
                }

                // Customize button (top right)
                VStack {
                    HStack {
                        Spacer()
                        Button {
                            showInventory = true
                        } label: {
                            HStack(spacing: 4) {
                                Image(systemName: "paintbrush.fill")
                                    .font(.caption)
                                Text("Customize")
                                    .font(.caption)
                                    .fontWeight(.medium)
                            }
                            .foregroundStyle(.accentColor)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.white.opacity(0.95))
                            .clipShape(Capsule())
                            .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
                        }
                        .padding(12)
                        .accessibilityLabel("Customize your hamster")
                        .accessibilityHint("Open your collection to change outfit, accessories, and enclosure items")
                    }
                    Spacer()
                }
            }
            .accessibilityElement(children: .contain)
            .accessibilityLabel(hamsterAccessibilityLabel(name: hamsterName, state: hamsterState))

            Text(hamsterState.description)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .accessibilityLabel("Hamster mood: \(hamsterState.description)")
        }
    }

    private func equippedBadge(name: String, icon: String, color: Color) -> some View {
        HStack(spacing: 3) {
            Image(systemName: icon)
                .font(.system(size: 10))
            Text(name)
                .font(.caption2)
                .lineLimit(1)
        }
        .foregroundStyle(color)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(color.opacity(0.15))
        .clipShape(Capsule())
        .accessibilityLabel("Wearing \(name)")
    }

    private func hamsterAccessibilityLabel(name: String, state: HamsterState) -> String {
        var label = "\(name) is a \(currentGrowthStage.displayName.lowercased()) hamster, feeling \(state.displayName.lowercased())"
        if let outfit = equippedItems.outfit {
            label += ", wearing \(outfit.name)"
        }
        if let accessory = equippedItems.accessory {
            label += " with \(accessory.name)"
        }
        if !equippedItems.enclosureItems.isEmpty {
            label += ", \(equippedItems.enclosureItems.count) items in enclosure"
        }
        return label
    }

    private func hamsterBackgroundColor(for state: HamsterState) -> Color {
        switch state {
        case .hungry: return Color.orange.opacity(0.15)
        case .chillin: return Color.blue.opacity(0.1)
        case .happy: return Color.green.opacity(0.15)
        case .excited: return Color.yellow.opacity(0.15)
        case .proud: return Color.purple.opacity(0.15)
        }
    }

    private func hamsterIconColor(for state: HamsterState) -> Color {
        switch state {
        case .hungry: return .orange
        case .chillin: return .blue
        case .happy: return .green
        case .excited: return .yellow
        case .proud: return .purple
        }
    }

    private func hamsterBadgeColor(for state: HamsterState) -> Color {
        switch state {
        case .hungry: return .orange
        case .chillin: return .blue
        case .happy: return .green
        case .excited: return .orange
        case .proud: return .purple
        }
    }

    /// Color for growth stage badge (Phase 07.4)
    private var growthStageColor: Color {
        switch currentGrowthStage.color {
        case "green": return .green
        case "blue": return .blue
        case "purple": return .purple
        case "yellow": return .yellow
        default: return .accentColor
        }
    }

    // MARK: - Today Status Section

    private var todayStatusSection: some View {
        let hasWorkoutToday = userStats?.hasCompletedWorkoutToday ?? false
        let hasRestDayToday = userStats?.hasRestDayCheckInToday ?? false
        let pointsToday = totalPointsEarnedToday
        let totalPoints = userStats?.totalPoints ?? 0

        return VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Today")
                    .font(.title2)
                    .fontWeight(.semibold)
                    .accessibilityAddTraits(.isHeader)

                Spacer()

                // Total points display (Phase 07.1: Using PointsBalanceView)
                PointsBalanceView(balance: totalPoints, style: .compact)
            }

            if hasWorkoutToday {
                // Workout completed today message
                HStack(spacing: 12) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.title3)
                        .foregroundStyle(.green)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Workout complete!")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        if pointsToday > 0 {
                            Text("You earned \(pointsToday) points today.")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }

                    Spacer()
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.green.opacity(0.1))
                .cornerRadius(12)
                .accessibilityElement(children: .combine)
                .accessibilityLabel("Workout complete! You earned \(pointsToday) points today.")
            } else if hasRestDayToday {
                // Rest day check-in completed
                HStack(spacing: 12) {
                    Image(systemName: "moon.stars.fill")
                        .font(.title3)
                        .foregroundStyle(.purple)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Rest day check-in done!")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        if pointsToday > 0 {
                            Text("You earned \(pointsToday) points today.")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }

                    Spacer()
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.purple.opacity(0.1))
                .cornerRadius(12)
                .accessibilityElement(children: .combine)
                .accessibilityLabel("Rest day check-in done! You earned \(pointsToday) points today.")
            } else {
                // Not yet checked in
                HStack(spacing: 12) {
                    Image(systemName: "sun.max.fill")
                        .font(.title3)
                        .foregroundStyle(.yellow)

                    Text("It's a great day to move! I'll be cheering you on.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.accentColor.opacity(0.05))
                .cornerRadius(12)
                .accessibilityElement(children: .combine)
                .accessibilityLabel("Today's status: It's a great day to move! I'll be cheering you on.")
            }
        }
    }

    /// Calculate total points earned today (workouts + rest day check-ins)
    private var totalPointsEarnedToday: Int {
        let workoutPoints = userStats?.pointsEarnedToday ?? 0
        let restDayPoints = userStats?.todaysRestDayCheckIn?.pointsEarned ?? 0
        return workoutPoints + restDayPoints
    }

    // MARK: - Daily Actions Section

    private var dailyActionsSection: some View {
        let hasCheckedIn = userStats?.hasAnyCheckInToday ?? false
        let hasWorkoutToday = userStats?.hasCompletedWorkoutToday ?? false
        let hasRestDayToday = userStats?.hasRestDayCheckInToday ?? false

        return VStack(alignment: .leading, spacing: 12) {
            Button {
                // Workout action placeholder - will navigate to workouts tab
            } label: {
                HStack {
                    Image(systemName: "figure.run")
                    Text("Start a Workout")
                        .fontWeight(.medium)
                    Spacer()
                    Image(systemName: "chevron.right")
                }
                .padding()
                .background(Color.accentColor.opacity(0.1))
                .cornerRadius(12)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Start a workout")
            .accessibilityHint("Opens the workout selection")

            // Rest Day Check-in Button
            if hasRestDayToday {
                // Already did rest-day check-in today
                restDayCompletedView
            } else if hasWorkoutToday {
                // Already did workout today - rest day not needed
                restDayNotNeededView
            } else {
                // Available for rest-day check-in
                Button {
                    showRestDayCheckIn = true
                } label: {
                    HStack {
                        Image(systemName: "moon.stars.fill")
                        Text("Rest Day Check-in")
                            .fontWeight(.medium)
                        Spacer()
                        Image(systemName: "chevron.right")
                    }
                    .padding()
                    .foregroundStyle(.purple)
                    .background(Color.purple.opacity(0.08))
                    .cornerRadius(12)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Rest day check-in")
                .accessibilityHint("Log a rest day and spend time with your hamster")
            }
        }
    }

    /// View when rest-day check-in is already completed today
    private var restDayCompletedView: some View {
        HStack(spacing: 12) {
            Image(systemName: "checkmark.circle.fill")
                .font(.title3)
                .foregroundStyle(.green)

            VStack(alignment: .leading, spacing: 2) {
                Text("Rest day check-in done!")
                    .font(.subheadline)
                    .fontWeight(.medium)
                if let checkIn = userStats?.todaysRestDayCheckIn {
                    Text("You earned \(checkIn.pointsEarned) points.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            Image(systemName: "moon.stars.fill")
                .foregroundStyle(.purple.opacity(0.5))
        }
        .padding()
        .background(Color.green.opacity(0.08))
        .cornerRadius(12)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Rest day check-in complete. You earned \(userStats?.todaysRestDayCheckIn?.pointsEarned ?? 0) points.")
    }

    /// View when workout was done so rest day is not needed
    private var restDayNotNeededView: some View {
        HStack(spacing: 12) {
            Image(systemName: "star.fill")
                .font(.title3)
                .foregroundStyle(.yellow)

            Text("Workout done — rest day not needed!")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            Spacer()
        }
        .padding()
        .background(Color.yellow.opacity(0.08))
        .cornerRadius(12)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("You completed a workout today, so a rest day check-in is not needed.")
    }

    // MARK: - Streak Section (Phase 06.2: Enhanced with StreakStatus, Phase 06.3: Streak Freeze)

    private var streakSection: some View {
        let displayCount = streakStatus.displayCount
        let longestStreak = userStats?.longestStreak ?? 0
        let isNewRecord = displayCount > 0 && displayCount == longestStreak
        let canRestore = userStats?.hasBrokenStreakToRestore ?? false

        return VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Text("Current Streak")
                            .font(.caption)
                            .foregroundStyle(.secondary)

                        // Status indicator badge
                        if streakStatus.isAtRisk {
                            Text("AT RISK")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.orange)
                                .cornerRadius(4)
                        } else if streakStatus.isBroken {
                            Text("RESET")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.gray)
                                .cornerRadius(4)
                        } else if streakStatus.isSecure && displayCount > 0 {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 12))
                                .foregroundStyle(.green)
                        }
                    }

                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        Text("\(displayCount)")
                            .font(.system(size: 32, weight: .bold))
                            .foregroundStyle(streakNumberColor)

                        Text(displayCount == 1 ? "day" : "days")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }

                    // Status message
                    Text(streakStatusMessage(isNewRecord: isNewRecord))
                        .font(.caption)
                        .foregroundStyle(streakMessageColor)
                        .lineLimit(2)
                        .fixedSize(horizontal: false, vertical: true)

                    // Phase 06.3: Restore streak button when broken
                    if canRestore {
                        Button {
                            showStreakFreeze = true
                        } label: {
                            HStack(spacing: 4) {
                                Image(systemName: "arrow.counterclockwise")
                                    .font(.caption)
                                Text("Restore Streak")
                                    .font(.caption)
                                    .fontWeight(.medium)
                            }
                            .foregroundStyle(.accentColor)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.accentColor.opacity(0.15))
                            .cornerRadius(8)
                        }
                        .accessibilityLabel("Restore streak")
                        .accessibilityHint("Spend points to restore your previous streak")
                        .padding(.top, 4)
                    }
                }

                Spacer()

                // Streak icon with status-based styling
                streakIcon
            }
        }
        .padding()
        .background(streakBackgroundColor.opacity(0.12))
        .cornerRadius(12)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(streakAccessibilityLabel)
    }

    /// Icon for the streak section based on status
    private var streakIcon: some View {
        ZStack {
            switch streakStatus {
            case .active(let days) where days >= 7:
                Image(systemName: "flame.fill")
                    .font(.system(size: 40))
                    .foregroundStyle(.red)
            case .active(let days) where days >= 3:
                Image(systemName: "flame.fill")
                    .font(.system(size: 36))
                    .foregroundStyle(.orange)
            case .active:
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 32))
                    .foregroundStyle(.green)
            case .atRisk(let days) where days >= 3:
                Image(systemName: "flame.fill")
                    .font(.system(size: 36))
                    .foregroundStyle(.orange)
                    .overlay(
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.system(size: 14))
                            .foregroundStyle(.white)
                            .background(Circle().fill(Color.orange).frame(width: 18, height: 18))
                            .offset(x: 14, y: 14)
                    )
            case .atRisk:
                Image(systemName: "flame.fill")
                    .font(.title)
                    .foregroundStyle(.orange)
            case .broken:
                Image(systemName: "arrow.counterclockwise.circle.fill")
                    .font(.system(size: 32))
                    .foregroundStyle(.gray)
            case .none:
                Image(systemName: "sparkles")
                    .font(.system(size: 32))
                    .foregroundStyle(.blue)
            }
        }
    }

    /// Background color based on streak status
    private var streakBackgroundColor: Color {
        switch streakStatus {
        case .active(let days) where days >= 7:
            return .red
        case .active(let days) where days >= 3:
            return .orange
        case .active:
            return .green
        case .atRisk:
            return .orange
        case .broken, .none:
            return .gray
        }
    }

    /// Number color based on streak status
    private var streakNumberColor: Color {
        switch streakStatus {
        case .active(let days) where days >= 7:
            return .red
        case .active:
            return .primary
        case .atRisk:
            return .orange
        case .broken, .none:
            return .secondary
        }
    }

    /// Message color based on streak status
    private var streakMessageColor: Color {
        switch streakStatus {
        case .active:
            return .green
        case .atRisk:
            return .orange
        case .broken, .none:
            return .secondary
        }
    }

    /// Generate streak status message
    private func streakStatusMessage(isNewRecord: Bool) -> String {
        let totalWorkouts = userStats?.totalWorkoutsCompleted ?? 0

        switch streakStatus {
        case .active(let days):
            if isNewRecord && days >= 3 {
                return "New personal best!"
            } else if days >= 7 {
                return "You're unstoppable!"
            } else if days >= 3 {
                return "Keep it going!"
            } else {
                return "Streak secured for today!"
            }
        case .atRisk(let days):
            if days == 0 {
                return "Start your streak today!"
            } else {
                return "Check in to keep your streak going!"
            }
        case .broken(let previous):
            if previous > 0 {
                return "Don't worry! Every day is a fresh start."
            } else if totalWorkouts > 0 {
                return "Ready to start fresh?"
            } else {
                return "Every journey starts here!"
            }
        case .none:
            return "Start your journey today!"
        }
    }

    /// Accessibility label for streak section
    private var streakAccessibilityLabel: String {
        let displayCount = streakStatus.displayCount

        switch streakStatus {
        case .active:
            return "Current streak: \(displayCount) days. Streak secured for today."
        case .atRisk(let days):
            if days > 0 {
                return "Current streak: \(days) days. At risk! Check in to maintain your streak."
            } else {
                return "No streak yet. Check in to start your streak!"
            }
        case .broken(let previous):
            if previous > 0 {
                return "Streak reset. Your previous streak was \(previous) days. Don't worry, every day is a fresh start!"
            } else {
                return "Ready to start your streak!"
            }
        case .none:
            return "Start your streak today!"
        }
    }

    // MARK: - Data Loading

    private func loadContent() {
        viewState = .loading

        Task {
            // Load user stats if we have a logged-in user
            if let userId = authViewModel.currentUser?.id {
                // Phase 06.2: Validate streak status first (this may update streak if broken)
                streakStatus = await activityService.validateStreak(userId: userId)

                // Refresh hamster state based on current activity
                _ = await activityService.refreshHamsterState(userId: userId)

                // Get updated stats
                userStats = await activityService.getUserStats(userId: userId)

                // Phase 07.3: Load equipped items for display
                equippedItems = await shopService.getEquippedItems(userId: userId)

                // Phase 07.4: Load growth stage and check for pending celebration
                currentGrowthStage = await activityService.getCurrentGrowthStage(userId: userId)
                if let milestone = await activityService.getPendingGrowthCelebration(userId: userId) {
                    await MainActor.run {
                        pendingGrowthMilestone = milestone
                        showGrowthCelebration = true
                    }
                }

                // Phase 06.3: Auto-show streak freeze prompt if streak is broken
                // Only show once per session to avoid being annoying
                // (only show if growth celebration isn't showing)
                if case .broken(let previousStreak) = streakStatus,
                   previousStreak > 0,
                   !hasShownStreakFreezeThisSession,
                   pendingGrowthMilestone == nil {
                    await MainActor.run {
                        hasShownStreakFreezeThisSession = true
                        showStreakFreeze = true
                    }
                }
            }

            // Short delay for smooth transition
            try? await Task.sleep(nanoseconds: 300_000_000)

            await MainActor.run {
                viewState = .content
            }
        }
    }

    /// Hamster-voiced error message for the Home screen
    static let homeErrorMessage = "I wandered off for a second! Let's try that again."
}

#Preview("Home") {
    HomeView()
        .environmentObject(AuthViewModel())
}

#Preview("Empty State") {
    NavigationStack {
        EmptyStateView(
            icon: "pawprint.fill",
            title: "Hi, I'm your hamster!",
            message: "I just woke up and I'm so excited to meet you. Let's get started together!",
            actionTitle: "Let's Go!",
            action: { }
        )
        .navigationTitle("Home")
    }
}

#Preview("Error State") {
    NavigationStack {
        ErrorView(
            message: HomeView.homeErrorMessage,
            retryAction: { }
        )
        .navigationTitle("Home")
    }
}
