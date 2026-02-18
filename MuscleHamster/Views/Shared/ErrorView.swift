//
//  ErrorView.swift
//  MuscleHamster
//
//  Friendly error state - no guilt, just helpful retry option
//

import SwiftUI

struct ErrorView: View {
    let message: String
    var retryAction: (() -> Void)?

    init(
        message: String = "Something went wrong. Let's try again!",
        retryAction: (() -> Void)? = nil
    ) {
        self.message = message
        self.retryAction = retryAction
    }

    var body: some View {
        VStack(spacing: 20) {
            Spacer()

            Image(systemName: "cloud.rain.fill")
                .font(.system(size: 50))
                .foregroundStyle(.secondary)

            VStack(spacing: 8) {
                Text("Oops!")
                    .font(.title3)
                    .fontWeight(.semibold)

                Text(message)
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            if let retryAction = retryAction {
                Button(action: retryAction) {
                    HStack(spacing: 8) {
                        Image(systemName: "arrow.clockwise")
                        Text("Try Again")
                    }
                    .fontWeight(.medium)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.accentColor)
                    .foregroundStyle(.white)
                    .cornerRadius(25)
                }
                .padding(.top, 8)
                .accessibilityLabel("Try again")
                .accessibilityHint("Attempts to reload the content")
            }

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Error. \(message)")
    }
}

#Preview {
    ErrorView(
        message: "We couldn't load your hamster. Check your connection and try again!",
        retryAction: { }
    )
}
