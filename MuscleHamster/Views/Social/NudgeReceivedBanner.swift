//
//  NudgeReceivedBanner.swift
//  MuscleHamster
//
//  Banner displayed on Home when a friend nudges you
//  Phase 09.6: Friend Nudges
//

import SwiftUI

struct NudgeReceivedBanner: View {
    let nudge: FriendNudge
    let senderName: String
    let onDismiss: () -> Void

    @State private var isVisible = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        HStack(spacing: 12) {
            // Icon
            ZStack {
                Circle()
                    .fill(Color.purple.opacity(0.15))
                    .frame(width: 44, height: 44)

                Image(systemName: "hand.wave.fill")
                    .font(.title2)
                    .foregroundStyle(.purple)
            }

            // Message
            VStack(alignment: .leading, spacing: 2) {
                Text("\(senderName) sent encouragement!")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundStyle(.primary)

                Text(nudge.messageWithName(senderName))
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }

            Spacer()

            // Dismiss button
            Button {
                withAnimation(.easeOut(duration: 0.2)) {
                    isVisible = false
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                    onDismiss()
                }
            } label: {
                Image(systemName: "xmark.circle.fill")
                    .font(.title3)
                    .foregroundStyle(.secondary)
            }
            .accessibilityLabel("Dismiss")
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemBackground))
                .shadow(color: .purple.opacity(0.2), radius: 8, x: 0, y: 2)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.purple.opacity(0.3), lineWidth: 1)
        )
        .scaleEffect(isVisible ? 1 : 0.9)
        .opacity(isVisible ? 1 : 0)
        .onAppear {
            withAnimation(reduceMotion ? .none : .spring(response: 0.4, dampingFraction: 0.7)) {
                isVisible = true
            }

            // Auto-dismiss after 8 seconds
            DispatchQueue.main.asyncAfter(deadline: .now() + 8) {
                if isVisible {
                    withAnimation(.easeOut(duration: 0.3)) {
                        isVisible = false
                    }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        onDismiss()
                    }
                }
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(senderName) sent encouragement: \(nudge.messageWithName(senderName))")
        .accessibilityHint("Double tap to dismiss")
        .accessibilityAddTraits(.isButton)
    }
}

// MARK: - Multiple Nudges Banner

/// Banner for when multiple friends have nudged you
struct MultipleNudgesBanner: View {
    let count: Int
    let onDismiss: () -> Void

    @State private var isVisible = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        HStack(spacing: 12) {
            // Icon
            ZStack {
                Circle()
                    .fill(Color.purple.opacity(0.15))
                    .frame(width: 44, height: 44)

                Image(systemName: "person.2.fill")
                    .font(.title3)
                    .foregroundStyle(.purple)
            }

            // Message
            VStack(alignment: .leading, spacing: 2) {
                Text("\(count) friends are cheering for you!")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundStyle(.primary)

                Text("They believe in you! Time to check in?")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            // Dismiss button
            Button {
                withAnimation(.easeOut(duration: 0.2)) {
                    isVisible = false
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                    onDismiss()
                }
            } label: {
                Image(systemName: "xmark.circle.fill")
                    .font(.title3)
                    .foregroundStyle(.secondary)
            }
            .accessibilityLabel("Dismiss")
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemBackground))
                .shadow(color: .purple.opacity(0.2), radius: 8, x: 0, y: 2)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.purple.opacity(0.3), lineWidth: 1)
        )
        .scaleEffect(isVisible ? 1 : 0.9)
        .opacity(isVisible ? 1 : 0)
        .onAppear {
            withAnimation(reduceMotion ? .none : .spring(response: 0.4, dampingFraction: 0.7)) {
                isVisible = true
            }

            // Auto-dismiss after 10 seconds
            DispatchQueue.main.asyncAfter(deadline: .now() + 10) {
                if isVisible {
                    withAnimation(.easeOut(duration: 0.3)) {
                        isVisible = false
                    }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        onDismiss()
                    }
                }
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(count) friends are cheering for you! They believe in you.")
        .accessibilityHint("Double tap to dismiss")
        .accessibilityAddTraits(.isButton)
    }
}

#Preview("Single Nudge") {
    VStack {
        NudgeReceivedBanner(
            nudge: FriendNudge(
                senderId: "friend1",
                recipientId: "user1",
                messageIndex: 0
            ),
            senderName: "Alex",
            onDismiss: {}
        )
        .padding()
    }
    .background(Color(.systemGroupedBackground))
}

#Preview("Multiple Nudges") {
    VStack {
        MultipleNudgesBanner(
            count: 3,
            onDismiss: {}
        )
        .padding()
    }
    .background(Color(.systemGroupedBackground))
}
