//
//  ShopItem.swift
//  MuscleHamster
//
//  Models for shop items, inventory, and purchase flow
//  Phase 07.2: Shop MVP and Purchase Flow
//

import Foundation

// MARK: - Shop Item Category

/// Categories of items available in the shop
enum ShopItemCategory: String, Codable, CaseIterable, Identifiable {
    case outfits     // Costumes and clothing for hamster
    case accessories // Hats, glasses, and other accessories
    case enclosure   // Items to decorate the hamster's home

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .outfits: return "Outfits"
        case .accessories: return "Accessories"
        case .enclosure: return "Enclosure"
        }
    }

    var description: String {
        switch self {
        case .outfits: return "Dress up your hamster in fun costumes"
        case .accessories: return "Add cute accessories to your friend"
        case .enclosure: return "Decorate your hamster's cozy home"
        }
    }

    var icon: String {
        switch self {
        case .outfits: return "tshirt.fill"
        case .accessories: return "sparkles"
        case .enclosure: return "house.fill"
        }
    }

    var color: String {
        switch self {
        case .outfits: return "purple"
        case .accessories: return "pink"
        case .enclosure: return "orange"
        }
    }
}

// MARK: - Shop Item Rarity

/// Rarity levels for shop items (affects pricing and visual treatment)
enum ShopItemRarity: String, Codable, CaseIterable {
    case common      // Basic items, lower cost
    case uncommon    // Nice items, moderate cost
    case rare        // Special items, higher cost
    case legendary   // Ultra rare items, highest cost

    var displayName: String {
        switch self {
        case .common: return "Common"
        case .uncommon: return "Uncommon"
        case .rare: return "Rare"
        case .legendary: return "Legendary"
        }
    }

    var color: String {
        switch self {
        case .common: return "gray"
        case .uncommon: return "green"
        case .rare: return "blue"
        case .legendary: return "purple"
        }
    }

    var badgeIcon: String {
        switch self {
        case .common: return "circle.fill"
        case .uncommon: return "star.fill"
        case .rare: return "sparkle"
        case .legendary: return "crown.fill"
        }
    }
}

// MARK: - Shop Item

/// A purchasable item in the shop
struct ShopItem: Codable, Identifiable, Equatable {
    let id: String
    let name: String
    let description: String
    let category: ShopItemCategory
    let rarity: ShopItemRarity
    let price: Int
    let previewImageName: String  // Asset catalog name for preview
    let isNew: Bool               // Show "NEW" badge
    let isFeatured: Bool          // Show in featured section

    /// Default preview image for categories
    var defaultIcon: String {
        switch category {
        case .outfits: return "tshirt.fill"
        case .accessories: return "sparkles"
        case .enclosure: return "house.fill"
        }
    }

    /// Formatted price string
    var displayPrice: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        return formatter.string(from: NSNumber(value: price)) ?? "\(price)"
    }

    /// Accessibility label for VoiceOver
    var accessibilityLabel: String {
        var label = "\(name), \(rarity.displayName) \(category.displayName)"
        label += ", \(price) points"
        if isNew { label += ", new item" }
        return label
    }
}

// MARK: - Owned Item

/// Represents an item the user has purchased
struct OwnedItem: Codable, Identifiable, Equatable {
    let id: String          // Unique ownership ID
    let itemId: String      // Reference to ShopItem.id
    let purchasedAt: Date   // When the item was purchased
    let pointsSpent: Int    // How many points were spent

    /// Formatted purchase date
    var displayPurchaseDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: purchasedAt)
    }
}

// MARK: - Inventory

/// User's collection of owned items
struct Inventory: Codable, Equatable {
    var ownedItems: [OwnedItem]

    /// Currently equipped outfit (nil if none)
    var equippedOutfitId: String?

    /// Currently equipped accessory (nil if none)
    var equippedAccessoryId: String?

    /// IDs of placed enclosure items (can have multiple)
    var placedEnclosureIds: Set<String>

    init(
        ownedItems: [OwnedItem] = [],
        equippedOutfitId: String? = nil,
        equippedAccessoryId: String? = nil,
        placedEnclosureIds: Set<String> = []
    ) {
        self.ownedItems = ownedItems
        self.equippedOutfitId = equippedOutfitId
        self.equippedAccessoryId = equippedAccessoryId
        self.placedEnclosureIds = placedEnclosureIds
    }

    /// Check if an item is owned
    func ownsItem(_ itemId: String) -> Bool {
        ownedItems.contains { $0.itemId == itemId }
    }

    /// Get ownership record for an item
    func getOwnership(for itemId: String) -> OwnedItem? {
        ownedItems.first { $0.itemId == itemId }
    }

