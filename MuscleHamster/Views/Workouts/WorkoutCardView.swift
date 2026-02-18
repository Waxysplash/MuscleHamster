//
//  WorkoutCardView.swift
//  MuscleHamster
//
//  Reusable workout card component for lists and grids
//

import SwiftUI

struct WorkoutCardView: View {
    let workout: Workout

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header: Category icon and duration
            HStack {
                Image(systemName: workout.category.icon)
                    .font(.title3)
                    .foregroundStyle(.accentColor)
                    .accessibilityHidden(true)

                Spacer()

                Text(workout.displayDuration)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            // Workout name
            Text(workout.name)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundStyle(.primary)
                .lineLimit(2)
                .multilineTextAlignment(.leading)

            // Difficulty badge
            HStack(spacing: 4) {
                Circle()
                    .fill(difficultyColor)
                    .frame(width: 8, height: 8)
                    .accessibilityHidden(true)

                Text(workout.displayDifficulty)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.accentColor.opacity(0.1))
        .cornerRadius(12)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(workout.name), \(workout.displayDifficulty), \(workout.displayDuration)")
        .accessibilityHint("Double tap to view workout details")
    }

    private var difficultyColor: Color {
        switch workout.difficulty {
        case .beginner:
            return .green
        case .intermediate:
            return .orange
        case .advanced:
            return .red
        }
    }
}

// MARK: - Compact Card Variant

struct WorkoutCardCompactView: View {
    let workout: Workout

    var body: some View {
        HStack(spacing: 12) {
            // Category icon
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.accentColor.opacity(0.2))
                    .frame(width: 44, height: 44)

                Image(systemName: workout.category.icon)
                    .font(.title3)
                    .foregroundStyle(.accentColor)
            }
            .accessibilityHidden(true)

            // Workout info
            VStack(alignment: .leading, spacing: 4) {
                Text(workout.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundStyle(.primary)
                    .lineLimit(1)

                HStack(spacing: 8) {
                    Text(workout.displayDifficulty)
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    Text("·")
                        .foregroundStyle(.secondary)

                    Text(workout.displayDuration)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            // Chevron
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
                .accessibilityHidden(true)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(workout.name), \(workout.displayDifficulty), \(workout.displayDuration)")
        .accessibilityHint("Double tap to view workout details")
    }
}

// MARK: - Preview

#Preview("Card") {
    WorkoutCardView(workout: .placeholder)
        .padding()
}

#Preview("Compact") {
    WorkoutCardCompactView(workout: .placeholder)
        .padding()
}
