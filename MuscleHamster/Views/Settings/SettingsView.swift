//
//  SettingsView.swift
//  MuscleHamster
//
//  Settings screen - Preferences and account options
//  Phase 02.3: Account basics with sign-out functionality
//  Phase 07.1: Added Points & Rewards section
//  Phase 08.1: Audio settings with persistence
//  Phase 08.2: Notification settings integration
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @ObservedObject private var notificationManager = NotificationManager.shared
    @State private var viewState: ViewState = .loading
    @State private var showSignOutConfirmation = false
    @State private var showSignOutError = false
    @State private var totalPoints: Int = 0
    @State private var showNotificationPrompt = false

    // Audio settings with persistence via @AppStorage
    @AppStorage(AudioPreferencesKey.globalMute) private var globalMute = AudioPreferences.defaultGlobalMute
    @AppStorage(AudioPreferencesKey.sfxEnabled) private var soundEnabled = AudioPreferences.defaultSfxEnabled
    @AppStorage(AudioPreferencesKey.musicEnabled) private var musicEnabled = AudioPreferences.defaultMusicEnabled

    /// Whether the user is currently signed in
    private var isSignedIn: Bool {
        authViewModel.currentUser != nil
    }

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
            if authViewModel.userProfile != nil {
                profileSection
            }
            if isSignedIn {
                pointsSection
            }
            workoutScheduleSection
            notificationsSection
            audioSection
            privacySection
            supportSection
            if isSignedIn {
                signOutSection
            }
            versionSection
        }
        .disabled(authViewModel.isSigningOut)
        .overlay {
            if authViewModel.isSigningOut {
                signOutOverlay
            }
        }
        .alert("Couldn't Sign Out", isPresented: $showSignOutError) {
            Button("Try Again") {
                Task {
                    await authViewModel.signOut()
                }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Something went wrong. Please check your connection and try again.")
        }
    }

    // MARK: - Sign Out Overlay

    private var signOutOverlay: some View {
        ZStack {
            Color.black.opacity(0.3)
                .ignoresSafeArea()

            VStack(spacing: 16) {
                ProgressView()
                    .scaleEffect(1.2)
                Text("Signing out...")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .padding(24)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Signing out, please wait")
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
                        if let user = authViewModel.currentUser {
                            Text(maskedEmail(user.email))
                                .font(.headline)
                            Text("Manage your account")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        } else {
                            Text("Sign In")
                                .font(.headline)
                            Text("Set up your account to save progress")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .padding(.vertical, 4)
            }
            .accessibilityLabel(authViewModel.currentUser != nil
                ? "Account: \(maskedEmail(authViewModel.currentUser?.email ?? "")). Manage your account"
                : "Account: Sign in to set up your account and save progress")
        }
    }

    /// Creates a privacy-safe masked version of an email address
    /// e.g., "user@example.com" becomes "u***@example.com"
    private func maskedEmail(_ email: String) -> String {
        guard let atIndex = email.firstIndex(of: "@") else {
            return email
        }

        let localPart = String(email[..<atIndex])
        let domain = String(email[atIndex...])

        if localPart.count <= 1 {
            return "\(localPart)***\(domain)"
        } else {
            let firstChar = localPart.prefix(1)
            return "\(firstChar)***\(domain)"
        }
    }

    // MARK: - Profile Section

    private var profileSection: some View {
        Section("My Profile") {
            NavigationLink {
                ProfileSettingsView()
            } label: {
                HStack(spacing: 12) {
                    // Hamster avatar
                    ZStack {
                        Circle()
                            .fill(Color.accentColor.opacity(0.2))
                            .frame(width: 44, height: 44)

                        Image(systemName: "pawprint.fill")
                            .font(.title3)
                            .foregroundStyle(.accentColor)
                    }
                    .accessibilityHidden(true)

                    VStack(alignment: .leading, spacing: 2) {
                        if let name = authViewModel.userProfile?.hamsterName {
                            Text(name)
                                .font(.headline)
                        } else {
                            Text("Your Hamster")
                                .font(.headline)
                        }
                        Text("Fitness goals, schedule, and preferences")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 4)
            }
            .accessibilityLabel(profileAccessibilityLabel)
        }
    }

    private var profileAccessibilityLabel: String {
        if let name = authViewModel.userProfile?.hamsterName {
            return "\(name): Edit fitness goals, schedule, and preferences"
        }
        return "Your Hamster: Edit fitness goals, schedule, and preferences"
    }

    // MARK: - Points Section

    private var pointsSection: some View {
        Section("Points & Rewards") {
            NavigationLink {
                PointsHistoryView()
            } label: {
                HStack(spacing: 12) {
                    // Points icon
                    ZStack {
                        Circle()
                            .fill(Color.yellow.opacity(0.2))
                            .frame(width: 44, height: 44)

                        Image(systemName: "star.fill")
                            .font(.title3)
                            .foregroundStyle(.yellow)
                    }
                    .accessibilityHidden(true)

                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 4) {
                            Text(formattedPoints)
                                .font(.headline)
                            Text("points")
                                .font(.headline)
                                .foregroundStyle(.secondary)
                        }
                        Text("View your points history")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 4)
            }
            .accessibilityLabel("\(totalPoints) points. View your points history")
        }
    }

    private var formattedPoints: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        return formatter.string(from: NSNumber(value: totalPoints)) ?? "\(totalPoints)"
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
            Toggle(isOn: Binding(
                get: { notificationManager.isEffectivelyEnabled },
                set: { newValue in
                    Task {
                        if newValue {
                            // If permission not determined, show prompt
                            if notificationManager.permissionState == .notDetermined {
                                await MainActor.run {
                                    showNotificationPrompt = true
                                }
                            } else {
                                await notificationManager.enableNotifications()
                            }
                        } else {
                            await notificationManager.disableNotifications()
                        }
                    }
                }
            )) {
                settingsLabel(
                    icon: notificationManager.isEffectivelyEnabled ? "bell.fill" : "bell.slash.fill",
                    title: "Notifications",
                    subtitle: notificationSubtitle
                )
            }
            .disabled(notificationManager.permissionState == .denied)
            .opacity(notificationManager.permissionState == .denied ? 0.7 : 1.0)
            .accessibilityLabel("Notifications")
            .accessibilityValue(notificationManager.isEffectivelyEnabled ? "On" : "Off")
            .accessibilityHint(notificationManager.permissionState == .denied
                ? "Notifications are disabled in device settings"
                : "Toggle to let your hamster send you reminders")

            if notificationManager.isEffectivelyEnabled || notificationManager.permissionState == .denied {
                NavigationLink {
                    NotificationSettingsView()
                } label: {
                    settingsLabel(
                        icon: "clock.fill",
                        title: "Reminder Settings",
                        subtitle: notificationManager.isEffectivelyEnabled
                            ? "Reminders at \(notificationManager.preferences.formattedReminderTime)"
                            : "Manage your reminder preferences"
                    )
                }
                .accessibilityLabel("Reminder Settings: \(notificationManager.isEffectivelyEnabled ? "Reminders at \(notificationManager.preferences.formattedReminderTime)" : "Manage your reminder preferences")")
            }
        }
        .sheet(isPresented: $showNotificationPrompt) {
            NotificationPermissionPromptView { granted in
                // Refresh state after prompt
                Task {
                    await notificationManager.refreshPermissionState()
                }
            }
            .presentationDetents([.medium, .large])
        }
    }

    private var notificationSubtitle: String {
        switch notificationManager.permissionState {
        case .denied:
            return "Enable in device Settings"
        case .notDetermined:
            return "Get gentle workout reminders"
        default:
            return notificationManager.isEffectivelyEnabled
                ? "Your hamster will send you reminders"
                : "Enable to get gentle reminders"
        }
    }

    // MARK: - Audio Section

    private var audioSection: some View {
        Section("Audio") {
            // Global Mute Toggle
            Toggle(isOn: $globalMute) {
                settingsLabel(
                    icon: globalMute ? "speaker.slash.fill" : "speaker.wave.2.fill",
                    title: "Mute All Audio",
                    subtitle: "Silences all sounds and music"
                )
            }
            .onChange(of: globalMute) { _, newValue in
                updateAudioPreferences()
            }
            .accessibilityLabel("Mute All Audio")
            .accessibilityValue(globalMute ? "On, all audio silenced" : "Off")
            .accessibilityHint("Double tap to toggle mute")

            // Sound Effects Toggle
            Toggle(isOn: $soundEnabled) {
                settingsLabel(
                    icon: "speaker.wave.2.fill",
                    title: "Sound Effects",
                    subtitle: "Workout cues, celebrations, and UI sounds"
                )
            }
            .disabled(globalMute)
            .opacity(globalMute ? 0.5 : 1.0)
            .onChange(of: soundEnabled) { _, newValue in
                updateAudioPreferences()
            }
            .accessibilityLabel("Sound Effects")
            .accessibilityValue(globalMute ? "Unavailable, audio is muted" : (soundEnabled ? "On" : "Off"))
            .accessibilityHint(globalMute ? "Turn off Mute All Audio to enable" : "Double tap to toggle")

            // Music Toggle
            Toggle(isOn: $musicEnabled) {
                settingsLabel(
                    icon: "music.note",
                    title: "Music",
                    subtitle: "Background music during workouts"
                )
            }
            .disabled(globalMute)
            .opacity(globalMute ? 0.5 : 1.0)
            .onChange(of: musicEnabled) { _, newValue in
                updateAudioPreferences()
            }
            .accessibilityLabel("Music")
            .accessibilityValue(globalMute ? "Unavailable, audio is muted" : (musicEnabled ? "On" : "Off"))
            .accessibilityHint(globalMute ? "Turn off Mute All Audio to enable" : "Double tap to toggle")

            // Audio Settings Link
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

    /// Updates AudioManager with current preferences
    private func updateAudioPreferences() {
        let preferences = AudioPreferences(
            globalMute: globalMute,
            soundEffectsEnabled: soundEnabled,
            musicEnabled: musicEnabled,
            soundEffectsVolume: UserDefaults.standard.object(forKey: AudioPreferencesKey.sfxVolume) as? Float ?? AudioPreferences.defaultSfxVolume,
            musicVolume: UserDefaults.standard.object(forKey: AudioPreferencesKey.musicVolume) as? Float ?? AudioPreferences.defaultMusicVolume,
            mixWithOthers: UserDefaults.standard.object(forKey: AudioPreferencesKey.mixWithOthers) as? Bool ?? AudioPreferences.defaultMixWithOthers
        )
        Task { @MainActor in
            AudioManager.shared.updatePreferences(preferences)
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
                showSignOutConfirmation = true
            } label: {
                HStack {
                    Spacer()
                    Text("Sign Out")
                    Spacer()
                }
            }
            .accessibilityLabel("Sign out of your account")
            .accessibilityHint("Double tap to sign out")
            .confirmationDialog(
                "Sign out of Muscle Hamster?",
                isPresented: $showSignOutConfirmation,
                titleVisibility: .visible
            ) {
                Button("Sign Out", role: .destructive) {
                    Task {
                        await authViewModel.signOut()
                    }
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("Your hamster will miss you, but your progress is safe!")
            }
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
        // Load points if signed in
        Task {
            if let userId = authViewModel.currentUser?.id {
                let stats = await MockActivityService.shared.getUserStats(userId: userId)
                await MainActor.run {
                    totalPoints = stats.totalPoints
                }
            }
            await MainActor.run {
                viewState = .content
            }
        }
    }
}

#Preview {
    NavigationStack {
        SettingsView()
            .environmentObject(AuthViewModel())
    }
}
