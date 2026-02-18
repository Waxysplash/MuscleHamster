//
//  AuthServiceProtocol.swift
//  MuscleHamster
//
//  Protocol defining authentication operations
//

import Foundation

protocol AuthServiceProtocol {
    /// Returns the currently authenticated user, if any
    var currentUser: User? { get }

    /// Sign up a new user with email and password
    /// - Parameters:
    ///   - email: User's email address
    ///   - password: User's password (minimum 8 characters)
    /// - Returns: The newly created User
    /// - Throws: AuthError if sign up fails
    func signUp(email: String, password: String) async throws -> User

    /// Sign in an existing user with email and password
    /// - Parameters:
    ///   - email: User's email address
    ///   - password: User's password
    /// - Returns: The authenticated User
    /// - Throws: AuthError if credentials are invalid
    func signIn(email: String, password: String) async throws -> User

    /// Sign out the current user
    func signOut() async

    /// Send a password reset email
    /// - Parameter email: Email address to send reset link to
    /// - Throws: AuthError if email is invalid or user not found
    func resetPassword(email: String) async throws

    /// Check if user is currently authenticated
    /// - Returns: The current user if authenticated
    func checkAuthStatus() async -> User?

    /// Update user data (e.g., profile completion status)
    /// - Parameter user: The updated user data
    func updateUser(_ user: User) async
}
