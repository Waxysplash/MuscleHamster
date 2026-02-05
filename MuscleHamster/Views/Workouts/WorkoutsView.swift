//
//  WorkoutsView.swift
//  MuscleHamster
//
//  Workouts tab - Browse and select workouts
//

import SwiftUI

struct WorkoutsView: View {
    @State private var viewState: ViewState = .loading

    var body: some View {
        NavigationStack {
            Group {
                switch viewState {
                case .loading:
                    LoadingView(message: "Loading workouts...")

                case .empty:
                    EmptyStateView(
                        icon: "figure.run",
                        title: "No Workouts Yet",
                        message: "Workouts will appear here once they're ready."
                    )

                case .error(let message):
                    ErrorView(
                        message: message,
                        retryAction: { loadContent() }
                    )

                case .content:
                    workoutsContent
                }
            }
            .navigationTitle("Workouts")
        }
        .onAppear {
            loadContent()
        }
    }

    private var workoutsContent: some View {
        ScrollView {
            VStack(spacing: 16) {
                recommendedSection
                browseSection
            }
            .padding()
        }
    }

    private var recommendedSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recommended for You")
                .font(.title2)
                .fontWeight(.semibold)
                .accessibilityAddTraits(.isHeader)

            RoundedRectangle(cornerRadius: 16)
                .fill(Color.accentColor.opacity(0.1))
                .frame(height: 120)
                .overlay {
                    VStack {
                        Image(systemName: "sparkles")
                            .font(.title)
                            .foregroundStyle(.accentColor)
                        Text("Personalized workouts coming soon")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .accessibilityLabel("Recommended workouts placeholder")
        }
    }

    private var browseSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Browse")
                .font(.title2)
                .fontWeight(.semibold)
                .accessibilityAddTraits(.isHeader)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                ForEach(WorkoutCategory.allCases, id: \.self) { category in
                    categoryCard(category)
                }
            }
        }
    }

    private func categoryCard(_ category: WorkoutCategory) -> some View {
        Button {
            // Category selection placeholder
        } label: {
            VStack(spacing: 8) {
                Image(systemName: category.icon)
                    .font(.title2)
                Text(category.rawValue)
                    .font(.subheadline)
                    .fontWeight(.medium)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.gray.opacity(0.1))
            .cornerRadius(12)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(category.rawValue) workouts")
    }

    private func loadContent() {
        viewState = .loading
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            viewState = .content
        }
    }
}

enum WorkoutCategory: String, CaseIterable {
    case strength = "Strength"
    case cardio = "Cardio"
    case flexibility = "Flexibility"
    case quickWorkout = "Quick"

    var icon: String {
        switch self {
        case .strength: return "dumbbell.fill"
        case .cardio: return "heart.fill"
        case .flexibility: return "figure.yoga"
        case .quickWorkout: return "timer"
        }
    }
}

#Preview {
    WorkoutsView()
}
