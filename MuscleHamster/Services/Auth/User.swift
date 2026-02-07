//
//  User.swift
//  MuscleHamster
//
//  User model representing authenticated user data
//

import Foundation

struct User: Identifiable, Codable, Equatable {
    let id: String
    let email: String
    var profileComplete: Bool

    init(id: String = UUID().uuidString, email: String, profileComplete: Bool = false) {
        self.id = id
        self.email = email
        self.profileComplete = profileComplete
    }
}
