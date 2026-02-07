//
//  AuthViewModel.swift
//  MuscleHamster
//
//  ObservableObject managing authentication state across the app
//

import SwiftUI

enum AuthState: Equatable {
    case unknown           // Checking auth status on launch
    case unauthenticated   // Show WelcomeView
    case authenticated     // Show MainTabView
}

@MainActor
class AuthViewModel: ObservableObject {
    @Published private(set) var authState: AuthState = .unknown
    @Published private(set) var currentUser: User?
    @Published private(set) var userProfile: UserProfile?
    @Published var error: AuthError?
    @Published private(set) var isSigningOut = false

    private let authService: MockAuthService

    init(authService: MockAuthService = MockAuthService()) {
        self.authService = authService
    }

    // MARK: - Auth Status Check

    func checkAuthStatus() async {
        authState = .unknown
        let user = await authService.checkAuthStatus()

        if let user = user {
            currentUser = user
            loadUserProfile(for: user)
            authState = .authenticated
        } else {
            currentUser = nil
            userProfile = nil
            authState = .unauthenticated
        }
    }

    // MARK: - Profile Management

    /// Loads the user profile from UserDefaults
    private func loadUserProfile(for user: User) {
        let key = "userProfile_\(user.id)"
        guard let data = UserDefaults.standard.data(forKey: key),
              let profile = try? JSONDecoder().decode(UserProfile.self, from: data) else {
            userProfile = nil
            return
        }
        userProfile = profile
    }

    /// Updates the user profile and persists to storage
    func updateProfile(_ profile: UserProfile) async {
        guard let user = currentUser else { return }

        // Update in memory
        userProfile = profile

        // Persist to UserDefaults
        if let encoded = try? JSONEncoder().encode(profile) {
            UserDefaults.standard.set(encoded, forKey: "userProfile_\(user.id)")
        }
    }

    // MARK: - Sign Up

    func signUp(email: String, password: String) async -> Bool {
        error = nil

        do {
            let user = try await authService.signUp(email: email, password: password)
            currentUser = user
            loadUserProfile(for: user) // Will be nil for new users, but consistent with signIn
            authState = .authenticated
            return true
        } catch let authError as AuthError {
            error = authError
            return false
        } catch {
            self.error = .unknown(error.localizedDescription)
            return false
        }
    }

    // MARK: - Sign In

    func signIn(email: String, password: String) async -> Bool {
        error = nil

        do {
            let user = try await authService.signIn(email: email, password: password)
            currentUser = user
            loadUserProfile(for: user)
            authState = .authenticated
            return true
        } catch let authError as AuthError {
            error = authError
            return false
        } catch {
            self.error = .unknown(error.localizedDescription)
            return false
        }
    }

    // MARK: - Sign Out

    func signOut() async {
        isSigningOut = true
        error = nil

        await authService.signOut()

        currentUser = nil
        userProfile = nil
        authState = .unauthenticated
        isSigningOut = false
    }

    // MARK: - Onboarding Completion

    func completeOnboarding(profile: UserProfile) async {
        guard var user = currentUser else { return }

        // Update user's profile completion status
        user.profileComplete = true
        currentUser = user

        // Store the profile data
        userProfile = profile

        // Persist profile to UserDefaults for now (would be server in production)
        if let encoded = try? JSONEncoder().encode(profile) {
            UserDefaults.standard.set(encoded, forKey: "userProfile_\(user.id)")
        }

        // Update the user in the auth service
        await authService.updateUser(user)
    }

    // MARK: - Password Reset

    func resetPassword(email: String) async -> Bool {
        error = nil

        do {
            try await authService.resetPassword(email: email)
            return true
        } catch let authError as AuthError {
            error = authError
            return false
        } catch {
            self.error = .unknown(error.localizedDescription)
            return false
        }
    }

    // MARK: - Clear Error

    func clearError() {
        error = nil
    }
}
