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
    let longestStreak: Int      // Their longest personal streak ever
    let totalWorkoutsCompleted: Int
    let hamsterState: HamsterState
    let growthStage: GrowthStage
    let equippedOutfitId: String?
    let equippedAccessoryId: String?
    let friendStreak: FriendStreak? // Mutual streak with viewing user
    let visibilitySettings: FriendVisibilitySettings?
    let memberSince: Date?      // When they joined

    init(
        id: String,
        email: String,
        hamsterName: String? = nil,
        currentStreak: Int = 0,
        longestStreak: Int = 0,
        totalWorkoutsCompleted: Int = 0,
        hamsterState: HamsterState = .chillin,
        growthStage: GrowthStage = .baby,
        equippedOutfitId: String? = nil,
        equippedAccessoryId: String? = nil,
        friendStreak: FriendStreak? = nil,
        visibilitySettings: FriendVisibilitySettings? = nil,
        memberSince: Date? = nil
    ) {
        self.id = id
        self.email = email
        self.hamsterName = hamsterName
        self.currentStreak = currentStreak
        self.longestStreak = longestStreak
        self.totalWorkoutsCompleted = totalWorkoutsCompleted
        self.hamsterState = hamsterState
        self.growthStage = growthStage
        self.equippedOutfitId = equippedOutfitId
        self.equippedAccessoryId = equippedAccessoryId
        self.friendStreak = friendStreak
        self.visibilitySettings = visibilitySettings
        self.memberSince = memberSince
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

// MARK: - Profile Visibility Level

/// Controls who can find and view your profile
enum ProfileVisibilityLevel: String, Codable, CaseIterable, Identifiable {
    case everyone      // Anyone can see your profile and send requests
    case friendsOnly   // Only friends can see your full profile
    case `private`     // Hidden from search, no incoming requests

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .everyone: return "Everyone"
        case .friendsOnly: return "Friends Only"
        case .private: return "Private"
        }
    }

    var description: String {
        switch self {
        case .everyone:
            return "Anyone can find you and see your hamster"
        case .friendsOnly:
            return "Only friends can see your profile. Others see a limited view."
        case .private:
            return "You're hidden from search. Only existing friends can see you."
        }
    }

    var detailedDescription: String {
        switch self {
        case .everyone:
            return "Your profile appears in search results. Anyone can send you friend requests and view your hamster, growth stage, and customizations."
        case .friendsOnly:
            return "Only your friends can see your full profile. Non-friends see just your username and a 'Profile is private' message. Anyone can still send friend requests."
        case .private:
            return "You don't appear in search results. No one can send you friend requests. Only existing friends can see your profile. Add new friends by sharing your invite link."
        }
    }

    var icon: String {
        switch self {
        case .everyone: return "globe"
        case .friendsOnly: return "person.2.fill"
        case .private: return "lock.fill"
        }
    }

    var color: String {
        switch self {
        case .everyone: return "green"
        case .friendsOnly: return "blue"
        case .private: return "orange"
        }
    }

    /// Whether this level allows friend requests from non-friends
    var allowsIncomingRequests: Bool {
        self != .private
    }

    /// Whether this level shows in search results
    var showsInSearch: Bool {
        self != .private && self != .friendsOnly
    }
}

// MARK: - Privacy Settings

/// User privacy preferences for social features
struct PrivacySettings: Codable, Equatable {
    var profileVisibility: ProfileVisibilityLevel
    var allowFriendRequests: Bool

    init(
        profileVisibility: ProfileVisibilityLevel = .everyone,
        allowFriendRequests: Bool = true
    ) {
        self.profileVisibility = profileVisibility
        self.allowFriendRequests = allowFriendRequests
    }

    /// Default privacy settings (open to everyone)
    static let `default` = PrivacySettings()

    /// Whether incoming friend requests are allowed based on all settings
    var canReceiveFriendRequests: Bool {
        allowFriendRequests && profileVisibility.allowsIncomingRequests
    }
}

extension PrivacySettings {
    /// UserDefaults key format
    static func storageKey(for userId: String) -> String {
        "privacySettings_\(userId)"
    }

    /// Save to UserDefaults with proper error logging
    func save(for userId: String) {
        PersistenceHelper.save(self, forKey: Self.storageKey(for: userId), context: "PrivacySettings for \(userId)")
    }

