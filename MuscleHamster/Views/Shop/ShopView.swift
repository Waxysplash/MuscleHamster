//
//  ShopView.swift
//  MuscleHamster
//
//  Shop tab - Browse and purchase items for hamster customization
//  Phase 07.2: Shop MVP and Purchase Flow
//  Phase 07.3: Added link to inventory/collection
//

import SwiftUI

struct ShopView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var viewState: ViewState = .loading
    @State private var featuredItems: [ShopItem] = []
    @State private var allItems: [ShopItem] = []
    @State private var ownedItemIds: Set<String> = []
    @State private var currentBalance: Int = 0
    @State private var selectedItem: ShopItem?
    @State private var showInventory = false

    private let shopService = MockShopService.shared
    private let activityService = MockActivityService.shared

    var body: some View {
        NavigationStack {
            Group {
                switch viewState {
                case .loading:
                    LoadingView(message: "Opening the shop...")

                case .empty:
                    EmptyStateView(
                        icon: "bag.fill",
                        title: "Shop Coming Soon",
                        message: "Outfits and items for your hamster will be available here."
                    )

                case .error(let message):
                    ErrorView(
                        message: message,
                        retryAction: { Task { await loadContent() } }
                    )

                case .content:
                    shopContent
                }
            }
            .navigationTitle("Shop")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        showInventory = true
                    } label: {
                        Label("My Collection", systemImage: "archivebox.fill")
                    }
                    .accessibilityLabel("My Collection")
                    .accessibilityHint("View and manage your owned items")
                }
                ToolbarItem(placement: .topBarTrailing) {
                    PointsBalanceView(balance: currentBalance, style: .compact)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.yellow.opacity(0.15))
                        .clipShape(Capsule())
                }
            }
            .sheet(isPresented: $showInventory) {
                InventoryView()
                    .onDisappear {
                        // Refresh to show any changes
                        Task { await loadContent() }
                    }
            }
            .sheet(item: $selectedItem) { item in
                ShopItemDetailView(
                    item: item,
                    isOwned: ownedItemIds.contains(item.id),
                    currentBalance: currentBalance,
                    onPurchaseComplete: { result in
                        if result.success {
                            // Refresh to show updated balance and ownership
                            Task { await loadContent() }
                        }
                    }
                )
            }
        }
        .task {
            await loadContent()
        }
    }

    // MARK: - Shop Content

    private var shopContent: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Welcome message
                welcomeSection

                // Featured items
                if !featuredItems.isEmpty {
                    featuredSection
                }

                // Categories
                categoriesSection

                // New arrivals
                newArrivalsSection
            }
            .padding(.vertical)
        }
        .refreshable {
            await loadContent()
        }
    }

    // MARK: - Welcome Section

    private var welcomeSection: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                Image(systemName: "sparkles")
                    .font(.title2)
                    .foregroundStyle(.yellow)

                VStack(alignment: .leading, spacing: 2) {
                    Text("Welcome to the Shop!")
                        .font(.headline)
                    Text("Find something special for your hamster")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                Spacer()
            }
            .padding()
            .background(
                LinearGradient(
                    colors: [.purple.opacity(0.1), .pink.opacity(0.1)],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .clipShape(RoundedRectangle(cornerRadius: 16))

            // My Collection link
            if !ownedItemIds.isEmpty {
                Button {
                    showInventory = true
                } label: {
                    HStack(spacing: 12) {
                        Image(systemName: "archivebox.fill")
                            .font(.title3)
                            .foregroundStyle(.accentColor)

                        VStack(alignment: .leading, spacing: 2) {
                            Text("My Collection")
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundStyle(.primary)
                            Text("\(ownedItemIds.count) items owned")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .buttonStyle(.plain)
                .accessibilityLabel("My Collection, \(ownedItemIds.count) items owned")
                .accessibilityHint("View and manage your owned items")
            }
        }
        .padding(.horizontal)
    }

    // MARK: - Featured Section

    private var featuredSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label("Featured", systemImage: "star.fill")
                    .font(.title3)
                    .fontWeight(.semibold)
                    .foregroundStyle(.primary)

                Spacer()
            }
            .padding(.horizontal)
            .accessibilityAddTraits(.isHeader)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(featuredItems) { item in
                        Button {
                            selectedItem = item
                        } label: {
                            FeaturedShopItemCard(
                                item: item,
                                isOwned: ownedItemIds.contains(item.id)
                            )
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel(shopItemAccessibilityLabel(for: item, isFeatured: true))
                        .accessibilityHint("Double tap to view details and purchase")
                    }
                }
                .padding(.horizontal)
            }
        }
    }

    /// Generate accessibility label for shop item buttons
    private func shopItemAccessibilityLabel(for item: ShopItem, isFeatured: Bool = false) -> String {
        var label = isFeatured ? "Featured: " : ""
        label += item.name
        label += ", \(item.rarity.displayName)"
        label += ", \(item.price) points"
        if ownedItemIds.contains(item.id) {
            label += ", already owned"
        }
        if item.isNew {
            label += ", new arrival"
        }
        return label
    }

    // MARK: - Categories Section

    private var categoriesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Categories")
                .font(.title3)
                .fontWeight(.semibold)
                .padding(.horizontal)
                .accessibilityAddTraits(.isHeader)

            VStack(spacing: 12) {
                ForEach(ShopItemCategory.allCases) { category in
                    NavigationLink {
                        ShopCategoryView(
                            category: category,
                            currentBalance: currentBalance
                        )
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
        HStack(spacing: 16) {
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

                Text(category.description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            // Item count
            VStack(alignment: .trailing, spacing: 2) {
                Text("\(itemCount(for: category))")
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text("items")
                    .font(.caption2)
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
        .accessibilityLabel("\(category.displayName), \(itemCount(for: category)) items")
        .accessibilityHint(category.description)
    }

    // MARK: - New Arrivals Section

    private var newArrivalsSection: some View {
        let newItems = allItems.filter { $0.isNew }

        return Group {
            if !newItems.isEmpty {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Label("New Arrivals", systemImage: "sparkle")
                            .font(.title3)
                            .fontWeight(.semibold)

                        Spacer()
                    }
                    .padding(.horizontal)
                    .accessibilityAddTraits(.isHeader)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(newItems) { item in
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
                                .accessibilityLabel(shopItemAccessibilityLabel(for: item))
                                .accessibilityHint("Double tap to view details and purchase")
                            }
                        }
                        .padding(.horizontal)
                    }
                }
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

    private func itemCount(for category: ShopItemCategory) -> Int {
        allItems.filter { $0.category == category }.count
    }

    private func loadContent() async {
        viewState = .loading

        do {
            // Load all items
            allItems = try await shopService.getAllItems()

            // Load featured items
            featuredItems = try await shopService.getFeaturedItems()

            // Load user stats for balance
            let userId = authViewModel.user?.id ?? "current_user"
            let stats = await activityService.getUserStats(userId: userId)
            currentBalance = stats.totalPoints

            // Load owned items
            let inventory = await shopService.getInventory(userId: userId)
            ownedItemIds = Set(inventory.ownedItems.map { $0.itemId })

            if allItems.isEmpty {
                viewState = .empty
            } else {
                viewState = .content
            }
        } catch {
            viewState = .error("Couldn't load the shop. Let's try again!")
        }
    }
}

// MARK: - Preview

#Preview {
    ShopView()
        .environmentObject(AuthViewModel())
}
