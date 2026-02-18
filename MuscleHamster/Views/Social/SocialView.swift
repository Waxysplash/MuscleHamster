//
//  SocialView.swift
//  MuscleHamster
//
//  Social tab - Friends list and social features
//  Phase 09.2: Add Friends entry point, friends list, pending requests
//  Phase 09.3: Enhanced friend profile view, at-risk indicators, remove/block
//

import SwiftUI

// MARK: - Social View Model

@MainActor
class SocialViewModel: ObservableObject {
    @Published var friends: [FriendProfile] = []
    @Published var pendingRequestCount: Int = 0
    @Published var viewState: ViewState = .loading
    @Published var friendStreaks: [FriendStreak] = []

    var userId: String = ""

    func loadContent() async {
        viewState = .loading

        do {
            // Load friends list
            friends = try await MockFriendService.shared.getFriends(userId: userId)

            // Load pending request count for badge
            pendingRequestCount = await MockFriendService.shared.getPendingRequestCount(userId: userId)

            // Load friend streaks
            friendStreaks = await MockFriendService.shared.getAllFriendStreaks(userId: userId)

            // Determine view state
            if friends.isEmpty {
                viewState = .empty
            } else {
                viewState = .content
            }
        } catch {
            viewState = .error("Couldn't load your friends. Let's try again!")
        }
    }

    func refresh() async {
        await loadContent()
    }
}

// MARK: - Social View