    /// Load from UserDefaults with proper error logging
    static func load(for userId: String) -> PrivacySettings {
        PersistenceHelper.load(PrivacySettings.self, forKey: storageKey(for: userId), context: "PrivacySettings for \(userId)") ?? .default
    }
}

// MARK: - Friend Nudge

/// Represents a nudge (encouragement) sent between friends
struct FriendNudge: Codable, Identifiable, Equatable {
    let id: String
    let senderId: String       // User who sent the nudge
    let recipientId: String    // User who received the nudge
    let sentAt: Date           // When the nudge was sent
    let messageIndex: Int      // Index into the message rotation

    init(
        id: String = UUID().uuidString,
        senderId: String,
        recipientId: String,
        sentAt: Date = Date(),
        messageIndex: Int = 0
    ) {
        self.id = id
        self.senderId = senderId
        self.recipientId = recipientId
        self.sentAt = sentAt
        self.messageIndex = messageIndex
    }

    /// Display message for the nudge (rotates through friendly messages)
    var message: String {
        NudgeMessages.forRecipient[messageIndex % NudgeMessages.forRecipient.count]
    }

    /// Message with friend's name substituted
    func messageWithName(_ name: String) -> String {
        message.replacingOccurrences(of: "[Name]", with: name)
    }
}

/// Nudge messages rotation
enum NudgeMessages {
    /// Messages shown to the recipient
    static let forRecipient: [String] = [
        "[Name] gave your hamster a little cheer!",
        "[Name]'s hamster is waving at yours!",
        "Your friend [Name] is thinking of you today!",
        "[Name] sent some encouragement your way!",
        "[Name]'s hamster and yours want to see each other happy!",
        "[Name] believes in you!",
        "A little encouragement from [Name]!",
        "Your hamster has a cheerleader — it's [Name]!"
    ]

    /// Messages shown in push notifications
    static let notificationBody: [String] = [
        "[Name]'s hamster is cheering for you! Time to check in?",
        "Your friend [Name] is rooting for you today!",
        "[Name] sent some encouragement — your hamster noticed!",
        "[Name] believes in you! Ready to check in?",
        "A friendly nudge from [Name]'s hamster!"
    ]

    /// Messages shown to the sender after sending
    static let confirmations: [String] = [
        "Your hamster gave [Name]'s hamster a cheer!",
        "[Name]'s hamster got your message!",
        "Encouragement sent!",
        "[Name] will get a friendly nudge from your hamster!",
        "Sent! [Name]'s hamster will let them know."
    ]

    /// Get a random message index
    static func randomIndex() -> Int {
        Int.random(in: 0..<forRecipient.count)
    }
}

/// Configuration for nudge limits and cooldowns
enum NudgeConfig {
    /// Cooldown between nudging the same friend (8 hours)
    static let perFriendCooldownSeconds: TimeInterval = 8 * 60 * 60

    /// Maximum nudges per day across all friends
    static let dailyLimit: Int = 5

    /// How long to keep nudge history (7 days)
    static let historyRetentionDays: Int = 7
}

/// Eligibility status for sending a nudge
enum NudgeEligibility: Equatable {
    case canNudge                           // Nudge is available
    case senderNotCheckedIn                 // Sender needs to check in first
    case recipientAlreadyCheckedIn          // Friend already checked in today
    case cooldownActive(remaining: TimeInterval)  // Recently nudged this friend
    case dailyLimitReached                  // Hit max nudges for today
    case notFriends                         // Not friends with this user
    case blocked                            // One user blocked the other

    var canSend: Bool {
        self == .canNudge
    }

    var displayMessage: String {
        switch self {
        case .canNudge:
            return "Send encouragement"
        case .senderNotCheckedIn:
            return "Check in first to send encouragement"
        case .recipientAlreadyCheckedIn:
            return "Already checked in today"
        case .cooldownActive(let remaining):
            return "Nudge again in \(formatTimeRemaining(remaining))"
        case .dailyLimitReached:
            return "You've encouraged lots of friends today!"
        case .notFriends:
            return "Add as friend first"
        case .blocked:
            return "Cannot send"
        }
    }

    var icon: String {
        switch self {
        case .canNudge:
            return "hand.wave.fill"
        case .senderNotCheckedIn:
            return "arrow.up.circle"
        case .recipientAlreadyCheckedIn:
            return "checkmark.circle.fill"
        case .cooldownActive:
            return "clock.fill"
        case .dailyLimitReached:
            return "heart.fill"
        case .notFriends, .blocked:
            return "xmark.circle"
        }
    }

