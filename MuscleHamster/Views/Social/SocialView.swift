//
//  SocialView.swift
//  MuscleHamster
//
//  Social tab - Friends and social features (POST-MVP placeholder)
//

import SwiftUI

struct SocialView: View {
    @State private var viewState: ViewState = .empty

    var body: some View {
        NavigationStack {
            Group {
                switch viewState {
                case .loading:
                    LoadingView(message: "Loading friends...")

                case .empty:
                    comingSoonContent

                case .error(let message):
                    ErrorView(
                        message: message,
                        retryAction: { }
                    )

                case .content:
                    comingSoonContent
                }
            }
            .navigationTitle("Social")
        }
    }

    private var comingSoonContent: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "person.2.fill")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)

            VStack(spacing: 8) {
                Text("Friends Coming Soon!")
                    .font(.title2)
                    .fontWeight(.semibold)

                Text("Soon you'll be able to connect with friends, share progress, and cheer each other on.")
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            Spacer()

            notifyMeButton

            Spacer()
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Social features coming soon. You'll be able to connect with friends and share progress.")
    }

    private var notifyMeButton: some View {
        Button {
            // Notify me action placeholder
        } label: {
            Text("Notify Me When Ready")
                .fontWeight(.semibold)
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
                .background(Color.accentColor.opacity(0.15))
                .foregroundStyle(.accentColor)
                .cornerRadius(25)
        }
        .accessibilityHint("Get notified when social features are available")
    }
}

#Preview {
    SocialView()
}
