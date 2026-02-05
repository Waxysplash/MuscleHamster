//
//  ViewState.swift
//  MuscleHamster
//
//  Common view state enum for handling loading, empty, error, and content states
//

import Foundation

enum ViewState: Equatable {
    case loading
    case empty
    case error(String)
    case content

    static func == (lhs: ViewState, rhs: ViewState) -> Bool {
        switch (lhs, rhs) {
        case (.loading, .loading): return true
        case (.empty, .empty): return true
        case (.content, .content): return true
        case (.error(let lhsMsg), .error(let rhsMsg)): return lhsMsg == rhsMsg
        default: return false
        }
    }
}
