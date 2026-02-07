//
//  Friend.swift
//  MuscleHamster
//
//  Models for friend relationships, requests, streaks, and blocking
//  Phase 09.1: Friend Data Model and Service Layer
//

import Foundation

// MARK: - Friend Relationship

/// Status of a friendship between two users
enum FriendRelationshipStatus: String, Codable, CaseIterable {
    case pending    // Request sent, awaiting acceptance
    case accepted   // Mutual friendship established
    case blocked    // One user has blocked the other

    var displayName: String {
        switch self {
        case .pending: return "Pending"
        case .accepted: return "Friends"
        case .blocked: return "Blocked"
        }
    }
}

/// Represents a mutual friendship between two users
struct FriendRelationship: Codable, Identifiable, Equatable {
    let id: String
    let userId1: String   // First user ID
    let userId2: String   // Second user ID
    var status: FriendRelationshipStatus
    let createdAt: Date   // When the relationship was first created (request sent)
    var acceptedAt: Date? // When the friendship was accepted
    var friendStreakId: String? // Reference to the friend streak, if exists

    init(
        id: String = UUID().uuidString,
        userId1: String,
        userId2: String,
        status: FriendRelationshipStatus = .pending,
        createdAt: Date = Date(),
        acceptedAt: Date? = nil,
        friendStreakId: String? = nil
    ) {
        self.id = id
        self.userId1 = userId1
        self.userId2 = userId2
        self.status = status
        self.createdAt = createdAt
        self.acceptedAt = acceptedAt
        self.friendStreakId = friendStreakId
    }

    /// Check if a given user is part of this relationship
    func involves(userId: String) -> Bool {
        userId1 == userId || userId2 == userId
    }

    /// Get the other user's ID in this relationship
    func otherUserId(from userId: String) -> String? {
        if userId1 == userId { return userId2 }
        if userId2 == userId { return userId1 }
        return nil
    }

    /// Whether this relationship represents an active friendship
    var isActive: Bool {
        status == .accepted
    }
}

// MARK: - Friend Request

/// Status of a friend request
enum FriendRequestStatus: String, Codable, CaseIterable {
    case pending    // Awaiting response
    case accepted   // Request was accepted
    case declined   // Request was declined
    case cancelled  // Sender cancelled the request
    case expired    // Request expired (optional future feature)

    var displayName: String {
        switch self {
        case .pending: return "Pending"
        case .accepted: return "Accepted"
        case .declined: return "Declined"
        case .cancelled: return "Cancelled"
        case .expired: return "Expired"
        }
    }

    var icon: String {
        switch self {
        case .pending: return "clock.fill"
        case .accepted: return "checkmark.circle.fill"
        case .declined: return "xmark.circle.fill"
        case .cancelled: return "minus.circle.fill"
        case .expired: return "clock.badge.xmark.fill"
        }
    }

    var isResolved: Bool {
        self != .pending
    }
}

/// Represents a friend request from one user to another
struct FriendRequest: Codable, Identifiable, Equatable {
    let id: String
    let senderId: String      // User who sent the request
    let receiverId: String    // User who should receive/respond
    var status: FriendRequestStatus
    let sentAt: Date          // When the request was sent
    var respondedAt: Date?    // When the receiver responded (if applicable)

    init(
        id: String = UUID().uuidString,
        senderId: String,
        receiverId: String,
        status: FriendRequestStatus = .pending,
        sentAt: Date = Date(),
        respondedAt: Date? = nil
    ) {
        self.id = id
        self.senderId = senderId
        self.receiverId = receiverId
        self.status = status
        self.sentAt = sentAt
        self.respondedAt = respondedAt
    }

    /// Whether this request can still be responded to
    var canRespond: Bool {
        status == .pending
    }

    /// Formatted date for display
    var displaySentDate: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: sentAt, relativeTo: Date())
    }
}

// MARK: - Friend Streak

/// Status of a friend streak
enum FriendStreakStatus: String, Codable, CaseIterable {
    case active     // Both friends have checked in today
    case waiting    // One friend has checked in, waiting for the other
    case atRisk     // One checked in yesterday, other hasn't - at risk
    case broken     // Streak was broken (one or both missed)
    case none       // No streak started yet

