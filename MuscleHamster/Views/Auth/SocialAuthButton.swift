//
//  SocialAuthButton.swift
//  MuscleHamster
//
//  Social sign-in buttons for Apple and Google authentication
//

import SwiftUI

enum SocialAuthProvider {
    case apple
    case google

    var title: String {
        switch self {
        case .apple: return "Continue with Apple"
        case .google: return "Continue with Google"
        }
    }

    var icon: String {
        switch self {
        case .apple: return "apple.logo"
        case .google: return "g.circle.fill"
        }
    }

    var accessibilityLabel: String {
        switch self {
        case .apple: return "Sign in with Apple"
        case .google: return "Sign in with Google"
        }
    }
}

struct SocialAuthButton: View {
    let provider: SocialAuthProvider
    let action: () -> Void

    @State private var isPressed = false

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: provider.icon)
                    .font(.title3)

                Text(provider.title)
                    .fontWeight(.medium)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(backgroundColor)
            .foregroundStyle(foregroundColor)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(borderColor, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
        .accessibilityLabel(provider.accessibilityLabel)
        .accessibilityHint("Double tap to sign in with \(provider == .apple ? "Apple" : "Google")")
    }

    private var backgroundColor: Color {
        switch provider {
        case .apple:
            return Color(.label)
        case .google:
            return Color(.systemBackground)
        }
    }

    private var foregroundColor: Color {
        switch provider {
        case .apple:
            return Color(.systemBackground)
        case .google:
            return Color(.label)
        }
    }

    private var borderColor: Color {
        switch provider {
        case .apple:
            return .clear
        case .google:
            return Color(.systemGray4)
        }
    }
}

#Preview {
    VStack(spacing: 16) {
        SocialAuthButton(provider: .apple) {
            print("Apple sign in")
        }

        SocialAuthButton(provider: .google) {
            print("Google sign in")
        }
    }
    .padding()
}
