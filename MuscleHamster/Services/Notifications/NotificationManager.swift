//
//  NotificationManager.swift
//  MuscleHamster
//
//  Centralized manager for notification permissions and scheduling
//  Phase 08.2: Push Permission UX and Scheduling Rules
//  Phase 08.3: Notification Tap Routing and Today Context
//

import Foundation
import UserNotifications
import SwiftUI

// MARK: - Notification Manager

/// Singleton manager for handling all notification-related functionality
@MainActor
final class NotificationManager: NSObject, ObservableObject {

    // MARK: - Singleton

    static let shared = NotificationManager()

    // MARK: - Published State

    /// Current iOS notification permission state
    @Published private(set) var permissionState: NotificationPermissionState = .notDetermined

    /// User's notification preferences
    @Published var preferences: NotificationPreferences {
        didSet {
            preferences.saveToUserDefaults()
            if preferences != oldValue {
                Task {
                    await rescheduleNotifications()
                }
            }
        }
    }

    /// Whether notifications are effectively enabled (permission + user preference)
    var isEffectivelyEnabled: Bool {
        permissionState.isAuthorized && preferences.userEnabled
    }

    // MARK: - Private Properties

    private let notificationCenter = UNUserNotificationCenter.current()

    /// Callback for when a notification is tapped (set by app on launch)
    var onNotificationTap: ((_ notificationType: NotificationType, _ hasCheckedInToday: Bool, _ currentStreak: Int) -> Void)?

    // MARK: - Init

    private override init() {
        self.preferences = NotificationPreferences.loadFromUserDefaults()

        super.init()

        // Set ourselves as the notification center delegate
        notificationCenter.delegate = self

        // Check initial permission state
        Task {
            await refreshPermissionState()
        }

        // Listen for app becoming active to refresh permission state
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appDidBecomeActive),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    @objc private func appDidBecomeActive() {
        Task { @MainActor in
            await refreshPermissionState()
        }
    }

    // MARK: - Notification Type Parsing

    /// Parse a notification identifier to determine its type
    func parseNotificationType(from identifier: String) -> NotificationType? {
        if identifier.hasPrefix(NotificationType.dailyReminder.identifierPrefix) {
            return .dailyReminder
        } else if identifier.hasPrefix(NotificationType.streakAtRisk.identifierPrefix) {
            return .streakAtRisk
        }
        return nil
    }

    // MARK: - Permission Management

    /// Refresh the current permission state from the system
    func refreshPermissionState() async {
        let settings = await notificationCenter.notificationSettings()

        switch settings.authorizationStatus {
        case .notDetermined:
            permissionState = .notDetermined
        case .denied:
            permissionState = .denied
        case .authorized:
            permissionState = .authorized
        case .provisional:
            permissionState = .provisional
        case .ephemeral:
            permissionState = .ephemeral
        @unknown default:
            permissionState = .notDetermined
        }
    }

    /// Request notification permission from the user
    /// - Returns: Whether permission was granted
    @discardableResult
    func requestPermission() async -> Bool {
        do {
            let granted = try await notificationCenter.requestAuthorization(options: [.alert, .sound, .badge])
            await refreshPermissionState()

            if granted {
                // Enable notifications and schedule them
                preferences.userEnabled = true
                await rescheduleNotifications()
            }

            // Track that we've shown the prompt
            NotificationPreferences.hasShownPermissionPrompt = true
            NotificationPreferences.permissionPromptDate = Date()

            return granted
        } catch {
            print("NotificationManager: Failed to request permission: \(error)")
            await refreshPermissionState()
            return false
        }
    }

    /// Enable notifications (called when user toggles on in settings)
    func enableNotifications() async {
        if permissionState == .notDetermined {
            await requestPermission()
        } else if permissionState.isAuthorized {
            preferences.userEnabled = true
            await rescheduleNotifications()
        }
    }

    /// Disable notifications (called when user toggles off in settings)
    func disableNotifications() async {
        preferences.userEnabled = false
        await cancelAllNotifications()
    }

    // MARK: - Notification Scheduling

