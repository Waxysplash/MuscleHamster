//
//  ProfileVisibilityView.swift
//  MuscleHamster
//
//  View for selecting profile visibility level
//  Phase 09.5: Privacy Controls
//

import SwiftUI

struct ProfileVisibilityView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var authViewModel: AuthViewModel

    @State private var selectedLevel: ProfileVisibilityLevel = .everyone
    @State private var isSaving = false
    @State private var showSaveError = false
    @State private var originalLevel: ProfileVisibilityLevel = .everyone

    private var currentUserId: String {
        authViewModel.currentUser?.id ?? ""
    }

    private var hasChanges: Bool {
        selectedLevel != originalLevel
    }

    var body: some View {
        List {
            // Info banner
            Section {
                infoBanner
            }

            // Visibility options
            Section {
                ForEach(ProfileVisibilityLevel.allCases) { level in
                    visibilityOption(level)
                }
            } header: {
                Text("Who can find your profile?")
            } footer: {
                Text("Changes take effect immediately.")
                    .font(.caption)
            }

            // Current setting explanation
            if hasChanges {
                Section {
                    changePreview
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("Profile Visibility")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                if hasChanges {
                    Button("Save") {
                        Task { await saveSettings() }
                    }
                    .fontWeight(.semibold)
                    .disabled(isSaving)
                }
            }
        }
        .task {
            await loadSettings()
        }
        .overlay {
            if isSaving {
                savingOverlay
            }
        }
        .alert("Couldn't Save", isPresented: $showSaveError) {
            Button("Try Again") {
                Task { await saveSettings() }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Something went wrong. Please try again.")
        }
    }

    // MARK: - Components

    private var infoBanner: some View {
        HStack(spacing: 12) {
            Image(systemName: "eye.fill")
                .font(.title2)
                .foregroundStyle(.blue)

            VStack(alignment: .leading, spacing: 2) {
                Text("Control Your Visibility")
                    .font(.subheadline)
                    .fontWeight(.medium)

                Text("Choose who can discover you and see your profile.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Control your visibility. Choose who can discover you and see your profile.")
    }

    private func visibilityOption(_ level: ProfileVisibilityLevel) -> some View {
        Button {
            withAnimation(.easeInOut(duration: 0.2)) {
                selectedLevel = level
            }
        } label: {
            HStack(spacing: 16) {
                // Icon
                ZStack {
                    Circle()
                        .fill(levelColor(level).opacity(0.15))
                        .frame(width: 44, height: 44)

                    Image(systemName: level.icon)
                        .font(.title3)
                        .foregroundStyle(levelColor(level))
                }
                .accessibilityHidden(true)

                // Content
                VStack(alignment: .leading, spacing: 4) {
                    Text(level.displayName)
                        .font(.body)
                        .fontWeight(.medium)
                        .foregroundStyle(.primary)

                    Text(level.description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                Spacer()

                // Selection indicator
                if selectedLevel == level {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.title2)
                        .foregroundStyle(.accentColor)
                }
            }
            .padding(.vertical, 8)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(level.displayName). \(level.description)")
        .accessibilityValue(selectedLevel == level ? "Selected" : "")
        .accessibilityHint("Double tap to select this visibility level")
        .accessibilityAddTraits(selectedLevel == level ? .isSelected : [])
    }

    private func levelColor(_ level: ProfileVisibilityLevel) -> Color {
        switch level.color {
        case "green": return .green
        case "blue": return .blue
        case "orange": return .orange
        default: return .accentColor
        }
    }

    private var changePreview: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label {
                Text("Changing to \(selectedLevel.displayName)")
                    .font(.subheadline)
                    .fontWeight(.medium)
            } icon: {
                Image(systemName: "info.circle.fill")
                    .foregroundStyle(.blue)
            }

            Text(selectedLevel.detailedDescription)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(.vertical, 4)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("You're changing to \(selectedLevel.displayName). \(selectedLevel.detailedDescription)")
    }

    private var savingOverlay: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()

            VStack(spacing: 16) {
                ProgressView()
                    .scaleEffect(1.2)
                Text("Saving...")
                    .font(.headline)
                    .foregroundStyle(.white)
            }
            .padding(32)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
        }
    }

    // MARK: - Actions

    private func loadSettings() async {
        let settings = await MockFriendService.shared.getPrivacySettings(userId: currentUserId)

        await MainActor.run {
            selectedLevel = settings.profileVisibility
            originalLevel = settings.profileVisibility
        }
    }

    private func saveSettings() async {
        isSaving = true

        do {
            var settings = await MockFriendService.shared.getPrivacySettings(userId: currentUserId)
            settings.profileVisibility = selectedLevel

            try await MockFriendService.shared.updatePrivacySettings(
                userId: currentUserId,
                settings: settings
            )

            await MainActor.run {
                isSaving = false
                originalLevel = selectedLevel
                dismiss()
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
        ProfileVisibilityView()
            .environmentObject(AuthViewModel())
    }
}
