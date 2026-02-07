//
//  ShopCategoryView.swift
//  MuscleHamster
//
//  View for browsing items in a specific shop category
//  Phase 07.2: Shop MVP and Purchase Flow
//

import SwiftUI

struct ShopCategoryView: View {
    let category: ShopItemCategory
    let currentBalance: Int

    @State private var viewState: ViewState = .loading
    @State private var items: [ShopItem] = []
    @State private var ownedItemIds: Set<String> = []
    @State private var selectedItem: ShopItem?

    private let shopService = MockShopService.shared

    private let columns = [
        GridItem(.flexible(), spacing: 16),
        GridItem(.flexible(), spacing: 16)
    ]

    var body: some View {
        Group {
            switch viewState {
            case .loading:
                LoadingView(message: "Loading \(category.displayName.lowercased())...")

            case .empty:
                EmptyStateView(
                    icon: category.icon,
                    title: "No Items Yet",
                    message: "New \(category.displayName.lowercased()) are coming soon!"
                )

            case .error(let message):
                ErrorView(
                    message: message,
                    retryAction: { Task { await loadItems() } }
                )

            case .content:
                itemsGrid
            }
        }
        .navigationTitle(category.displayName)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                PointsBalanceView(balance: currentBalance, style: .compact)
            }
        }
        .sheet(item: $selectedItem) { item in
            ShopItemDetailView(
                item: item,
                isOwned: ownedItemIds.contains(item.id),
                currentBalance: currentBalance,
                onPurchaseComplete: { _ in
                    // Refresh to show updated ownership
                    Task { await loadItems() }
                }
            )
        }
        .task {
            await loadItems()
        }
    }

    // MARK: - Items Grid

    private var itemsGrid: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Category header
                categoryHeader

                // Stats
                statsRow

                // Items grid
                LazyVGrid(columns: columns, spacing: 16) {
                    ForEach(items) { item in
                        Button {
                            selectedItem = item
                        } label: {
                            ShopItemCardView(
                                item: item,
                                isOwned: ownedItemIds.contains(item.id),
                                size: .regular
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding()
        }
    }

    // MARK: - Category Header

    private var categoryHeader: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(categoryColor.opacity(0.2))
                    .frame(width: 50, height: 50)

                Image(systemName: category.icon)
                    .font(.title2)
                    .foregroundStyle(categoryColor)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(category.displayName)
                    .font(.title2)
                    .fontWeight(.bold)
                    .accessibilityAddTraits(.isHeader)

                Text(category.description)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()
        }
    }

    // MARK: - Stats Row

    private var statsRow: some View {
        HStack(spacing: 20) {
            statBadge(
                value: "\(items.count)",
                label: "Items",
                icon: "bag"
            )

            statBadge(
                value: "\(ownedItemIds.count)",
                label: "Owned",
                icon: "checkmark.circle"
            )

            if let cheapest = items.filter({ !ownedItemIds.contains($0.id) }).min(by: { $0.price < $1.price }) {
                statBadge(
                    value: "\(cheapest.price)",
                    label: "From",
                    icon: "star.fill"
                )
            }

            Spacer()
        }
        .padding(.vertical, 8)
    }

    private func statBadge(value: String, label: String, icon: String) -> some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundStyle(.secondary)

            VStack(alignment: .leading, spacing: 0) {
                Text(value)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                Text(label)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(value) \(label)")
    }

    // MARK: - Helpers

    private var categoryColor: Color {
        switch category {
        case .outfits: return .purple
        case .accessories: return .pink
        case .enclosure: return .orange
        }
    }

    private func loadItems() async {
        viewState = .loading

        do {
            // Load items for this category
            items = try await shopService.getItems(in: category)

            // Load owned items
            if let userId = await getCurrentUserId() {
                let inventory = await shopService.getInventory(userId: userId)
                ownedItemIds = Set(inventory.ownedItems.map { $0.itemId })
            }

            if items.isEmpty {
                viewState = .empty
            } else {
                viewState = .content
            }
        } catch {
            viewState = .error("Couldn't load items. Let's try again!")
        }
    }

    private func getCurrentUserId() async -> String? {
        // In a real app, get from AuthViewModel
        // For now, use a placeholder
        return "current_user"
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        ShopCategoryView(
            category: .outfits,
            currentBalance: 350
        )
    }
}
