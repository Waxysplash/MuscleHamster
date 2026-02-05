//
//  AccountSettingsView.swift
//  MuscleHamster
//
//  Account settings placeholder - signed-in vs signed-out states
//  Phase 01.3: Will be filled in by Phase 02 (Auth & Age Gate)
//

import SwiftUI

struct AccountSettingsView: View {
    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "person.crop.circle")
                .font(.system(size: 64))
                .foregroundStyle(.secondary)

            VStack(spacing: 8) {
                Text("Account Setup Coming Soon")
                    .font(.title3)
                    .fontWeight(.semibold)

                Text("Your hamster is getting your account ready. Sign-in, profile editing, and progress saving will be available here.")
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .navigationTitle("Account")
        .navigationBarTitleDisplayMode(.inline)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Account settings. Coming soon. Your hamster is getting your account ready.")
    }
}

#Preview {
    NavigationStack {
        AccountSettingsView()
    }
}
