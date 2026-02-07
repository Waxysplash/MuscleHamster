//
//  AppRoutingState.swift
//  MuscleHamster
//
//  Manages app-wide routing state for deep links and notification taps
//  Phase 08.3: Notification Tap Routing and Today Context
//

import Foundation
import SwiftUI

// MARK: - App Routing State

/// Observable object for managing app-wide routing state
@MainActor
final class AppRoutingState: ObservableObject {

    // MARK: - Singleton

    static let shared = AppRoutingState()

    // MARK: - Published State

    /// The pending destination to route to (set by notification tap, consumed by app)
    @Published var pendingDestination: DeepLinkDestination?

    /// Current notification context to display on Home
    @Published var notificationContext: NotificationContext?

    /// Whether the app should navigate to Home tab
    @Published var shouldNavigateToHome: Bool = false

    // MARK: - Init

    private init() {}

    // MARK: - Routing Methods

    /// Handle a notification tap and set appropriate routing state
    /// - Parameters:
    ///   - notificationType: The type of notification that was tapped
    ///   - hasCheckedInToday: Whether the user has any check-in today
    ///   - currentStreak: The user's current streak count
    func handleNotificationTap(
        notificationType: NotificationType,
        hasCheckedInToday: Bool,
        currentStreak: Int
    ) {
        let context = NotificationContext(
            notificationType: notificationType,
            tappedAt: Date(),
            hasCheckedInToday: hasCheckedInToday,
            currentStreak: currentStreak
        )

        // Set the context for Home to display
        notificationContext = context

        // Set destination to home with context
        pendingDestination = .homeWithNotificationContext(context)

        // Trigger navigation to home tab
        shouldNavigateToHome = true

        print("AppRoutingState: Handling notification tap - type: \(notificationType), checkedIn: \(hasCheckedInToday)")
    }

    /// Clear the pending destination after it's been consumed
    func clearPendingDestination() {
        pendingDestination = nil
        shouldNavigateToHome = false
    }

    /// Clear the notification context after it's been displayed
    func clearNotificationContext() {
        notificationContext = nil
    }

    /// Clear all routing state
    func clearAll() {
        pendingDestination = nil
        notificationContext = nil
        shouldNavigateToHome = false
    }
}

// MARK: - Deep Link Destination

/// Possible deep link destinations in the app
enum DeepLinkDestination: Equatable {
    case home
    case homeWithNotificationContext(NotificationContext)
    case workouts
    case restDayCheckIn

    static func == (lhs: DeepLinkDestination, rhs: DeepLinkDestination) -> Bool {
        switch (lhs, rhs) {
        case (.home, .home):
            return true
        case (.homeWithNotificationContext(let lhsContext), .homeWithNotificationContext(let rhsContext)):
            return lhsContext.id == rhsContext.id
        case (.workouts, .workouts):
            return true
        case (.restDayCheckIn, .restDayCheckIn):
            return true
        default:
            return false
        }
    }
}

// MARK: - Notification Context

/// Context passed from a notification tap to the destination screen
struct NotificationContext: Identifiable, Equatable {
    let id: String
    let notificationType: NotificationType
    let tappedAt: Date
    let hasCheckedInToday: Bool
    let currentStreak: Int

    init(
        notificationType: NotificationType,
        tappedAt: Date,
        hasCheckedInToday: Bool,
        currentStreak: Int
    ) {
        self.id = UUID().uuidString
        self.notificationType = notificationType
        self.tappedAt = tappedAt
        self.hasCheckedInToday = hasCheckedInToday
        self.currentStreak = currentStreak
    }

    /// The banner type to display based on context
    var bannerType: NotificationBannerType {
        if hasCheckedInToday {
            return .streakSafe
        } else if notificationType == .streakAtRisk {
            return .actionNeeded
        } else {
            return .gentleNudge
        }
    }

    /// The message to display in the banner
    var bannerMessage: String {
        switch bannerType {
        case .streakSafe:
            if currentStreak > 0 {
                return "You're all set! Your streak is safe at \(currentStreak) day\(currentStreak == 1 ? "" : "s")."
            } else {
                return "Great job checking in today! Keep it up!"
            }
        case .actionNeeded:
            return "There's still time! Check in to keep your streak going."
        case .gentleNudge:
            return "Ready when you are! Your hamster is excited to work out."
        }
    }

    /// Whether the banner should show an action button
    var hasActionButton: Bool {
        bannerType == .actionNeeded
    }

    /// The action button title
    var actionButtonTitle: String {
        "Quick Check-in"
    }

    /// Whether the banner should auto-dismiss
    var shouldAutoDismiss: Bool {
        bannerType != .actionNeeded
    }

    /// Auto-dismiss delay in seconds
    var autoDismissDelay: TimeInterval {
        8.0
    }
}

// MARK: - Notification Banner Type

/// Types of contextual banners shown after notification tap
enum NotificationBannerType {
    case streakSafe      // User already checked in
    case actionNeeded    // Streak at risk, no check-in
    case gentleNudge     // Daily reminder, no check-in

    var icon: String {
        switch self {
        case .streakSafe:
            return "checkmark.circle.fill"
        case .actionNeeded:
            return "flame.fill"
        case .gentleNudge:
            return "pawprint.fill"
        }
    }

    var backgroundColor: Color {
        switch self {
        case .streakSafe:
            return Color.green.opacity(0.15)
        case .actionNeeded:
            return Color.orange.opacity(0.15)
        case .gentleNudge:
            return Color.purple.opacity(0.15)
        }
    }

    var iconColor: Color {
        switch self {
        case .streakSafe:
            return .green
        case .actionNeeded:
            return .orange
        case .gentleNudge:
            return .purple
        }
    }

    var accessibilityLabel: String {
        switch self {
        case .streakSafe:
            return "Streak safe notification"
        case .actionNeeded:
            return "Action needed notification"
        case .gentleNudge:
            return "Workout reminder notification"
        }
    }
}
