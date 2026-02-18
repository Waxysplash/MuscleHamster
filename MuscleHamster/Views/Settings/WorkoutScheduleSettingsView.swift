//
//  WorkoutScheduleSettingsView.swift
//  MuscleHamster
//
//  Workout schedule settings placeholder
//  Phase 01.3: Will be filled in by Phase 03 (Onboarding & Profile) / Phase 06 (Streaks)
//

import SwiftUI

struct WorkoutScheduleSettingsView: View {
    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "calendar")
                .font(.system(size: 64))
                .foregroundStyle(.secondary)

            VStack(spacing: 8) {
                Text("Schedule Setup Coming Soon")
                    .font(.title3)
                    .fontWeight(.semibold)

                Text("Pick which days you want to work out and which are rest days. Your hamster will plan around your schedule!")
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .navigationTitle("Workout Schedule")
        .navigationBarTitleDisplayMode(.inline)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Workout schedule settings. Coming soon. Pick which days you want to work out.")
    }
}

#Preview {
    NavigationStack {
        WorkoutScheduleSettingsView()
    }
}
