//
//  InventoryItemPreviewView.swift
//  MuscleHamster
//
//  Preview and equip/place items from inventory
//  Phase 07.3: Customization MVP - Equip and Place
//  Phase 10: Added hamster preview with item equipped
//

import SwiftUI

struct InventoryItemPreviewView: View {
    let item: ShopItem
    let category: ShopItemCategory
    let onCustomizationComplete: () -> Void

    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var viewState: PreviewState = .idle
    @State private var isInUse: Bool = false
    @State private var inventory: Inventory = Inventory()
    @State private var showSuccessAnimation = false
    @State private var resultMessage: String = ""
    @State private var hamsterReaction: String = ""

    private let shopService = MockShopService.shared

    enum PreviewState {
        case idle
        case loading
        case success
        case error(String)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Item preview
                    itemPreviewSection

                    // Item info
                    itemInfoSection

                    // Action buttons
                    actionSection
                }
                .padding()
            }
            .navigationTitle("Preview")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
            .overlay {
                if case .loading = viewState {
                    loadingOverlay
                }
            }
            .overlay {
                if showSuccessAnimation {
                    successOverlay
                }
            }
        }
        .task {
            await loadStatus()
        }
    }

    // MARK: - Item Preview Section (Phase 10: Shows hamster with item)

    private var itemPreviewSection: some View {
        VStack(spacing: 16) {
            // Large preview with hamster
            ZStack {
                // Category gradient background
                LinearGradient(
                    colors: categoryGradientColors,
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )

                // Preview content based on category
                switch category {
                case .outfits:
                    // Show hamster wearing the outfit
                    HamsterView(
                        state: .happy,
                        growthStage: .adult,
                        outfit: item,
                        size: 140
                    )

                case .accessories:
                    // Show hamster wearing the accessory
                    HamsterView(
                        state: .happy,
                        growthStage: .adult,
                        accessory: item,
                        size: 140
                    )

                case .enclosure:
                    // Show the enclosure item
                    EnclosureItemView(item: item, size: 120)
                }

                // In-use badge
                if isInUse {
                    VStack {
                        HStack {
                            Spacer()
                            HStack(spacing: 4) {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.caption)
                                Text(inUseText)
                                    .font(.caption)
                                    .fontWeight(.medium)
                            }
                            .foregroundStyle(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.green)
                            .clipShape(Capsule())
                            .padding()
                        }
                        Spacer()
                    }
                }

                // Rarity badge
                VStack {
                    HStack {
                        HStack(spacing: 4) {
                            Image(systemName: item.rarity.badgeIcon)
                                .font(.caption)
                            Text(item.rarity.displayName)
                                .font(.caption)
                                .fontWeight(.medium)
                        }
                        .foregroundStyle(rarityColor)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(Color.white.opacity(0.9))
                        .clipShape(Capsule())
                        .padding()
                        Spacer()
                    }
                    Spacer()
                }
            }
            .frame(height: 240)
            .clipShape(RoundedRectangle(cornerRadius: 20))
            .accessibilityLabel("\(item.name) preview")
        }
    }

    // MARK: - Item Info Section

    private var itemInfoSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Name and category
            VStack(alignment: .leading, spacing: 4) {
                Text(item.name)
                    .font(.title2)
                    .fontWeight(.bold)

                HStack(spacing: 8) {
                    Label(category.displayName, systemImage: category.icon)
                        .font(.subheadline)
                        .foregroundStyle(categoryColor)

                    if item.isNew {
                        Text("NEW")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.red)
                            .clipShape(Capsule())
                    }
                }
            }

            // Description
            Text(item.description)
                .font(.body)
                .foregroundStyle(.secondary)

            // Ownership info
            if let ownership = inventory.getOwnership(for: item.id) {
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.seal.fill")
                        .foregroundStyle(.green)
                    Text("Owned since \(ownership.displayPurchaseDate)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Action Section

    private var actionSection: some View {
        VStack(spacing: 12) {
            // Main action button
            Button {
                Task {
                    await performAction()
                }
            } label: {
                HStack {
                    Image(systemName: actionIcon)
                    Text(actionButtonText)
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(actionButtonColor)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .disabled(viewState == .loading)
            .accessibilityLabel(actionButtonText)
            .accessibilityHint(isInUse ? "Remove this item" : "Use this item")

            // Secondary info text
            Text(actionHintText)
                .font(.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
    }

    private var actionButtonText: String {
        if isInUse {
            switch category {
            case .outfits, .accessories:
                return "Remove"
            case .enclosure:
                return "Remove from Home"
            }
        } else {
            switch category {
            case .outfits:
                return "Wear This Outfit"
            case .accessories:
                return "Wear This Accessory"
            case .enclosure:
                return "Place in Home"
            }
        }
    }

    private var actionIcon: String {
        if isInUse {
            return "xmark.circle.fill"
        } else {
            switch category {
            case .outfits:
                return "tshirt.fill"
            case .accessories:
                return "sparkles"
            case .enclosure:
                return "house.fill"
            }
        }
    }

    private var actionButtonColor: Color {
        if isInUse {
            return .gray
        } else {
            return categoryColor
        }
    }

    private var actionHintText: String {
        if isInUse {
            switch category {
            case .outfits, .accessories:
                return "This will remove the item from your hamster."
            case .enclosure:
                return "This will remove the item from display."
            }
        } else {
            switch category {
            case .outfits:
                return "This will replace any currently equipped outfit."
            case .accessories:
                return "This will replace any currently equipped accessory."
            case .enclosure:
                return "You can place multiple items in your hamster's home."
            }
        }
    }

    private var inUseText: String {
        switch category {
        case .outfits, .accessories:
            return "Equipped"
        case .enclosure:
            return "Placed"
        }
    }

    // MARK: - Loading Overlay

    private var loadingOverlay: some View {
        ZStack {
            Color.black.opacity(0.3)
                .ignoresSafeArea()

            VStack(spacing: 16) {
                ProgressView()
                    .scaleEffect(1.2)
                Text(loadingMessage)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .padding(24)
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }

    private var loadingMessage: String {
        if isInUse {
            return "Removing..."
        } else {
            switch category {
            case .outfits, .accessories:
                return "Putting it on..."
            case .enclosure:
                return "Placing it..."
            }
        }
    }

    // MARK: - Success Overlay

    private var successOverlay: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()

            VStack(spacing: 20) {
                // Success icon
                ZStack {
                    Circle()
                        .fill(Color.green.opacity(0.2))
                        .frame(width: 80, height: 80)

                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 50))
                        .foregroundStyle(.green)
                }
                .scaleEffect(showSuccessAnimation ? 1.0 : 0.5)
                .animation(.spring(response: 0.4, dampingFraction: 0.6), value: showSuccessAnimation)

                // Message
                Text(resultMessage)
                    .font(.headline)
                    .multilineTextAlignment(.center)

                // Hamster reaction (Phase 10: Using HamsterView)
                VStack(spacing: 8) {
                    HamsterView(
                        state: .excited,
                        growthStage: .adult,
                        size: 60
                    )

                    Text(""\(hamsterReaction)"")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .italic()
                }
                .padding()
                .background(Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 12))

                // Done button
                Button {
                    onCustomizationComplete()
                    dismiss()
                } label: {
                    Text("Done")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.accentColor)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
            .padding(24)
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 20))
            .padding(.horizontal, 32)
        }
    }

    // MARK: - Helpers

    private var categoryGradientColors: [Color] {
        switch category {
        case .outfits:
            return [.purple.opacity(0.7), .pink.opacity(0.6)]
        case .accessories:
            return [.pink.opacity(0.7), .orange.opacity(0.5)]
        case .enclosure:
            return [.orange.opacity(0.7), .yellow.opacity(0.5)]
        }
    }

    private var categoryColor: Color {
        switch category {
        case .outfits: return .purple
        case .accessories: return .pink
        case .enclosure: return .orange
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

    private func loadStatus() async {
        let userId = authViewModel.user?.id ?? "current_user"
        inventory = await shopService.getInventory(userId: userId)
        isInUse = inventory.isInUse(item.id, category: category)
    }

    private func performAction() async {
        viewState = .loading
        let userId = authViewModel.user?.id ?? "current_user"

        do {
            let result: CustomizationResult

            if isInUse {
                // Remove/unequip
                switch category {
                case .outfits:
                    result = try await shopService.unequipOutfit(userId: userId)
                case .accessories:
                    result = try await shopService.unequipAccessory(userId: userId)
                case .enclosure:
                    result = try await shopService.removeEnclosureItem(itemId: item.id, userId: userId)
                }
            } else {
                // Equip/place
                switch category {
                case .outfits:
                    result = try await shopService.equipOutfit(itemId: item.id, userId: userId)
                case .accessories:
                    result = try await shopService.equipAccessory(itemId: item.id, userId: userId)
                case .enclosure:
                    result = try await shopService.placeEnclosureItem(itemId: item.id, userId: userId)
                }
            }

            // Show success
            resultMessage = result.message
            hamsterReaction = result.hamsterReaction
            viewState = .success
            isInUse = !isInUse
            withAnimation {
                showSuccessAnimation = true
            }

        } catch let error as CustomizationError {
            viewState = .error(error.friendlyMessage)
        } catch {
            viewState = .error("Something went wrong. Let's try again!")
        }
    }
}

// MARK: - Preview

#Preview("Outfit Preview") {
    InventoryItemPreviewView(
        item: ShopItem(
            id: "outfit_wizard",
            name: "Wizard Robe",
            description: "A mystical purple robe with stars. Your hamster is now a fitness wizard!",
            category: .outfits,
            rarity: .rare,
            price: 300,
            previewImageName: "outfit_wizard",
            isNew: true,
            isFeatured: true
        ),
        category: .outfits,
        onCustomizationComplete: {}
    )
    .environmentObject(AuthViewModel())
}

#Preview("Enclosure Preview") {
    InventoryItemPreviewView(
        item: ShopItem(
            id: "enc_castle",
            name: "Mini Castle",
            description: "A royal castle for your hamster kingdom. Rule your realm!",
            category: .enclosure,
            rarity: .rare,
            price: 350,
            previewImageName: "enc_castle",
            isNew: true,
            isFeatured: true
        ),
        category: .enclosure,
        onCustomizationComplete: {}
    )
    .environmentObject(AuthViewModel())
}
