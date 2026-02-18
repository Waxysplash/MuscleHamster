//
//  FriendRowView.swift
//  MuscleHamster
//
//  Reusable row component for displaying friend search results, contact matches, and friend lists
//  Phase 09.2: Add Friends UX
//

import SwiftUI

// MARK: - Friend Relationship State

/// Represents the relationship state between current user and displayed user
enum FriendRelationState: Equatable {
    case none           // Not connected - can add
    case pending        // Request sent - can cancel
    case incoming       // Request received - can accept/decline
    case friends        // Already friends
    case blocked        // User is blocked

    var buttonLabel: String {
        switch self {
        case .none: return "Add"
        case .pending: return "Pending"
        case .incoming: return "Accept"
        case .friends: return "Friends"
        case .blocked: return "Blocked"
        }
    }

    var buttonIcon: String {
        switch self {
        case .none: return "person.badge.plus"
        case .pending: return "clock"
        case .incoming: return "checkmark"
        case .friends: return "checkmark.circle.fill"
        case .blocked: return "nosign"
        }
    }

    var isActionable: Bool {
        switch self {
        case .none, .pending, .incoming: return true
        case .friends, .blocked: return false
        }
    }
}

// MARK: - Friend Row View

struct FriendRowView: View {
    let profile: FriendProfile
    let relationState: FriendRelationState
    let contactName: String?  // Optional contact name from phone
    let onAction: () -> Void
    let onSecondaryAction: (() -> Void)?  // For decline on incoming requests

    @State private var isLoading = false

    init(
        profile: FriendProfile,
        relationState: FriendRelationState,
        contactName: String? = nil,
        onAction: @escaping () -> Void,
        onSecondaryAction: (() -> Void)? = nil
    ) {
        self.profile = profile
        self.relationState = relationState
        self.contactName = contactName
        self.onAction = onAction
        self.onSecondaryAction = onSecondaryAction
    }

    var body: some View {
        HStack(spacing: 12) {
            // Avatar
            avatarView

            // User info
            VStack(alignment: .leading, spacing: 2) {
                // Display name (contact name or hamster name)
                Text(displayName)
                    .font(.body)
                    .fontWeight(.medium)
                    .lineLimit(1)

                // Username or secondary info
                if let hamsterName = profile.hamsterName, !hamsterName.isEmpty {
                    Text(hamsterName)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }

                // Friend streak if exists
                if let streak = profile.friendStreak, streak.currentStreak > 0 {
                    HStack(spacing: 4) {
                        Image(systemName: "flame.fill")
                            .font(.caption2)
                            .foregroundStyle(.orange)
                        Text("\(streak.currentStreak) day streak")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            Spacer()

            // Action button(s)
            actionButtons
        }
        .padding(.vertical, 8)
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityLabel)
        .accessibilityHint(accessibilityHint)
    }

    // MARK: - Avatar

    private var avatarView: some View {
        ZStack {
            Circle()
                .fill(hamsterStateColor.opacity(0.2))
                .frame(width: 50, height: 50)

            // Hamster placeholder with growth stage icon
            Image(systemName: profile.growthStage.icon)
                .font(.title2)
                .foregroundStyle(hamsterStateColor)
        }
        .overlay(
            // Equipped accessory indicator
            Group {
                if profile.equippedAccessoryId != nil {
                    Circle()
                        .fill(.yellow)
                        .frame(width: 16, height: 16)
                        .overlay(
                            Image(systemName: "sparkle")
                                .font(.system(size: 10))
                                .foregroundStyle(.white)
                        )
                        .offset(x: 18, y: -18)
                }
            }
        )
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

    // MARK: - Display Name

    private var displayName: String {
        // Prefer contact name if available
        if let contact = contactName, !contact.isEmpty {
            return contact
        }
        return profile.displayName
    }

    // MARK: - Action Buttons

    @ViewBuilder
    private var actionButtons: some View {
        switch relationState {
        case .none:
            addButton

        case .pending:
            pendingButton

        case .incoming:
            HStack(spacing: 8) {
                // Decline button
                if let onDecline = onSecondaryAction {
                    Button {
                        onDecline()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.body)
                            .foregroundStyle(.secondary)
                            .frame(width: 36, height: 36)
                            .background(Color(.systemGray5))
                            .clipShape(Circle())
                    }
                    .accessibilityLabel("Decline friend request")
                }

                // Accept button
                acceptButton
            }

        case .friends:
            friendsIndicator

        case .blocked:
            EmptyView()
        }
    }

    private var addButton: some View {
        Button {
            performAction()
        } label: {
            HStack(spacing: 4) {
                if isLoading {
                    ProgressView()
                        .scaleEffect(0.8)
                } else {
                    Image(systemName: "person.badge.plus")
                }
                Text("Add")
            }
            .font(.subheadline)
            .fontWeight(.medium)
            .foregroundStyle(.white)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color.accentColor)
            .clipShape(Capsule())
        }
        .disabled(isLoading)
        .accessibilityLabel("Send friend request to \(displayName)")
    }

    private var pendingButton: some View {
        Button {
            performAction()
        } label: {
            HStack(spacing: 4) {
                if isLoading {
                    ProgressView()
                        .scaleEffect(0.8)
                } else {
                    Image(systemName: "clock")
                }
                Text("Pending")
            }
            .font(.subheadline)
            .fontWeight(.medium)
            .foregroundStyle(.secondary)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color(.systemGray5))
            .clipShape(Capsule())
        }
        .disabled(isLoading)
        .accessibilityLabel("Cancel friend request to \(displayName)")
        .accessibilityHint("Double tap to cancel the pending request")
    }

