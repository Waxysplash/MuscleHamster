//
//  ShopItemDetailView.swift
//  MuscleHamster
//
//  Detail view for a shop item with preview and purchase flow
//  Phase 07.2: Shop MVP and Purchase Flow
//

import SwiftUI

struct ShopItemDetailView: View {
    let item: ShopItem
    let isOwned: Bool
    let currentBalance: Int
    var onPurchaseComplete: ((PurchaseResult) -> Void)?

    @Environment(\.dismiss) private var dismiss
    @State private var purchaseState: PurchaseState = .idle
    @State private var purchaseResult: PurchaseResult?
    @State private var showConfirmation = false

    private let shopService = MockShopService.shared
    private let activityService = MockActivityService.shared

    enum PurchaseState {
        case idle
        case confirming
        case purchasing
        case success
        case error(String)
    }

    private var canAfford: Bool {
        currentBalance >= item.price
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Preview area
                    itemPreview

                    // Item info
                    itemInfo

                    // Purchase section
                    purchaseSection
                }
                .padding()
            }
            .navigationTitle("Item Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title2)
                            .foregroundStyle(.secondary)
                    }
                    .accessibilityLabel("Close")
                }
            }
            .overlay {
                if purchaseState == .purchasing {
                    purchasingOverlay
                }
            }
            .confirmationDialog(
                "Confirm Purchase",
                isPresented: $showConfirmation,
                titleVisibility: .visible
            ) {
                Button("Buy for \(item.price) points") {
                    Task { await performPurchase() }
                }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("Purchase \(item.name)?")
            }
            .sheet(isPresented: .init(
                get: { purchaseState == .success && purchaseResult != nil },
                set: { if !$0 { handleSuccessDismiss() } }
            )) {
                if let result = purchaseResult {
                    PurchaseSuccessView(result: result) {
                        handleSuccessDismiss()
                    }
                    .presentationDetents([.medium])
                }
            }
        }
    }

    // MARK: - Item Preview

    private var itemPreview: some View {
        ZStack {
            // Background
            RoundedRectangle(cornerRadius: 24)
                .fill(previewGradient)
                .frame(height: 250)

            // Item icon (placeholder for actual asset)
            VStack(spacing: 16) {
                Image(systemName: item.defaultIcon)
                    .font(.system(size: 80))
                    .foregroundStyle(.white.opacity(0.9))

                // Rarity badge
                HStack(spacing: 6) {
                    Image(systemName: item.rarity.badgeIcon)
                        .font(.caption)
                    Text(item.rarity.displayName)
                        .font(.caption)
                        .fontWeight(.medium)
                }
                .foregroundStyle(rarityColor)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.white.opacity(0.9))
                .clipShape(Capsule())
            }

            // Owned overlay
            if isOwned {
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        HStack(spacing: 6) {
                            Image(systemName: "checkmark.circle.fill")
                            Text("Owned")
                                .fontWeight(.medium)
                        }
                        .foregroundStyle(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(Color.green)
                        .clipShape(Capsule())
                        .padding()
                    }
                }
            }

            // New badge
            if item.isNew && !isOwned {
                VStack {
                    HStack {
                        Text("NEW")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundStyle(.white)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.red)
                            .clipShape(Capsule())
                            .padding()
                        Spacer()
                    }
                    Spacer()
                }
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(item.name), \(item.rarity.displayName) \(item.category.displayName)")
    }

    // MARK: - Item Info

    private var itemInfo: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Name and category
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(item.name)
                        .font(.title2)
                        .fontWeight(.bold)

                    HStack(spacing: 6) {
                        Image(systemName: item.category.icon)
                            .font(.caption)
                        Text(item.category.displayName)
                            .font(.subheadline)
                    }
                    .foregroundStyle(.secondary)
                }

                Spacer()

                // Price
                if !isOwned {
                    VStack(alignment: .trailing, spacing: 2) {
                        HStack(spacing: 4) {
                            Image(systemName: "star.fill")
                                .foregroundStyle(.yellow)
                            Text(item.displayPrice)
                                .fontWeight(.bold)
                        }
                        .font(.title3)

                        Text("points")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            // Description
            Text(item.description)
                .font(.body)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    // MARK: - Purchase Section

    private var purchaseSection: some View {
        VStack(spacing: 16) {
            if isOwned {
                // Already owned
                ownedSection
            } else if canAfford {
                // Can purchase
                affordableSection
            } else {
                // Can't afford
                insufficientPointsSection
            }
        }
    }

    private var ownedSection: some View {
        VStack(spacing: 12) {
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 40))
                .foregroundStyle(.green)

            Text("You own this item!")
                .font(.headline)

            Text("Check your inventory to equip or place it.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.green.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var affordableSection: some View {
        VStack(spacing: 16) {
            // Balance info
            HStack {
                Text("Your balance:")
                    .foregroundStyle(.secondary)
                Spacer()
                PointsBalanceView(balance: currentBalance, style: .compact)
            }

            // After purchase
            HStack {
                Text("After purchase:")
                    .foregroundStyle(.secondary)
                Spacer()
                HStack(spacing: 4) {
                    Image(systemName: "star.fill")
                        .font(.caption)
                        .foregroundStyle(.yellow)
                    Text("\(currentBalance - item.price)")
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
            }

            Divider()

            // Buy button
            Button {
                showConfirmation = true
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "bag.fill")
                    Text("Buy for \(item.price) points")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.accentColor)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .accessibilityLabel("Buy \(item.name) for \(item.price) points")
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var insufficientPointsSection: some View {
        VStack(spacing: 16) {
            // Points needed
            InsufficientPointsMessage(
                currentBalance: currentBalance,
                requiredAmount: item.price
            )

            Divider()

            // Encouragement
            HStack(spacing: 12) {
                Image(systemName: "figure.run")
                    .font(.title2)
                    .foregroundStyle(.accentColor)

                VStack(alignment: .leading, spacing: 2) {
                    Text("Earn more points")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    Text("Complete workouts to earn points!")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()
            }

            // Disabled buy button
            Button { } label: {
                HStack(spacing: 8) {
                    Image(systemName: "lock.fill")
                    Text("\(item.price) points needed")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.gray.opacity(0.3))
                .foregroundStyle(.secondary)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .disabled(true)
            .accessibilityLabel("Not enough points. Need \(item.price) points, have \(currentBalance)")
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    // MARK: - Purchasing Overlay

    private var purchasingOverlay: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()

            VStack(spacing: 16) {
                ProgressView()
                    .scaleEffect(1.5)
                    .tint(.white)

                Text("Purchasing...")
                    .font(.headline)
                    .foregroundStyle(.white)
            }
            .padding(40)
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 20))
        }
    }

    // MARK: - Helpers

    private var previewGradient: LinearGradient {
        switch item.category {
        case .outfits:
            return LinearGradient(
                colors: [.purple.opacity(0.7), .pink.opacity(0.6)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        case .accessories:
            return LinearGradient(
                colors: [.pink.opacity(0.7), .orange.opacity(0.5)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        case .enclosure:
            return LinearGradient(
                colors: [.orange.opacity(0.7), .yellow.opacity(0.5)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
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

    private func performPurchase() async {
        purchaseState = .purchasing

        do {
            // Get user ID (in real app, from AuthViewModel)
            let userId = "current_user"

            // Record transaction in activity service
            _ = try await activityService.recordShopPurchase(
                itemId: item.id,
                itemName: item.name,
                amount: item.price,
                userId: userId
            )

            // Complete purchase in shop service
            let result = try await shopService.purchaseItem(
                itemId: item.id,
                userId: userId,
                currentBalance: currentBalance
            )

            purchaseResult = result

            if result.success {
                purchaseState = .success
            } else {
                purchaseState = .error(result.message)
            }
        } catch let error as ShopError {
            purchaseState = .error(error.friendlyMessage)
        } catch let error as ActivityError {
            purchaseState = .error(error.friendlyMessage)
        } catch {
            purchaseState = .error("Something went wrong. Let's try again!")
        }
    }

    private func handleSuccessDismiss() {
        if let result = purchaseResult {
            onPurchaseComplete?(result)
        }
        dismiss()
    }
}

// MARK: - Purchase Success View

struct PurchaseSuccessView: View {
    let result: PurchaseResult
    let onDismiss: () -> Void

    @State private var showContent = false

    var body: some View {
        VStack(spacing: 24) {
            // Celebration header
            VStack(spacing: 12) {
                Image(systemName: "party.popper.fill")
                    .font(.system(size: 60))
                    .foregroundStyle(.yellow)
                    .scaleEffect(showContent ? 1 : 0)
                    .animation(.spring(response: 0.5, dampingFraction: 0.6), value: showContent)

                Text(result.celebrationTitle)
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .opacity(showContent ? 1 : 0)
                    .animation(.easeOut.delay(0.2), value: showContent)
            }

            // Item info
            if let item = result.item {
                VStack(spacing: 8) {
                    Text("You got the")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    Text(item.name)
                        .font(.title2)
                        .fontWeight(.semibold)

                    // Points spent
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .foregroundStyle(.yellow)
                        Text("-\(result.pointsSpent) points")
                            .fontWeight(.medium)
                    }
                    .foregroundStyle(.orange)
                }
                .opacity(showContent ? 1 : 0)
                .animation(.easeOut.delay(0.3), value: showContent)
            }

            // Hamster reaction
            VStack(spacing: 8) {
                Image(systemName: "bubble.left.fill")
                    .font(.title)
                    .foregroundStyle(.accentColor.opacity(0.2))

                Text(result.hamsterReaction)
                    .font(.body)
                    .italic()
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)
            }
            .padding()
            .background(Color(.systemGray6))
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .opacity(showContent ? 1 : 0)
            .animation(.easeOut.delay(0.4), value: showContent)

            Spacer()

            // Done button
            Button {
                onDismiss()
            } label: {
                Text("Awesome!")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.accentColor)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .opacity(showContent ? 1 : 0)
            .animation(.easeOut.delay(0.5), value: showContent)
        }
        .padding()
        .onAppear {
            withAnimation {
                showContent = true
            }
        }
    }
}

// MARK: - Preview

#Preview("Affordable") {
    ShopItemDetailView(
        item: ShopItem(
            id: "test",
            name: "Superhero Cape",
            description: "A bright red cape to make your hamster feel super! Perfect for conquering those tough workouts.",
            category: .outfits,
            rarity: .uncommon,
            price: 150,
            previewImageName: "test",
            isNew: true,
            isFeatured: true
        ),
        isOwned: false,
        currentBalance: 350
    )
}

#Preview("Not Affordable") {
    ShopItemDetailView(
        item: ShopItem(
            id: "test",
            name: "Astronaut Suit",
            description: "To infinity and beyond! A mini spacesuit for cosmic adventures.",
            category: .outfits,
            rarity: .legendary,
            price: 500,
            previewImageName: "test",
            isNew: false,
            isFeatured: true
        ),
        isOwned: false,
        currentBalance: 150
    )
}

#Preview("Owned") {
    ShopItemDetailView(
        item: ShopItem(
            id: "test",
            name: "Cool Sunglasses",
            description: "Ultra stylish shades for your cool hamster.",
            category: .accessories,
            rarity: .common,
            price: 50,
            previewImageName: "test",
            isNew: false,
            isFeatured: false
        ),
        isOwned: true,
        currentBalance: 350
    )
}