    /// Reschedule all notifications based on current preferences
    func rescheduleNotifications() async {
        // First, cancel all existing notifications
        await cancelAllNotifications()

        // Only schedule if effectively enabled
        guard isEffectivelyEnabled else { return }

        // Schedule daily reminder if enabled
        if preferences.dailyReminderEnabled {
            await scheduleDailyReminder()
        }

        // Schedule streak at risk reminder if enabled
        if preferences.streakReminderEnabled {
            await scheduleStreakAtRiskReminder()
        }
    }

    /// Schedule the daily workout reminder
    private func scheduleDailyReminder() async {
        let content = NotificationContent.randomDailyReminder()

        let notificationContent = UNMutableNotificationContent()
        notificationContent.title = content.title
        notificationContent.body = content.body
        notificationContent.sound = .default
        notificationContent.badge = 1

        // Create trigger for the preferred time (repeating daily)
        var dateComponents = DateComponents()
        dateComponents.hour = preferences.reminderHour
        dateComponents.minute = preferences.reminderMinute

        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)

        let request = UNNotificationRequest(
            identifier: "\(NotificationType.dailyReminder.identifierPrefix)_daily",
            content: notificationContent,
            trigger: trigger
        )

        do {
            try await notificationCenter.add(request)
            print("NotificationManager: Scheduled daily reminder for \(preferences.formattedReminderTime)")
        } catch {
            print("NotificationManager: Failed to schedule daily reminder: \(error)")
        }
    }

    /// Schedule the streak at risk reminder (evening reminder)
    private func scheduleStreakAtRiskReminder() async {
        let content = NotificationContent.randomStreakAtRisk()

        let notificationContent = UNMutableNotificationContent()
        notificationContent.title = content.title
        notificationContent.body = content.body
        notificationContent.sound = .default
        notificationContent.badge = 1

        // Create trigger for evening time (repeating daily)
        var dateComponents = DateComponents()
        dateComponents.hour = preferences.streakReminderHour
        dateComponents.minute = 0

        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)

        let request = UNNotificationRequest(
            identifier: "\(NotificationType.streakAtRisk.identifierPrefix)_daily",
            content: notificationContent,
            trigger: trigger
        )

        do {
            try await notificationCenter.add(request)
            print("NotificationManager: Scheduled streak at risk reminder for \(preferences.streakReminderHour):00")
        } catch {
            print("NotificationManager: Failed to schedule streak at risk reminder: \(error)")
        }
    }

    /// Cancel all scheduled notifications
    func cancelAllNotifications() async {
        notificationCenter.removeAllPendingNotificationRequests()
        notificationCenter.removeAllDeliveredNotifications()
        await clearBadge()
        print("NotificationManager: Cancelled all notifications")
    }

    /// Cancel a specific notification type
    func cancelNotification(type: NotificationType) async {
        let identifiers = ["\(type.identifierPrefix)_daily"]
        notificationCenter.removePendingNotificationRequests(withIdentifiers: identifiers)
        notificationCenter.removeDeliveredNotifications(withIdentifiers: identifiers)
    }

    /// Clear the app badge
    func clearBadge() async {
        await UIApplication.shared.applicationIconBadgeNumber = 0
    }

    // MARK: - Preference Updates

    /// Update the preferred reminder time
    func updateReminderTime(hour: Int, minute: Int) {
        preferences.reminderHour = hour
        preferences.reminderMinute = minute
        // Notification rescheduling happens via didSet on preferences
    }

    /// Update reminder time from a time period selection
    func updateReminderTime(period: ReminderTimePeriod) {
        preferences.reminderHour = period.defaultHour
        preferences.reminderMinute = period.defaultMinute
    }

    /// Toggle daily reminder
    func toggleDailyReminder(_ enabled: Bool) {
        preferences.dailyReminderEnabled = enabled
    }

    /// Toggle streak at risk reminder
    func toggleStreakReminder(_ enabled: Bool) {
        preferences.streakReminderEnabled = enabled
    }

    /// Initialize preferences from user's onboarding workout time preference
    func initializeFromOnboarding(workoutTime: WorkoutTime?) {
        guard let workoutTime = workoutTime else { return }

        // Only initialize if user hasn't set preferences yet
        if !NotificationPreferences.hasShownPermissionPrompt {
            preferences.reminderHour = workoutTime.defaultReminderHour
            preferences.reminderMinute = 0
        }
    }

    // MARK: - Check-In Handling

    /// Called when user completes a check-in (workout or rest day)
    /// This can cancel today's pending notifications since they've already checked in
    func handleCheckIn() async {
        // For now, we don't cancel pending notifications on check-in
        // because local notifications can't be conditionally delivered
        // In a future version, we could use a notification service extension
        // to check status before delivery

        // Clear any delivered notifications and badge
        notificationCenter.removeAllDeliveredNotifications()
        await clearBadge()
    }

    // MARK: - Status Helpers

    /// Whether we should show the notification permission prompt
    /// (after first workout, if not already shown or cooldown passed)
    func shouldShowPermissionPrompt(totalWorkouts: Int) -> Bool {
        // Only show after first workout
        guard totalWorkouts >= 1 else { return false }

        // Don't show if already authorized
        if permissionState.isAuthorized { return false }

        // Don't show if denied (user made their choice)
        if permissionState == .denied { return false }

        // Check cooldown
        return NotificationPreferences.canShowPermissionPromptAgain
    }

    /// Get pending notification requests (for debugging)
    func getPendingNotifications() async -> [UNNotificationRequest] {
        return await notificationCenter.pendingNotificationRequests()
    }
}

