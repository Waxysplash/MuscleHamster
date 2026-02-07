//
//  NotificationPreferences.swift
//  MuscleHamster
//
//  Notification preferences model for storing user notification settings
//  Phase 08.2: Push Permission UX and Scheduling Rules
//

import Foundation

// MARK: - UserDefaults Keys

/// Keys for notification preferences stored in UserDefaults
enum NotificationPreferencesKey {
    static let userEnabled = "notification_userEnabled"
    static let dailyReminderEnabled = "notification_dailyReminderEnabled"
    static let streakReminderEnabled = "notification_streakReminderEnabled"
    static let reminderHour = "notification_reminderHour"
    static let reminderMinute = "notification_reminderMinute"
    static let hasShownPermissionPrompt = "notification_hasShownPermissionPrompt"
    static let permissionPromptDate = "notification_permissionPromptDate"
    static let quietHoursEnabled = "notification_quietHoursEnabled"
    static let quietHoursStart = "notification_quietHoursStart"
    static let quietHoursEnd = "notification_quietHoursEnd"
}

// MARK: - Notification Preferences

/// User's notification preference settings
struct NotificationPreferences: Equatable {
    /// Whether the user has enabled notifications in the app (separate from iOS permission)
    var userEnabled: Bool

    /// Whether daily workout reminders are enabled
    var dailyReminderEnabled: Bool

    /// Whether streak at risk reminders are enabled
    var streakReminderEnabled: Bool

    /// Hour component of preferred reminder time (0-23)
    var reminderHour: Int

    /// Minute component of preferred reminder time (0-59)
    var reminderMinute: Int

    /// Whether quiet hours are enabled
    var quietHoursEnabled: Bool

    /// Quiet hours start hour (0-23)
    var quietHoursStart: Int

    /// Quiet hours end hour (0-23)
    var quietHoursEnd: Int

    // MARK: - Defaults

    static let defaultUserEnabled = false
    static let defaultDailyReminderEnabled = true
    static let defaultStreakReminderEnabled = true
    static let defaultReminderHour = 8  // 8 AM
    static let defaultReminderMinute = 0
    static let defaultQuietHoursEnabled = true
    static let defaultQuietHoursStart = 22  // 10 PM
    static let defaultQuietHoursEnd = 7     // 7 AM

    init(
        userEnabled: Bool = defaultUserEnabled,
        dailyReminderEnabled: Bool = defaultDailyReminderEnabled,
        streakReminderEnabled: Bool = defaultStreakReminderEnabled,
        reminderHour: Int = defaultReminderHour,
        reminderMinute: Int = defaultReminderMinute,
        quietHoursEnabled: Bool = defaultQuietHoursEnabled,
        quietHoursStart: Int = defaultQuietHoursStart,
        quietHoursEnd: Int = defaultQuietHoursEnd
    ) {
        self.userEnabled = userEnabled
        self.dailyReminderEnabled = dailyReminderEnabled
        self.streakReminderEnabled = streakReminderEnabled
        self.reminderHour = reminderHour
        self.reminderMinute = reminderMinute
        self.quietHoursEnabled = quietHoursEnabled
        self.quietHoursStart = quietHoursStart
        self.quietHoursEnd = quietHoursEnd
    }

    // MARK: - Computed Properties

    /// Formatted reminder time string (e.g., "8:00 AM")
    var formattedReminderTime: String {
        let hour12 = reminderHour == 0 ? 12 : (reminderHour > 12 ? reminderHour - 12 : reminderHour)
        let period = reminderHour < 12 ? "AM" : "PM"
        return String(format: "%d:%02d %@", hour12, reminderMinute, period)
    }

    /// The Date representing today's reminder time
    var reminderTimeToday: Date {
        var components = Calendar.current.dateComponents([.year, .month, .day], from: Date())
        components.hour = reminderHour
        components.minute = reminderMinute
        components.second = 0
        return Calendar.current.date(from: components) ?? Date()
    }

    /// Whether the reminder time is during quiet hours
    var isReminderDuringQuietHours: Bool {
        guard quietHoursEnabled else { return false }

        if quietHoursStart < quietHoursEnd {
            // Normal range (e.g., 22-7 doesn't apply, 9-17 does)
            return reminderHour >= quietHoursStart && reminderHour < quietHoursEnd
        } else {
            // Overnight range (e.g., 22-7)
            return reminderHour >= quietHoursStart || reminderHour < quietHoursEnd
        }
    }

