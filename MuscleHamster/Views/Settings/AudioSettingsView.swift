//
//  AudioSettingsView.swift
//  MuscleHamster
//
//  Audio settings placeholder
//  Phase 01.3: Will be filled in by Phase 08 (Notifications & Audio)
//

import SwiftUI

struct AudioSettingsView: View {
    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "speaker.wave.2")
                .font(.system(size: 64))
                .foregroundStyle(.secondary)

            VStack(spacing: 8) {
                Text("Audio Settings Coming Soon")
                    .font(.title3)
                    .fontWeight(.semibold)

                Text("Volume controls, workout music preferences, and sound effect options will be available here. Your hamster loves a good tune!")
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .navigationTitle("Audio Settings")
        .navigationBarTitleDisplayMode(.inline)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Audio settings. Coming soon. Volume controls and music preferences will be here.")
    }
}

#Preview {
    NavigationStack {
        AudioSettingsView()
    }
}