// MARK: - UNUserNotificationCenterDelegate

extension NotificationManager: UNUserNotificationCenterDelegate {

    /// Called when a notification is delivered while app is in foreground
    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        // Show the notification even when app is in foreground
        // This allows users to see reminders if they're already in the app
        completionHandler([.banner, .sound, .badge])
    }

    /// Called when user taps a notification
    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let identifier = response.notification.request.identifier

        Task { @MainActor in
            await handleNotificationResponse(identifier: identifier)
        }

        completionHandler()
    }

    /// Handle a notification tap
    @MainActor
    private func handleNotificationResponse(identifier: String) async {
        print("NotificationManager: Handling notification tap - identifier: \(identifier)")

        // Parse the notification type
        guard let notificationType = parseNotificationType(from: identifier) else {
            print("NotificationManager: Unknown notification identifier: \(identifier)")
            return
        }

        // Clear badge and delivered notifications
        notificationCenter.removeAllDeliveredNotifications()
        await clearBadge()

        // Get current user stats to determine today context
        // Note: This needs the activity service, but we want to avoid tight coupling
        // So we use the callback pattern to let the app handle routing
        let activityService = MockActivityService.shared
        let userId = UserDefaults.standard.string(forKey: "currentUserId") ?? ""

        var hasCheckedInToday = false
        var currentStreak = 0

        if !userId.isEmpty {
            do {
                let stats = try await activityService.getUserStats(userId: userId)
                hasCheckedInToday = stats.hasAnyCheckInToday
                currentStreak = stats.currentStreak
            } catch {
                print("NotificationManager: Failed to get user stats: \(error)")
                // Continue with defaults - routing will still work
            }
        }

        // Call the tap handler if set
        onNotificationTap?(notificationType, hasCheckedInToday, currentStreak)

        // Also update the routing state directly
        AppRoutingState.shared.handleNotificationTap(
            notificationType: notificationType,
            hasCheckedInToday: hasCheckedInToday,
            currentStreak: currentStreak
        )
    }
}

// MARK: - Notification Error

enum NotificationError: LocalizedError {
    case permissionDenied
    case schedulingFailed(underlying: Error)
    case unknown

    var errorDescription: String? {
        switch self {
        case .permissionDenied:
            return "Notification permission was denied"
        case .schedulingFailed(let error):
            return "Failed to schedule notification: \(error.localizedDescription)"
        case .unknown:
            return "An unknown error occurred"
        }
    }

    /// Friendly hamster-voiced error message
    var friendlyMessage: String {
        switch self {
        case .permissionDenied:
            return "I'd love to send you reminders, but notifications are turned off. You can enable them in Settings whenever you're ready!"
        case .schedulingFailed:
            return "Hmm, I had trouble setting up your reminders. Want to try again?"
        case .unknown:
            return "Something went wrong with notifications. No worries though!"
        }
    }
}
