//
//  InventoryView.swift
//  MuscleHamster
//
//  Customization hub - Browse owned items and customize your hamster
//  Phase 07.3: Customization MVP - Equip and Place
//

import SwiftUI

struct InventoryView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var viewState: ViewState = .loading
    @State private var inventory: Inventory = Inventory()
    @State private var equippedItems: EquippedItems = .empty
    @State private var allItems: [ShopItem] = []

    private let shopService = MockShopService.shared

    var body: some View {
        NavigationStack {
            Group {
                switch viewState {
                case .loading:
                    LoadingView(message: "Opening your collection...")

                case .empty:
                    emptyInventoryView

                case .error(let message):
                    ErrorView(
                        message: message,
                        retryAction: { Task { await loadContent() } }
                    )

                case .content:
                    inventoryContent
                }
            }
            .navigationTitle("My Collection")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
        .task {
            await loadContent()
        }
    }

    // MARK: - Empty State

    private var emptyInventoryView: some View {
        VStack(spacing: 20) {
            Image(systemName: "bag.fill")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)

            Text("Your Collection is Empty")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Visit the shop to find outfits, accessories, and items to decorate your hamster's home!")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)

            Button {
                dismiss()
            } label: {
                Text("Go to Shop")
                    .fontWeight(.semibold)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.accentColor)
                    .clipShape(Capsule())
            }
            .padding(.top, 8)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Your collection is empty. Visit the shop to find items for your hamster.")
    }

    // MARK: - Inventory Content

    private var inventoryContent: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Current Look Preview
                currentLookSection

                // Categories
                categoriesSection
            }
            .padding(.vertical)
        }
        .refreshable {
            await loadContent()
        }
    }

    // MARK: - Current Look Section

    private var currentLookSection: some View {
        VStack(spacing: 16) {
            // Hamster preview with equipped items
            VStack(spacing: 12) {
                Text("Current Look")
                    .font(.headline)
                    .accessibilityAddTraits(.isHeader)

                // Hamster display area
                ZStack {
                    // Enclosure background
                    RoundedRectangle(cornerRadius: 20)
                        .fill(
                            LinearGradient(
                                colors: [.orange.opacity(0.1), .yellow.opacity(0.15)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .frame(height: 200)

                    VStack(spacing: 8) {
                        // Hamster with equipped items indicator
                        ZStack {
                            // Base hamster
                            Image(systemName: "hare.fill")
                                .font(.system(size: 70))
                                .foregroundStyle(.brown)

                            // Outfit indicator
                            if equippedItems.outfit != nil {
                                Image(systemName: "tshirt.fill")
                                    .font(.system(size: 20))
                                    .foregroundStyle(.purple)
                                    .offset(x: -30, y: 20)
                            }

                            // Accessory indicator
                            if equippedItems.accessory != nil {
                                Image(systemName: "sparkles")
                                    .font(.system(size: 18))
                                    .foregroundStyle(.pink)
                                    .offset(x: 30, y: -25)
                            }
                        }

                        // Equipped items labels
                        HStack(spacing: 12) {
                            if let outfit = equippedItems.outfit {
                                equippedItemBadge(outfit, icon: "tshirt.fill", color: .purple)
                            }
                            if let accessory = equippedItems.accessory {
                                equippedItemBadge(accessory, icon: "sparkles", color: .pink)
                            }
                        }

                        // Enclosure items count
                        if !equippedItems.enclosureItems.isEmpty {
                            HStack(spacing: 4) {
                                Image(systemName: "house.fill")
                                    .font(.caption2)
                                Text("\(equippedItems.enclosureItems.count) items in enclosure")
                                    .font(.caption)
                            }
                            .foregroundStyle(.orange)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(Color.orange.opacity(0.15))
                            .clipShape(Capsule())
                        }
                    }
                }
                .padding(.horizontal)
            }
        }
    }

    private func equippedItemBadge(_ item: ShopItem, icon: String, color: Color) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption2)
            Text(item.name)
                .font(.caption)
                .lineLimit(1)
        }
        .foregroundStyle(color)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(color.opacity(0.15))
        .clipShape(Capsule())
        .accessibilityLabel("Wearing \(item.name)")
    }

    // MARK: - Categories Section

    private var categoriesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Categories")
                .font(.title3)
                .fontWeight(.semibold)
                .padding(.horizontal)
                .accessibilityAddTraits(.isHeader)

            VStack(spacing: 12) {
                ForEach(ShopItemCategory.allCases) { category in
                    NavigationLink {
                        InventoryCategoryView(category: category)
                    } label: {
                        categoryRow(category)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
        }
    }

    private func categoryRow(_ category: ShopItemCategory) -> some View {
        let ownedCount = ownedItemCount(for: category)
        let inUseCount = inventory.inUseCount(for: category)

        return HStack(spacing: 16) {
            // Category icon
            ZStack {
                Circle()
                    .fill(categoryColor(for: category).opacity(0.2))
                    .frame(width: 50, height: 50)

                Image(systemName: category.icon)
                    .font(.title3)
                    .foregroundStyle(categoryColor(for: category))
            }

            // Category info
            VStack(alignment: .leading, spacing: 2) {
                Text(category.displayName)
                    .font(.headline)
                    .foregroundStyle(.primary)

                Text(categoryStatusText(category: category, ownedCount: ownedCount, inUseCount: inUseCount))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            // Owned/In-use indicator
            if ownedCount > 0 {
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(ownedCount)")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    if inUseCount > 0 {
                        HStack(spacing: 2) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 10))
                            Text("\(inUseCount) active")
                                .font(.caption2)
                        }
                        .foregroundStyle(.green)
                    }
                }
            } else {
                Text("Empty")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(category.displayName), \(ownedCount) items owned, \(inUseCount) in use")
        .accessibilityHint("Double tap to view and manage items")
    }

    private func categoryStatusText(category: ShopItemCategory, ownedCount: Int, inUseCount: Int) -> String {
        if ownedCount == 0 {
            return "No items yet - visit the shop!"
        }

        switch category {
        case .outfits, .accessories:
            if inUseCount > 0 {
                return "Currently wearing an item"
            } else {
                return "\(ownedCount) item\(ownedCount == 1 ? "" : "s") available"
            }
        case .enclosure:
            if inUseCount > 0 {
                return "\(inUseCount) item\(inUseCount == 1 ? "" : "s") on display"
            } else {
                return "\(ownedCount) item\(ownedCount == 1 ? "" : "s") available to place"
            }
        }
    }

    // MARK: - Helpers

    private func categoryColor(for category: ShopItemCategory) -> Color {
        switch category {
        case .outfits: return .purple
        case .accessories: return .pink
        case .enclosure: return .orange
        }
    }

    private func ownedItemCount(for category: ShopItemCategory) -> Int {
        inventory.countItems(in: category, shopItems: allItems)
    }

    private func loadContent() async {
        viewState = .loading

        do {
            let userId = authViewModel.user?.id ?? "current_user"

            // Load inventory
            inventory = await shopService.getInventory(userId: userId)

            // Load all items for reference
            allItems = try await shopService.getAllItems()

            // Load equipped items
            equippedItems = await shopService.getEquippedItems(userId: userId)

            // Check if inventory is empty
            if inventory.totalItemsOwned == 0 {
                viewState = .empty
            } else {
                viewState = .content
            }
        } catch {
            viewState = .error("Couldn't load your collection. Let's try again!")
        }
    }
}

// MARK: - Preview

#Preview {
    InventoryView()
        .environmentObject(AuthViewModel())
}