    /// Count of items owned in a category
    func countItems(in category: ShopItemCategory, shopItems: [ShopItem]) -> Int {
        ownedItems.filter { owned in
            shopItems.first { $0.id == owned.itemId }?.category == category
        }.count
    }

    /// Add a new owned item
    mutating func addItem(_ item: OwnedItem) {
        // Prevent duplicates
        guard !ownsItem(item.itemId) else { return }
        ownedItems.append(item)
    }

    /// Total number of owned items
    var totalItemsOwned: Int {
        ownedItems.count
    }

    // MARK: - Equipped Status Helpers (Phase 07.3)

    /// Check if an item is currently equipped (outfit or accessory)
    func isEquipped(_ itemId: String) -> Bool {
        equippedOutfitId == itemId || equippedAccessoryId == itemId
    }

    /// Check if an enclosure item is currently placed
    func isPlaced(_ itemId: String) -> Bool {
        placedEnclosureIds.contains(itemId)
    }

    /// Check if an item is actively in use (equipped or placed)
    func isInUse(_ itemId: String, category: ShopItemCategory) -> Bool {
        switch category {
        case .outfits:
            return equippedOutfitId == itemId
        case .accessories:
            return equippedAccessoryId == itemId
        case .enclosure:
            return placedEnclosureIds.contains(itemId)
        }
    }

    /// Get count of items in use by category
    func inUseCount(for category: ShopItemCategory) -> Int {
        switch category {
        case .outfits:
            return equippedOutfitId != nil ? 1 : 0
        case .accessories:
            return equippedAccessoryId != nil ? 1 : 0
        case .enclosure:
            return placedEnclosureIds.count
        }
    }
}

// MARK: - Purchase Result

/// Result of a purchase attempt
struct PurchaseResult: Equatable {
    let success: Bool
    let item: ShopItem?
    let pointsSpent: Int
    let newBalance: Int
    let message: String

    /// Hamster reaction to the purchase
    var hamsterReaction: String {
        guard success, let item = item else {
            return "That's okay! We can save up for it together."
        }

        switch item.rarity {
        case .legendary:
            return "WOW! A legendary item! I feel so fancy!"
        case .rare:
            return "Ooh, this is really special! I love it!"
        case .uncommon:
            return "This is so nice! Thank you!"
        case .common:
            return "Yay! I love my new \(item.name.lowercased())!"
        }
    }

    /// Success celebration message
    var celebrationTitle: String {
        guard success else { return "Oops!" }
        return ["New Look!", "Got It!", "Awesome!", "Yay!"].randomElement() ?? "Success!"
    }
}

// MARK: - Shop Error

/// Errors that can occur during shop operations
enum ShopError: LocalizedError {
    case itemNotFound
    case alreadyOwned
    case insufficientPoints
    case purchaseFailed
    case inventoryFull
    case unknown(String)

    var errorDescription: String? {
        switch self {
        case .itemNotFound:
            return "This item couldn't be found."
        case .alreadyOwned:
            return "You already own this item!"
        case .insufficientPoints:
            return "Not enough points for this item."
        case .purchaseFailed:
            return "The purchase couldn't be completed."
        case .inventoryFull:
            return "Your inventory is full."
        case .unknown(let message):
            return message
        }
    }

    /// Friendly hamster-voiced message
    var friendlyMessage: String {
        switch self {
        case .itemNotFound:
            return "Hmm, I can't find that item right now. Let's look at something else!"
        case .alreadyOwned:
            return "Good news - you already have this one! Check your inventory."
        case .insufficientPoints:
            return "We need a few more points for this. Let's do a workout together!"
        case .purchaseFailed:
            return "Something went wrong. Let's try again!"
        case .inventoryFull:
            return "Wow, you have so many items! That's amazing."
        case .unknown:
            return "Oops! Something unexpected happened. Let's try again."
        }
    }
}

// MARK: - Inventory Persistence

extension Inventory {
    /// UserDefaults key format for inventory
    static func storageKey(for userId: String) -> String {
        "inventory_\(userId)"
    }

    /// Save to UserDefaults with proper error logging
    func save(for userId: String) {
        PersistenceHelper.save(self, forKey: Self.storageKey(for: userId), context: "Inventory for \(userId)")
    }

    /// Load from UserDefaults with proper error logging
    static func load(for userId: String) -> Inventory? {
        PersistenceHelper.load(Inventory.self, forKey: storageKey(for: userId), context: "Inventory for \(userId)")
    }

    /// Clear saved inventory
    static func clear(for userId: String) {
        PersistenceHelper.remove(forKey: storageKey(for: userId), context: "Inventory for \(userId)")
    }
}
