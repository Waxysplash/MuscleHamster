//
//  PrivacySettingsView.swift
//  MuscleHamster
//
//  Privacy settings placeholder
//  Phase 01.3: Will be filled in by later phases (data export, deletion, visibility)
//

import SwiftUI

struct PrivacySettingsView: View {
    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "lock.shield")
                .font(.system(size: 64))
                .foregroundStyle(.secondary)

            VStack(spacing: 8) {
                Text("Privacy Controls Coming Soon")
                    .font(.title3)
                    .fontWeight(.semibold)

                Text("Data export, account deletion, profile visibility, and blocking controls will live here. Your privacy matters to your hamster!")
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .navigationTitle("Privacy")
        .navigationBarTitleDisplayMode(.inline)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Privacy settings. Coming soon. Data export, deletion, and visibility controls will be here.")
    }
}

#Preview {
    NavigationStack {
        PrivacySettingsView()
    }
}
