//
//  AccountSettingsView.swift
//  MuscleHamster
//
//  Account settings - View and manage account details
//  Phase 02.3: Account basics with signed-in state and deletion placeholder
//

import SwiftUI

struct AccountSettingsView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @State private var showDeleteAccountInfo = false

    /// Whether the user is currently signed in
    private var isSignedIn: Bool {
        authViewModel.currentUser != nil
    }

    var body: some View {
        Group {
            if let user = authViewModel.currentUser {
                signedInContent(user: user)
            } else {
                signedOutContent
            }
        }
        .navigationTitle("Account")
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Signed In Content

    private func signedInContent(user: User) -> some View {
        List {
            accountInfoSection(user: user)
            accountStatusSection(user: user)
            dangerZoneSection
        }
    }

    // MARK: - Account Info Section

    private func accountInfoSection(user: User) -> some View {
        Section {
            HStack(spacing: 16) {
                Image(systemName: "person.crop.circle.fill")
                    .font(.system(size: 56))
                    .foregroundStyle(.accentColor)
                    .accessibilityHidden(true)

                VStack(alignment: .leading, spacing: 4) {
                    Text(user.email)
                        .font(.headline)
                    Text("Your account email")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(.vertical, 8)
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Account email: \(user.email)")
        }
    }

    // MARK: - Account Status Section

    private func accountStatusSection(user: User) -> some View {
        Section("Account Status") {
            HStack {
                Label {
                    Text("Profile Setup")
                } icon: {
                    Image(systemName: "person.text.rectangle")
                        .foregroundStyle(.accentColor)
                }

                Spacer()

                if user.profileComplete {
                    Label("Complete", systemImage: "checkmark.circle.fill")
                        .font(.subheadline)
                        .foregroundStyle(.green)
                } else {
                    Text("Incomplete")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Profile setup: \(user.profileComplete ? "Complete" : "Incomplete")")
        }
    }

    // MARK: - Danger Zone Section

    private var dangerZoneSection: some View {
        Section {
            Button {
                showDeleteAccountInfo = true
            } label: {
                HStack {
                    Label {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Delete Account")
                            Text("Coming Soon")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    } icon: {
                        Image(systemName: "trash")
                            .foregroundStyle(.secondary)
                    }

                    Spacer()

                    Image(systemName: "info.circle")
                        .foregroundStyle(.secondary)
                }
            }
            .foregroundStyle(.secondary)
            .accessibilityLabel("Delete Account")
            .accessibilityHint("This feature is coming soon. Tap for more information.")
            .alert("Account Deletion", isPresented: $showDeleteAccountInfo) {
                Button("Got It", role: .cancel) {}
            } message: {
                Text("Account deletion will be available soon. When ready, you'll be able to permanently delete your account and all associated data. Your hamster understands!")
            }
        } header: {
            Text("Danger Zone")
        } footer: {
            Text("Account deletion permanently removes all your data including workout history, points, and customizations.")
                .font(.caption)
        }
    }

    // MARK: - Signed Out Content

    /// Fallback view if somehow accessed while signed out
    private var signedOutContent: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "person.crop.circle.badge.questionmark")
                .font(.system(size: 64))
                .foregroundStyle(.secondary)
                .accessibilityHidden(true)

            VStack(spacing: 8) {
                Text("Not Signed In")
                    .font(.title3)
                    .fontWeight(.semibold)

                Text("Sign in to view and manage your account settings.")
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Not signed in. Sign in to view and manage your account settings.")
    }
}

#Preview("Signed In") {
    NavigationStack {
        AccountSettingsView()
            .environmentObject({
                let vm = AuthViewModel()
                Task {
                    _ = await vm.signUp(email: "hamster@example.com", password: "password123")
                }
                return vm
            }())
    }
}

#Preview("Signed Out") {
    NavigationStack {
        AccountSettingsView()
            .environmentObject(AuthViewModel())
    }
}
