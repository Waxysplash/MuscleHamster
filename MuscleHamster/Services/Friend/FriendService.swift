//
//  FriendService.swift
//  MuscleHamster
//
//  Service for managing friend relationships, requests, blocking, and friend streaks
//  Phase 09.1: Friend Data Model and Service Layer
//

import Foundation

// MARK: - Friend Service Protocol

protocol FriendServiceProtocol {
    // MARK: - Friend List

    /// Get all friends for a user
    func getFriends(userId: String) async throws -> [FriendProfile]

    /// Get the count of friends for a user
    func getFriendCount(userId: String) async -> Int

    /// Check if two users are friends
    func areFriends(userId1: String, userId2: String) async -> Bool

    /// Get a friend's profile (their public info)
    func getFriendProfile(friendId: String, viewingUserId: String) async throws -> FriendProfile

    // MARK: - Friend Requests

    /// Send a friend request to another user
    func sendFriendRequest(from senderId: String, to receiverId: String) async throws -> FriendRequest

    /// Accept a friend request
    func acceptFriendRequest(requestId: String, userId: String) async throws -> FriendRelationship

    /// Decline a friend request
    func declineFriendRequest(requestId: String, userId: String) async throws

    /// Cancel an outgoing friend request
    func cancelFriendRequest(requestId: String, userId: String) async throws

    /// Get pending incoming friend requests
    func getPendingIncomingRequests(userId: String) async throws -> [FriendRequest]

    /// Get pending outgoing friend requests
    func getPendingOutgoingRequests(userId: String) async throws -> [FriendRequest]

    /// Get the count of pending incoming requests (for badge display)
    func getPendingRequestCount(userId: String) async -> Int

    // MARK: - Friend Management

    /// Remove a friend (unfriend)
    func removeFriend(userId: String, friendId: String) async throws

    // MARK: - Blocking

    /// Block a user
    func blockUser(blockerId: String, blockedId: String) async throws

    /// Unblock a user
    func unblockUser(blockerId: String, blockedId: String) async throws

    /// Get list of blocked users
    func getBlockedUsers(userId: String) async -> [BlockedUser]

    /// Check if a user is blocked by another
    func isBlocked(blockerId: String, blockedId: String) async -> Bool

    /// Check if either user has blocked the other (bidirectional check)
    func hasBlockBetween(userId1: String, userId2: String) async -> Bool

    // MARK: - Friend Streaks

    /// Get the friend streak between two users
    func getFriendStreak(userId1: String, userId2: String) async -> FriendStreak?

    /// Get all friend streaks for a user
    func getAllFriendStreaks(userId: String) async -> [FriendStreak]

    /// Update friend streak when a user checks in
    /// This should be called after a workout or rest-day check-in
    func updateFriendStreaks(userId: String) async

    /// Validate all friend streaks for a user (call on app launch)
    func validateFriendStreaks(userId: String) async

    /// Restore a friend streak (self only - 150 points)
    func restoreFriendStreakSelf(
        streakId: String,
        userId: String
    ) async throws -> FriendStreakRestoreResult

    /// Restore a friend streak for both users (300 points)
    func restoreFriendStreakBoth(
        streakId: String,
        userId: String
    ) async throws -> FriendStreakRestoreResult

    // MARK: - Discovery

    /// Search for users by username/email (with blocking filter)
    func searchUsers(query: String, searcherId: String) async throws -> [FriendProfile]

    /// Generate an invite link/code for a user
    func generateInviteCode(userId: String) async -> String

    /// Accept an invite code
    func acceptInviteCode(code: String, userId: String) async throws -> FriendRequest

    // MARK: - Visibility Settings

    /// Get visibility settings for a user
    func getVisibilitySettings(userId: String) async -> FriendVisibilitySettings

    /// Update visibility settings
    func updateVisibilitySettings(userId: String, settings: FriendVisibilitySettings) async throws

    // MARK: - Privacy Settings

    /// Get privacy settings for a user
    func getPrivacySettings(userId: String) async -> PrivacySettings

    /// Update privacy settings
    func updatePrivacySettings(userId: String, settings: PrivacySettings) async throws

    // MARK: - Blocked Users with Profiles

    /// Get blocked users with their profile information
    func getBlockedUsersWithProfiles(userId: String) async -> [(blockedUser: BlockedUser, profile: FriendProfile?)]

    // MARK: - Nudges

    /// Check if user can nudge a friend
    func canNudge(senderId: String, recipientId: String) async -> NudgeEligibility

    /// Send a nudge to a friend
    func sendNudge(senderId: String, recipientId: String) async throws -> FriendNudge

    /// Get nudge history for a user
    func getNudgeHistory(userId: String) async -> NudgeHistory