    private var acceptButton: some View {
        Button {
            performAction()
        } label: {
            HStack(spacing: 4) {
                if isLoading {
                    ProgressView()
                        .scaleEffect(0.8)
                } else {
                    Image(systemName: "checkmark")
                }
                Text("Accept")
            }
            .font(.subheadline)
            .fontWeight(.medium)
            .foregroundStyle(.white)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color.green)
            .clipShape(Capsule())
        }
        .disabled(isLoading)
        .accessibilityLabel("Accept friend request from \(displayName)")
    }

    private var friendsIndicator: some View {
        HStack(spacing: 4) {
            Image(systemName: "checkmark.circle.fill")
            Text("Friends")
        }
        .font(.subheadline)
        .fontWeight(.medium)
        .foregroundStyle(.green)
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .accessibilityLabel("Already friends with \(displayName)")
    }

    // MARK: - Actions

    private func performAction() {
        guard !isLoading else { return }

        isLoading = true
        onAction()

        // Reset loading after a short delay (actual state change comes from parent)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            isLoading = false
        }
    }

    // MARK: - Accessibility

    private var accessibilityLabel: String {
        var label = displayName

        if let hamsterName = profile.hamsterName, !hamsterName.isEmpty, contactName != nil {
            label += ", hamster named \(hamsterName)"
        }

        if profile.currentStreak > 0 {
            label += ", \(profile.currentStreak) day personal streak"
        }

        if let friendStreak = profile.friendStreak, friendStreak.currentStreak > 0 {
            label += ", \(friendStreak.currentStreak) day friend streak"
        }

        return label
    }

    private var accessibilityHint: String {
        switch relationState {
        case .none:
            return "Double tap to send friend request"
        case .pending:
            return "Double tap to cancel pending request"
        case .incoming:
            return "Double tap to accept request, or use decline button"
        case .friends:
            return "You are already friends"
        case .blocked:
            return "This user is blocked"
        }
    }
}

// MARK: - Compact Variant

struct FriendRowCompactView: View {
    let profile: FriendProfile
    let relationState: FriendRelationState
    let onAction: () -> Void

    var body: some View {
        HStack(spacing: 10) {
            // Small avatar
            ZStack {
                Circle()
                    .fill(Color.accentColor.opacity(0.15))
                    .frame(width: 40, height: 40)

                Image(systemName: profile.growthStage.icon)
                    .font(.body)
                    .foregroundStyle(.accentColor)
            }

            // Name only
            Text(profile.displayName)
                .font(.subheadline)
                .lineLimit(1)

            Spacer()

            // Compact action
            compactActionButton
        }
        .padding(.vertical, 6)
    }

    @ViewBuilder
    private var compactActionButton: some View {
        switch relationState {
        case .none:
            Button {
                onAction()
            } label: {
                Image(systemName: "plus.circle.fill")
                    .font(.title2)
                    .foregroundStyle(.accentColor)
            }
            .accessibilityLabel("Add \(profile.displayName)")

        case .pending:
            Image(systemName: "clock.fill")
                .font(.title2)
                .foregroundStyle(.secondary)
                .accessibilityLabel("Pending request")

        case .friends:
            Image(systemName: "checkmark.circle.fill")
                .font(.title2)
                .foregroundStyle(.green)
                .accessibilityLabel("Friends")

        case .incoming:
            Button {
                onAction()
            } label: {
                Image(systemName: "checkmark.circle.fill")
                    .font(.title2)
                    .foregroundStyle(.green)
            }
            .accessibilityLabel("Accept request from \(profile.displayName)")

        case .blocked:
            EmptyView()
        }
    }
}

// MARK: - Preview

#Preview("Friend Row - Add") {
    List {
        FriendRowView(
            profile: FriendProfile(
                id: "1",
                email: "alex@example.com",
                hamsterName: "Peanut",
                currentStreak: 5,
                totalWorkoutsCompleted: 20,
                hamsterState: .happy,
                growthStage: .juvenile
            ),
            relationState: .none,
            onAction: { print("Add tapped") }
        )
    }
}

#Preview("Friend Row - Pending") {
    List {
        FriendRowView(
            profile: FriendProfile(
                id: "2",
                email: "sam@example.com",
                hamsterName: "Whiskers",
                currentStreak: 12,
                hamsterState: .excited,
                growthStage: .adult
            ),
            relationState: .pending,
            onAction: { print("Cancel tapped") }
        )
    }
}

#Preview("Friend Row - Friends") {
    List {
        FriendRowView(
            profile: FriendProfile(
                id: "3",
                email: "jordan@example.com",
                hamsterName: "Nugget",
                currentStreak: 30,
                hamsterState: .proud,
                growthStage: .mature,
                friendStreak: FriendStreak(
                    userId1: "me",
                    userId2: "3",
                    currentStreak: 7
                )
            ),
            relationState: .friends,
            onAction: { }
        )
    }
}
