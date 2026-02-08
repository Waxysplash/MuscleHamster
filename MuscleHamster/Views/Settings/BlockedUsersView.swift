//
//  BlockedUsersView.swift
//  MuscleHamster
//
//  View for managing blocked users
//  Phase 09.5: Privacy Controls
//

import SwiftUI

struct BlockedUsersView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var authViewModel: AuthViewModel

    @State private var viewState: ViewState = .loading
    @State private var blockedUsers: [(blockedUser: BlockedUser, profile: FriendProfile?)] = []
    @State private var userToUnblock: (blockedUser: BlockedUser, profile: FriendProfile?)? = nil
    @State private var showUnblockConfirmation = false
    @State private var isUnblocking = false
    @State private var errorMessage: String? = nil
    @State private var showError = false

    private var currentUserId: String {
        authViewModel.currentUser?.id ?? ""
    }

    var body: some View {
        Group {
            switch viewState {
            case .loading:
                loadingContent
            case .empty:
                emptyContent
            case .content:
                blockedListContent
            case .error:
                errorContent
            }
        }
        .navigationTitle("Blocked Users")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadBlockedUsers()
        }
        .confirmationDialog(
            unblockConfirmationTitle,
            isPresented: $showUnblockConfirmation,
            titleVisibility: .visible
        ) {
            Button("Unblock", role: .none) {
                Task { await unblockUser() }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("They'll be able to find you and send friend requests again.")
        }
        .alert("Couldn't Unblock", isPresented: $showError) {
            Button("Try Again") {
                if userToUnblock != nil {
                    Task { await unblockUser() }
                }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text(errorMessage ?? "Something went wrong. Please try again.")
        }
        .overlay {
            if isUnblocking {
                unblockingOverlay
            }
        }
    }

    // MARK: - View States

    private var loadingContent: some View {
        VStack(spacing: 16) {
            ProgressView()
            Text("Loading...")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Loading blocked users")
    }

    private var emptyContent: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "checkmark.shield.fill")
                .font(.system(size: 64))
                .foregroundStyle(.green)

            VStack(spacing: 8) {
                Text("No Blocked Users")
                    .font(.title3)
                    .fontWeight(.semibold)

                Text("You haven't blocked anyone. That's good news!")
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            Spacer()
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("No blocked users. You haven't blocked anyone.")
    }

    private var blockedListContent: some View {
        List {
            Section {
                ForEach(blockedUsers, id: \.blockedUser.id) { item in
                    blockedUserRow(item)
                }
            } header: {
                Text("Blocked users can't see your profile, send requests, or appear in your searches.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .textCase(nil)
            }
        }
        .listStyle(.insetGrouped)
        .refreshable {
            await loadBlockedUsers()
        }
    }

    private func blockedUserRow(_ item: (blockedUser: BlockedUser, profile: FriendProfile?)) -> some View {
        HStack(spacing: 12) {
            // Avatar
            avatarView(for: item.profile)

            // Info
            VStack(alignment: .leading, spacing: 2) {
                Text(item.profile?.displayName ?? "Unknown User")
                    .font(.body)
                    .fontWeight(.medium)

                Text(blockedDateText(item.blockedUser.blockedAt))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            // Unblock button
            Button {
                userToUnblock = item
                showUnblockConfirmation = true
            } label: {
                Text("Unblock")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundStyle(.accentColor)
            }
            .buttonStyle(.borderless)
        }
        .padding(.vertical, 4)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(item.profile?.displayName ?? "Unknown User"), blocked \(blockedDateText(item.blockedUser.blockedAt))")
        .accessibilityHint("Double tap to unblock this user")
    }

    private func avatarView(for profile: FriendProfile?) -> some View {
        ZStack {
            Circle()
                .fill(hamsterStateColor(profile?.hamsterState).opacity(0.3))
                .frame(width: 44, height: 44)

            Image(systemName: "pawprint.fill")
                .font(.title3)
                .foregroundStyle(.white)
        }
        .accessibilityHidden(true)
    }

    private func hamsterStateColor(_ state: HamsterState?) -> Color {
        guard let state = state else { return .secondary }
        switch state {
        case .hungry: return .orange
        case .chillin: return .blue
        case .happy: return .green
        case .excited: return .yellow
        case .proud: return .purple
        }
    }

    private var errorContent: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundStyle(.orange)

            Text("Couldn't load blocked users")
                .font(.headline)

            Button("Try Again") {
                Task { await loadBlockedUsers() }
            }
            .buttonStyle(.borderedProminent)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Error loading blocked users. Tap to try again.")
    }

    private var unblockingOverlay: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()

            VStack(spacing: 16) {
                ProgressView()
                    .scaleEffect(1.2)
                Text("Unblocking...")
                    .font(.headline)
                    .foregroundStyle(.white)
            }
            .padding(32)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
        }
    }

    // MARK: - Helpers

    private var unblockConfirmationTitle: String {
        if let profile = userToUnblock?.profile {
            return "Unblock \(profile.displayName)?"
        }
        return "Unblock this user?"
    }

    private func blockedDateText(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return "Blocked \(formatter.localizedString(for: date, relativeTo: Date()))"
    }

    // MARK: - Actions

    private func loadBlockedUsers() async {
        viewState = .loading

        let users = await MockFriendService.shared.getBlockedUsersWithProfiles(userId: currentUserId)

        await MainActor.run {
            blockedUsers = users
            viewState = users.isEmpty ? .empty : .content
        }
    }

    private func unblockUser() async {
        guard let item = userToUnblock else { return }

        isUnblocking = true

        do {
            try await MockFriendService.shared.unblockUser(
                blockerId: currentUserId,
                blockedId: item.blockedUser.blockedId
            )

            await MainActor.run {
                isUnblocking = false
                userToUnblock = nil
                // Refresh the list
                Task { await loadBlockedUsers() }
            }
        } catch {
            await MainActor.run {
                isUnblocking = false
                errorMessage = "Couldn't unblock this user. Please try again."
                showError = true
            }
        }
    }
}

#Preview {
    NavigationStack {
        BlockedUsersView()
            .environmentObject(AuthViewModel())
    }
}
