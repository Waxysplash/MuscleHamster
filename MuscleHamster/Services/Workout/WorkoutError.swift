//
//  WorkoutError.swift
//  MuscleHamster
//
//  Typed workout errors with hamster-friendly user descriptions
//

import Foundation

enum WorkoutError: Error, Equatable {
    case workoutNotFound
    case catalogEmpty
    case fetchFailed
    case invalidFilter

    /// User-friendly error description with hamster voice
    var userMessage: String {
        switch self {
        case .workoutNotFound:
            return "I couldn't find that workout. Maybe it ran away?"
        case .catalogEmpty:
            return "No workouts here yet! Check back soon for new exercises."
        case .fetchFailed:
            return "I had trouble loading workouts. Let's try again!"
        case .invalidFilter:
            return "Those filters didn't quite work. Try adjusting them!"
        }
    }
}
