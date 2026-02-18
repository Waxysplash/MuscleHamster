//
//  WorkoutDetailView.swift
//  MuscleHamster
//
//  Full workout preview with metadata and Start button
//

import SwiftUI

struct WorkoutDetailView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    let workout: Workout
    @State private var showPlayer: Bool = false

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header with category icon
                headerSection

                // Quick stats row
                statsRow

                // Description
                descriptionSection

                // Body focus tags
                if !workout.bodyFocus.isEmpty {
                    bodyFocusSection
                }

                // Equipment
                equipmentSection

                // Goals
                goalsSection
            }
            .padding()
            .padding(.bottom, 100) // Space for sticky button
        }
        .navigationTitle(workout.name)
        .navigationBarTitleDisplayMode(.inline)
        .safeAreaInset(edge: .bottom) {
            startButton
        }
    }

    // MARK: - Header Section

    private var headerSection: some View {
        VStack(spacing: 16) {
            // Category icon placeholder (would be workout image in production)
            ZStack {
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color.accentColor.opacity(0.15))
                    .frame(height: 160)

                VStack(spacing: 8) {
                    Image(systemName: workout.category.icon)
                        .font(.system(size: 48))
                        .foregroundStyle(.accentColor)

                    Text(workout.category.displayName)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundStyle(.secondary)
                }
            }
            .accessibilityLabel("\(workout.category.displayName) workout")

            // Difficulty badge
            HStack {
                Circle()
                    .fill(difficultyColor)
                    .frame(width: 10, height: 10)

                Text(workout.displayDifficulty)
                    .font(.subheadline)
                    .fontWeight(.medium)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(difficultyColor.opacity(0.15))
            .cornerRadius(20)
            .accessibilityLabel("\(workout.displayDifficulty) difficulty")
        }
    }

    // MARK: - Stats Row

    private var statsRow: some View {
        HStack(spacing: 0) {
            statItem(
                icon: "clock.fill",
                value: workout.displayDuration,
                label: "Duration"
            )

            Divider()
                .frame(height: 40)

            statItem(
                icon: "flame.fill",
                value: "\(workout.fitnessGoals.count)",
                label: workout.fitnessGoals.count == 1 ? "Goal" : "Goals"
            )

            Divider()
                .frame(height: 40)

            statItem(
                icon: equipmentIcon,
                value: equipmentLabel,
                label: "Equipment"
            )
        }
        .padding(.vertical, 16)
        .background(Color(.systemGray6))
        .cornerRadius(16)
    }

    private func statItem(icon: String, value: String, label: String) -> some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(.accentColor)
                .accessibilityHidden(true)

            Text(value)
                .font(.subheadline)
                .fontWeight(.semibold)

            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(label): \(value)")
    }

    // MARK: - Description Section

    private var descriptionSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("About This Workout")
                .font(.headline)
                .accessibilityAddTraits(.isHeader)

            Text(workout.description)
                .font(.body)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Body Focus Section

    private var bodyFocusSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Body Focus")
                .font(.headline)
                .accessibilityAddTraits(.isHeader)

            FlowLayout(spacing: 8) {
                ForEach(workout.bodyFocus.sorted(by: { $0.displayName < $1.displayName }), id: \.self) { focus in
                    HStack(spacing: 4) {
                        Image(systemName: focus.icon)
                            .font(.caption)
                            .accessibilityHidden(true)

                        Text(focus.displayName)
                            .font(.caption)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color(.systemGray5))
                    .cornerRadius(16)
                    .accessibilityLabel(focus.displayName)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Equipment Section

    private var equipmentSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Equipment Needed")
                .font(.headline)
                .accessibilityAddTraits(.isHeader)

            if workout.isEquipmentFree {
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                        .accessibilityHidden(true)

                    Text("No equipment needed!")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            } else {
                FlowLayout(spacing: 8) {
                    ForEach(workout.equipmentRequired.sorted(by: { $0.displayName < $1.displayName }), id: \.self) { equipment in
                        HStack(spacing: 4) {
                            Image(systemName: equipment.icon)
                                .font(.caption)
                                .accessibilityHidden(true)

                            Text(equipment.displayName)
                                .font(.caption)
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.orange.opacity(0.15))
                        .foregroundStyle(.orange)
                        .cornerRadius(16)
                        .accessibilityLabel(equipment.displayName)
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Goals Section

    private var goalsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Fitness Goals")
                .font(.headline)
                .accessibilityAddTraits(.isHeader)

            VStack(spacing: 8) {
                ForEach(workout.fitnessGoals.sorted(by: { $0.displayName < $1.displayName }), id: \.self) { goal in
                    HStack(spacing: 12) {
                        Image(systemName: goal.icon)
                            .font(.title3)
                            .foregroundStyle(.accentColor)
                            .frame(width: 24)
                            .accessibilityHidden(true)

                        Text(goal.displayName)
                            .font(.subheadline)

                        Spacer()
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    .accessibilityLabel(goal.displayName)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Start Button

    private var startButton: some View {
        VStack(spacing: 0) {
            Divider()

            Button {
                showPlayer = true
            } label: {
                HStack {
                    Image(systemName: "play.fill")
                    Text("Start Workout")
                }
                .font(.headline)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(Color.accentColor)
                .cornerRadius(14)
            }
            .padding()
            .accessibilityLabel("Start workout")
            .accessibilityHint("Double tap to begin this workout")
            .fullScreenCover(isPresented: $showPlayer) {
                NavigationStack {
                    WorkoutPlayerView(workout: workout)
                }
                .environmentObject(authViewModel)
            }
        }
        .background(.regularMaterial)
    }

    // MARK: - Helpers

    private var difficultyColor: Color {
        switch workout.difficulty {
        case .beginner: return .green
        case .intermediate: return .orange
        case .advanced: return .red
        }
    }

    private var equipmentIcon: String {
        workout.isEquipmentFree ? "checkmark.circle.fill" : "dumbbell.fill"
    }

    private var equipmentLabel: String {
        workout.isEquipmentFree ? "None" : "\(workout.equipmentRequired.count)"
    }
}

// MARK: - Flow Layout (for wrapping tags)

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let sizes = subviews.map { $0.sizeThatFits(.unspecified) }
        return layout(sizes: sizes, containerWidth: proposal.width ?? 0).size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let sizes = subviews.map { $0.sizeThatFits(.unspecified) }
        let offsets = layout(sizes: sizes, containerWidth: bounds.width).offsets

        for (offset, subview) in zip(offsets, subviews) {
            subview.place(at: CGPoint(x: bounds.minX + offset.x, y: bounds.minY + offset.y), proposal: .unspecified)
        }
    }

    private func layout(sizes: [CGSize], containerWidth: CGFloat) -> (offsets: [CGPoint], size: CGSize) {
        var offsets: [CGPoint] = []
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var lineHeight: CGFloat = 0
        var maxWidth: CGFloat = 0

        for size in sizes {
            if currentX + size.width > containerWidth && currentX > 0 {
                currentX = 0
                currentY += lineHeight + spacing
                lineHeight = 0
            }

            offsets.append(CGPoint(x: currentX, y: currentY))
            lineHeight = max(lineHeight, size.height)
            currentX += size.width + spacing
            maxWidth = max(maxWidth, currentX)
        }

        return (offsets, CGSize(width: maxWidth, height: currentY + lineHeight))
    }
}

#Preview {
    NavigationStack {
        WorkoutDetailView(workout: .placeholder)
    }
    .environmentObject(AuthViewModel())
}
