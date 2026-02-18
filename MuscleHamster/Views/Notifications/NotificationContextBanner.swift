//
//  NotificationContextBanner.swift
//  MuscleHamster
//
//  Contextual banner shown when app opens from a notification tap
//  Phase 08.3: Notification Tap Routing and Today Context
//

import SwiftUI

// MARK: - Notification Context Banner

/// Banner shown at top of Home after user taps a notification
struct NotificationContextBanner: View {
    let context: NotificationContext
    let onDismiss: () -> Void
    let onAction: (() -> Void)?

    @State private var isVisible: Bool = false
    @State private var dismissTask: Task<Void, Never>?
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    init(
        context: NotificationContext,
        onDismiss: @escaping () -> Void,
        onAction: (() -> Void)? = nil
    ) {
        self.context = context
        self.onDismiss = onDismiss
        self.onAction = onAction
    }

    var body: some View {
        bannerContent
            .opacity(isVisible ? 1 : 0)
            .offset(y: isVisible ? 0 : -20)
            .onAppear {
                triggerAppear()
            }
            .onDisappear {
                dismissTask?.cancel()
            }
    }

    private var bannerContent: some View {
        HStack(spacing: 12) {
            // Icon
            Image(systemName: context.bannerType.icon)
                .font(.title2)
                .foregroundStyle(context.bannerType.iconColor)
                .accessibilityHidden(true)

            // Message and optional action
            VStack(alignment: .leading, spacing: 6) {
                Text(context.bannerMessage)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundStyle(.primary)
                    .fixedSize(horizontal: false, vertical: true)

                // Action button for "action needed" state
                if context.hasActionButton, let onAction = onAction {
                    Button(action: {
                        onAction()
                        dismiss()
                    }) {
                        Text(context.actionButtonTitle)
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundStyle(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(context.bannerType.iconColor)
                            .clipShape(Capsule())
                    }
                    .accessibilityLabel(context.actionButtonTitle)
                    .accessibilityHint("Opens rest day check-in options")
                }
            }

            Spacer()

            // Dismiss button
            Button(action: dismiss) {
                Image(systemName: "xmark")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(.secondary)
                    .padding(8)
                    .background(Color(.systemGray5))
                    .clipShape(Circle())
            }
            .accessibilityLabel("Dismiss")
            .accessibilityHint("Dismisses this notification banner")
        }
        .padding()
        .background(context.bannerType.backgroundColor)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .strokeBorder(context.bannerType.iconColor.opacity(0.3), lineWidth: 1)
        )
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(context.bannerType.accessibilityLabel). \(context.bannerMessage)")
        .accessibilityAddTraits(.isStaticText)
    }

    // MARK: - Lifecycle

    private func triggerAppear() {
        // Animate in
        withAnimation(reduceMotion ? .none : .spring(response: 0.4, dampingFraction: 0.8)) {
            isVisible = true
        }

        // Announce for VoiceOver
        announceForVoiceOver()

        // Schedule auto-dismiss if applicable
        if context.shouldAutoDismiss {
            scheduleAutoDismiss()
        }
    }

    private func dismiss() {
        // Cancel any pending auto-dismiss
        dismissTask?.cancel()

        // Animate out
        withAnimation(reduceMotion ? .none : .easeOut(duration: 0.2)) {
            isVisible = false
        }

        // Notify parent after animation
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) {
            onDismiss()
        }
    }

    private func scheduleAutoDismiss() {
        dismissTask = Task {
            try? await Task.sleep(nanoseconds: UInt64(context.autoDismissDelay * 1_000_000_000))

            guard !Task.isCancelled else { return }

            await MainActor.run {
                dismiss()
            }
        }
    }

    private func announceForVoiceOver() {
        // Post accessibility announcement for VoiceOver users
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            UIAccessibility.post(
                notification: .announcement,
                argument: context.bannerMessage
            )
        }
    }
}

// MARK: - Banner Container

/// Container view that manages the notification banner display
struct NotificationBannerContainer: View {
    @EnvironmentObject private var routingState: AppRoutingState
    let onRestDayAction: () -> Void

    var body: some View {
        if let context = routingState.notificationContext {
            NotificationContextBanner(
                context: context,
                onDismiss: {
                    routingState.clearNotificationContext()
                },
                onAction: context.hasActionButton ? onRestDayAction : nil
            )
            .onAppear {
                // Trigger the banner's appear animation
                // The banner handles its own animation internally
            }
            .padding(.horizontal)
            .padding(.top, 8)
        }
    }
}

// MARK: - Preview

#Preview("Streak Safe") {
    VStack {
        NotificationContextBanner(
            context: NotificationContext(
                notificationType: .dailyReminder,
                tappedAt: Date(),
                hasCheckedInToday: true,
                currentStreak: 7
            ),
            onDismiss: { print("Dismissed") }
        )
        .onAppear {
            // Preview needs to trigger appear
        }

        Spacer()
    }
    .padding()
}

#Preview("Action Needed") {
    VStack {
        NotificationContextBanner(
            context: NotificationContext(
                notificationType: .streakAtRisk,
                tappedAt: Date(),
                hasCheckedInToday: false,
                currentStreak: 5
            ),
            onDismiss: { print("Dismissed") },
            onAction: { print("Action tapped") }
        )

        Spacer()
    }
    .padding()
}

#Preview("Gentle Nudge") {
    VStack {
        NotificationContextBanner(
            context: NotificationContext(
                notificationType: .dailyReminder,
                tappedAt: Date(),
                hasCheckedInToday: false,
                currentStreak: 0
            ),
            onDismiss: { print("Dismissed") }
        )

        Spacer()
    }
    .padding()
}