struct SocialView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @StateObject private var viewModel = SocialViewModel()
    @State private var showAddFriends = false
    @State private var showPendingRequests = false

    var body: some View {
        NavigationStack {
            Group {
                switch viewModel.viewState {
                case .loading:
                    LoadingView(message: "Loading friends...")

                case .empty:
                    emptyStateContent

                case .error(let message):
                    ErrorView(
                        message: message,
                        retryAction: {
                            Task {
                                await viewModel.refresh()
                            }
                        }
                    )

                case .content:
                    friendsListContent
                }
            }
            .navigationTitle("Social")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    addFriendsButton
                }
            }
            .sheet(isPresented: $showAddFriends) {
                AddFriendsView()
            }
            .sheet(isPresented: $showPendingRequests) {
                PendingRequestsView(userId: authViewModel.currentUser?.id ?? "")
            }
            .refreshable {
                await viewModel.refresh()
            }
            .task {
                viewModel.userId = authViewModel.currentUser?.id ?? ""
                await viewModel.loadContent()
            }
            .onChange(of: showAddFriends) { isPresented in
                if !isPresented {
                    // Refresh when returning from Add Friends
                    Task {
                        await viewModel.refresh()
                    }
                }
            }
        }
    }

    // MARK: - Add Friends Button

    private var addFriendsButton: some View {
        Button {
            showAddFriends = true
        } label: {
            ZStack(alignment: .topTrailing) {
                Image(systemName: "person.badge.plus")
                    .font(.title3)

                // Pending requests badge
                if viewModel.pendingRequestCount > 0 {
                    Text("\(viewModel.pendingRequestCount)")
                        .font(.caption2)
                        .fontWeight(.bold)
                        .foregroundStyle(.white)
                        .padding(4)
                        .background(Color.red)
                        .clipShape(Circle())
                        .offset(x: 8, y: -8)
                }
            }
        }
        .accessibilityLabel("Add friends")
        .accessibilityHint(viewModel.pendingRequestCount > 0
            ? "You have \(viewModel.pendingRequestCount) pending friend requests"
            : "Search for and add new friends")
    }

    // MARK: - Empty State

    private var emptyStateContent: some View {
        VStack(spacing: 24) {
            Spacer()

            // Illustration
            ZStack {
                Circle()
                    .fill(Color.accentColor.opacity(0.1))
                    .frame(width: 120, height: 120)

                Image(systemName: "person.2.fill")
                    .font(.system(size: 50))
                    .foregroundStyle(.accentColor)
            }

            // Text
            VStack(spacing: 12) {
                Text("No friends yet!")
                    .font(.title2)
                    .fontWeight(.bold)

                Text("Add friends to share your progress, build streaks together, and cheer each other on!")
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            Spacer()

            // CTA Button
            Button {
                showAddFriends = true
            } label: {
                HStack {
                    Image(systemName: "person.badge.plus")
                    Text("Find Friends")
                }
                .font(.headline)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.accentColor)
                .cornerRadius(14)
            }
            .padding(.horizontal, 40)

            // Pending requests link (if any)
            if viewModel.pendingRequestCount > 0 {
                Button {
                    showPendingRequests = true
                } label: {
                    HStack {
                        Image(systemName: "envelope.badge")
                        Text("\(viewModel.pendingRequestCount) pending request\(viewModel.pendingRequestCount == 1 ? "" : "s")")
                    }
                    .font(.subheadline)
                    .foregroundStyle(.accentColor)
                }
                .padding(.top, 8)
            }

            Spacer()
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("No friends yet. Add friends to share your progress and build streaks together.")
    }

    // MARK: - Friends List

    private var friendsListContent: some View {
        List {
            // Pending requests section (if any)
            if viewModel.pendingRequestCount > 0 {
                Section {
                    Button {
                        showPendingRequests = true
                    } label: {
                        HStack {
                            ZStack {
                                Circle()
                                    .fill(Color.orange.opacity(0.15))
                                    .frame(width: 44, height: 44)

                                Image(systemName: "envelope.badge")
                                    .font(.title3)
                                    .foregroundStyle(.orange)
                            }

                            VStack(alignment: .leading, spacing: 2) {
                                Text("Friend Requests")
                                    .font(.body)
                                    .fontWeight(.medium)
                                    .foregroundStyle(.primary)

                                Text("\(viewModel.pendingRequestCount) pending")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundStyle(.tertiary)
                        }
                    }
                }
            }

            // Friends with active streaks
            let friendsWithStreaks = viewModel.friends.filter { $0.friendStreak?.currentStreak ?? 0 > 0 }
            if !friendsWithStreaks.isEmpty {
                Section {
                    ForEach(friendsWithStreaks) { friend in
                        NavigationLink(destination: FriendProfileView(profile: friend, currentUserId: viewModel.userId)) {
                            friendRow(friend)
                        }
                    }
                } header: {
                    HStack {
                        Image(systemName: "flame.fill")
                            .foregroundStyle(.orange)
                        Text("Active Streaks")
                    }
                }
            }

            // All friends (without active friend streaks)
            let friendsWithoutStreaks = viewModel.friends.filter { $0.friendStreak?.currentStreak ?? 0 == 0 }
            if !friendsWithoutStreaks.isEmpty {
                Section {
                    ForEach(friendsWithoutStreaks) { friend in
                        NavigationLink(destination: FriendProfileView(profile: friend, currentUserId: viewModel.userId)) {
                            friendRow(friend)
                        }
                    }
                } header: {
                    Text("Friends (\(viewModel.friends.count))")
                }
            }
        }
        .listStyle(.insetGrouped)
    }

    private func friendRow(_ friend: FriendProfile) -> some View {
        HStack(spacing: 12) {
            // Avatar
            ZStack {
                Circle()
                    .fill(hamsterStateColor(friend.hamsterState).opacity(0.2))
                    .frame(width: 44, height: 44)

                Image(systemName: friend.growthStage.icon)
                    .font(.title3)
                    .foregroundStyle(hamsterStateColor(friend.hamsterState))
            }

            // Info
            VStack(alignment: .leading, spacing: 2) {
                Text(friend.displayName)
                    .font(.body)
                    .fontWeight(.medium)

                HStack(spacing: 8) {
                    // Personal streak
                    if friend.currentStreak > 0 {
                        HStack(spacing: 2) {
                            Image(systemName: "flame")
                                .font(.caption2)
                            Text("\(friend.currentStreak)")
                                .font(.caption)
                        }
                        .foregroundStyle(.orange)
                    }

                    // Friend streak with at-risk indicator
                    if let streak = friend.friendStreak, streak.currentStreak > 0 {
                        friendStreakBadge(streak: streak)
                    }

                    // Hamster state
                    Text(friend.hamsterState.displayName)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(friendRowAccessibilityLabel(friend))
    }

    private func friendStreakBadge(streak: FriendStreak) -> some View {
        HStack(spacing: 2) {
            // Icon with at-risk indicator
            ZStack {
                Image(systemName: "person.2")
                    .font(.caption2)

                // At-risk warning overlay
                if streak.status == .atRisk {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 6))
                        .foregroundStyle(.yellow)
                        .offset(x: 6, y: -4)
                }
            }

            Text("\(streak.currentStreak)")
                .font(.caption)
        }
        .foregroundStyle(streak.status == .atRisk ? .orange : .purple)
        .padding(.horizontal, 6)
        .padding(.vertical, 2)
        .background(
            RoundedRectangle(cornerRadius: 6)
                .fill(streak.status == .atRisk ? Color.orange.opacity(0.15) : Color.purple.opacity(0.1))
        )
    }

    private func friendRowAccessibilityLabel(_ friend: FriendProfile) -> String {
        var label = "\(friend.displayName), hamster is \(friend.hamsterState.displayName)"

        if friend.currentStreak > 0 {
            label += ", \(friend.currentStreak) day personal streak"
        }

        if let streak = friend.friendStreak, streak.currentStreak > 0 {
            label += ", \(streak.currentStreak) day friend streak"
            if streak.status == .atRisk {
                label += " at risk"
            }
        }

        return label
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
}

// MARK: - Pending Requests View

/// A request with sender profile info attached
struct RequestWithSender: Identifiable {
    let request: FriendRequest
    let senderProfile: FriendProfile?

    var id: String { request.id }

    var displayName: String {
        senderProfile?.displayName ?? "Someone"
    }

    var hamsterName: String? {
        senderProfile?.hamsterName
    }

    var hamsterState: HamsterState {
        senderProfile?.hamsterState ?? .chillin
    }

    var growthStage: GrowthStage {
        senderProfile?.growthStage ?? .baby
    }
}

struct PendingRequestsView: View {
    let userId: String

    @Environment(\.dismiss) private var dismiss
    @State private var requestsWithSenders: [RequestWithSender] = []
    @State private var isLoading = true
    @State private var processingIds: Set<String> = []
    @State private var selectedTab: RequestTab = .incoming
    @State private var outgoingRequests: [FriendRequest] = []

    enum RequestTab: String, CaseIterable {
        case incoming = "Incoming"
        case outgoing = "Sent"
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Tab picker
                Picker("Request Type", selection: $selectedTab) {
                    ForEach(RequestTab.allCases, id: \.self) { tab in
                        Text(tab.rawValue).tag(tab)
                    }
                }
                .pickerStyle(.segmented)
                .padding()

                // Content
                Group {
                    if isLoading {
                        LoadingView(message: "Loading requests...")
                    } else {
                        switch selectedTab {
                        case .incoming:
                            if requestsWithSenders.isEmpty {
                                incomingEmptyState
                            } else {
                                incomingRequestsList
                            }
                        case .outgoing:
                            if outgoingRequests.isEmpty {
                                outgoingEmptyState
                            } else {
                                outgoingRequestsList
                            }
                        }
                    }
                }
            }
            .navigationTitle("Friend Requests")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .task {
                await loadRequests()
            }
        }
    }

    // MARK: - Incoming Requests

    private var incomingEmptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "envelope.open")
                .font(.system(size: 50))
                .foregroundStyle(.secondary)

            Text("No pending requests")
                .font(.headline)

            Text("Your hamster is patient!")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var incomingRequestsList: some View {
        List(requestsWithSenders) { item in
            HStack(spacing: 12) {
                // Avatar with sender's hamster state
                ZStack {
                    Circle()
                        .fill(hamsterStateColor(item.hamsterState).opacity(0.2))
                        .frame(width: 50, height: 50)

                    Image(systemName: item.growthStage.icon)
                        .font(.title3)
                        .foregroundStyle(hamsterStateColor(item.hamsterState))
                }

                // Sender info
                VStack(alignment: .leading, spacing: 4) {
                    Text(item.displayName)
                        .font(.body)
                        .fontWeight(.medium)

                    if let hamsterName = item.hamsterName {
                        Text("🐹 \(hamsterName)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Text(item.request.displaySentDate)
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }

                Spacer()

                // Actions
                if processingIds.contains(item.request.id) {
                    ProgressView()
                } else {
                    HStack(spacing: 8) {
                        // Decline
                        Button {
                            declineRequest(item.request)
                        } label: {
                            Image(systemName: "xmark")
                                .font(.body)
                                .foregroundStyle(.secondary)
                                .frame(width: 36, height: 36)
                                .background(Color(.systemGray5))
                                .clipShape(Circle())
                        }
                        .accessibilityLabel("Decline request from \(item.displayName)")

                        // Accept
                        Button {
                            acceptRequest(item.request)
                        } label: {
                            Image(systemName: "checkmark")
                                .font(.body)
                                .foregroundStyle(.white)
                                .frame(width: 36, height: 36)
                                .background(Color.green)
                                .clipShape(Circle())
                        }
                        .accessibilityLabel("Accept request from \(item.displayName)")
                    }
                }
            }
            .padding(.vertical, 4)
            .accessibilityElement(children: .combine)
        }
        .listStyle(.plain)
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

    // MARK: - Outgoing Requests

    private var outgoingEmptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "paperplane")
                .font(.system(size: 50))
                .foregroundStyle(.secondary)

            Text("No sent requests")
                .font(.headline)

            Text("Friend requests you send will appear here.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var outgoingRequestsList: some View {
        List(outgoingRequests) { request in
            HStack(spacing: 12) {
                // Avatar placeholder
                ZStack {
                    Circle()
                        .fill(Color.accentColor.opacity(0.15))
                        .frame(width: 50, height: 50)

                    Image(systemName: "person.fill")
                        .font(.title3)
                        .foregroundStyle(.accentColor)
                }

                // Info
                VStack(alignment: .leading, spacing: 4) {
                    Text("Pending")
                        .font(.body)
                        .fontWeight(.medium)

                    Text("Sent \(request.displaySentDate)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                // Cancel button
                if processingIds.contains(request.id) {
                    ProgressView()
                } else {
                    Button {
                        cancelRequest(request)
                    } label: {
                        Text("Cancel")
                            .font(.subheadline)
                            .foregroundStyle(.red)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.red.opacity(0.1))
                            .cornerRadius(8)
                    }
                    .accessibilityLabel("Cancel sent request")
                }
            }
            .padding(.vertical, 4)
        }
        .listStyle(.plain)
    }

    // MARK: - Data Loading

    private func loadRequests() async {
        isLoading = true

        // Load incoming requests with sender profiles
        do {
            let incomingRequests = try await MockFriendService.shared.getPendingIncomingRequests(userId: userId)

            var requestsWithProfiles: [RequestWithSender] = []
            for request in incomingRequests {
                // Try to get sender's profile
                let senderProfile = try? await MockFriendService.shared.getFriendProfile(
                    friendId: request.senderId,
                    viewingUserId: userId
                )
                requestsWithProfiles.append(RequestWithSender(
                    request: request,
                    senderProfile: senderProfile
                ))
            }
            requestsWithSenders = requestsWithProfiles
        } catch {
            // Silent fail for incoming
        }

        // Load outgoing requests
        do {
            outgoingRequests = try await MockFriendService.shared.getPendingOutgoingRequests(userId: userId)
        } catch {
            // Silent fail for outgoing
        }

        isLoading = false
    }

    private func acceptRequest(_ request: FriendRequest) {
        processingIds.insert(request.id)

        Task {
            do {
                _ = try await MockFriendService.shared.acceptFriendRequest(
                    requestId: request.id,
                    userId: userId
                )
                requestsWithSenders.removeAll { $0.request.id == request.id }
            } catch {
                // Handle error
            }
            processingIds.remove(request.id)
        }
    }

    private func declineRequest(_ request: FriendRequest) {
        processingIds.insert(request.id)

        Task {
            do {
                try await MockFriendService.shared.declineFriendRequest(
                    requestId: request.id,
                    userId: userId
                )
                requestsWithSenders.removeAll { $0.request.id == request.id }
            } catch {
                // Handle error
            }
            processingIds.remove(request.id)
        }
    }

    private func cancelRequest(_ request: FriendRequest) {
        processingIds.insert(request.id)

        Task {
            do {
                try await MockFriendService.shared.cancelFriendRequest(
                    requestId: request.id,
                    userId: userId
                )
                outgoingRequests.removeAll { $0.id == request.id }
            } catch {
                // Handle error
            }
            processingIds.remove(request.id)
        }
    }
}

// MARK: - Friend Profile View

struct FriendProfileView: View {
    let profile: FriendProfile
    let currentUserId: String

    @Environment(\.dismiss) private var dismiss
    @State private var showRemoveConfirmation = false
    @State private var showBlockConfirmation = false
    @State private var isRemoving = false
    @State private var isBlocking = false
    @State private var errorMessage: String?
    @State private var showError = false
    @State private var showStreakDetail = false
    @State private var nudgeEligibility: NudgeEligibility = .senderNotCheckedIn
    @State private var isNudging = false
    @State private var showNudgeSent = false
    @State private var nudgeConfirmationMessage = ""

    init(profile: FriendProfile, currentUserId: String = "") {
        self.profile = profile
        self.currentUserId = currentUserId
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Read-only banner
                readOnlyBanner

                // Hamster header
                hamsterHeaderSection

                // Stats section
                statsSection

                // Friend streak section
                friendStreakSection

                // Nudge section
                nudgeSection

                // Customization preview
                customizationPreviewSection

                Spacer(minLength: 40)
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("\(profile.displayName)'s Hamster")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                actionsMenu
            }
        }
        .confirmationDialog(
            "Remove Friend",
            isPresented: $showRemoveConfirmation,
            titleVisibility: .visible
        ) {
            Button("Remove \(profile.displayName)", role: .destructive) {
                removeFriend()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("You'll no longer be able to see each other's progress or build friend streaks together.")
        }
        .confirmationDialog(
            "Block \(profile.displayName)?",
            isPresented: $showBlockConfirmation,
            titleVisibility: .visible
        ) {
            Button("Block", role: .destructive) {
                blockUser()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("They won't be able to see your profile, send requests, or interact with you. You can unblock them later in Privacy settings.")
        }
        .alert("Oops!", isPresented: $showError) {
            Button("OK") {}
        } message: {
            Text(errorMessage ?? "Something went wrong. Please try again.")
        }
        .overlay {
            if isRemoving || isBlocking || isNudging {
                Color.black.opacity(0.3)
                    .ignoresSafeArea()
                    .overlay {
                        VStack(spacing: 12) {
                            ProgressView()
                            Text(loadingMessage)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        .padding(24)
                        .background(.regularMaterial)
                        .cornerRadius(16)
                    }
            }
        }
        .overlay {
            if showNudgeSent {
                nudgeSentOverlay
            }
        }
        .task {
            await loadNudgeEligibility()
        }
    }

    private var loadingMessage: String {
        if isRemoving { return "Removing friend..." }
        if isBlocking { return "Blocking user..." }
        if isNudging { return "Sending encouragement..." }
        return ""
    }

    // MARK: - Read-Only Banner

    private var readOnlyBanner: some View {
        HStack(spacing: 8) {
            Image(systemName: "eye.fill")
                .foregroundStyle(.secondary)
            Text("You're viewing \(profile.displayName)'s profile")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color(.systemGray5))
        .cornerRadius(20)
        .accessibilityLabel("Viewing \(profile.displayName)'s profile. This is read-only.")
    }

    // MARK: - Hamster Header

    private var hamsterHeaderSection: some View {
        VStack(spacing: 16) {
            // Large hamster avatar
            ZStack {
                Circle()
                    .fill(hamsterStateColor.opacity(0.2))
                    .frame(width: 120, height: 120)

                Image(systemName: profile.growthStage.icon)
                    .font(.system(size: 50))
                    .foregroundStyle(hamsterStateColor)

                // Accessory indicator
                if profile.equippedAccessoryId != nil {
                    Circle()
                        .fill(.yellow)
                        .frame(width: 28, height: 28)
                        .overlay(
                            Image(systemName: "sparkle")
                                .font(.system(size: 14))
                                .foregroundStyle(.white)
                        )
                        .offset(x: 45, y: -45)
                }
            }
            .accessibilityLabel("\(profile.displayName)'s hamster, \(profile.growthStage.displayName) stage, looking \(profile.hamsterState.displayName)")

            // Name and hamster name
            VStack(spacing: 6) {
                Text(profile.displayName)
                    .font(.title2)
                    .fontWeight(.bold)

                if let hamsterName = profile.hamsterName, !hamsterName.isEmpty {
                    Text("🐹 \(hamsterName)")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }

            // Status badges
            HStack(spacing: 12) {
                // Hamster state badge
                HStack(spacing: 4) {
                    Image(systemName: profile.hamsterState.icon)
                        .font(.caption)
                    Text(profile.hamsterState.displayName)
                        .font(.caption)
                        .fontWeight(.medium)
                }
                .foregroundStyle(hamsterStateColor)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(hamsterStateColor.opacity(0.15))
                .cornerRadius(12)

                // Growth stage badge
                HStack(spacing: 4) {
                    Image(systemName: profile.growthStage.icon)
                        .font(.caption)
                    Text(profile.growthStage.displayName)
                        .font(.caption)
                        .fontWeight(.medium)
                }
                .foregroundStyle(.purple)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Color.purple.opacity(0.15))
                .cornerRadius(12)
            }
        }
        .padding(.top, 8)
    }

    private var hamsterStateColor: Color {
        switch profile.hamsterState {
        case .hungry: return .orange
        case .chillin: return .blue
        case .happy: return .green
        case .excited: return .yellow
        case .proud: return .purple
        }
    }

    // MARK: - Stats Section

    private var statsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Stats")
                .font(.headline)
                .padding(.horizontal, 4)

            // First row: streaks
            HStack(spacing: 16) {
                statCard(
                    value: "\(profile.currentStreak)",
                    label: "Current Streak",
                    icon: "flame.fill",
                    color: .orange
                )

                statCard(
                    value: "\(profile.longestStreak)",
                    label: "Best Streak",
                    icon: "trophy.fill",
                    color: .yellow
                )
            }

            // Second row: workouts and member since
            HStack(spacing: 16) {
                statCard(
                    value: "\(profile.totalWorkoutsCompleted)",
                    label: "Workouts",
                    icon: "figure.run",
                    color: .green
                )

                if let memberSince = profile.memberSince {
                    statCard(
                        value: memberSinceText(memberSince),
                        label: "Member",
                        icon: "calendar",
                        color: .blue
                    )
                }
            }
        }
    }

    private func memberSinceText(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }

    private func statCard(value: String, label: String, icon: String, color: Color) -> some View {
        VStack(spacing: 8) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .foregroundStyle(color)
                Text(value)
                    .font(.title)
                    .fontWeight(.bold)
            }

            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(label): \(value)")
    }

    // MARK: - Friend Streak Section

    @ViewBuilder
    private var friendStreakSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Your Streak Together")
                .font(.headline)
                .padding(.horizontal, 4)

            if let streak = profile.friendStreak {
                Button {
                    showStreakDetail = true
                } label: {
                    friendStreakCard(streak: streak)
                }
                .buttonStyle(.plain)
                .accessibilityHint("Tap to view streak details and manage")
            } else {
                Button {
                    showStreakDetail = true
                } label: {
                    noStreakCard
                }
                .buttonStyle(.plain)
                .accessibilityHint("Tap to view streak details")
            }
        }
        .sheet(isPresented: $showStreakDetail) {
            FriendStreakDetailView(
                friendProfile: profile,
                currentUserId: currentUserId
            )
        }
    }

    private func friendStreakCard(streak: FriendStreak) -> some View {
        VStack(spacing: 16) {
            // Streak count and status
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 8) {
                        Image(systemName: streak.status.icon)
                            .font(.title2)
                            .foregroundStyle(streakStatusColor(streak.status))

                        Text("\(streak.currentStreak)")
                            .font(.system(size: 36, weight: .bold, design: .rounded))
                            .foregroundStyle(streakStatusColor(streak.status))

                        Text(streak.currentStreak == 1 ? "day" : "days")
                            .font(.headline)
                            .foregroundStyle(.secondary)
                    }

                    // Status badge
                    Text(streak.status.displayName)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundStyle(streakStatusColor(streak.status))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(streakStatusColor(streak.status).opacity(0.15))
                        .cornerRadius(8)
                }

                Spacer()

                // Best together and chevron
                VStack(alignment: .trailing, spacing: 4) {
                    if streak.longestStreak > 0 {
                        Text("Best Together")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                        Text("\(streak.longestStreak) days")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                    }

                    // View details indicator
                    HStack(spacing: 4) {
                        Text("Details")
                            .font(.caption)
                        Image(systemName: "chevron.right")
                            .font(.caption2)
                    }
                    .foregroundStyle(.accentColor)
                    .padding(.top, 4)
                }
            }

            Divider()

            // Check-in status for today
            checkInStatusView(streak: streak)

            // Status message
            Text(friendStreakStatusMessage(streak: streak))
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)

            // Restore prompt for broken streaks
            if streak.status == .broken && streak.previousBrokenStreak > 0 {
                HStack {
                    Image(systemName: "arrow.counterclockwise")
                        .font(.caption)
                    Text("Tap to restore your streak")
                        .font(.caption)
                }
                .foregroundStyle(.accentColor)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.accentColor.opacity(0.1))
                .cornerRadius(8)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Friend streak with \(profile.displayName): \(streak.currentStreak) days. \(friendStreakStatusMessage(streak: streak)). Tap for details.")
    }

    private func checkInStatusView(streak: FriendStreak) -> some View {
        HStack(spacing: 24) {
            // Your check-in status
            VStack(spacing: 6) {
                checkInIcon(hasCheckedIn: streak.hasCheckedInToday(userId: currentUserId))
                Text("You")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            // Connection indicator
            Image(systemName: "heart.fill")
                .font(.caption)
                .foregroundStyle(streak.bothCheckedInToday ? .pink : .gray.opacity(0.3))

            // Friend's check-in status
            VStack(spacing: 6) {
                let friendId = streak.otherUserId(from: currentUserId) ?? ""
                checkInIcon(hasCheckedIn: streak.hasCheckedInToday(userId: friendId))
                Text(profile.displayName)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
        }
        .padding(.vertical, 8)
    }

    private func checkInIcon(hasCheckedIn: Bool) -> some View {
        ZStack {
            Circle()
                .fill(hasCheckedIn ? Color.green.opacity(0.15) : Color.gray.opacity(0.1))
                .frame(width: 44, height: 44)

            Image(systemName: hasCheckedIn ? "checkmark.circle.fill" : "clock")
                .font(.title2)
                .foregroundStyle(hasCheckedIn ? .green : .gray)
        }
    }

    private func friendStreakStatusMessage(streak: FriendStreak) -> String {
        let friendName = profile.displayName
        let friendId = streak.otherUserId(from: currentUserId) ?? ""
        let youCheckedIn = streak.hasCheckedInToday(userId: currentUserId)
        let friendCheckedIn = streak.hasCheckedInToday(userId: friendId)

        switch streak.status {
        case .active:
            if streak.currentStreak >= 7 {
                return "You two are unstoppable! 🔥"
            }
            return "You both crushed it today! 🎉"

        case .waiting:
            if youCheckedIn && !friendCheckedIn {
                return "You're in! Waiting for \(friendName)..."
            } else if !youCheckedIn && friendCheckedIn {
                return "\(friendName) checked in! Your turn!"
            }
            return "Keep it going!"

        case .atRisk:
            if !youCheckedIn {
                return "Check in today to save your streak!"
            }
            return "Waiting for \(friendName) to check in..."

        case .broken:
            if streak.previousBrokenStreak > 0 {
                return "Your \(streak.previousBrokenStreak)-day streak ended. Start fresh together?"
            }
            return "Ready to start a new streak together?"

        case .none:
            return "Check in together to start your first streak!"
        }
    }

    private func streakStatusColor(_ status: FriendStreakStatus) -> Color {
        switch status {
        case .active: return .orange
        case .waiting: return .blue
        case .atRisk: return .yellow
        case .broken: return .gray
        case .none: return .purple
        }
    }

    private var noStreakCard: some View {
        VStack(spacing: 12) {
            Image(systemName: "sparkles")
                .font(.largeTitle)
                .foregroundStyle(.purple.opacity(0.6))

            Text("No streak yet!")
                .font(.headline)

            Text("Check in on the same day to start building a streak together.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }

    // MARK: - Customization Preview

    @ViewBuilder
    private var customizationPreviewSection: some View {
        if profile.equippedOutfitId != nil || profile.equippedAccessoryId != nil {
            VStack(alignment: .leading, spacing: 12) {
                Text("Wearing")
                    .font(.headline)
                    .padding(.horizontal, 4)

                HStack(spacing: 12) {
                    if profile.equippedOutfitId != nil {
                        customizationBadge(
                            icon: "tshirt.fill",
                            label: "Outfit",
                            color: .purple
                        )
                    }

                    if profile.equippedAccessoryId != nil {
                        customizationBadge(
                            icon: "sparkle",
                            label: "Accessory",
                            color: .yellow
                        )
                    }
                }
            }
        }
    }

    private func customizationBadge(icon: String, label: String, color: Color) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundStyle(color)
            Text(label)
                .font(.subheadline)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }

    // MARK: - Nudge Section

    @ViewBuilder
    private var nudgeSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Send Encouragement")
                .font(.headline)
                .padding(.horizontal, 4)

            nudgeCard
        }
    }

    private var nudgeCard: some View {
        VStack(spacing: 16) {
            // Nudge status and button
            HStack(spacing: 16) {
                // Icon
                ZStack {
                    Circle()
                        .fill(nudgeIconBackground)
                        .frame(width: 48, height: 48)

                    Image(systemName: nudgeEligibility.icon)
                        .font(.title2)
                        .foregroundStyle(nudgeIconColor)
                }

                // Message
                VStack(alignment: .leading, spacing: 4) {
                    Text(nudgeTitle)
                        .font(.subheadline)
                        .fontWeight(.medium)

                    Text(nudgeEligibility.displayMessage)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                // Nudge button
                if nudgeEligibility.canSend {
                    Button {
                        Task { await sendNudge() }
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: "hand.wave.fill")
                            Text("Nudge")
                        }
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(Color.accentColor)
                        .cornerRadius(20)
                    }
                    .disabled(isNudging)
                    .accessibilityLabel("Nudge \(profile.displayName)")
                    .accessibilityHint("Send a friendly encouragement to your friend")
                }
            }

            // Additional context for non-eligible states
            if case .senderNotCheckedIn = nudgeEligibility {
                HStack(spacing: 8) {
                    Image(systemName: "info.circle")
                        .font(.caption)
                    Text("Complete your check-in first to encourage friends!")
                        .font(.caption)
                }
                .foregroundStyle(.orange)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.orange.opacity(0.1))
                .cornerRadius(8)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(nudgeAccessibilityLabel)
    }

    private var nudgeTitle: String {
        switch nudgeEligibility {
        case .canNudge:
            return "\(profile.displayName) hasn't checked in yet"
        case .recipientAlreadyCheckedIn:
            return "\(profile.displayName) already checked in!"
        case .senderNotCheckedIn:
            return "Check in first to nudge"
        case .cooldownActive:
            return "Recently nudged"
        case .dailyLimitReached:
            return "You're an encouraging friend!"
        default:
            return "Nudge unavailable"
        }
    }

    private var nudgeIconBackground: Color {
        switch nudgeEligibility {
        case .canNudge: return Color.accentColor.opacity(0.15)
        case .recipientAlreadyCheckedIn: return Color.green.opacity(0.15)
        case .senderNotCheckedIn: return Color.orange.opacity(0.15)
        case .cooldownActive: return Color.gray.opacity(0.15)
        case .dailyLimitReached: return Color.pink.opacity(0.15)
        default: return Color.gray.opacity(0.15)
        }
    }

    private var nudgeIconColor: Color {
        switch nudgeEligibility {
        case .canNudge: return .accentColor
        case .recipientAlreadyCheckedIn: return .green
        case .senderNotCheckedIn: return .orange
        case .cooldownActive: return .gray
        case .dailyLimitReached: return .pink
        default: return .gray
        }
    }

    private var nudgeAccessibilityLabel: String {
        switch nudgeEligibility {
        case .canNudge:
            return "Send encouragement to \(profile.displayName). They haven't checked in yet today. Double tap to nudge."
        case .recipientAlreadyCheckedIn:
            return "\(profile.displayName) already checked in today. No nudge needed."
        case .senderNotCheckedIn:
            return "Check in first to send encouragement to friends."
        case .cooldownActive(let remaining):
            let minutes = Int(remaining / 60)
            return "You recently nudged \(profile.displayName). You can nudge again in \(minutes) minutes."
        case .dailyLimitReached:
            return "You've encouraged many friends today. Great job!"
        default:
            return "Nudge unavailable."
        }
    }

    private var nudgeSentOverlay: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()
                .onTapGesture {
                    showNudgeSent = false
                }

            VStack(spacing: 20) {
                // Success icon with animation
                ZStack {
                    Circle()
                        .fill(Color.green.opacity(0.2))
                        .frame(width: 80, height: 80)

                    Image(systemName: "hand.wave.fill")
                        .font(.system(size: 36))
                        .foregroundStyle(.green)
                }

                Text("Encouragement Sent!")
                    .font(.title2)
                    .fontWeight(.bold)

                Text(nudgeConfirmationMessage)
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                Button("Done") {
                    showNudgeSent = false
                }
                .buttonStyle(.borderedProminent)
                .padding(.top, 8)
            }
            .padding(32)
            .background(.regularMaterial)
            .cornerRadius(24)
            .shadow(radius: 20)
            .padding(40)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Encouragement sent to \(profile.displayName). \(nudgeConfirmationMessage)")
        .accessibilityAddTraits(.isModal)
    }

    // MARK: - Nudge Actions

    private func loadNudgeEligibility() async {
        let eligibility = await MockFriendService.shared.canNudge(
            senderId: currentUserId,
            recipientId: profile.id
        )
        await MainActor.run {
            nudgeEligibility = eligibility
        }
    }

    private func sendNudge() async {
        isNudging = true

        do {
            let nudge = try await MockFriendService.shared.sendNudge(
                senderId: currentUserId,
                recipientId: profile.id
            )

            // Get a random confirmation message
            let confirmationIndex = Int.random(in: 0..<NudgeMessages.confirmations.count)
            let message = NudgeMessages.confirmations[confirmationIndex]
                .replacingOccurrences(of: "[Name]", with: profile.displayName)

            await MainActor.run {
                isNudging = false
                nudgeConfirmationMessage = message
                showNudgeSent = true
                // Update eligibility to show cooldown
                nudgeEligibility = .cooldownActive(remaining: NudgeConfig.perFriendCooldownSeconds)
            }
        } catch {
            await MainActor.run {
                isNudging = false
                errorMessage = "Couldn't send nudge. Please try again."
                showError = true
            }
        }
    }

    // MARK: - Actions Menu

    private var actionsMenu: some View {
        Menu {
            Button(role: .destructive) {
                showRemoveConfirmation = true
            } label: {
                Label("Remove Friend", systemImage: "person.badge.minus")
            }

            Button(role: .destructive) {
                showBlockConfirmation = true
            } label: {
                Label("Block User", systemImage: "nosign")
            }
        } label: {
            Image(systemName: "ellipsis.circle")
                .font(.title3)
        }
        .accessibilityLabel("More actions")
        .accessibilityHint("Opens menu to remove friend or block user")
    }

    // MARK: - Actions

    private func removeFriend() {
        isRemoving = true

        Task {
            do {
                try await MockFriendService.shared.removeFriend(
                    userId: currentUserId,
                    friendId: profile.id
                )
                await MainActor.run {
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    isRemoving = false
                    errorMessage = "Couldn't remove friend. Please try again."
                    showError = true
                }
            }
        }
    }

    private func blockUser() {
        isBlocking = true

        Task {
            do {
                try await MockFriendService.shared.blockUser(
                    blockerId: currentUserId,
                    blockedId: profile.id
                )
                await MainActor.run {
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    isBlocking = false
                    errorMessage = "Couldn't block user. Please try again."
                    showError = true
                }
            }
        }
    }
}

// MARK: - Preview

#Preview {
    SocialView()
        .environmentObject(AuthViewModel())
}
