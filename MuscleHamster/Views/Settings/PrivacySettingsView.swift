//
//  PrivacySettingsView.swift
//  MuscleHamster
//
//  Central hub for privacy controls
//  Phase 09.5: Privacy Controls
//

import SwiftUI

struct PrivacySettingsView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel

    @State private var privacySettings: PrivacySettings = .default
    @State private var blockedUsersCount: Int = 0
    @State private var isLoading = true
    @State private var isSaving = false
    @State private var showSaveError = false

    private var currentUserId: String {
        authViewModel.currentUser?.id ?? ""
    }

    var body: some View {
        List {
            // Profile visibility section
            profileVisibilitySection

            // Friend requests section
            friendRequestsSection

            // Blocked users section
            blockedUsersSection

            // Data & Account section (placeholders)
            dataAccountSection
        }
        .listStyle(.insetGrouped)
        .navigationTitle("Privacy")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadSettings()
        }
        .onChange(of: privacySettings.allowFriendRequests) { _, _ in
            Task { await saveSettings() }
        }
        .alert("Couldn't Save", isPresented: $showSaveError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Your changes couldn't be saved. Please try again.")
        }
    }

    // MARK: - Profile Visibility Section

    private var profileVisibilitySection: some View {
        Section {
            NavigationLink {
                ProfileVisibilityView()
            } label: {
                HStack(spacing: 12) {
                    iconView(systemName: "eye.fill", color: .blue)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Profile Visibility")
                            .foregroundStyle(.primary)

                        HStack(spacing: 4) {
                            Image(systemName: privacySettings.profileVisibility.icon)
                                .font(.caption)
                            Text(privacySettings.profileVisibility.displayName)
                                .font(.caption)
                        }
                        .foregroundStyle(.secondary)
                    }
                }
            }
            .accessibilityLabel("Profile Visibility")
            .accessibilityValue(privacySettings.profileVisibility.displayName)
            .accessibilityHint("Controls who can find and see your profile. Double tap to change.")
        } header: {
            Text("Discoverability")
        } footer: {
            Text(privacySettings.profileVisibility.description)
                .font(.caption)
        }
    }

    // MARK: - Friend Requests Section

    private var friendRequestsSection: some View {
        Section {
            Toggle(isOn: $privacySettings.allowFriendRequests) {
                HStack(spacing: 12) {
                    iconView(systemName: "person.badge.plus.fill", color: .green)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Allow Friend Requests")
                            .foregroundStyle(.primary)

                        Text(friendRequestsSubtitle)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .tint(.accentColor)
            .disabled(isSaving || !privacySettings.profileVisibility.allowsIncomingRequests)
            .accessibilityLabel("Allow Friend Requests")
            .accessibilityValue(privacySettings.allowFriendRequests ? "On" : "Off")
            .accessibilityHint(privacySettings.allowFriendRequests ?
                "Others can send you friend requests" :
                "No one can send you friend requests")
        } header: {
            Text("Social")
        } footer: {
            if !privacySettings.profileVisibility.allowsIncomingRequests {
                Label {
                    Text("Friend requests are automatically disabled when your profile is set to Private.")
                } icon: {
                    Image(systemName: "info.circle")
                }
                .font(.caption)
                .foregroundStyle(.secondary)
            }
        }
    }

    private var friendRequestsSubtitle: String {
        if privacySettings.allowFriendRequests {
            return "Others can send you friend requests"
        } else {
            return "No one can send you requests"
        }
    }

    // MARK: - Blocked Users Section

    private var blockedUsersSection: some View {
        Section {
            NavigationLink {
                BlockedUsersView()
            } label: {
                HStack(spacing: 12) {
                    iconView(systemName: "nosign", color: .red)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Blocked Users")
                            .foregroundStyle(.primary)

                        Text(blockedUsersSubtitle)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .accessibilityLabel("Blocked Users")
            .accessibilityValue(blockedUsersSubtitle)
            .accessibilityHint("Manage users you've blocked. Double tap to view.")
        } header: {
            Text("Blocking")
        } footer: {
            Text("Blocked users can't see your profile, send requests, or interact with you.")
                .font(.caption)
        }
    }

    private var blockedUsersSubtitle: String {
        if blockedUsersCount == 0 {
            return "No blocked users"
        } else if blockedUsersCount == 1 {
            return "1 blocked user"
        } else {
            return "\(blockedUsersCount) blocked users"
        }
    }

    // MARK: - Data & Account Section

    private var dataAccountSection: some View {
        Section {
            // Download Data
            HStack(spacing: 12) {
                iconView(systemName: "arrow.down.doc.fill", color: .purple)

                VStack(alignment: .leading, spacing: 2) {
                    Text("Download My Data")
                        .foregroundStyle(.primary)

                    Text("Coming soon")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Text("Coming Soon")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.secondary.opacity(0.15), in: Capsule())
            }
            .accessibilityLabel("Download My Data")
            .accessibilityValue("Coming soon")

            // Delete Account
            HStack(spacing: 12) {
                iconView(systemName: "trash.fill", color: .red)

                VStack(alignment: .leading, spacing: 2) {
                    Text("Delete Account")
                        .foregroundStyle(.primary)

                    Text("Permanently delete your account and data")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Text("Coming Soon")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.secondary.opacity(0.15), in: Capsule())
            }
            .accessibilityLabel("Delete Account")
            .accessibilityValue("Coming soon. Permanently delete your account and data.")
        } header: {
            Text("Data & Account")
        } footer: {
            Text("Your privacy matters to your hamster. These features are in development.")
                .font(.caption)
        }
    }

    // MARK: - Helpers

    private func iconView(systemName: String, color: Color) -> some View {
        Image(systemName: systemName)
            .font(.title3)
            .foregroundStyle(color)
            .frame(width: 28)
            .accessibilityHidden(true)
    }

    // MARK: - Actions

    private func loadSettings() async {
        isLoading = true

        async let settingsTask = MockFriendService.shared.getPrivacySettings(userId: currentUserId)
        async let blockedTask = MockFriendService.shared.getBlockedUsers(userId: currentUserId)

        let (settings, blocked) = await (settingsTask, blockedTask)

        await MainActor.run {
            privacySettings = settings
            blockedUsersCount = blocked.count
            isLoading = false
        }
    }

    private func saveSettings() async {
        isSaving = true

        do {
            try await MockFriendService.shared.updatePrivacySettings(
                userId: currentUserId,
                settings: privacySettings
            )
            await MainActor.run {
                isSaving = false
            }
        } catch {
            await MainActor.run {
                isSaving = false
                showSaveError = true
            }
        }
    }
}

#Preview {
    NavigationStack {
        PrivacySettingsView()
            .environmentObject(AuthViewModel())
    }
}
