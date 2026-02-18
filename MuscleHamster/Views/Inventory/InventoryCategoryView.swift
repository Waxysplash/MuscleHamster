//
//  InventoryCategoryView.swift
//  MuscleHamster
//
//  Browse owned items in a category and equip/place them
//  Phase 07.3: Customization MVP - Equip and Place
//

import SwiftUI

struct InventoryCategoryView: View {
    let category: ShopItemCategory

    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var viewState: ViewState = .loading
    @State private var ownedItems: [ShopItem] = []
    @State private var inventory: Inventory = Inventory()
    @State private var selectedItem: ShopItem?

    private let shopService = MockShopService.shared

    var body: some View {
        Group {
            switch viewState {
            case .loading:
                LoadingView(message: "Loading your \(category.displayName.lowercased())...")

            case .empty:
                emptyCategoryView

            case .error(let message):
                ErrorView(
                    message: message,
                    retryAction: { Task { await loadContent() } }
                )

            case .content:
                categoryContent
            }
        }
        .navigationTitle(category.displayName)
        .navigationBarTitleDisplayMode(.large)
        .sheet(item: $selectedItem) { item in
            InventoryItemPreviewView(
                item: item,
                category: category,
                onCustomizationComplete: {
                    Task { await loadContent() }
                }
            )
        }
        .task {
            await loadContent()
        }
    }

    // MARK: - Empty State

    private var emptyCategoryView: some View {
        VStack(spacing: 20) {
            Image(systemName: category.icon)
                .font(.system(size: 60))
                .foregroundStyle(categoryColor.opacity(0.5))

            Text("No \(category.displayName) Yet")
                .font(.title2)
                .fontWeight(.semibold)

            Text(emptyStateMessage)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)

            NavigationLink {
                ShopCategoryView(category: category, currentBalance: 0)
            } label: {
                Text("Browse Shop")
                    .fontWeight(.semibold)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(categoryColor)
                    .clipShape(Capsule())
            }
            .padding(.top, 8)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("No \(category.displayName.lowercased()) in your collection yet. Visit the shop to find some!")
    }

    private var emptyStateMessage: String {
        switch category {
        case .outfits:
            return "Find fun outfits in the shop to dress up your hamster!"
        case .accessories:
            return "Discover cute accessories to add some flair!"
        case .enclosure:
            return "Get some items to make your hamster's home extra cozy!"
        }
    }

    // MARK: - Category Content

    private var categoryContent: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Category header
                categoryHeader