    /// Get recent received nudges (for display on Home)
    func getRecentReceivedNudges(userId: String) async -> [FriendNudge]

    /// Clear received nudges (after viewing)
    func clearReceivedNudges(userId: String) async
}

// MARK: - Friend Error

enum FriendError: LocalizedError {
    case userNotFound
    case alreadyFriends
    case requestNotFound
    case requestAlreadyResponded
    case cannotFriendSelf
    case userBlocked
    case insufficientPoints
    case noStreakToRestore
    case streakAlreadyActive
    case rateLimited
    case inviteCodeInvalid
    case inviteCodeExpired
    case saveFailed
    case nudgeCooldown
    case nudgeDailyLimit
    case nudgeSenderNotCheckedIn
    case nudgeRecipientCheckedIn
    case unknown(String)

    var errorDescription: String? {
        switch self {
        case .userNotFound:
            return "User not found."
        case .alreadyFriends:
            return "You're already friends with this user."
        case .requestNotFound:
            return "Friend request not found."
        case .requestAlreadyResponded:
            return "This request has already been responded to."
        case .cannotFriendSelf:
            return "You can't send a friend request to yourself."
        case .userBlocked:
            return "Cannot interact with this user."
        case .insufficientPoints:
            return "Not enough points for this action."
        case .noStreakToRestore:
            return "There's no broken streak to restore."
        case .streakAlreadyActive:
            return "Your streak is already active."
        case .rateLimited:
            return "Too many requests. Please try again later."
        case .inviteCodeInvalid:
            return "This invite code isn't valid."
        case .inviteCodeExpired:
            return "This invite code has expired."
        case .saveFailed:
            return "Couldn't save your changes."
        case .nudgeCooldown:
            return "Please wait before nudging again."
        case .nudgeDailyLimit:
            return "Daily nudge limit reached."
        case .nudgeSenderNotCheckedIn:
            return "Check in first to send encouragement."
        case .nudgeRecipientCheckedIn:
            return "Your friend already checked in today."
        case .unknown(let message):
            return message
        }
    }

    /// Hamster-friendly error message
    var friendlyMessage: String {
        switch self {
        case .userNotFound:
            return "Hmm, I can't find that person. Double-check the username?"
        case .alreadyFriends:
            return "Great news — you're already friends! No need to add them again."
        case .requestNotFound:
            return "Oops, I can't find that request. It might have been cancelled."
        case .requestAlreadyResponded:
            return "Someone already responded to this request!"
        case .cannotFriendSelf:
            return "You can't add yourself as a friend, but I'll always be your buddy!"
        case .userBlocked:
            return "I can't help with that person right now."
        case .insufficientPoints:
            return "You need a few more points for that. Keep up those workouts!"
        case .noStreakToRestore:
            return "No broken streak to fix here! You're all good."
        case .streakAlreadyActive:
            return "Your friend streak is already going strong! Keep it up!"
        case .rateLimited:
            return "Slow down a bit! Let's try again in a moment."
        case .inviteCodeInvalid:
            return "That code doesn't look right. Ask your friend to send a new one?"
        case .inviteCodeExpired:
            return "This invite code has expired. Time for a fresh one!"
        case .saveFailed:
            return "Oops, something went wrong. Let's try that again!"
        case .nudgeCooldown:
            return "You just nudged them! Give them a bit of time."
        case .nudgeDailyLimit:
            return "You've encouraged lots of friends today! That's wonderful."
        case .nudgeSenderNotCheckedIn:
            return "Check in first to send encouragement to your friends!"
        case .nudgeRecipientCheckedIn:
            return "Good news — your friend already checked in today!"
        case .unknown:
            return "Something went a little wrong. Let's give it another try!"
        }
    }
}

// MARK: - Mock Friend Service

