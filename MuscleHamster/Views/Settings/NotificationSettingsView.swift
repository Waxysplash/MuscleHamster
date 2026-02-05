//
//  NotificationSettingsView.swift
//  MuscleHamster
//
//  Notification preferences placeholder
//  Phase 01.3: Will be filled in by Phase 08 (Notifications & Audio)
//

import SwiftUI

struct NotificationSettingsView: View {
    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "bell.badge")
                .font(.system(size: 64))
                .foregroundStyle(.secondary)

            VStack(spacing: 8) {
                Text("Reminder Settings Coming Soon")
                    .font(.title3)
                    .fontWeight(.semibold)

                Text("Choose when your hamster sends you friendly nudges. Reminder times, frequency, and quiet hours will live here.")
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .navigationTitle("Reminders")
        .navigationBarTitleDisplayMode(.inline)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Notification settings. Coming soon. Choose when your hamster sends you reminders.")
    }
}

#Preview {
    NavigationStack {
        NotificationSettingsView()
    }
}
