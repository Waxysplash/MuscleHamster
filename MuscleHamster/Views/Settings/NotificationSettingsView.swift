//
//  NotificationSettingsView.swift
//  MuscleHamster
//
//  Full notification settings screen
//  Phase 08.2: Push Permission UX and Scheduling Rules
//

import SwiftUI

struct NotificationSettingsView: View {
    @ObservedObject private var notificationManager = NotificationManager.shared
    @State private var showPermissionPrompt = false
    @State private var showTimePicker = false
    @State private var selectedHour: Int = 8
    @State private var selectedMinute: Int = 0

    var body: some View {
        List {
            // Permission state banner (if needed)
            if notificationManager.permissionState == .denied {
                permissionDeniedBanner
            }

            // Master toggle section
            masterToggleSection

            // Settings (only if authorized and enabled)
            if notificationManager.permissionState.isAuthorized && notificationManager.preferences.userEnabled {
                reminderTimeSection
                reminderTypesSection
            } else if notificationManager.permissionState == .notDetermined {
                enablePromptSection
            }
        }
        .navigationTitle("Reminders")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showPermissionPrompt) {
            NotificationPermissionPromptView { granted in
                // Refresh state after prompt
                Task {
                    await notificationManager.refreshPermissionState()
                }
            }
            .presentationDetents([.medium, .large])
        }
        .sheet(isPresented: $showTimePicker) {
            timePickerSheet
        }
        .onAppear {
            // Initialize time picker values from current preferences
            selectedHour = notificationManager.preferences.reminderHour
            selectedMinute = notificationManager.preferences.reminderMinute
        }
        .task {
            // Refresh permission state - auto-cancelled when view disappears
            await notificationManager.refreshPermissionState()
        }
    }

    // MARK: - Permission Denied Banner

    private var permissionDeniedBanner: some View {
        Section {
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 12) {
                    Image(systemName: "bell.slash.fill")
                        .font(.title2)
                        .foregroundStyle(.orange)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Notifications Disabled")
                            .font(.headline)

                        Text("Notifications are turned off in your device settings.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                Button {
                    openSystemSettings()
                } label: {
                    HStack {
                        Text("Open Settings")
                            .font(.subheadline)
                            .fontWeight(.medium)

                        Spacer()

                        Image(systemName: "arrow.up.forward.app.fill")
                            .font(.caption)
                    }
                    .foregroundStyle(.accentColor)
                    .padding(.vertical, 8)
                    .padding(.horizontal, 12)
                    .background(Color.accentColor.opacity(0.1), in: RoundedRectangle(cornerRadius: 8))
                }
                .accessibilityLabel("Open Settings to enable notifications")
            }
            .padding(.vertical, 8)
        }
    }

    // MARK: - Master Toggle Section

    private var masterToggleSection: some View {
        Section {
            Toggle(isOn: Binding(
                get: { notificationManager.preferences.userEnabled },
                set: { newValue in
                    Task {
                        if newValue {
                            await notificationManager.enableNotifications()
                        } else {
                            await notificationManager.disableNotifications()
                        }
                    }
                }
            )) {
                HStack(spacing: 12) {
                    Image(systemName: notificationManager.preferences.userEnabled ? "bell.fill" : "bell.slash.fill")
                        .font(.title2)
                        .foregroundStyle(notificationManager.preferences.userEnabled ? .accentColor : .secondary)
                        .frame(width: 32)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Notifications")
                            .foregroundStyle(.primary)

                        Text(notificationStatusText)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .disabled(notificationManager.permissionState == .denied)
            .opacity(notificationManager.permissionState == .denied ? 0.5 : 1.0)
            .accessibilityLabel("Notifications")
            .accessibilityValue(notificationManager.preferences.userEnabled ? "On" : "Off")
            .accessibilityHint(notificationManager.permissionState == .denied ? "Enable notifications in device Settings first" : "Toggle to receive workout reminders")
        } footer: {
            if notificationManager.preferences.userEnabled && notificationManager.permissionState.isAuthorized {
                Text("Your hamster will send you gentle reminders to help you stay on track.")
            }
        }
    }

    private var notificationStatusText: String {
        switch notificationManager.permissionState {
        case .denied:
            return "Enable in device Settings to receive reminders"
        case .notDetermined:
            return "Get gentle workout reminders"
        case .authorized, .provisional, .ephemeral:
            return notificationManager.preferences.userEnabled
                ? "Your hamster will send you reminders"
                : "Reminders are currently off"
        }
    }

    // MARK: - Enable Prompt Section

    private var enablePromptSection: some View {
        Section {
            Button {
                showPermissionPrompt = true
            } label: {
                HStack(spacing: 12) {
                    Image(systemName: "sparkles")
                        .font(.title2)
                        .foregroundStyle(.accentColor)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("Set Up Reminders")
                            .font(.headline)
                            .foregroundStyle(.primary)

                        Text("Let your hamster send you friendly nudges when it's workout time.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
                .padding(.vertical, 8)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Set up reminders")
            .accessibilityHint("Opens notification permission setup")
        }
    }

    // MARK: - Reminder Time Section

    private var reminderTimeSection: some View {
        Section("Reminder Time") {
            // Time period picker
            ForEach([ReminderTimePeriod.morning, .afternoon, .evening], id: \.self) { period in
                timePeriodRow(period)
            }

            // Custom time option
            Button {
                showTimePicker = true
            } label: {
                HStack(spacing: 12) {
                    Image(systemName: "clock.fill")
                        .font(.title3)
                        .foregroundStyle(.accentColor)
                        .frame(width: 28)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Custom Time")
                            .foregroundStyle(.primary)

                        if notificationManager.preferences.reminderTimePeriod == .custom {
                            Text(notificationManager.preferences.formattedReminderTime)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }

                    Spacer()

                    if notificationManager.preferences.reminderTimePeriod == .custom {
                        Image(systemName: "checkmark")
                            .font(.body.weight(.semibold))
                            .foregroundStyle(.accentColor)
                    }

                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Custom time: \(notificationManager.preferences.formattedReminderTime)")
            .accessibilityHint("Opens time picker to set a custom reminder time")
            .accessibilityAddTraits(notificationManager.preferences.reminderTimePeriod == .custom ? .isSelected : [])
        } footer: {
            Text("We'll remind you at this time each day. You can always change it later.")
        }
    }

    private func timePeriodRow(_ period: ReminderTimePeriod) -> some View {
        Button {
            notificationManager.updateReminderTime(period: period)
        } label: {
            HStack(spacing: 12) {
                Image(systemName: period.icon)
                    .font(.title3)
                    .foregroundStyle(.accentColor)
                    .frame(width: 28)

                VStack(alignment: .leading, spacing: 2) {
                    Text(period.displayName)
                        .foregroundStyle(.primary)

                    Text(period.description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                if notificationManager.preferences.reminderTimePeriod == period {
                    Image(systemName: "checkmark")
                        .font(.body.weight(.semibold))
                        .foregroundStyle(.accentColor)
                }
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(period.displayName): \(period.description)")
        .accessibilityAddTraits(notificationManager.preferences.reminderTimePeriod == period ? .isSelected : [])
    }

    // MARK: - Reminder Types Section

    private var reminderTypesSection: some View {
        Section("Reminder Types") {
            // Daily reminder toggle
            Toggle(isOn: Binding(
                get: { notificationManager.preferences.dailyReminderEnabled },
                set: { notificationManager.toggleDailyReminder($0) }
            )) {
                HStack(spacing: 12) {
                    Image(systemName: "bell.fill")
                        .font(.title3)
                        .foregroundStyle(.accentColor)
                        .frame(width: 28)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Daily Workout Reminder")
                            .foregroundStyle(.primary)

                        Text("A gentle nudge at your preferred time")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .accessibilityLabel("Daily Workout Reminder")
            .accessibilityValue(notificationManager.preferences.dailyReminderEnabled ? "On" : "Off")
            .accessibilityHint("Get a reminder at your preferred time each day")

            // Streak at risk toggle
            Toggle(isOn: Binding(
                get: { notificationManager.preferences.streakReminderEnabled },
                set: { notificationManager.toggleStreakReminder($0) }
            )) {
                HStack(spacing: 12) {
                    Image(systemName: "flame.fill")
                        .font(.title3)
                        .foregroundStyle(.orange)
                        .frame(width: 28)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Streak at Risk")
                            .foregroundStyle(.primary)

                        Text("Reminder before your streak resets")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .accessibilityLabel("Streak at Risk Reminder")
            .accessibilityValue(notificationManager.preferences.streakReminderEnabled ? "On" : "Off")
            .accessibilityHint("Get an evening reminder if you haven't checked in")

            // Friend nudges toggle
            Toggle(isOn: Binding(
                get: { notificationManager.preferences.friendNudgesEnabled },
                set: { notificationManager.toggleFriendNudges($0) }
            )) {
                HStack(spacing: 12) {
                    Image(systemName: "hand.wave.fill")
                        .font(.title3)
                        .foregroundStyle(.purple)
                        .frame(width: 28)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Friend Nudges")
                            .foregroundStyle(.primary)

                        Text("Encouragement from your friends")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .accessibilityLabel("Friend Nudges")
            .accessibilityValue(notificationManager.preferences.friendNudgesEnabled ? "On" : "Off")
            .accessibilityHint("Receive friendly encouragement when friends nudge you")
        } footer: {
            Text("All reminders are friendly and judgment-free. Your hamster just wants to help!")
        }
    }

    // MARK: - Time Picker Sheet

    private var timePickerSheet: some View {
        NavigationStack {
            VStack(spacing: 24) {
                DatePicker(
                    "Select Time",
                    selection: Binding(
                        get: {
                            var components = DateComponents()
                            components.hour = selectedHour
                            components.minute = selectedMinute
                            return Calendar.current.date(from: components) ?? Date()
                        },
                        set: { date in
                            let components = Calendar.current.dateComponents([.hour, .minute], from: date)
                            selectedHour = components.hour ?? 8
                            selectedMinute = components.minute ?? 0
                        }
                    ),
                    displayedComponents: .hourAndMinute
                )
                .datePickerStyle(.wheel)
                .labelsHidden()

                Text("We'll remind you at this time each day.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                Spacer()
            }
            .padding(.top, 24)
            .navigationTitle("Custom Time")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        showTimePicker = false
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        notificationManager.updateReminderTime(hour: selectedHour, minute: selectedMinute)
                        showTimePicker = false
                    }
                }
            }
        }
        .presentationDetents([.medium])
    }

    // MARK: - Helpers

    private func openSystemSettings() {
        if let url = URL(string: UIApplication.openSettingsURLString) {
            UIApplication.shared.open(url)
        }
    }
}

#Preview {
    NavigationStack {
        NotificationSettingsView()
    }
}