    /// Get evening reminder hour for streak at risk notification
    var streakReminderHour: Int {
        // Default to 6 PM, or quiet hours start minus 2 hours
        if quietHoursEnabled && quietHoursStart > 2 {
            return quietHoursStart - 2
        }
        return 18  // 6 PM
    }

    // MARK: - Time Period Helpers

    /// Get reminder time period based on hour
    var reminderTimePeriod: ReminderTimePeriod {
        switch reminderHour {
        case 5..<12: return .morning
        case 12..<17: return .afternoon
        case 17..<22: return .evening
        default: return .custom
        }
    }
}

// MARK: - Reminder Time Period

/// Pre-defined reminder time periods
enum ReminderTimePeriod: String, CaseIterable, Identifiable {
    case morning
    case afternoon
    case evening
    case custom

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .morning: return "Morning"
        case .afternoon: return "Afternoon"
        case .evening: return "Evening"
        case .custom: return "Custom"
        }
    }

    var description: String {
        switch self {
        case .morning: return "Around 8:00 AM"
        case .afternoon: return "Around 1:00 PM"
        case .evening: return "Around 6:00 PM"
        case .custom: return "Pick your own time"
        }
    }

    var icon: String {
        switch self {
        case .morning: return "sun.horizon.fill"
        case .afternoon: return "sun.max.fill"
        case .evening: return "moon.fill"
        case .custom: return "clock.fill"
        }
    }

    /// Default hour for this period
    var defaultHour: Int {
        switch self {
        case .morning: return 8
        case .afternoon: return 13
        case .evening: return 18
        case .custom: return 8
        }
    }

    /// Default minute for this period
    var defaultMinute: Int {
        return 0
    }
}

// MARK: - Notification Type

/// Types of notifications the app can send
enum NotificationType: String, CaseIterable, Identifiable {
    case dailyReminder
    case streakAtRisk

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .dailyReminder: return "Daily Workout Reminder"
        case .streakAtRisk: return "Streak at Risk"
        }
    }

    var description: String {
        switch self {
        case .dailyReminder: return "A gentle nudge at your preferred time"
        case .streakAtRisk: return "Reminder before your streak resets"
        }
    }

    var icon: String {
        switch self {
        case .dailyReminder: return "bell.fill"
        case .streakAtRisk: return "flame.fill"
        }
    }

    /// Notification identifier prefix for this type
    var identifierPrefix: String {
        switch self {
        case .dailyReminder: return "daily_reminder"
        case .streakAtRisk: return "streak_at_risk"
        }
    }
}

// MARK: - Notification Content

/// Hamster-voiced notification messages
enum NotificationContent {

    /// Get a random daily reminder message
    static var dailyReminderMessages: [(title: String, body: String)] {
        [
            (
                title: "Hey there!",
                body: "Ready for a little movement today? I'll be cheering you on!"
            ),
            (
                title: "Workout time?",
                body: "Just a friendly nudge — how about we do a workout together?"
            ),
            (
                title: "Your hamster is excited!",
                body: "I've been waiting for you! Want to get moving?"
            ),
            (
                title: "Hi friend!",
                body: "It's a great day for some exercise. I believe in you!"
            ),
            (
                title: "Let's go!",
                body: "Your workout buddy is ready when you are!"
            )
        ]
    }

    /// Get a random streak at risk message
    static var streakAtRiskMessages: [(title: String, body: String)] {
        [
            (
                title: "Quick check-in!",
                body: "We haven't worked out together today! There's still time to keep our streak going."
            ),
            (
                title: "Hey!",
                body: "I'm getting a little antsy... want to do a quick workout before the day ends?"
            ),
            (
                title: "Streak reminder",
                body: "Just a gentle nudge — your streak is waiting! Even a short workout counts."
            )
        ]
    }

    /// Get a random daily reminder
    static func randomDailyReminder() -> (title: String, body: String) {
        dailyReminderMessages.randomElement() ?? dailyReminderMessages[0]
    }

    /// Get a random streak at risk reminder
    static func randomStreakAtRisk() -> (title: String, body: String) {
        streakAtRiskMessages.randomElement() ?? streakAtRiskMessages[0]
    }
}

// MARK: - Permission State

/// Current state of notification permissions
enum NotificationPermissionState: Equatable {
    case notDetermined
    case authorized
    case denied
    case provisional
    case ephemeral

    var isAuthorized: Bool {
        switch self {
        case .authorized, .provisional, .ephemeral:
            return true
        case .notDetermined, .denied:
            return false
        }
    }

