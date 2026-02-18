//
//  ActiveFiltersView.swift
//  MuscleHamster
//
//  Horizontal scroll of removable filter chips
//

import SwiftUI

struct ActiveFiltersView: View {
    @ObservedObject var viewModel: WorkoutBrowseViewModel

    var body: some View {
        if viewModel.hasActiveFilters {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(viewModel.activeFilterDescriptions) { chip in
                        filterChip(chip)
                    }

                    // Clear all button
                    if viewModel.activeFilterCount > 1 {
                        Button {
                            viewModel.clearAllFilters()
                        } label: {
                            Text("Clear All")
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundStyle(.accentColor)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                        }
                        .accessibilityLabel("Clear all filters")
                        .accessibilityHint("Double tap to remove all \(viewModel.activeFilterCount) filters")
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical, 8)
        }
    }

    private func filterChip(_ chip: FilterChip) -> some View {
        Button {
            viewModel.removeFilter(chip)
        } label: {
            HStack(spacing: 4) {
                Text(chip.label)
                    .font(.caption)
                    .fontWeight(.medium)

                Image(systemName: "xmark")
                    .font(.caption2)
                    .fontWeight(.semibold)
            }
            .foregroundStyle(.white)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Color.accentColor)
            .cornerRadius(16)
        }
        .accessibilityLabel("\(chip.label) filter active")
        .accessibilityHint("Double tap to remove this filter")
    }
}

#Preview {
    let viewModel = WorkoutBrowseViewModel()
    viewModel.selectedDuration = .short
    viewModel.selectedDifficulty = .beginner
    viewModel.selectedGoals = [.cardio, .fatLoss]

    return ActiveFiltersView(viewModel: viewModel)
}