    var displayName: String {
        switch self {
        case .active: return "On Fire"
        case .waiting: return "Waiting"
        case .atRisk: return "At Risk"
        case .broken: return "Broken"
        case .none: return "Not Started"
        }
    }

    var icon: String {
        switch self {
        case .active: return "flame.fill"
        case .waiting: return "clock.fill"
        case .atRisk: return "exclamationmark.triangle.fill"
        case .broken: return "heart.slash.fill"
        case .none: return "sparkles"
        }
    }

    var color: String {
        switch self {
        case .active: return "orange"
        case .waiting: return "blue"
        case .atRisk: return "yellow"
        case .broken: return "gray"
        case .none: return "purple"
        }
    }

    var isAtRisk: Bool { self == .atRisk }
    var isBroken: Bool { self == .broken }
    var isActive: Bool { self == .active || self == .waiting }
}

/// Represents a shared streak between two friends
struct FriendStreak: Codable, Identifiable, Equatable {
    let id: String
    let userId1: String            // First friend's ID
    let userId2: String            // Second friend's ID
    var currentStreak: Int         // Current streak count
    var longestStreak: Int         // Longest streak ever achieved together
    var lastCheckInUser1: Date?    // Last check-in date for user 1
    var lastCheckInUser2: Date?    // Last check-in date for user 2
    var status: FriendStreakStatus // Current status
    var previousBrokenStreak: Int  // For restore purposes
    let createdAt: Date            // When the streak was created
    var lastUpdatedAt: Date        // Last time streak was updated

    init(
        id: String = UUID().uuidString,
        userId1: String,
        userId2: String,
        currentStreak: Int = 0,
        longestStreak: Int = 0,
        lastCheckInUser1: Date? = nil,
        lastCheckInUser2: Date? = nil,
        status: FriendStreakStatus = .none,
        previousBrokenStreak: Int = 0,
        createdAt: Date = Date(),
        lastUpdatedAt: Date = Date()
    ) {
        self.id = id
        self.userId1 = userId1
        self.userId2 = userId2
        self.currentStreak = currentStreak
        self.longestStreak = longestStreak
        self.lastCheckInUser1 = lastCheckInUser1
        self.lastCheckInUser2 = lastCheckInUser2
        self.status = status
        self.previousBrokenStreak = previousBrokenStreak
        self.createdAt = createdAt
        self.lastUpdatedAt = lastUpdatedAt
    }

    /// Check if a given user is part of this streak
    func involves(userId: String) -> Bool {
        userId1 == userId || userId2 == userId
    }

    /// Get the other user's ID in this streak
    func otherUserId(from userId: String) -> String? {
        if userId1 == userId { return userId2 }
        if userId2 == userId { return userId1 }
        return nil
    }

    /// Get the last check-in date for a specific user
    func lastCheckIn(for userId: String) -> Date? {
        if userId1 == userId { return lastCheckInUser1 }
        if userId2 == userId { return lastCheckInUser2 }
        return nil
    }

    /// Whether a specific user has checked in today
    func hasCheckedInToday(userId: String) -> Bool {
        guard let lastCheckIn = lastCheckIn(for: userId) else { return false }
        return Calendar.current.isDateInToday(lastCheckIn)
    }

    /// Whether both users have checked in today
    var bothCheckedInToday: Bool {
        guard let check1 = lastCheckInUser1, let check2 = lastCheckInUser2 else { return false }
        let calendar = Calendar.current
        return calendar.isDateInToday(check1) && calendar.isDateInToday(check2)
    }

    /// Status message for display
    var statusMessage: String {
        switch status {
        case .active:
            if currentStreak >= 7 {
                return "You two are unstoppable! \(currentStreak) days together!"
            } else {
                return "Great teamwork! Both checked in today."
            }
        case .waiting:
            return "You're both doing great — one more check-in to go!"
        case .atRisk:
            return "Don't let the streak slip! Check in soon."
        case .broken:
            if previousBrokenStreak > 0 {
                return "Your \(previousBrokenStreak)-day streak ended. You can restore it!"
            } else {
                return "Streak ended. Ready to start again?"
            }
        case .none:
            return "Start your first streak together!"
        }
    }
}

