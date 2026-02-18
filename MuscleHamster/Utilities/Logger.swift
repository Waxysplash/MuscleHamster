//
//  Logger.swift
//  MuscleHamster
//
//  Centralized logging utility using OSLog for structured logging.
//  Replaces print() statements throughout the app.
//  Phase: Internal Testing & Polish
//

import Foundation
import OSLog

// MARK: - App Logger

/// Centralized logging for the MuscleHamster app using Apple's OSLog framework.
/// Provides structured, filterable logs that can be viewed in Console.app.
enum AppLogger {

    // MARK: - Subsystem

    /// The app's bundle identifier used as the OSLog subsystem
    private static let subsystem = Bundle.main.bundleIdentifier ?? "com.musclehamster.app"

    // MARK: - Log Categories

    /// Logger for notification-related events
    static let notifications = Logger(subsystem: subsystem, category: "Notifications")

    /// Logger for audio playback events
    static let audio = Logger(subsystem: subsystem, category: "Audio")

    /// Logger for authentication events
    static let auth = Logger(subsystem: subsystem, category: "Auth")

    /// Logger for navigation and routing events
    static let routing = Logger(subsystem: subsystem, category: "Routing")

    /// Logger for workout-related events
    static let workout = Logger(subsystem: subsystem, category: "Workout")

    /// Logger for activity/streak tracking
    static let activity = Logger(subsystem: subsystem, category: "Activity")

    /// Logger for shop and purchases
    static let shop = Logger(subsystem: subsystem, category: "Shop")

    /// Logger for friend/social features
    static let social = Logger(subsystem: subsystem, category: "Social")

    /// Logger for data persistence
    static let persistence = Logger(subsystem: subsystem, category: "Persistence")

    /// Logger for network operations
    static let network = Logger(subsystem: subsystem, category: "Network")

    /// Logger for general app events
    static let general = Logger(subsystem: subsystem, category: "General")

    /// Logger for debug-only information (not included in release builds)
    static let debug = Logger(subsystem: subsystem, category: "Debug")
}

// MARK: - Logger Extensions

extension Logger {

    /// Log a success event
    /// - Parameters:
    ///   - message: The success message
    ///   - context: Optional additional context
    func success(_ message: String, context: String? = nil) {
        if let context = context {
            self.info("✅ \(message) | \(context)")
        } else {
            self.info("✅ \(message)")
        }
    }

    /// Log a failure event
    /// - Parameters:
    ///   - message: The failure message
    ///   - error: Optional error that caused the failure
    func failure(_ message: String, error: Error? = nil) {
        if let error = error {
            self.error("❌ \(message) | Error: \(error.localizedDescription)")
        } else {
            self.error("❌ \(message)")
        }
    }

    /// Log a state change
    /// - Parameters:
    ///   - from: Previous state description
    ///   - to: New state description
    func stateChange(from: String, to: String) {
        self.debug("🔄 State: \(from) → \(to)")
    }

    /// Log a user action
    /// - Parameter action: Description of the action
    func userAction(_ action: String) {
        self.info("👆 User: \(action)")
    }

    /// Log a timing/performance event
    /// - Parameters:
    ///   - event: Event name
    ///   - duration: Duration in seconds
    func timing(_ event: String, duration: TimeInterval) {
        self.debug("⏱️ \(event): \(String(format: "%.2f", duration))s")
    }
}

// MARK: - Debug-Only Logging

#if DEBUG
/// Debug-only print that won't appear in release builds
/// Use this for temporary debugging that should never ship
func debugLog(_ items: Any..., file: String = #file, function: String = #function, line: Int = #line) {
    let fileName = (file as NSString).lastPathComponent
    let output = items.map { "\($0)" }.joined(separator: " ")
    AppLogger.debug.debug("[\(fileName):\(line)] \(function): \(output)")
}
#else
/// No-op in release builds
@inline(__always)
func debugLog(_ items: Any..., file: String = #file, function: String = #function, line: Int = #line) {
    // No-op in release
}
#endif