    var displayName: String {
        switch self {
        case .notDetermined: return "Not Set"
        case .authorized: return "Enabled"
        case .denied: return "Disabled"
        case .provisional: return "Provisional"
        case .ephemeral: return "Temporary"
        }
    }

    var description: String {
        switch self {
        case .notDetermined:
            return "Notifications haven't been set up yet"
        case .authorized:
            return "You'll receive gentle reminders from your hamster"
        case .denied:
            return "Notifications are turned off in Settings"
        case .provisional:
            return "Quiet notifications are enabled"
        case .ephemeral:
            return "Temporary notifications are enabled"
        }
    }
}

// MARK: - UserDefaults Persistence

extension NotificationPreferences {

    /// Load preferences from UserDefaults
    static func loadFromUserDefaults() -> NotificationPreferences {
        let defaults = UserDefaults.standard

        return NotificationPreferences(
            userEnabled: defaults.object(forKey: NotificationPreferencesKey.userEnabled) as? Bool ?? defaultUserEnabled,
            dailyReminderEnabled: defaults.object(forKey: NotificationPreferencesKey.dailyReminderEnabled) as? Bool ?? defaultDailyReminderEnabled,
            streakReminderEnabled: defaults.object(forKey: NotificationPreferencesKey.streakReminderEnabled) as? Bool ?? defaultStreakReminderEnabled,
            reminderHour: defaults.object(forKey: NotificationPreferencesKey.reminderHour) as? Int ?? defaultReminderHour,
            reminderMinute: defaults.object(forKey: NotificationPreferencesKey.reminderMinute) as? Int ?? defaultReminderMinute,
            quietHoursEnabled: defaults.object(forKey: NotificationPreferencesKey.quietHoursEnabled) as? Bool ?? defaultQuietHoursEnabled,
            quietHoursStart: defaults.object(forKey: NotificationPreferencesKey.quietHoursStart) as? Int ?? defaultQuietHoursStart,
            quietHoursEnd: defaults.object(forKey: NotificationPreferencesKey.quietHoursEnd) as? Int ?? defaultQuietHoursEnd
        )
    }

    /// Save preferences to UserDefaults
    func saveToUserDefaults() {
        let defaults = UserDefaults.standard
        defaults.set(userEnabled, forKey: NotificationPreferencesKey.userEnabled)
        defaults.set(dailyReminderEnabled, forKey: NotificationPreferencesKey.dailyReminderEnabled)
        defaults.set(streakReminderEnabled, forKey: NotificationPreferencesKey.streakReminderEnabled)
        defaults.set(reminderHour, forKey: NotificationPreferencesKey.reminderHour)
        defaults.set(reminderMinute, forKey: NotificationPreferencesKey.reminderMinute)
        defaults.set(quietHoursEnabled, forKey: NotificationPreferencesKey.quietHoursEnabled)
        defaults.set(quietHoursStart, forKey: NotificationPreferencesKey.quietHoursStart)
        defaults.set(quietHoursEnd, forKey: NotificationPreferencesKey.quietHoursEnd)
    }

    /// Whether the permission prompt has been shown before
    static var hasShownPermissionPrompt: Bool {
        get { UserDefaults.standard.bool(forKey: NotificationPreferencesKey.hasShownPermissionPrompt) }
        set { UserDefaults.standard.set(newValue, forKey: NotificationPreferencesKey.hasShownPermissionPrompt) }
    }

    /// Date when the permission prompt was last shown
    static var permissionPromptDate: Date? {
        get { UserDefaults.standard.object(forKey: NotificationPreferencesKey.permissionPromptDate) as? Date }
        set { UserDefaults.standard.set(newValue, forKey: NotificationPreferencesKey.permissionPromptDate) }
    }

    /// Whether we can show the permission prompt again (7 day cooldown)
    static var canShowPermissionPromptAgain: Bool {
        guard hasShownPermissionPrompt else { return true }
        guard let lastDate = permissionPromptDate else { return true }

        let daysSince = Calendar.current.dateComponents([.day], from: lastDate, to: Date()).day ?? 0
        return daysSince >= 7
    }
}

// MARK: - WorkoutTime Extension

extension WorkoutTime {
    /// Convert onboarding workout time preference to notification reminder hour
    var defaultReminderHour: Int {
        switch self {
        case .morning: return 8
        case .afternoon: return 13
        case .evening: return 18
        case .noPreference: return 8
        }
    }
}