// MARK: - Blocked User

/// Represents a one-directional block from one user to another
struct BlockedUser: Codable, Identifiable, Equatable {
    let id: String
    let blockerId: String   // User who initiated the block
    let blockedId: String   // User who is blocked
    let blockedAt: Date     // When the block occurred

    init(
        id: String = UUID().uuidString,
        blockerId: String,
        blockedId: String,
        blockedAt: Date = Date()
    ) {
        self.id = id
        self.blockerId = blockerId
        self.blockedId = blockedId
        self.blockedAt = blockedAt
    }
}

// MARK: - Friend Profile

/// Public profile information for a friend (what others can see)
struct FriendProfile: Codable, Identifiable, Equatable {
    let id: String              // User ID
    let email: String           // Email (may be partially masked)
    let hamsterName: String?    // Their hamster's name
    let currentStreak: Int      // Their personal streak
    let totalWorkoutsCompleted: Int
    let hamsterState: HamsterState
    let growthStage: GrowthStage
    let equippedOutfitId: String?
    let equippedAccessoryId: String?
    let friendStreak: FriendStreak? // Mutual streak with viewing user
    let visibilitySettings: FriendVisibilitySettings?

    init(
        id: String,
        email: String,
        hamsterName: String? = nil,
        currentStreak: Int = 0,
        totalWorkoutsCompleted: Int = 0,
        hamsterState: HamsterState = .chillin,
        growthStage: GrowthStage = .baby,
        equippedOutfitId: String? = nil,
        equippedAccessoryId: String? = nil,
        friendStreak: FriendStreak? = nil,
        visibilitySettings: FriendVisibilitySettings? = nil
    ) {
        self.id = id
        self.email = email
        self.hamsterName = hamsterName
        self.currentStreak = currentStreak
        self.totalWorkoutsCompleted = totalWorkoutsCompleted
        self.hamsterState = hamsterState
        self.growthStage = growthStage
        self.equippedOutfitId = equippedOutfitId
        self.equippedAccessoryId = equippedAccessoryId
        self.friendStreak = friendStreak
        self.visibilitySettings = visibilitySettings
    }

    /// Display name (hamster name or masked email)
    var displayName: String {
        if let name = hamsterName, !name.isEmpty {
            return name
        }
        return maskedEmail
    }

    /// Masked email for privacy (u***@example.com)
    var maskedEmail: String {
        guard let atIndex = email.firstIndex(of: "@") else { return email }
        let localPart = String(email[..<atIndex])
        let domain = String(email[atIndex...])

        if localPart.count <= 1 {
            return email
        }

        let firstChar = String(localPart.prefix(1))
        return "\(firstChar)***\(domain)"
    }
}

// MARK: - Friend Visibility Settings

/// Controls what information is visible to friends
struct FriendVisibilitySettings: Codable, Equatable {
    var showStreak: Bool
    var showWorkoutCount: Bool
    var showHamsterState: Bool
    var showGrowthStage: Bool
    var showCustomizations: Bool

    init(
        showStreak: Bool = true,
        showWorkoutCount: Bool = true,
        showHamsterState: Bool = true,
        showGrowthStage: Bool = true,
        showCustomizations: Bool = true
    ) {
        self.showStreak = showStreak
        self.showWorkoutCount = showWorkoutCount
        self.showHamsterState = showHamsterState
        self.showGrowthStage = showGrowthStage
        self.showCustomizations = showCustomizations
    }

    /// Default visibility settings (all visible)
    static let `default` = FriendVisibilitySettings()

    /// Private settings (minimal visibility)
    static let `private` = FriendVisibilitySettings(
        showStreak: false,
        showWorkoutCount: false,
        showHamsterState: true,
        showGrowthStage: false,
        showCustomizations: true
    )
}

// MARK: - Friend Streak Restore

/// Options for restoring a friend streak
enum FriendStreakRestoreOption: String, Codable, CaseIterable {
    case selfOnly   // Restore only your side (150 points)
    case forBoth    // Restore for both friends (300 points)

    var displayName: String {
        switch self {
        case .selfOnly: return "Restore My Side"
        case .forBoth: return "Restore for Both"
        }
    }

