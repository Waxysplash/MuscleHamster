//
//  CategoryWorkoutsView.swift
//  MuscleHamster
//
//  Displays workouts for a specific category with filtering
//

import SwiftUI

struct CategoryWorkoutsView: View {
    let category: WorkoutType

    @StateObject private var viewModel = WorkoutBrowseViewModel()
    @State private var showFilterSheet = false

    var body: some View {
        Group {
            switch viewModel.viewState {
            case .loading:
                LoadingView(message: "Finding \(category.displayName.lowercased()) workouts...")

            case .empty:
                emptyStateView

            case .error(let message):
                ErrorView(
                    message: message,
                    retryAction: {
                        Task { await viewModel.loadWorkouts(for: category) }
                    }
                )

            case .content:
                workoutsList
            }
        }
        .navigationTitle(category.displayName)
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                filterButton
            }
        }
        .sheet(isPresented: $showFilterSheet) {
            WorkoutFilterSheet(viewModel: viewModel)
        }
        .task {
            await viewModel.loadWorkouts(for: category)
        }
    }

    // MARK: - Filter Button

    private var filterButton: some View {
        Button {
            showFilterSheet = true
        } label: {
            HStack(spacing: 4) {
                Image(systemName: "slider.horizontal.3")

                if viewModel.activeFilterCount > 0 {
                    Text("\(viewModel.activeFilterCount)")
                        .font(.caption2)
                        .fontWeight(.bold)
                        .foregroundStyle(.white)
                        .frame(width: 18, height: 18)
                        .background(Color.accentColor)
                        .clipShape(Circle())
                }
            }
        }
        .accessibilityLabel("Filter workouts")
        .accessibilityValue(viewModel.activeFilterCount > 0 ? "\(viewModel.activeFilterCount) filters active" : "No filters")
        .accessibilityHint("Opens filter options")
    }

    // MARK: - Empty State

    private var emptyStateView: some View {
        VStack(spacing: 20) {
            EmptyStateView(
                icon: "magnifyingglass",
                title: "No Matches Found",
                message: viewModel.hasActiveFilters
                    ? "Try adjusting your filters to see more workouts."
                    : "No \(category.displayName.lowercased()) workouts available yet."
            )

            if viewModel.hasActiveFilters {
                Button {
                    viewModel.clearAllFilters()
                } label: {
                    Text("Clear Filters")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundStyle(.accentColor)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color.accentColor.opacity(0.1))
                        .cornerRadius(12)
                }
                .accessibilityLabel("Clear all filters")
                .accessibilityHint("Double tap to remove all filters and see all workouts")
            }
        }
    }

    // MARK: - Workouts List

    private var workoutsList: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Active filters chips
                ActiveFiltersView(viewModel: viewModel)

                // Category description
                categoryHeader

                // Workouts grid
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 12) {
                    ForEach(viewModel.filteredWorkouts) { workout in
                        NavigationLink {
                            WorkoutDetailView(workout: workout)
                        } label: {
                            WorkoutCardView(workout: workout)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal)
            }
            .padding(.bottom)
        }
    }

    // MARK: - Category Header

    private var categoryHeader: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color.accentColor.opacity(0.2))
                    .frame(width: 44, height: 44)

                Image(systemName: category.icon)
                    .font(.title3)
                    .foregroundStyle(.accentColor)
            }
            .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 2) {
                Text(category.description)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                Text("\(viewModel.filteredWorkouts.count) workout\(viewModel.filteredWorkouts.count == 1 ? "" : "s")")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }

            Spacer()
        }
        .padding(.horizontal)
    }
}

#Preview {
    NavigationStack {
        CategoryWorkoutsView(category: .strength)
    }
}
