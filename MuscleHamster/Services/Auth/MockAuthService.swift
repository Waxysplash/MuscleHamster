//
//  MockAuthService.swift
//  MuscleHamster
//
//  In-memory auth implementation for MVP development and testing
//

import Foundation

actor MockAuthService: AuthServiceProtocol {
    // In-memory storage for registered users (email -> password)
    private var registeredUsers: [String: String] = [:]

    // In-memory storage for user data (userId -> User)
    private var userData: [String: User] = [:]

    // Currently authenticated user
    private(set) var currentUser: User?

    // Simulated network delay range (seconds)
    private let minDelay: Double = 0.5
    private let maxDelay: Double = 1.5

    init() {}

    func signUp(email: String, password: String) async throws -> User {
        try await simulateNetworkDelay()

        // Validate email format
        guard isValidEmail(email) else {
            throw AuthError.invalidEmail
        }

        // Validate password strength
        guard password.count >= 8 else {
            throw AuthError.weakPassword
        }

        // Check if email already exists
        let normalizedEmail = email.lowercased().trimmingCharacters(in: .whitespaces)
        guard registeredUsers[normalizedEmail] == nil else {
            throw AuthError.emailAlreadyInUse
        }

        // Register the user
        registeredUsers[normalizedEmail] = password

        let user = User(email: normalizedEmail, profileComplete: false)
        userData[user.id] = user
        currentUser = user

        // Store user ID mapping for sign-in lookup
        UserDefaults.standard.set(user.id, forKey: "userId_\(normalizedEmail)")

        return user
    }

    func signIn(email: String, password: String) async throws -> User {
        try await simulateNetworkDelay()

        // Validate email format
        guard isValidEmail(email) else {
            throw AuthError.invalidEmail
        }

        let normalizedEmail = email.lowercased().trimmingCharacters(in: .whitespaces)

        // Check if user exists
        guard let storedPassword = registeredUsers[normalizedEmail] else {
            throw AuthError.userNotFound
        }

        // Validate password
        guard storedPassword == password else {
            throw AuthError.invalidCredentials
        }

        // Retrieve stored user data with profile completion status
        var user: User
        if let storedUserId = UserDefaults.standard.string(forKey: "userId_\(normalizedEmail)"),
           let storedUser = userData[storedUserId] {
            user = storedUser
        } else {
            // Fallback for users created before this change
            user = User(email: normalizedEmail, profileComplete: false)
            userData[user.id] = user
            UserDefaults.standard.set(user.id, forKey: "userId_\(normalizedEmail)")
        }

        currentUser = user
        return user
    }

    func signOut() async {
        try? await simulateNetworkDelay()
        currentUser = nil
    }

    func resetPassword(email: String) async throws {
        try await simulateNetworkDelay()

        // Validate email format
        guard isValidEmail(email) else {
            throw AuthError.invalidEmail
        }

        let normalizedEmail = email.lowercased().trimmingCharacters(in: .whitespaces)

        // Check if user exists (in real app, we might not reveal this)
        guard registeredUsers[normalizedEmail] != nil else {
            throw AuthError.userNotFound
        }

        // In a real app, this would send an email
        // For mock, we just succeed silently
    }

    func checkAuthStatus() async -> User? {
        // Simulate checking stored credentials
        try? await Task.sleep(nanoseconds: 200_000_000) // 0.2 seconds
        return currentUser
    }

    func updateUser(_ user: User) async {
        // Update stored user data
        userData[user.id] = user

        // Update current user if it's the same user
        if currentUser?.id == user.id {
            currentUser = user
        }
    }

    // MARK: - Helpers

    private func simulateNetworkDelay() async throws {
        let delay = Double.random(in: minDelay...maxDelay)
        try await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
    }

    private func isValidEmail(_ email: String) -> Bool {
        let emailRegex = #"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"#
        return email.range(of: emailRegex, options: .regularExpression) != nil
    }
}
