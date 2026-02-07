//
//  WorkoutFilterSheet.swift
//  MuscleHamster
//
//  Filter sheet modal for workout browsing
//

import SwiftUI

struct WorkoutFilterSheet: View {
    @ObservedObject var viewModel: WorkoutBrowseViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var showBodyFocus = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    durationSection
                    difficultySection
                    goalsSection

                    // Body Focus is collapsible (optional)
                    bodyFocusSection
                }
                .padding()
            }
            .navigationTitle("Filter Workouts")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        Task {
                            await viewModel.applyFilters()
                            dismiss()
                        }
                    }
                    .fontWeight(.semibold)
                }
            }
            .safeAreaInset(edge: .bottom) {
                footerButtons
            }
        }
    }

    // MARK: - Duration Section

    private var durationSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Duration")
                .font(.headline)
                .accessibilityAddTraits(.isHeader)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(DurationBucket.allCases) { bucket in
                        durationPill(bucket)
                    }
                }
            }
        }
    }

    private func durationPill(_ bucket: DurationBucket) -> some View {
        let isSelected = viewModel.selectedDuration == bucket

        return Button {
            viewModel.toggleDuration(bucket)
        } label: {
            Text(bucket.timeRange)
                .font(.subheadline)
                .fontWeight(isSelected ? .semibold : .regular)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(isSelected ? Color.accentColor : Color(.systemGray5))
                .foregroundStyle(isSelected ? .white : .primary)
                .cornerRadius(20)
        }
        .accessibilityLabel(bucket.displayName)
        .accessibilityAddTraits(isSelected ? .isSelected : [])
        .accessibilityHint("Double tap to \(isSelected ? "deselect" : "select")")
    }

    // MARK: - Difficulty Section

    private var difficultySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Difficulty")
                .font(.headline)
                .accessibilityAddTraits(.isHeader)

            VStack(spacing: 8) {
                ForEach(FitnessLevel.allCases) { level in
                    difficultyRow(level)
                }
            }
        }
    }

    private func difficultyRow(_ level: FitnessLevel) -> some View {
        let isSelected = viewModel.selectedDifficulty == level

        return Button {
            viewModel.toggleDifficulty(level)
        } label: {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(level.displayName)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundStyle(.primary)

                    Text(level.description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.title3)
                        .foregroundStyle(.accentColor)
                } else {
                    Image(systemName: "circle")
                        .font(.title3)
                        .foregroundStyle(Color(.systemGray4))
                }
            }
            .padding()
            .background(isSelected ? Color.accentColor.opacity(0.1) : Color(.systemGray6))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .strokeBorder(isSelected ? Color.accentColor : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
        .accessibilityLabel(level.displayName)
        .accessibilityAddTraits(isSelected ? .isSelected : [])
        .accessibilityHint("Double tap to \(isSelected ? "deselect" : "select")")
    }

    // MARK: - Goals Section

    private var goalsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Fitness Goals")
                .font(.headline)
                .accessibilityAddTraits(.isHeader)

            Text("Select all that apply")
                .font(.caption)
                .foregroundStyle(.secondary)

            VStack(spacing: 8) {
                ForEach(FitnessGoal.allCases) { goal in
                    goalRow(goal)
                }
            }
        }
    }

    private func goalRow(_ goal: FitnessGoal) -> some View {
        let isSelected = viewModel.selectedGoals.contains(goal)

        return Button {
            viewModel.toggleGoal(goal)
        } label: {
            HStack(spacing: 12) {
                Image(systemName: goal.icon)
                    .font(.title3)
                    .frame(width: 24)
                    .foregroundStyle(.accentColor)
                    .accessibilityHidden(true)

                Text(goal.displayName)
                    .font(.subheadline)
                    .foregroundStyle(.primary)

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.title3)
                        .foregroundStyle(.accentColor)
                } else {
                    Image(systemName: "circle")
                        .font(.title3)
                        .foregroundStyle(Color(.systemGray4))
                }
            }
            .padding()
            .background(isSelected ? Color.accentColor.opacity(0.1) : Color(.systemGray6))
            .cornerRadius(12)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(goal.displayName)
        .accessibilityAddTraits(isSelected ? .isSelected : [])
        .accessibilityHint("Double tap to \(isSelected ? "deselect" : "select")")
    }

    // MARK: - Body Focus Section (Collapsible)

    private var bodyFocusSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Button {
                withAnimation {
                    showBodyFocus.toggle()
                }
            } label: {
                HStack {
                    Text("Body Focus")
                        .font(.headline)
                        .foregroundStyle(.primary)

                    if !viewModel.selectedBodyFocus.isEmpty {
                        Text("(\(viewModel.selectedBodyFocus.count))")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }

                    Spacer()

                    Image(systemName: showBodyFocus ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .accessibilityLabel("Body Focus, \(viewModel.selectedBodyFocus.count) selected")
            .accessibilityHint("Double tap to \(showBodyFocus ? "collapse" : "expand")")

            if showBodyFocus {
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 8) {
                    ForEach(BodyFocus.allCases) { focus in
                        bodyFocusButton(focus)
                    }
                }
            }
        }
    }

    private func bodyFocusButton(_ focus: BodyFocus) -> some View {
        let isSelected = viewModel.selectedBodyFocus.contains(focus)

        return Button {
            viewModel.toggleBodyFocus(focus)
        } label: {
            HStack(spacing: 8) {
                Image(systemName: focus.icon)
                    .font(.caption)
                    .foregroundStyle(isSelected ? .white : .accentColor)
                    .accessibilityHidden(true)

                Text(focus.displayName)
                    .font(.caption)
                    .fontWeight(isSelected ? .semibold : .regular)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .padding(.horizontal, 12)
            .background(isSelected ? Color.accentColor : Color(.systemGray5))
            .foregroundStyle(isSelected ? .white : .primary)
            .cornerRadius(8)
        }
        .accessibilityLabel(focus.displayName)
        .accessibilityAddTraits(isSelected ? .isSelected : [])
        .accessibilityHint("Double tap to \(isSelected ? "deselect" : "select")")
    }

    // MARK: - Footer Buttons

    private var footerButtons: some View {
        VStack(spacing: 12) {
            Divider()

            HStack(spacing: 12) {
                // Clear All button
                Button {
                    viewModel.clearAllFilters()
                } label: {
                    Text("Clear All")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color(.systemGray5))
                        .foregroundStyle(viewModel.hasActiveFilters ? .primary : .secondary)
                        .cornerRadius(12)
                }
                .disabled(!viewModel.hasActiveFilters)
                .accessibilityLabel("Clear all filters")
                .accessibilityHint(viewModel.hasActiveFilters ? "Double tap to remove all filters" : "No filters to clear")

                // Apply button
                Button {
                    Task {
                        await viewModel.applyFilters()
                        dismiss()
                    }
                } label: {
                    Text("Show Results")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.accentColor)
                        .foregroundStyle(.white)
                        .cornerRadius(12)
                }
                .accessibilityLabel("Show workout results")
            }
            .padding(.horizontal)
            .padding(.bottom, 8)
        }
        .background(.regularMaterial)
    }
}

#Preview {
    WorkoutFilterSheet(viewModel: WorkoutBrowseViewModel())
}
