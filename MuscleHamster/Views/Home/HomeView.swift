//
//  HomeView.swift
//  MuscleHamster
//
//  Home screen - Displays the hamster and primary daily actions
//  Phase 01.2: Tone baseline — copy is hamster-voiced, warm, no guilt
//

import SwiftUI

struct HomeView: View {
    @State private var viewState: ViewState = .loading

    var body: some View {
        NavigationStack {
            Group {
                switch viewState {
                case .loading:
                    LoadingView(message: "Waking up your hamster...")

                case .empty:
                    EmptyStateView(
                        icon: "pawprint.fill",
                        title: "Hi, I'm your hamster!",
                        message: "I just woke up and I'm so excited to meet you. Let's get started together!",
                        actionTitle: "Let's Go!",
                        action: { viewState = .content }
                    )

                case .error(let message):
                    ErrorView(
                        message: message,
                        retryAction: { loadContent() }
                    )

                case .content:
                    homeContent
                }
            }
            .navigationTitle("Home")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    NavigationLink {
                        SettingsView()
                    } label: {
                        Image(systemName: "gearshape.fill")
                            .accessibilityLabel("Settings")
                    }
                }
            }
        }
        .onAppear {
            loadContent()
        }
    }

    private var homeContent: some View {
        ScrollView {
            VStack(spacing: 24) {
                hamsterSection
                todayStatusSection
                dailyActionsSection
                streakSection
            }
            .padding()
        }
    }

    // MARK: - Hamster Section

    private var hamsterSection: some View {
        VStack(spacing: 12) {
            Text("Hey there! I'm so happy to see you!")
                .font(.headline)
                .foregroundStyle(.primary)
                .accessibilityAddTraits(.isHeader)

            RoundedRectangle(cornerRadius: 20)
                .fill(Color.gray.opacity(0.2))
                .frame(height: 250)
                .overlay {
                    VStack {
                        Image(systemName: "hare.fill")
                            .font(.system(size: 80))
                            .foregroundStyle(.secondary)
                        Text("Hamster View Placeholder")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .accessibilityLabel("Your hamster")

            Text("I'm feeling great today!")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .accessibilityLabel("Hamster mood: feeling great today")
        }
    }

    // MARK: - Today Status Section

    private var todayStatusSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Today")
                .font(.title2)
                .fontWeight(.semibold)
                .accessibilityAddTraits(.isHeader)

            HStack(spacing: 12) {
                Image(systemName: "sun.max.fill")
                    .font(.title3)
                    .foregroundStyle(.yellow)

                Text("It's a great day to move! I'll be cheering you on.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.accentColor.opacity(0.05))
            .cornerRadius(12)
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Today's status: It's a great day to move! I'll be cheering you on.")
        }
    }

    // MARK: - Daily Actions Section

    private var dailyActionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Button {
                // Workout action placeholder
            } label: {
                HStack {
                    Image(systemName: "figure.run")
                    Text("Start a Workout")
                        .fontWeight(.medium)
                    Spacer()
                    Image(systemName: "chevron.right")
                }
                .padding()
                .background(Color.accentColor.opacity(0.1))
                .cornerRadius(12)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Start a workout")
            .accessibilityHint("Opens the workout selection")

            Button {
                // Rest day check-in placeholder
            } label: {
                HStack {
                    Image(systemName: "zzz")
                    Text("Rest Day Check-in")
                    Spacer()
                    Image(systemName: "chevron.right")
                }
                .padding()
                .foregroundStyle(.secondary)
                .background(Color.gray.opacity(0.08))
                .cornerRadius(12)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Rest day check-in")
            .accessibilityHint("Log a rest day and spend time with your hamster")
        }
    }

    // MARK: - Streak Section

    private var streakSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Current Streak")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text("0 days")
                    .font(.title3)
                    .fontWeight(.semibold)
                Text("Every journey starts here!")
                    .font(.caption)
                    .foregroundStyle(.orange)
            }
            Spacer()
            Image(systemName: "flame.fill")
                .font(.title)
                .foregroundStyle(.orange)
        }
        .padding()
        .background(Color.orange.opacity(0.1))
        .cornerRadius(12)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Current streak: 0 days. Every journey starts here!")
    }

    // MARK: - Data Loading

    private func loadContent() {
        viewState = .loading
        // Simulate loading - will be replaced with actual data fetching
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            viewState = .content
        }
    }

    /// Hamster-voiced error message for the Home screen
    static let homeErrorMessage = "I wandered off for a second! Let's try that again."
}

#Preview("Home") {
    HomeView()
}

#Preview("Empty State") {
    NavigationStack {
        EmptyStateView(
            icon: "pawprint.fill",
            title: "Hi, I'm your hamster!",
            message: "I just woke up and I'm so excited to meet you. Let's get started together!",
            actionTitle: "Let's Go!",
            action: { }
        )
        .navigationTitle("Home")
    }
}

#Preview("Error State") {
    NavigationStack {
        ErrorView(
            message: HomeView.homeErrorMessage,
            retryAction: { }
        )
        .navigationTitle("Home")
    }
}