    private func formatTimeRemaining(_ seconds: TimeInterval) -> String {
        let hours = Int(seconds) / 3600
        let minutes = (Int(seconds) % 3600) / 60

        if hours > 0 {
            return "\(hours)h \(minutes)m"
        } else if minutes > 0 {
            return "\(minutes)m"
        } else {
            return "a moment"
        }
    }
}

/// Nudge history tracking for a user
struct NudgeHistory: Codable {
    var sentNudges: [FriendNudge]
    var receivedNudges: [FriendNudge]

    init(sentNudges: [FriendNudge] = [], receivedNudges: [FriendNudge] = []) {
        self.sentNudges = sentNudges
        self.receivedNudges = receivedNudges
    }

    /// Nudges sent today
    var sentToday: [FriendNudge] {
        let calendar = Calendar.current
        return sentNudges.filter { calendar.isDateInToday($0.sentAt) }
    }

    /// Whether the daily limit has been reached
    var isDailyLimitReached: Bool {
        sentToday.count >= NudgeConfig.dailyLimit
    }

    /// Get cooldown remaining for a specific friend (nil if no cooldown)
    func cooldownRemaining(for friendId: String) -> TimeInterval? {
        guard let lastNudge = sentNudges
            .filter({ $0.recipientId == friendId })
            .max(by: { $0.sentAt < $1.sentAt }) else {
            return nil
        }

        let elapsed = Date().timeIntervalSince(lastNudge.sentAt)
        let remaining = NudgeConfig.perFriendCooldownSeconds - elapsed

        return remaining > 0 ? remaining : nil
    }

    /// Unread/new received nudges (within last 24 hours, not yet acknowledged)
    var recentReceivedNudges: [FriendNudge] {
        let oneDayAgo = Date().addingTimeInterval(-24 * 60 * 60)
        return receivedNudges.filter { $0.sentAt > oneDayAgo }
    }

    /// Prune old nudges beyond retention period
    mutating func pruneOldNudges() {
        let cutoff = Calendar.current.date(
            byAdding: .day,
            value: -NudgeConfig.historyRetentionDays,
            to: Date()
        ) ?? Date()

        sentNudges = sentNudges.filter { $0.sentAt > cutoff }
        receivedNudges = receivedNudges.filter { $0.sentAt > cutoff }
    }
}

extension NudgeHistory {
    /// UserDefaults key format
    static func storageKey(for userId: String) -> String {
        "nudgeHistory_\(userId)"
    }

    /// Save to UserDefaults with proper error logging
    func save(for userId: String) {
        PersistenceHelper.save(self, forKey: Self.storageKey(for: userId), context: "NudgeHistory for \(userId)")
    }

    /// Load from UserDefaults with proper error logging
    static func load(for userId: String) -> NudgeHistory {
        PersistenceHelper.load(NudgeHistory.self, forKey: storageKey(for: userId), context: "NudgeHistory for \(userId)") ?? NudgeHistory()
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

    /// Save to UserDefaults with proper error logging
    func save() {
        let key = Self.storageKey(userId1: userId1, userId2: userId2)
        PersistenceHelper.save(self, forKey: key, context: "FriendStreak between \(userId1) and \(userId2)")
    }

    /// Load from UserDefaults with proper error logging
    static func load(userId1: String, userId2: String) -> FriendStreak? {
        let key = storageKey(userId1: userId1, userId2: userId2)
        return PersistenceHelper.load(FriendStreak.self, forKey: key, context: "FriendStreak between \(userId1) and \(userId2)")
    }
}

extension FriendVisibilitySettings {
    /// UserDefaults key format
    static func storageKey(for userId: String) -> String {
        "friendVisibility_\(userId)"
    }

    /// Save to UserDefaults with proper error logging
    func save(for userId: String) {
        PersistenceHelper.save(self, forKey: Self.storageKey(for: userId), context: "FriendVisibilitySettings for \(userId)")
    }

    /// Load from UserDefaults with proper error logging
    static func load(for userId: String) -> FriendVisibilitySettings {
        PersistenceHelper.load(FriendVisibilitySettings.self, forKey: storageKey(for: userId), context: "FriendVisibilitySettings for \(userId)") ?? .default
    }
}