    var description: String {
        switch self {
        case .selfOnly: return "Fix your missed check-in. Your friend still needs to restore theirs."
        case .forBoth: return "Fix both missed check-ins. The streak continues right away!"
        }
    }

    var cost: Int {
        switch self {
        case .selfOnly: return 150
        case .forBoth: return 300
        }
    }

    var icon: String {
        switch self {
        case .selfOnly: return "person.fill"
        case .forBoth: return "person.2.fill"
        }
    }
}

/// Result of a friend streak restore attempt
struct FriendStreakRestoreResult: Equatable {
    let success: Bool
    let restoredStreak: Int
    let option: FriendStreakRestoreOption
    let pointsSpent: Int
    let message: String
    let friendNeedsToRestore: Bool  // For selfOnly option

    /// Hamster reaction to the restore
    var hamsterReaction: String {
        if success {
            switch option {
            case .selfOnly:
                if friendNeedsToRestore {
                    return "I fixed your side! Now your friend just needs to do theirs."
                } else {
                    return "Your streak is back on track! Great teamwork!"
                }
            case .forBoth:
                if restoredStreak >= 7 {
                    return "Wow, I saved both of you! Your \(restoredStreak)-day streak lives on!"
                } else {
                    return "All fixed! Your streak is saved. Keep going together!"
                }
            }
        } else {
            return "That's okay! Starting fresh together can be even more fun."
        }
    }
}

// MARK: - Friend Streak Points Config

/// Points configuration for friend streak features
enum FriendStreakConfig {
    /// Cost to restore your side of a broken friend streak
    static let selfRestoreCost = 150

    /// Cost to restore both sides of a broken friend streak
    static let bothRestoreCost = 300

    /// Whether the streak can be restored (within restore window)
    static func canRestore(brokenStreak: FriendStreak) -> Bool {
        // Can only restore on the day after the streak broke
        guard brokenStreak.status == .broken else { return false }
        guard brokenStreak.previousBrokenStreak > 0 else { return false }

        let calendar = Calendar.current

        // Check if either user checked in yesterday (restore window)
        let yesterdayCheck1 = brokenStreak.lastCheckInUser1.map { calendar.isDateInYesterday($0) } ?? false
        let yesterdayCheck2 = brokenStreak.lastCheckInUser2.map { calendar.isDateInYesterday($0) } ?? false

        return yesterdayCheck1 || yesterdayCheck2
    }
}

// MARK: - Persistence

extension FriendStreak {
    /// UserDefaults key format for friend streaks
    static func storageKey(userId1: String, userId2: String) -> String {
        // Sort user IDs to ensure consistent key regardless of order
        let sortedIds = [userId1, userId2].sorted()
        return "friendStreak_\(sortedIds[0])_\(sortedIds[1])"
    }

    /// Save to UserDefaults
    func save() {
        let key = Self.storageKey(userId1: userId1, userId2: userId2)
        if let encoded = try? JSONEncoder().encode(self) {
            UserDefaults.standard.set(encoded, forKey: key)
        }
    }

    /// Load from UserDefaults
    static func load(userId1: String, userId2: String) -> FriendStreak? {
        let key = storageKey(userId1: userId1, userId2: userId2)
        guard let data = UserDefaults.standard.data(forKey: key),
              let streak = try? JSONDecoder().decode(FriendStreak.self, from: data) else {
            return nil
        }
        return streak
    }
}

extension FriendVisibilitySettings {
    /// UserDefaults key format
    static func storageKey(for userId: String) -> String {
        "friendVisibility_\(userId)"
    }

    /// Save to UserDefaults
    func save(for userId: String) {
        if let encoded = try? JSONEncoder().encode(self) {
            UserDefaults.standard.set(encoded, forKey: Self.storageKey(for: userId))
        }
    }

    /// Load from UserDefaults
    static func load(for userId: String) -> FriendVisibilitySettings {
        guard let data = UserDefaults.standard.data(forKey: storageKey(for: userId)),
              let settings = try? JSONDecoder().decode(FriendVisibilitySettings.self, from: data) else {
            return .default
        }
        return settings
    }
}