actor MockFriendService: FriendServiceProtocol {
    /// In-memory storage for relationships
    private var relationships: [String: FriendRelationship] = [:]

    /// In-memory storage for friend requests
    private var requests: [String: FriendRequest] = [:]

    /// In-memory storage for blocked users
    private var blockedUsers: [String: BlockedUser] = [:]

    /// In-memory storage for friend streaks
    private var friendStreaks: [String: FriendStreak] = [:]

    /// In-memory storage for user profiles (mock data)
    private var mockProfiles: [String: FriendProfile] = [:]

    /// In-memory storage for visibility settings
    private var visibilitySettings: [String: FriendVisibilitySettings] = [:]

    /// Invite codes (code -> userId)
    private var inviteCodes: [String: String] = [:]

    init() {
        // Set up some mock profiles for testing
        setupMockProfiles()
    }

    // MARK: - Friend List

    func getFriends(userId: String) async throws -> [FriendProfile] {
        // Simulate network delay
        try? await Task.sleep(nanoseconds: 200_000_000)

        let friendIds = relationships.values
            .filter { $0.involves(userId: userId) && $0.status == .accepted }
            .compactMap { $0.otherUserId(from: userId) }

        var friends: [FriendProfile] = []
        for friendId in friendIds {
            if var profile = mockProfiles[friendId] {
                // Attach friend streak if exists
                let streak = await getFriendStreak(userId1: userId, userId2: friendId)
                profile = FriendProfile(
                    id: profile.id,
                    email: profile.email,
                    hamsterName: profile.hamsterName,
                    currentStreak: profile.currentStreak,
                    longestStreak: profile.longestStreak,
                    totalWorkoutsCompleted: profile.totalWorkoutsCompleted,
                    hamsterState: profile.hamsterState,
                    growthStage: profile.growthStage,
                    equippedOutfitId: profile.equippedOutfitId,
                    equippedAccessoryId: profile.equippedAccessoryId,
                    friendStreak: streak,
                    visibilitySettings: profile.visibilitySettings,
                    memberSince: profile.memberSince
                )
                friends.append(profile)
            }
        }

        return friends
    }

    func getFriendCount(userId: String) async -> Int {
        relationships.values
            .filter { $0.involves(userId: userId) && $0.status == .accepted }
            .count
    }

    func areFriends(userId1: String, userId2: String) async -> Bool {
        relationships.values.contains { rel in
            rel.involves(userId: userId1) &&
            rel.involves(userId: userId2) &&
            rel.status == .accepted
        }
    }

    func getFriendProfile(friendId: String, viewingUserId: String) async throws -> FriendProfile {
        // Check for blocks
        if await hasBlockBetween(userId1: viewingUserId, userId2: friendId) {
            throw FriendError.userBlocked
        }

        guard var profile = mockProfiles[friendId] else {
            throw FriendError.userNotFound
        }

        // Attach friend streak if exists
        let streak = await getFriendStreak(userId1: viewingUserId, userId2: friendId)
        profile = FriendProfile(
            id: profile.id,
            email: profile.email,
            hamsterName: profile.hamsterName,
            currentStreak: profile.currentStreak,
            longestStreak: profile.longestStreak,
            totalWorkoutsCompleted: profile.totalWorkoutsCompleted,
            hamsterState: profile.hamsterState,
            growthStage: profile.growthStage,
            equippedOutfitId: profile.equippedOutfitId,
            equippedAccessoryId: profile.equippedAccessoryId,
            friendStreak: streak,
            visibilitySettings: profile.visibilitySettings,
            memberSince: profile.memberSince
        )

        // Simulate network delay
        try? await Task.sleep(nanoseconds: 150_000_000)

        return profile
    }

    // MARK: - Friend Requests

    func sendFriendRequest(from senderId: String, to receiverId: String) async throws -> FriendRequest {
        // Validate: can't friend self
        guard senderId != receiverId else {
            throw FriendError.cannotFriendSelf
        }

        // Validate: check for blocks
        if await hasBlockBetween(userId1: senderId, userId2: receiverId) {
            throw FriendError.userBlocked
        }

        // Validate: check if already friends
        if await areFriends(userId1: senderId, userId2: receiverId) {
            throw FriendError.alreadyFriends
        }

        // Check if receiver already sent a request to sender (auto-accept)
        let existingRequest = requests.values.first { req in
            req.senderId == receiverId &&
            req.receiverId == senderId &&
            req.status == .pending
        }

        if existingRequest != nil {
            // Auto-accept: both users sent requests to each other
            _ = try await acceptFriendRequest(requestId: existingRequest!.id, userId: senderId)

            // Return a "completed" request to indicate friendship was established
            return FriendRequest(
                senderId: senderId,
                receiverId: receiverId,
                status: .accepted,
                sentAt: Date(),
                respondedAt: Date()
            )
        }

        // Check for existing pending request from sender to receiver
        let duplicateRequest = requests.values.first { req in
            req.senderId == senderId &&
            req.receiverId == receiverId &&
            req.status == .pending
        }

        if duplicateRequest != nil {
            throw FriendError.alreadyFriends // Request already pending
        }

        // Create new request
        let request = FriendRequest(
            senderId: senderId,
            receiverId: receiverId,
            status: .pending,
            sentAt: Date()
        )

        requests[request.id] = request

        // Simulate network delay
        try? await Task.sleep(nanoseconds: 200_000_000)

        return request
    }

    func acceptFriendRequest(requestId: String, userId: String) async throws -> FriendRelationship {
        guard var request = requests[requestId] else {
            throw FriendError.requestNotFound
        }

        guard request.receiverId == userId else {
            throw FriendError.requestNotFound
        }

        guard request.status == .pending else {
            throw FriendError.requestAlreadyResponded
        }

        // Update request status
        request.status = .accepted
        request.respondedAt = Date()
        requests[requestId] = request

        // Create friendship
        let relationship = FriendRelationship(
            userId1: request.senderId,
            userId2: request.receiverId,
            status: .accepted,
            createdAt: request.sentAt,
            acceptedAt: Date()
        )

        relationships[relationship.id] = relationship

        // Create a new friend streak for them
        let streak = FriendStreak(
            userId1: request.senderId,
            userId2: request.receiverId
        )
        let streakKey = FriendStreak.storageKey(userId1: streak.userId1, userId2: streak.userId2)
        friendStreaks[streakKey] = streak

        // Simulate network delay
        try? await Task.sleep(nanoseconds: 200_000_000)

        return relationship
    }

    func declineFriendRequest(requestId: String, userId: String) async throws {
        guard var request = requests[requestId] else {
            throw FriendError.requestNotFound
        }

        guard request.receiverId == userId else {
            throw FriendError.requestNotFound
        }

        guard request.status == .pending else {
            throw FriendError.requestAlreadyResponded
        }

        // Update request status
        request.status = .declined
        request.respondedAt = Date()
        requests[requestId] = request

        // Simulate network delay
        try? await Task.sleep(nanoseconds: 100_000_000)
    }

    func cancelFriendRequest(requestId: String, userId: String) async throws {
        guard var request = requests[requestId] else {
            throw FriendError.requestNotFound
        }

        guard request.senderId == userId else {
            throw FriendError.requestNotFound
        }

        guard request.status == .pending else {
            throw FriendError.requestAlreadyResponded
        }

        // Update request status
        request.status = .cancelled
        request.respondedAt = Date()
        requests[requestId] = request

        // Simulate network delay
        try? await Task.sleep(nanoseconds: 100_000_000)
    }

    func getPendingIncomingRequests(userId: String) async throws -> [FriendRequest] {
        // Simulate network delay
        try? await Task.sleep(nanoseconds: 150_000_000)

        return requests.values
            .filter { $0.receiverId == userId && $0.status == .pending }
            .sorted { $0.sentAt > $1.sentAt }
    }

    func getPendingOutgoingRequests(userId: String) async throws -> [FriendRequest] {
        // Simulate network delay
        try? await Task.sleep(nanoseconds: 150_000_000)

        return requests.values
            .filter { $0.senderId == userId && $0.status == .pending }
            .sorted { $0.sentAt > $1.sentAt }
    }

    func getPendingRequestCount(userId: String) async -> Int {
        requests.values
            .filter { $0.receiverId == userId && $0.status == .pending }
            .count
    }

    // MARK: - Friend Management

    func removeFriend(userId: String, friendId: String) async throws {
        // Find the relationship
        guard let relationshipId = relationships.values
            .first(where: {
                $0.involves(userId: userId) &&
                $0.involves(userId: friendId) &&
                $0.status == .accepted
            })?.id
        else {
            throw FriendError.userNotFound
        }

        // Remove the relationship
        relationships.removeValue(forKey: relationshipId)

        // Remove the friend streak
        let streakKey = FriendStreak.storageKey(userId1: userId, userId2: friendId)
        friendStreaks.removeValue(forKey: streakKey)

        // Simulate network delay
        try? await Task.sleep(nanoseconds: 150_000_000)
    }

    // MARK: - Blocking

    func blockUser(blockerId: String, blockedId: String) async throws {
        // Create block record
        let block = BlockedUser(
            blockerId: blockerId,
            blockedId: blockedId
        )

        blockedUsers[block.id] = block

        // If they were friends, terminate the friendship
        if let relationshipId = relationships.values
            .first(where: {
                $0.involves(userId: blockerId) &&
                $0.involves(userId: blockedId)
            })?.id
        {
            relationships.removeValue(forKey: relationshipId)
        }

        // Cancel any pending requests between them
        for (id, request) in requests {
            if (request.senderId == blockerId && request.receiverId == blockedId) ||
               (request.senderId == blockedId && request.receiverId == blockerId)
            {
                if request.status == .pending {
                    var updated = request
                    updated.status = .cancelled
                    updated.respondedAt = Date()
                    requests[id] = updated
                }
            }
        }

        // Remove friend streak
        let streakKey = FriendStreak.storageKey(userId1: blockerId, userId2: blockedId)
        friendStreaks.removeValue(forKey: streakKey)

        // Simulate network delay
        try? await Task.sleep(nanoseconds: 150_000_000)
    }

    func unblockUser(blockerId: String, blockedId: String) async throws {
        // Find and remove the block
        guard let blockId = blockedUsers.values
            .first(where: { $0.blockerId == blockerId && $0.blockedId == blockedId })?.id
        else {
            return // Already not blocked
        }

        blockedUsers.removeValue(forKey: blockId)

        // Simulate network delay
        try? await Task.sleep(nanoseconds: 100_000_000)
    }

    func getBlockedUsers(userId: String) async -> [BlockedUser] {
        blockedUsers.values
            .filter { $0.blockerId == userId }
            .sorted { $0.blockedAt > $1.blockedAt }
    }

    func isBlocked(blockerId: String, blockedId: String) async -> Bool {
        blockedUsers.values.contains { $0.blockerId == blockerId && $0.blockedId == blockedId }
    }

    func hasBlockBetween(userId1: String, userId2: String) async -> Bool {
        await isBlocked(blockerId: userId1, blockedId: userId2) ||
        await isBlocked(blockerId: userId2, blockedId: userId1)
    }

    // MARK: - Friend Streaks

    func getFriendStreak(userId1: String, userId2: String) async -> FriendStreak? {
        let key = FriendStreak.storageKey(userId1: userId1, userId2: userId2)
        return friendStreaks[key]
    }

    func getAllFriendStreaks(userId: String) async -> [FriendStreak] {
        friendStreaks.values
            .filter { $0.involves(userId: userId) }
            .sorted { $0.currentStreak > $1.currentStreak }
    }

    func updateFriendStreaks(userId: String) async {
        // Get all friend streaks for this user
        let userStreaks = friendStreaks.values.filter { $0.involves(userId: userId) }

        for var streak in userStreaks {
            let key = FriendStreak.storageKey(userId1: streak.userId1, userId2: streak.userId2)
            let calendar = Calendar.current

            // Update check-in date for this user
            if streak.userId1 == userId {
                streak.lastCheckInUser1 = Date()
            } else {
                streak.lastCheckInUser2 = Date()
            }

            // Check if both users have now checked in today
            let user1Today = streak.lastCheckInUser1.map { calendar.isDateInToday($0) } ?? false
            let user2Today = streak.lastCheckInUser2.map { calendar.isDateInToday($0) } ?? false

            if user1Today && user2Today {
                // Both checked in today - increment streak!
                streak.currentStreak += 1
                streak.longestStreak = max(streak.longestStreak, streak.currentStreak)
                streak.status = .active
            } else {
                // Only one has checked in - waiting
                streak.status = .waiting
            }

            streak.lastUpdatedAt = Date()
            friendStreaks[key] = streak
            streak.save()
        }
    }

    func validateFriendStreaks(userId: String) async {
        // Get all friend streaks for this user
        let userStreaks = friendStreaks.values.filter { $0.involves(userId: userId) }
        let calendar = Calendar.current

        for var streak in userStreaks {
            let key = FriendStreak.storageKey(userId1: streak.userId1, userId2: streak.userId2)

            // Check last check-in dates
            let lastCheck1 = streak.lastCheckInUser1
            let lastCheck2 = streak.lastCheckInUser2

            // Determine if either user missed
            let user1MissedYesterday = lastCheck1.map { !calendar.isDateInYesterday($0) && !calendar.isDateInToday($0) } ?? true
            let user2MissedYesterday = lastCheck2.map { !calendar.isDateInYesterday($0) && !calendar.isDateInToday($0) } ?? true

            // If either missed (and streak was active), break it
            if (user1MissedYesterday || user2MissedYesterday) && streak.currentStreak > 0 {
                if streak.status != .broken {
                    streak.previousBrokenStreak = streak.currentStreak
                    streak.currentStreak = 0
                    streak.status = .broken
                    streak.lastUpdatedAt = Date()
                    friendStreaks[key] = streak
                    streak.save()
                }
            }
        }
    }

    func restoreFriendStreakSelf(
        streakId: String,
        userId: String
    ) async throws -> FriendStreakRestoreResult {
        guard var streak = friendStreaks.values.first(where: { $0.id == streakId }) else {
            throw FriendError.noStreakToRestore
        }

        guard streak.status == .broken && streak.previousBrokenStreak > 0 else {
            throw FriendError.noStreakToRestore
        }

        guard streak.involves(userId: userId) else {
            throw FriendError.noStreakToRestore
        }

        // Check if user can afford it
        let userStats = await MockActivityService.shared.getUserStats(userId: userId)
        guard userStats.totalPoints >= FriendStreakConfig.selfRestoreCost else {
            throw FriendError.insufficientPoints
        }

        // Deduct points via ActivityService
        _ = try await MockActivityService.shared.recordShopPurchase(
            itemId: "friend_streak_restore_self_\(streakId)",
            itemName: "Friend Streak Restore (Self)",
            amount: FriendStreakConfig.selfRestoreCost,
            userId: userId
        )

        // Update check-in for this user
        if streak.userId1 == userId {
            streak.lastCheckInUser1 = Date()
        } else {
            streak.lastCheckInUser2 = Date()
        }

        // Check if friend also restored
        let friendUserId = streak.otherUserId(from: userId)!
        let friendCheckIn = streak.lastCheckIn(for: friendUserId)
        let friendRestoredToday = friendCheckIn.map { Calendar.current.isDateInToday($0) } ?? false

        if friendRestoredToday {
            // Both restored - streak continues
            streak.currentStreak = streak.previousBrokenStreak
            streak.previousBrokenStreak = 0
            streak.status = .active
        } else {
            // Only self restored - waiting for friend
            streak.status = .waiting
        }

        streak.lastUpdatedAt = Date()

        let key = FriendStreak.storageKey(userId1: streak.userId1, userId2: streak.userId2)
        friendStreaks[key] = streak
        streak.save()

        // Simulate network delay
        try? await Task.sleep(nanoseconds: 250_000_000)

        return FriendStreakRestoreResult(
            success: true,
            restoredStreak: streak.previousBrokenStreak > 0 ? streak.previousBrokenStreak : streak.currentStreak,
            option: .selfOnly,
            pointsSpent: FriendStreakConfig.selfRestoreCost,
            message: friendRestoredToday
                ? "Your streak is back! Both of you came through."
                : "Your side is fixed! Waiting for your friend now.",
            friendNeedsToRestore: !friendRestoredToday
        )
    }

    func restoreFriendStreakBoth(
        streakId: String,
        userId: String
    ) async throws -> FriendStreakRestoreResult {
        guard var streak = friendStreaks.values.first(where: { $0.id == streakId }) else {
            throw FriendError.noStreakToRestore
        }

        guard streak.status == .broken && streak.previousBrokenStreak > 0 else {
            throw FriendError.noStreakToRestore
        }

        guard streak.involves(userId: userId) else {
            throw FriendError.noStreakToRestore
        }

        // Check if user can afford it
        let userStats = await MockActivityService.shared.getUserStats(userId: userId)
        guard userStats.totalPoints >= FriendStreakConfig.bothRestoreCost else {
            throw FriendError.insufficientPoints
        }

        // Deduct points via ActivityService
        _ = try await MockActivityService.shared.recordShopPurchase(
            itemId: "friend_streak_restore_both_\(streakId)",
            itemName: "Friend Streak Restore (Both)",
            amount: FriendStreakConfig.bothRestoreCost,
            userId: userId
        )

        // Update check-in for both users
        streak.lastCheckInUser1 = Date()
        streak.lastCheckInUser2 = Date()

        // Restore the streak
        let restoredStreak = streak.previousBrokenStreak
        streak.currentStreak = restoredStreak
        streak.previousBrokenStreak = 0
        streak.status = .active
        streak.lastUpdatedAt = Date()

        let key = FriendStreak.storageKey(userId1: streak.userId1, userId2: streak.userId2)
        friendStreaks[key] = streak
        streak.save()

        // Simulate network delay
        try? await Task.sleep(nanoseconds: 250_000_000)

        return FriendStreakRestoreResult(
            success: true,
            restoredStreak: restoredStreak,
            option: .forBoth,
            pointsSpent: FriendStreakConfig.bothRestoreCost,
            message: "Your \(restoredStreak)-day streak is saved! Great teamwork.",
            friendNeedsToRestore: false
        )
    }

    // MARK: - Discovery

    func searchUsers(query: String, searcherId: String) async throws -> [FriendProfile] {
        guard !query.isEmpty else { return [] }

        // Simulate network delay
        try? await Task.sleep(nanoseconds: 200_000_000)

        let lowercasedQuery = query.lowercased()

        // Filter mock profiles
        return mockProfiles.values
            .filter { profile in
                // Don't include self
                guard profile.id != searcherId else { return false }

                // Don't include blocked users
                let isBlocked = blockedUsers.values.contains { block in
                    (block.blockerId == searcherId && block.blockedId == profile.id) ||
                    (block.blockerId == profile.id && block.blockedId == searcherId)
                }
                if isBlocked { return false }

                // Match by email or hamster name
                let emailMatch = profile.email.lowercased().contains(lowercasedQuery)
                let nameMatch = profile.hamsterName?.lowercased().contains(lowercasedQuery) ?? false

                return emailMatch || nameMatch
            }
            .sorted { ($0.hamsterName ?? "") < ($1.hamsterName ?? "") }
    }

    func generateInviteCode(userId: String) async -> String {
        // Generate a simple alphanumeric code
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        let code = String((0..<8).map { _ in characters.randomElement()! })

        // Store the mapping
        inviteCodes[code] = userId

        return code
    }

    func acceptInviteCode(code: String, userId: String) async throws -> FriendRequest {
        guard let inviterId = inviteCodes[code] else {
            throw FriendError.inviteCodeInvalid
        }

        // Remove the used code
        inviteCodes.removeValue(forKey: code)

        // Send a friend request from the inviter to the acceptor
        // (This way the acceptor becomes the receiver and can "auto-accept")
        let request = try await sendFriendRequest(from: inviterId, to: userId)

        // Auto-accept the request
        _ = try await acceptFriendRequest(requestId: request.id, userId: userId)

        return FriendRequest(
            id: request.id,
            senderId: inviterId,
            receiverId: userId,
            status: .accepted,
            sentAt: request.sentAt,
            respondedAt: Date()
        )
    }

    // MARK: - Visibility Settings

    func getVisibilitySettings(userId: String) async -> FriendVisibilitySettings {
        visibilitySettings[userId] ?? FriendVisibilitySettings.load(for: userId)
    }

    func updateVisibilitySettings(userId: String, settings: FriendVisibilitySettings) async throws {
        visibilitySettings[userId] = settings
        settings.save(for: userId)

        // Simulate network delay
        try? await Task.sleep(nanoseconds: 100_000_000)
    }

    // MARK: - Privacy Settings

    private var privacySettingsCache: [String: PrivacySettings] = [:]

    func getPrivacySettings(userId: String) async -> PrivacySettings {
        if let cached = privacySettingsCache[userId] {
            return cached
        }
        let settings = PrivacySettings.load(for: userId)
        privacySettingsCache[userId] = settings
        return settings
    }

    func updatePrivacySettings(userId: String, settings: PrivacySettings) async throws {
        privacySettingsCache[userId] = settings
        settings.save(for: userId)

        // Simulate network delay
        try? await Task.sleep(nanoseconds: 100_000_000)
    }

    // MARK: - Blocked Users with Profiles

    func getBlockedUsersWithProfiles(userId: String) async -> [(blockedUser: BlockedUser, profile: FriendProfile?)] {
        let blockedList = blockedUsers.filter { $0.blockerId == userId }
            .sorted { $0.blockedAt > $1.blockedAt }

        return blockedList.map { blocked in
            let profile = mockProfiles[blocked.blockedId]
            return (blockedUser: blocked, profile: profile)
        }
    }

    // MARK: - Nudges

    private var nudgeHistoryCache: [String: NudgeHistory] = [:]

    func canNudge(senderId: String, recipientId: String) async -> NudgeEligibility {
        // Check if they are friends
        let areFriends = await self.areFriends(userId1: senderId, userId2: recipientId)
        if !areFriends {
            return .notFriends
        }

        // Check for blocks
        let hasBlock = await hasBlockBetween(userId1: senderId, userId2: recipientId)
        if hasBlock {
            return .blocked
        }

        // Check if sender has checked in today (using ActivityService)
        let senderStats = await MockActivityService.shared.getUserStats(userId: senderId)
        if !senderStats.hasAnyCheckInToday {
            return .senderNotCheckedIn
        }

        // Check if recipient has already checked in today
        // For mock, we'll use the friend profile's hamster state
        // In real implementation, this would check their actual check-in status
        if let profile = mockProfiles[recipientId] {
            // If their hamster is happy/excited/proud, they likely checked in
            if profile.hamsterState == .happy || profile.hamsterState == .excited || profile.hamsterState == .proud {
                return .recipientAlreadyCheckedIn
            }
        }

        // Check nudge history
        let history = getNudgeHistorySync(for: senderId)

        // Check daily limit
        if history.isDailyLimitReached {
            return .dailyLimitReached
        }

        // Check cooldown for this specific friend
        if let remaining = history.cooldownRemaining(for: recipientId) {
            return .cooldownActive(remaining: remaining)
        }

        return .canNudge
    }

    func sendNudge(senderId: String, recipientId: String) async throws -> FriendNudge {
        // Verify eligibility
        let eligibility = await canNudge(senderId: senderId, recipientId: recipientId)

        switch eligibility {
        case .canNudge:
            break
        case .senderNotCheckedIn:
            throw FriendError.nudgeSenderNotCheckedIn
        case .recipientAlreadyCheckedIn:
            throw FriendError.nudgeRecipientCheckedIn
        case .cooldownActive:
            throw FriendError.nudgeCooldown
        case .dailyLimitReached:
            throw FriendError.nudgeDailyLimit
        case .notFriends:
            throw FriendError.userNotFound
        case .blocked:
            throw FriendError.userBlocked
        }

        // Create the nudge
        let nudge = FriendNudge(
            senderId: senderId,
            recipientId: recipientId,
            messageIndex: NudgeMessages.randomIndex()
        )

        // Update sender's history
        var senderHistory = getNudgeHistorySync(for: senderId)
        senderHistory.sentNudges.append(nudge)
        senderHistory.pruneOldNudges()
        nudgeHistoryCache[senderId] = senderHistory
        senderHistory.save(for: senderId)

        // Update recipient's history
        var recipientHistory = getNudgeHistorySync(for: recipientId)
        recipientHistory.receivedNudges.append(nudge)
        recipientHistory.pruneOldNudges()
        nudgeHistoryCache[recipientId] = recipientHistory
        recipientHistory.save(for: recipientId)

        // Simulate network delay
        try? await Task.sleep(nanoseconds: 200_000_000)

        return nudge
    }

    func getNudgeHistory(userId: String) async -> NudgeHistory {
        getNudgeHistorySync(for: userId)
    }

    func getRecentReceivedNudges(userId: String) async -> [FriendNudge] {
        let history = getNudgeHistorySync(for: userId)
        return history.recentReceivedNudges.sorted { $0.sentAt > $1.sentAt }
    }

    func clearReceivedNudges(userId: String) async {
        var history = getNudgeHistorySync(for: userId)
        history.receivedNudges = []
        nudgeHistoryCache[userId] = history
        history.save(for: userId)
    }

    private func getNudgeHistorySync(for userId: String) -> NudgeHistory {
        if let cached = nudgeHistoryCache[userId] {
            return cached
        }
        let history = NudgeHistory.load(for: userId)
        nudgeHistoryCache[userId] = history
        return history
    }

    // MARK: - Mock Data Setup

    private func setupMockProfiles() {
        // Create some mock friend profiles for testing
        mockProfiles = [
            "mock_friend_1": FriendProfile(
                id: "mock_friend_1",
                email: "alex@example.com",
                hamsterName: "Peanut",
                currentStreak: 12,
                longestStreak: 28,
                totalWorkoutsCompleted: 45,
                hamsterState: .excited,
                growthStage: .juvenile,
                equippedOutfitId: "outfit_athlete",
                memberSince: Calendar.current.date(byAdding: .month, value: -2, to: Date())
            ),
            "mock_friend_2": FriendProfile(
                id: "mock_friend_2",
                email: "sam@example.com",
                hamsterName: "Whiskers",
                currentStreak: 5,
                longestStreak: 14,
                totalWorkoutsCompleted: 23,
                hamsterState: .happy,
                growthStage: .baby,
                memberSince: Calendar.current.date(byAdding: .day, value: -21, to: Date())
            ),
            "mock_friend_3": FriendProfile(
                id: "mock_friend_3",
                email: "jordan@example.com",
                hamsterName: "Nugget",
                currentStreak: 30,
                longestStreak: 60,
                totalWorkoutsCompleted: 120,
                hamsterState: .proud,
                growthStage: .adult,
                equippedOutfitId: "outfit_superhero",
                equippedAccessoryId: "accessory_crown",
                memberSince: Calendar.current.date(byAdding: .month, value: -4, to: Date())
            ),
            "mock_friend_4": FriendProfile(
                id: "mock_friend_4",
                email: "taylor@example.com",
                hamsterName: "Coco",
                currentStreak: 0,
                longestStreak: 3,
                totalWorkoutsCompleted: 8,
                hamsterState: .hungry,
                growthStage: .baby,
                memberSince: Calendar.current.date(byAdding: .day, value: -10, to: Date())
            ),
            "mock_friend_5": FriendProfile(
                id: "mock_friend_5",
                email: "morgan@example.com",
                hamsterName: "Biscuit",
                currentStreak: 7,
                longestStreak: 21,
                totalWorkoutsCompleted: 35,
                hamsterState: .chillin,
                growthStage: .juvenile,
                equippedAccessoryId: "accessory_headband",
                memberSince: Calendar.current.date(byAdding: .month, value: -1, to: Date())
            )
        ]
    }

    // MARK: - Test Helpers

    /// Add a mock profile (for testing)
    func addMockProfile(_ profile: FriendProfile) {
        mockProfiles[profile.id] = profile
    }

    /// Get a mock profile by ID
    func getMockProfile(id: String) -> FriendProfile? {
        mockProfiles[id]
    }
}

// MARK: - Singleton Access

extension MockFriendService {
    static let shared = MockFriendService()
}
