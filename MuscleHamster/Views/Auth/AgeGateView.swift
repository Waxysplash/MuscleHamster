//
//  AgeGateView.swift
//  MuscleHamster
//
//  Age verification screen - users must confirm they are 13+ before creating an account
//

import SwiftUI

struct AgeGateView: View {
    @Binding var hasConfirmedAge: Bool
    @State private var showBlockedView = false

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            // Hero section
            VStack(spacing: 24) {
                Image(systemName: "person.crop.circle.badge.checkmark")
                    .font(.system(size: 80))
                    .foregroundStyle(.accentColor)
                    .accessibilityHidden(true)

                VStack(spacing: 12) {
                    Text("Before We Begin")
                        .font(.title)
                        .fontWeight(.bold)
                        .multilineTextAlignment(.center)

                    Text("Muscle Hamster is designed for users who are 13 years or older.")
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                }
            }
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Before We Begin. Muscle Hamster is designed for users who are 13 years or older.")

            Spacer()

            // Action buttons
            VStack(spacing: 16) {
                Button {
                    hasConfirmedAge = true
                } label: {
                    Text("I am 13 or older")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.accentColor)
                        .foregroundStyle(.white)
                        .cornerRadius(14)
                }
                .accessibilityLabel("I am 13 or older")
                .accessibilityHint("Confirms your age and continues to account creation")

                Button {
                    showBlockedView = true
                } label: {
                    Text("I am under 13")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .accessibilityLabel("I am under 13")
                .accessibilityHint("Shows information for younger users")
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 48)
        }
        .navigationTitle("Age Verification")
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(isPresented: $showBlockedView) {
            AgeBlockedView()
        }
    }
}

#Preview {
    NavigationStack {
        AgeGateView(hasConfirmedAge: .constant(false))
    }
}
