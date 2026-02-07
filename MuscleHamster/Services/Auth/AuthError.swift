//
//  AuthError.swift
//  MuscleHamster
//
//  Typed auth errors with hamster-friendly user descriptions
//

import Foundation

enum AuthError: Error, Equatable {
    case invalidEmail
    case weakPassword
    case emailAlreadyInUse
    case invalidCredentials
    case userNotFound
    case networkError
    case unknown(String)

    /// User-friendly error description with hamster voice
    var userMessage: String {
        switch self {
        case .invalidEmail:
            return "That email doesn't look quite right. Mind double-checking it?"
        case .weakPassword:
            return "Your hamster needs a stronger password! At least 8 characters, please."
        case .emailAlreadyInUse:
            return "Looks like you've been here before! Try signing in instead."
        case .invalidCredentials:
            return "That didn't quite work. Double-check your email and password?"
        case .userNotFound:
            return "We couldn't find that account. Want to create one instead?"
        case .networkError:
            return "Your hamster can't reach the internet right now. Check your connection and try again!"
        case .unknown(let message):
            return message.isEmpty ? "Something unexpected happened. Let's try again!" : message
        }
    }

    static func == (lhs: AuthError, rhs: AuthError) -> Bool {
        switch (lhs, rhs) {
        case (.invalidEmail, .invalidEmail): return true
        case (.weakPassword, .weakPassword): return true
        case (.emailAlreadyInUse, .emailAlreadyInUse): return true
        case (.invalidCredentials, .invalidCredentials): return true
        case (.userNotFound, .userNotFound): return true
        case (.networkError, .networkError): return true
        case (.unknown(let lhsMsg), .unknown(let rhsMsg)): return lhsMsg == rhsMsg
        default: return false
        }
    }
}
