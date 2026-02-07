//
//  NotificationPermissionPromptView.swift
//  MuscleHamster
//
//  Pre-prompt view for requesting notification permissions
//  Phase 08.2: Push Permission UX and Scheduling Rules
//

import SwiftUI

struct NotificationPermissionPromptView: View {
    @Environment(\.dismiss) private var dismiss
    @ObservedObject private var notificationManager = NotificationManager.shared

    @State private var isRequesting = false
    @State private var showResult = false
    @State private var permissionGranted = false

    /// Callback when the prompt flow completes
    var onComplete: ((Bool) -> Void)?

    var body: some View {
        VStack(spacing: 0) {
            // Drag indicator
            RoundedRectangle(cornerRadius: 2.5)
                .fill(Color.secondary.opacity(0.3))
                .frame(width: 36, height: 5)
                .padding(.top, 8)

            ScrollView {
                VStack(spacing: 32) {
                    // Header illustration
                    headerSection

                    // Main content
                    if showResult {
                        resultSection
                    } else {
                        promptSection
                    }
                }
                .padding(.horizontal, 24)
                .padding(.top, 24)
                .padding(.bottom, 40)
            }

            // Bottom buttons
            if !showResult {
                buttonSection
            }
        }
        .background(Color(.systemBackground))
        .accessibilityElement(children: .contain)
    }

    // MARK: - Header Section

    private var headerSection: some View {
        VStack(spacing: 16) {
            // Hamster with bell
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Color.accentColor.opacity(0.3), Color.accentColor.opacity(0.1)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 120, height: 120)

                Image(systemName: "bell.badge.fill")
                    .font(.system(size: 48))
                    .foregroundStyle(.accentColor)
            }
            .accessibilityHidden(true)

            // Title
            Text(showResult ? (permissionGranted ? "You're all set!" : "No problem!") : "Can I send you a little nudge?")
                .font(.title2)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
        }
    }

    // MARK: - Prompt Section

    private var promptSection: some View {
        VStack(spacing: 24) {
            // Explanation text (hamster-voiced)
            VStack(spacing: 12) {
                Text("I promise I'll be gentle!")
                    .font(.headline)
                    .foregroundStyle(.primary)

                Text("Just a friendly reminder when it's time for our workout together. No spam, no pressure — just your hamster cheering you on.")
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }

            // What to expect
            VStack(alignment: .leading, spacing: 12) {
                notificationPreview(
                    icon: "bell.fill",
                    title: "Daily Reminder",
                    description: "A gentle nudge at your preferred time"
                )

                notificationPreview(
                    icon: "flame.fill",
                    title: "Streak Support",
                    description: "A heads-up if your streak is at risk"
                )
            }
            .padding(.horizontal, 8)
        }
    }

    private func notificationPreview(icon: String, title: String, description: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(.accentColor)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)

                Text(description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()
        }
        .padding(.vertical, 8)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(title): \(description)")
    }

    // MARK: - Result Section

    private var resultSection: some View {
        VStack(spacing: 16) {
            if permissionGranted {
                Text("I'll send you gentle reminders to keep our workout streak going. You can always change this in Settings.")
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)

                // Confirmation checkmark
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 48))
                    .foregroundStyle(.green)
                    .padding(.top, 8)
            } else {
                Text("I'll be here whenever you're ready. You can always enable reminders later in Settings if you change your mind.")
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)

                // Heart icon
                Image(systemName: "heart.fill")
                    .font(.system(size: 48))
                    .foregroundStyle(.accentColor)
                    .padding(.top, 8)
            }

            Button {
                onComplete?(permissionGranted)
                dismiss()
            } label: {
                Text("Got it!")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Color.accentColor, in: RoundedRectangle(cornerRadius: 12))
            }
            .padding(.top, 16)
            .accessibilityLabel("Got it. Close notification prompt")
        }
    }

    // MARK: - Button Section

    private var buttonSection: some View {
        VStack(spacing: 12) {
            // Primary: Enable notifications
            Button {
                requestPermission()
            } label: {
                HStack(spacing: 8) {
                    if isRequesting {
                        ProgressView()
                            .tint(.white)
                    }
                    Text("Yes, Remind Me")
                        .font(.headline)
                }
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(Color.accentColor, in: RoundedRectangle(cornerRadius: 12))
            }
            .disabled(isRequesting)
            .accessibilityLabel("Yes, remind me. Enable notifications")
            .accessibilityHint("Your hamster will send gentle workout reminders")

            // Secondary: Maybe later
            Button {
                handleMaybeLater()
            } label: {
                Text("Maybe Later")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .padding(.vertical, 8)
            }
            .disabled(isRequesting)
            .accessibilityLabel("Maybe later. Skip notifications for now")
            .accessibilityHint("You can enable notifications anytime in Settings")
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 32)
    }

    // MARK: - Actions

    private func requestPermission() {
        isRequesting = true

        Task {
            let granted = await notificationManager.requestPermission()

            await MainActor.run {
                isRequesting = false
                permissionGranted = granted

                withAnimation(.easeInOut(duration: 0.3)) {
                    showResult = true
                }
            }
        }
    }

    private func handleMaybeLater() {
        // Track that we've shown the prompt
        NotificationPreferences.hasShownPermissionPrompt = true
        NotificationPreferences.permissionPromptDate = Date()

        withAnimation(.easeInOut(duration: 0.3)) {
            permissionGranted = false
            showResult = true
        }
    }
}

// MARK: - Compact Prompt View (for workout completion screen)

struct NotificationPromptBanner: View {
    @ObservedObject private var notificationManager = NotificationManager.shared
    @State private var showFullPrompt = false

    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                Image(systemName: "bell.badge.fill")
                    .font(.title2)
                    .foregroundStyle(.accentColor)

                VStack(alignment: .leading, spacing: 2) {
                    Text("Want a gentle reminder?")
                        .font(.subheadline)
                        .fontWeight(.medium)

                    Text("I can nudge you when it's workout time!")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()
            }

            Button {
                showFullPrompt = true
            } label: {
                Text("Enable Reminders")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color.accentColor, in: RoundedRectangle(cornerRadius: 8))
            }
            .accessibilityLabel("Enable reminders. Opens notification settings")
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.secondarySystemBackground))
        )
        .sheet(isPresented: $showFullPrompt) {
            NotificationPermissionPromptView()
                .presentationDetents([.medium, .large])
        }
        .accessibilityElement(children: .contain)
    }
}

#Preview("Full Prompt") {
    NotificationPermissionPromptView()
}

#Preview("Banner") {
    NotificationPromptBanner()
        .padding()
}
