//
//  EmptyStateView.swift
//  MuscleHamster
//
//  Friendly empty state with customizable icon and message
//

import SwiftUI

struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    var actionTitle: String?
    var action: (() -> Void)?

    var body: some View {
        VStack(spacing: 20) {
            Spacer()

            Image(systemName: icon)
                .font(.system(size: 50))
                .foregroundStyle(.secondary)

            VStack(spacing: 8) {
                Text(title)
                    .font(.title3)
                    .fontWeight(.semibold)

                Text(message)
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            if let actionTitle = actionTitle, let action = action {
                Button(action: action) {
                    Text(actionTitle)
                        .fontWeight(.medium)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color.accentColor)
                        .foregroundStyle(.white)
                        .cornerRadius(25)
                }
                .padding(.top, 8)
            }

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(title). \(message)")
    }
}

#Preview {
    EmptyStateView(
        icon: "pawprint.fill",
        title: "Nothing Here Yet",
        message: "Your hamster is getting things ready for you.",
        actionTitle: "Get Started",
        action: { }
    )
}
