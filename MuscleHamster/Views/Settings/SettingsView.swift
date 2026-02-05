//
//  SettingsView.swift
//  MuscleHamster
//
//  Settings screen - Preferences and account options shell
//  Phase 01.3: Placeholder sections for later phases to fill in
//

import SwiftUI

struct SettingsView: View {
    @State private var viewState: ViewState = .loading

    // Placeholder toggle states with safe defaults
    @State private var notificationsEnabled = false
    @State private var soundEnabled = true
    @State private var musicEnabled = true

    var body: some View {
        Group {
            switch viewState {
            case .loading:
                LoadingView(message: "Loading your preferences...")

            case .error(let message):
                ErrorView(
                    message: message,
                    retryAction: { loadSettings() }
                )

            case .empty, .content:
                settingsList
            }
        }
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { loadSettings() }
    }

    // MARK: - Settings List

    private var settingsList: some View {
        List {
            accountSection
            workoutScheduleSection
            notificationsSection
            audioSection
            privacySection
            supportSection
            signOutSection
            versionSection
        }
    }

    // MARK: - Account Section

    private var accountSection: some View {
        Section {
            NavigationLink {
                AccountSettingsView()
            } label: {
                HStack(spacing: 12) {
                    Image(systemName: "person.crop.circle.fill")
                        .font(.system(size: 40))
                        .foregroundStyle(.accentColor)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Sign In")
                            .font(.headline)
                        Text("Set up your account to save progress")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 4)
            }
            .accessibilityLabel("Account: Sign in to set up your account and save progress")
        }
    }

    // MARK: - Workout Schedule Section

    private var workoutScheduleSection: some View {
        Section("Workout Schedule") {
            NavigationLink {
                WorkoutScheduleSettingsView()
            } label: {
                settingsLabel(
                    icon: "calendar",
                    title: "Workout Days",
                    subtitle: "Choose which days you want to move"
                )
            }
            .accessibilityLabel("Workout Days: Choose which days you want to move")
        }
    }

    // MARK: - Notifications Section

    private var notificationsSection: some View {
        Section("Notifications") {
            Toggle(isOn: $notificationsEnabled) {
                settingsLabel(
                    icon: "bell.fill",
                    title: "Notifications",
                    subtitle: notificationsEnabled ? "Your hamster will send you reminders" : "Enable to get gentle reminders"
                )
            }
            .accessibilityLabel("Notifications")
            .accessibilityValue(notificationsEnabled ? "On" : "Off")
            .accessibilityHint("Toggle to let your hamster send you reminders")

            if notificationsEnabled {
                NavigationLink {
                    NotificationSettingsView()
                } label: {
                    settingsLabel(
                        icon: "clock.fill",
                        title: "Reminder Time",
                        subtitle: "When should your hamster nudge you?"
                    )
                }
                .accessibilityLabel("Reminder Time: When should your hamster nudge you?")
            }
        }
    }

    // MARK: - Audio Section

    private var audioSection: some View {
        Section("Audio") {
            Toggle(isOn: $soundEnabled) {
                settingsLabel(
                    icon: "speaker.wave.2.fill",
                    title: "Sound Effects",
                    subtitle: nil
                )
            }
            .accessibilityLabel("Sound Effects")
            .accessibilityValue(soundEnabled ? "On" : "Off")

            Toggle(isOn: $musicEnabled) {
                settingsLabel(
                    icon: "music.note",
                    title: "Music",
                    subtitle: nil
                )
            }
            .accessibilityLabel("Music")
            .accessibilityValue(musicEnabled ? "On" : "Off")

            NavigationLink {
                AudioSettingsView()
            } label: {
                settingsLabel(
                    icon: "slider.horizontal.3",
                    title: "Audio Settings",
                    subtitle: "Volume and preferences"
                )
            }
            .accessibilityLabel("Audio Settings: Volume and preferences")
        }
    }

    // MARK: - Privacy Section

    private var privacySection: some View {
        Section("Privacy") {
            NavigationLink {
                PrivacySettingsView()
            } label: {
                settingsLabel(
                    icon: "lock.shield.fill",
                    title: "Privacy Controls",
                    subtitle: "Manage your data and visibility"
                )
            }
            .accessibilityLabel("Privacy Controls: Manage your data and visibility")
        }
    }

    // MARK: - Support Section

    private var supportSection: some View {
        Section("Support") {
            settingsButton(
                icon: "questionmark.circle.fill",
                title: "Help",
                subtitle: "FAQs and support"
            )

            settingsButton(
                icon: "doc.text.fill",
                title: "Privacy Policy",
                subtitle: nil
            )

            settingsButton(
                icon: "doc.text.fill",
                title: "Terms of Service",
                subtitle: nil
            )
        }
    }

    // MARK: - Sign Out

    private var signOutSection: some View {
        Section {
            Button(role: .destructive) {
                // Sign out placeholder
            } label: {
                HStack {
                    Spacer()
                    Text("Sign Out")
                    Spacer()
                }
            }
            .accessibilityLabel("Sign out of your account")
        }
    }

    // MARK: - Version Info

    private var versionSection: some View {
        Section {
            VStack(spacing: 4) {
                Text("Muscle Hamster")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                Text("Version 1.0.0")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
            .frame(maxWidth: .infinity)
            .listRowBackground(Color.clear)
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Muscle Hamster, Version 1.0.0")
        }
    }

    // MARK: - Helpers

    private func settingsLabel(icon: String, title: String, subtitle: String?) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(.accentColor)
                .frame(width: 28)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .foregroundStyle(.primary)

                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
    }

    private func settingsButton(icon: String, title: String, subtitle: String?) -> some View {
        Button {
            // Navigation placeholder
        } label: {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundStyle(.accentColor)
                    .frame(width: 28)

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .foregroundStyle(.primary)

                    if let subtitle = subtitle {
                        Text(subtitle)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel(subtitle != nil ? "\(title): \(subtitle!)" : title)
    }

    // MARK: - Data Loading

    private func loadSettings() {
        viewState = .loading
        // Simulate loading - will be replaced with actual preferences fetch
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            viewState = .content
        }
    }
}

#Preview {
    NavigationStack {
        SettingsView()
    }
}
