//
//  PointsHistoryView.swift
//  MuscleHamster
//
//  Transaction history screen showing points earned and spent
//  Phase 07.1: Points Wallet
//

import SwiftUI

struct PointsHistoryView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @State private var viewState: ViewState = .loading
    @State private var userStats: UserStats?
    @State private var transactions: [PointsTransaction] = []

    var body: some View {
        Group {
            switch viewState {
            case .loading:
                loadingView
            case .error(let message):
                ErrorView(
                    message: message,
                    retryAction: loadData
                )
            case .content, .empty:
                contentView
            }
        }
        .navigationTitle("Points History")
        .navigationBarTitleDisplayMode(.large)
        .task {
            await loadData()
        }
    }

    // MARK: - Loading View

    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.2)

            Text("Loading your points history...")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .accessibilityLabel("Loading points history")
    }

    // MARK: - Content View

    private var contentView: some View {
        List {
            // Balance Header Section
            Section {
                balanceHeaderView
            }

            // Transactions Section
            if transactions.isEmpty {
                Section {
                    emptyStateView
                }
            } else {
                Section {
                    transactionListView
                } header: {
                    Text("Recent Activity")
                }
            }
        }
        .listStyle(.insetGrouped)
        .refreshable {
            await loadData()
        }
    }

    // MARK: - Balance Header

    private var balanceHeaderView: some View {
        VStack(spacing: 16) {
            // Large balance display
            VStack(spacing: 4) {
                HStack(spacing: 8) {
                    Image(systemName: "star.fill")
                        .font(.system(size: 32))
                        .foregroundStyle(.yellow)

                    Text(formattedBalance)
                        .font(.system(size: 40, weight: .bold))
                }

                Text("Total Points")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)

            // Today's activity summary
            if let stats = userStats {
                todaySummaryView(stats: stats)
            }
        }
        .listRowBackground(Color.clear)
        .listRowInsets(EdgeInsets(top: 16, leading: 0, bottom: 16, trailing: 0))
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(userStats?.totalPoints ?? 0) total points")
    }

    private func todaySummaryView(stats: UserStats) -> some View {
        let earnedToday = stats.transactionPointsEarnedToday
        let spentToday = stats.pointsSpentToday

        return HStack(spacing: 24) {
            if earnedToday > 0 {
                VStack(spacing: 2) {
                    Text("+\(earnedToday)")
                        .font(.headline)
                        .foregroundStyle(.green)
                    Text("earned today")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }

            if spentToday > 0 {
                VStack(spacing: 2) {
                    Text("-\(spentToday)")
                        .font(.headline)
                        .foregroundStyle(.orange)
                    Text("spent today")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }

            if earnedToday == 0 && spentToday == 0 {
                Text("No activity today")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }

    // MARK: - Transaction List

    private var transactionListView: some View {
        ForEach(transactions) { transaction in
            TransactionRowView(transaction: transaction)
        }
    }

    // MARK: - Empty State

    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "sparkles")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)

            Text("Your points journey starts here!")
                .font(.headline)
                .multilineTextAlignment(.center)

            Text("Complete a workout to earn your first points.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 32)
        .listRowBackground(Color.clear)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("No points history yet. Complete a workout to earn your first points.")
    }

    // MARK: - Helpers

    private var formattedBalance: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        return formatter.string(from: NSNumber(value: userStats?.totalPoints ?? 0)) ?? "0"
    }

    private func loadData() async {
        viewState = .loading

        // Small delay for visual feedback
        try? await Task.sleep(nanoseconds: 200_000_000)

        guard let userId = authViewModel.currentUser?.id else {
            viewState = .error("Please sign in to view your points history.")
            return
        }

        let stats = await MockActivityService.shared.getUserStats(userId: userId)
        userStats = stats
        transactions = stats.recentTransactions(limit: 100)

        if transactions.isEmpty {
            viewState = .empty
        } else {
            viewState = .content
        }
    }
}

// MARK: - Transaction Row View

struct TransactionRowView: View {
    let transaction: PointsTransaction

    var body: some View {
        HStack(spacing: 12) {
            // Category icon
            categoryIcon
                .frame(width: 40, height: 40)
                .background(iconBackgroundColor.opacity(0.15))
                .clipShape(Circle())

            // Description and time
            VStack(alignment: .leading, spacing: 2) {
                Text(transaction.description)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .lineLimit(1)

                HStack(spacing: 4) {
                    Text(transaction.category.displayName)
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    Text("•")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    Text(transaction.shortDate)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            // Points change
            Text(transaction.displayAmount)
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundStyle(transaction.type == .earn ? .green : .orange)
        }
        .padding(.vertical, 4)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(transaction.accessibilityLabel)
    }

    private var categoryIcon: some View {
        Image(systemName: transaction.category.icon)
            .font(.system(size: 16))
            .foregroundStyle(iconBackgroundColor)
    }

    private var iconBackgroundColor: Color {
        switch transaction.category {
        case .workout:
            return .blue
        case .restDay:
            return .green
        case .streakFreeze:
            return .purple
        case .shopPurchase:
            return .pink
        case .adReward:
            return .orange
        }
    }
}

// MARK: - Previews

#Preview("With Transactions") {
    NavigationStack {
        PointsHistoryView()
            .environmentObject(AuthViewModel())
    }
}

#Preview("Empty State") {
    NavigationStack {
        // Preview with no transactions would show empty state
        PointsHistoryView()
            .environmentObject(AuthViewModel())
    }
}
