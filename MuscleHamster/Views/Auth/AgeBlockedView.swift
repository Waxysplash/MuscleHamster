//
//  AgeBlockedView.swift
//  MuscleHamster
//
//  Friendly screen shown to users who indicate they are under 13
//  Complies with age-gate requirements by preventing account creation
//

import SwiftUI

struct AgeBlockedView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            // Hero section
            VStack(spacing: 24) {
                Image(systemName: "heart.circle.fill")
                    .font(.system(size: 80))
                    .foregroundStyle(.orange)
                    .accessibilityHidden(true)

                VStack(spacing: 16) {
                    Text("See You Soon!")
                        .font(.title)
                        .fontWeight(.bold)
                        .multilineTextAlignment(.center)

                    Text("Muscle Hamster is made for users who are 13 and older. We'd love to help you build healthy habits when you're a bit older!")
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)

                    Text("In the meantime, keep moving and having fun!")
                        .font(.callout)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                        .padding(.top, 8)
                }
            }
            .accessibilityElement(children: .combine)
            .accessibilityLabel("See You Soon! Muscle Hamster is made for users who are 13 and older. We'd love to help you build healthy habits when you're a bit older! In the meantime, keep moving and having fun!")

            Spacer()

            // Back button
            VStack(spacing: 16) {
                Button {
                    dismiss()
                } label: {
                    Text("Go Back")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color(.systemGray5))
                        .foregroundStyle(.primary)
                        .cornerRadius(14)
                }
                .accessibilityLabel("Go Back")
                .accessibilityHint("Returns to the previous screen")
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 48)
        }
        .navigationTitle("")
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button {
                    dismiss()
                } label: {
                    Image(systemName: "chevron.left")
                        .fontWeight(.semibold)
                }
                .accessibilityLabel("Back")
            }
        }
    }
}

#Preview {
    NavigationStack {
        AgeBlockedView()
    }
}