                // Items grid
                LazyVGrid(columns: [
                    GridItem(.flexible(), spacing: 12),
                    GridItem(.flexible(), spacing: 12)
                ], spacing: 16) {
                    ForEach(ownedItems) { item in
                        Button {
                            selectedItem = item
                        } label: {
                            InventoryItemCard(
                                item: item,
                                isInUse: inventory.isInUse(item.id, category: category)
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .refreshable {
            await loadContent()
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

            VStack(alignment: .leading, spacing: 4) {
                Text("\(ownedItems.count) \(category.displayName)")
                    .font(.headline)

                Text(headerStatusText)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()
        }
        .padding()
        .background(categoryColor.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .padding(.horizontal)
    }

    private var headerStatusText: String {
        let inUseCount = inventory.inUseCount(for: category)

        switch category {
        case .outfits:
            if inUseCount > 0 {
                return "1 equipped"
            } else {
                return "Tap an item to try it on"
            }
        case .accessories:
            if inUseCount > 0 {
                return "1 equipped"
            } else {
                return "Tap an item to wear it"
            }
        case .enclosure:
            if inUseCount > 0 {
                return "\(inUseCount) placed in home"
            } else {
                return "Tap an item to place it"
            }
        }
    }

    // MARK: - Helpers

    private var categoryColor: Color {
        switch category {
        case .outfits: return .purple
        case .accessories: return .pink
        case .enclosure: return .orange
        }
    }

    private func loadContent() async {
        viewState = .loading

        do {
            let userId = authViewModel.user?.id ?? "current_user"

            // Load owned items in this category
            ownedItems = try await shopService.getOwnedItems(in: category, userId: userId)

            // Load inventory for equipped status
            inventory = await shopService.getInventory(userId: userId)

            if ownedItems.isEmpty {
                viewState = .empty
            } else {
                viewState = .content
            }
        } catch {
            viewState = .error("Couldn't load your items. Let's try again!")
        }
    }
}

// MARK: - Inventory Item Card

struct InventoryItemCard: View {
    let item: ShopItem
    let isInUse: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Preview area
            ZStack {
                // Category gradient background
                LinearGradient(
                    colors: categoryGradientColors,
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )

                // Item icon
                Image(systemName: item.defaultIcon)
                    .font(.system(size: 40))
                    .foregroundStyle(.white.opacity(0.9))

                // In-use indicator
                if isInUse {
                    VStack {
                        HStack {
                            Spacer()
                            inUseBadge
                                .padding(8)
                        }
                        Spacer()
                    }
                }

                // Rarity badge
                if item.rarity != .common {
                    VStack {
                        HStack {
                            rarityBadge
                                .padding(8)
                            Spacer()
                        }
                        Spacer()
                    }
                }
            }
            .frame(height: 100)
            .clipShape(RoundedRectangle(cornerRadius: 12))

            // Item info
            VStack(alignment: .leading, spacing: 4) {
                Text(item.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .lineLimit(1)

                if isInUse {
                    HStack(spacing: 4) {
                        Image(systemName: inUseIcon)
                            .font(.caption2)
                        Text(inUseText)
                            .font(.caption)
                    }
                    .foregroundStyle(.green)
                } else {
                    Text("Tap to preview")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(12)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .strokeBorder(
                    isInUse ? Color.green.opacity(0.5) : Color.clear,
                    lineWidth: 2
                )
        )
        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(item.name), \(item.rarity.displayName)\(isInUse ? ", currently \(inUseText.lowercased())" : "")")
        .accessibilityHint("Double tap to preview and \(item.category == .enclosure ? "place" : "equip")")
    }

    private var inUseBadge: some View {
        Image(systemName: "checkmark.circle.fill")
            .font(.system(size: 20))
            .foregroundStyle(.white)
            .background(
                Circle()
                    .fill(Color.green)
                    .frame(width: 24, height: 24)
            )
    }

    private var rarityBadge: some View {
        Image(systemName: item.rarity.badgeIcon)
            .font(.caption)
            .foregroundStyle(rarityColor)
            .padding(4)
            .background(Color.white.opacity(0.9))
            .clipShape(Circle())
    }

    private var categoryGradientColors: [Color] {
        switch item.category {
        case .outfits:
            return [.purple.opacity(0.6), .pink.opacity(0.6)]
        case .accessories:
            return [.pink.opacity(0.6), .orange.opacity(0.5)]
        case .enclosure:
            return [.orange.opacity(0.6), .yellow.opacity(0.5)]
        }
    }

    private var rarityColor: Color {
        switch item.rarity {
        case .common: return .gray
        case .uncommon: return .green
        case .rare: return .blue
        case .legendary: return .purple
        }
    }

    private var inUseIcon: String {
        switch item.category {
        case .outfits, .accessories:
            return "checkmark.circle.fill"
        case .enclosure:
            return "house.fill"
        }
    }

    private var inUseText: String {
        switch item.category {
        case .outfits, .accessories:
            return "Equipped"
        case .enclosure:
            return "Placed"
        }
    }
}

// MARK: - Preview

#Preview("Outfits") {
    NavigationStack {
        InventoryCategoryView(category: .outfits)
    }
    .environmentObject(AuthViewModel())
}

#Preview("Enclosure") {
    NavigationStack {
        InventoryCategoryView(category: .enclosure)
    }
    .environmentObject(AuthViewModel())
}
