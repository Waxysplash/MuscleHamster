//
//  ShopService.swift
//  MuscleHamster
//
//  Service for shop operations: browsing items, purchasing, and inventory management
//  Phase 07.2: Shop MVP and Purchase Flow
//  Phase 07.3: Customization MVP - Equip and Place
//

import Foundation

// MARK: - Customization Result

/// Result of an equip/place operation
struct CustomizationResult: Equatable {
    let success: Bool
    let item: ShopItem?
    let action: CustomizationAction
    let message: String

    /// Hamster reaction to the customization
    var hamsterReaction: String {
        guard success, let item = item else {
            return "Hmm, something went wrong. Let's try again!"
        }

        switch action {
        case .equip:
            return "Ooh, I love my new \(item.name.lowercased())! How do I look?"
        case .unequip:
            return "Okay, I'll take that off for now!"
        case .place:
            return "My home looks even cozier now! I love the \(item.name.lowercased())!"
        case .remove:
            return "I'll put that away for now. We can use it again later!"
        }
    }
}

/// Types of customization actions
enum CustomizationAction: String {
    case equip
    case unequip
    case place
    case remove
}

// MARK: - Customization Error

/// Errors that can occur during customization operations
enum CustomizationError: LocalizedError {
    case itemNotOwned
    case itemNotFound
    case wrongCategory
    case saveFailed
    case unknown(String)

    var errorDescription: String? {
        switch self {
        case .itemNotOwned:
            return "You don't own this item yet."
        case .itemNotFound:
            return "This item couldn't be found."
        case .wrongCategory:
            return "This item can't be used that way."
        case .saveFailed:
            return "Changes couldn't be saved."
        case .unknown(let message):
            return message
        }
    }

    /// Friendly hamster-voiced message
    var friendlyMessage: String {
        switch self {
        case .itemNotOwned:
            return "This isn't in your collection yet. Visit the shop to find it!"
        case .itemNotFound:
            return "Hmm, I can't find that item. Let's look for something else!"
        case .wrongCategory:
            return "That doesn't quite work here, but we can try something else!"
        case .saveFailed:
            return "Oops! I couldn't save that. Let's try again!"
        case .unknown:
            return "Something unexpected happened. Let's try again!"
        }
    }
}

// MARK: - Shop Service Protocol

protocol ShopServiceProtocol {
    /// Get all items in the shop
    func getAllItems() async throws -> [ShopItem]

    /// Get items in a specific category
    func getItems(in category: ShopItemCategory) async throws -> [ShopItem]

    /// Get featured items for the shop home
    func getFeaturedItems() async throws -> [ShopItem]

    /// Get a specific item by ID
    func getItem(id: String) async throws -> ShopItem?

    /// Purchase an item
    /// - Returns: PurchaseResult with success/failure details
    func purchaseItem(
        itemId: String,
        userId: String,
        currentBalance: Int
    ) async throws -> PurchaseResult

    /// Get user's inventory
    func getInventory(userId: String) async -> Inventory

    /// Check if user owns a specific item
    func ownsItem(itemId: String, userId: String) async -> Bool

    // MARK: - Customization Methods (Phase 07.3)

    /// Get owned items in a category
    func getOwnedItems(in category: ShopItemCategory, userId: String) async throws -> [ShopItem]

    /// Equip an outfit (only one can be equipped at a time)
    func equipOutfit(itemId: String, userId: String) async throws -> CustomizationResult

    /// Unequip the current outfit
    func unequipOutfit(userId: String) async throws -> CustomizationResult

    /// Equip an accessory (only one can be equipped at a time)
    func equipAccessory(itemId: String, userId: String) async throws -> CustomizationResult

    /// Unequip the current accessory
    func unequipAccessory(userId: String) async throws -> CustomizationResult

    /// Place an enclosure item (multiple can be placed)
    func placeEnclosureItem(itemId: String, userId: String) async throws -> CustomizationResult

    /// Remove an enclosure item
    func removeEnclosureItem(itemId: String, userId: String) async throws -> CustomizationResult

    /// Get currently equipped/placed items
    func getEquippedItems(userId: String) async -> EquippedItems
}

/// Container for currently equipped/placed items
struct EquippedItems: Equatable {
    let outfit: ShopItem?
    let accessory: ShopItem?
    let enclosureItems: [ShopItem]

    static let empty = EquippedItems(outfit: nil, accessory: nil, enclosureItems: [])
}

// MARK: - Mock Shop Service

actor MockShopService: ShopServiceProtocol {
    /// All items in the shop catalog
    private let catalog: [ShopItem]

    /// In-memory inventory cache (keyed by userId)
    private var inventoryCache: [String: Inventory] = [:]

    init() {
        self.catalog = Self.createCatalog()
    }

    // MARK: - Get All Items

    func getAllItems() async throws -> [ShopItem] {
        // Simulate network delay
        try? await Task.sleep(nanoseconds: 200_000_000)

        // Simplified MVP: Return limited items (4 per category = 12 total)
        if !FeatureFlags.raritySystem {
            return simplifiedCatalog
        }
        return catalog
    }

    /// Simplified catalog with fewer items (4 per category)
    private var simplifiedCatalog: [ShopItem] {
        var items: [ShopItem] = []
        for category in ShopItemCategory.allCases {
            let categoryItems = catalog.filter { $0.category == category }
            // Take first 4 items of each category (sorted by price for variety)
            items.append(contentsOf: categoryItems.sorted { $0.price < $1.price }.prefix(4))
        }
        return items
    }

    // MARK: - Get Items by Category

    func getItems(in category: ShopItemCategory) async throws -> [ShopItem] {
        try? await Task.sleep(nanoseconds: 150_000_000)
        let categoryItems = catalog.filter { $0.category == category }

        // Simplified MVP: Return limited items per category
        if !FeatureFlags.raritySystem {
            return Array(categoryItems.sorted { $0.price < $1.price }.prefix(4))
        }
        return categoryItems
    }

    // MARK: - Get Featured Items

    func getFeaturedItems() async throws -> [ShopItem] {
        try? await Task.sleep(nanoseconds: 100_000_000)

        // Simplified MVP: No featured section
        if !FeatureFlags.raritySystem {
            return []
        }
        return catalog.filter { $0.isFeatured }
    }

    // MARK: - Get Single Item

    func getItem(id: String) async throws -> ShopItem? {
        try? await Task.sleep(nanoseconds: 50_000_000)
        return catalog.first { $0.id == id }
    }

    // MARK: - Purchase Item

    func purchaseItem(
        itemId: String,
        userId: String,
        currentBalance: Int
    ) async throws -> PurchaseResult {
        // Find the item
        guard let item = catalog.first(where: { $0.id == itemId }) else {
            throw ShopError.itemNotFound
        }

        // Load current inventory
        var inventory = await getInventory(userId: userId)

        // Check if already owned
        guard !inventory.ownsItem(itemId) else {
            throw ShopError.alreadyOwned
        }

        // Check if enough points
        guard currentBalance >= item.price else {
            return PurchaseResult(
                success: false,
                item: item,
                pointsSpent: 0,
                newBalance: currentBalance,
                message: "You need \(item.price - currentBalance) more points for this item."
            )
        }

        // Simulate network delay for purchase
        try? await Task.sleep(nanoseconds: 300_000_000)

        // Create ownership record
        let ownedItem = OwnedItem(
            id: UUID().uuidString,
            itemId: itemId,
            purchasedAt: Date(),
            pointsSpent: item.price
        )

        // Add to inventory
        inventory.addItem(ownedItem)

        // Save inventory
        inventoryCache[userId] = inventory
        inventory.save(for: userId)

        // Calculate new balance
        let newBalance = currentBalance - item.price

        return PurchaseResult(
            success: true,
            item: item,
            pointsSpent: item.price,
            newBalance: newBalance,
            message: "You got the \(item.name)!"
        )
    }

    // MARK: - Get Inventory

    func getInventory(userId: String) async -> Inventory {
        // Check cache first
        if let cached = inventoryCache[userId] {
            return cached
        }

        // Try loading from persistence
        if let saved = Inventory.load(for: userId) {
            inventoryCache[userId] = saved
            return saved
        }

        // Return empty inventory for new users
        let newInventory = Inventory()
        inventoryCache[userId] = newInventory
        return newInventory
    }

    // MARK: - Check Ownership

    func ownsItem(itemId: String, userId: String) async -> Bool {
        let inventory = await getInventory(userId: userId)
        return inventory.ownsItem(itemId)
    }

    // MARK: - Customization Methods (Phase 07.3)

    func getOwnedItems(in category: ShopItemCategory, userId: String) async throws -> [ShopItem] {
        let inventory = await getInventory(userId: userId)
        let ownedItemIds = Set(inventory.ownedItems.map { $0.itemId })

        // Filter catalog to only owned items in this category
        return catalog.filter { item in
            item.category == category && ownedItemIds.contains(item.id)
        }
    }

    func equipOutfit(itemId: String, userId: String) async throws -> CustomizationResult {
        // Find the item
        guard let item = catalog.first(where: { $0.id == itemId }) else {
            throw CustomizationError.itemNotFound
        }

        // Verify it's an outfit
        guard item.category == .outfits else {
            throw CustomizationError.wrongCategory
        }

        // Load inventory
        var inventory = await getInventory(userId: userId)

        // Verify ownership
        guard inventory.ownsItem(itemId) else {
            throw CustomizationError.itemNotOwned
        }

        // Simulate brief delay
        try? await Task.sleep(nanoseconds: 100_000_000)

        // Equip the outfit
        inventory.equippedOutfitId = itemId

        // Save
        inventoryCache[userId] = inventory
        inventory.save(for: userId)

        return CustomizationResult(
            success: true,
            item: item,
            action: .equip,
            message: "Looking great in your \(item.name)!"
        )
    }

    func unequipOutfit(userId: String) async throws -> CustomizationResult {
        var inventory = await getInventory(userId: userId)

        // Get the currently equipped item for the reaction
        let previousItem: ShopItem?
        if let equippedId = inventory.equippedOutfitId {
            previousItem = catalog.first { $0.id == equippedId }
        } else {
            previousItem = nil
        }

        // Simulate brief delay
        try? await Task.sleep(nanoseconds: 100_000_000)

        // Unequip
        inventory.equippedOutfitId = nil

        // Save
        inventoryCache[userId] = inventory
        inventory.save(for: userId)

        return CustomizationResult(
            success: true,
            item: previousItem,
            action: .unequip,
            message: "Outfit removed!"
        )
    }

    func equipAccessory(itemId: String, userId: String) async throws -> CustomizationResult {
        // Find the item
        guard let item = catalog.first(where: { $0.id == itemId }) else {
            throw CustomizationError.itemNotFound
        }

        // Verify it's an accessory
        guard item.category == .accessories else {
            throw CustomizationError.wrongCategory
        }

        // Load inventory
        var inventory = await getInventory(userId: userId)

        // Verify ownership
        guard inventory.ownsItem(itemId) else {
            throw CustomizationError.itemNotOwned
        }

        // Simulate brief delay
        try? await Task.sleep(nanoseconds: 100_000_000)

        // Equip the accessory
        inventory.equippedAccessoryId = itemId

        // Save
        inventoryCache[userId] = inventory
        inventory.save(for: userId)

        return CustomizationResult(
            success: true,
            item: item,
            action: .equip,
            message: "Your \(item.name) looks perfect!"
        )
    }

    func unequipAccessory(userId: String) async throws -> CustomizationResult {
        var inventory = await getInventory(userId: userId)

        // Get the currently equipped item for the reaction
        let previousItem: ShopItem?
        if let equippedId = inventory.equippedAccessoryId {
            previousItem = catalog.first { $0.id == equippedId }
        } else {
            previousItem = nil
        }

        // Simulate brief delay
        try? await Task.sleep(nanoseconds: 100_000_000)

        // Unequip
        inventory.equippedAccessoryId = nil

        // Save
        inventoryCache[userId] = inventory
        inventory.save(for: userId)

        return CustomizationResult(
            success: true,
            item: previousItem,
            action: .unequip,
            message: "Accessory removed!"
        )
    }

    func placeEnclosureItem(itemId: String, userId: String) async throws -> CustomizationResult {
        // Find the item
        guard let item = catalog.first(where: { $0.id == itemId }) else {
            throw CustomizationError.itemNotFound
        }

        // Verify it's an enclosure item
        guard item.category == .enclosure else {
            throw CustomizationError.wrongCategory
        }

        // Load inventory
        var inventory = await getInventory(userId: userId)

        // Verify ownership
        guard inventory.ownsItem(itemId) else {
            throw CustomizationError.itemNotOwned
        }

        // Simulate brief delay
        try? await Task.sleep(nanoseconds: 100_000_000)

        // Place the item (can have multiple)
        inventory.placedEnclosureIds.insert(itemId)

        // Save
        inventoryCache[userId] = inventory
        inventory.save(for: userId)

        return CustomizationResult(
            success: true,
            item: item,
            action: .place,
            message: "Your \(item.name) is now in your hamster's home!"
        )
    }

    func removeEnclosureItem(itemId: String, userId: String) async throws -> CustomizationResult {
        // Find the item
        let item = catalog.first(where: { $0.id == itemId })

        // Load inventory
        var inventory = await getInventory(userId: userId)

        // Simulate brief delay
        try? await Task.sleep(nanoseconds: 100_000_000)

        // Remove the item
        inventory.placedEnclosureIds.remove(itemId)

        // Save
        inventoryCache[userId] = inventory
        inventory.save(for: userId)

        return CustomizationResult(
            success: true,
            item: item,
            action: .remove,
            message: item != nil ? "\(item!.name) removed from display." : "Item removed."
        )
    }

    func getEquippedItems(userId: String) async -> EquippedItems {
        let inventory = await getInventory(userId: userId)

        // Get outfit
        let outfit: ShopItem?
        if let outfitId = inventory.equippedOutfitId {
            outfit = catalog.first { $0.id == outfitId }
        } else {
            outfit = nil
        }

        // Get accessory
        let accessory: ShopItem?
        if let accessoryId = inventory.equippedAccessoryId {
            accessory = catalog.first { $0.id == accessoryId }
        } else {
            accessory = nil
        }

        // Get enclosure items
        let enclosureItems = catalog.filter { inventory.placedEnclosureIds.contains($0.id) }

        return EquippedItems(
            outfit: outfit,
            accessory: accessory,
            enclosureItems: enclosureItems
        )
    }

    // MARK: - Catalog Creation

    private static func createCatalog() -> [ShopItem] {
        var items: [ShopItem] = []

        // MARK: Outfits
        items.append(contentsOf: [
            ShopItem(
                id: "outfit_superhero",
                name: "Superhero Cape",
                description: "A bright red cape to make your hamster feel super! Perfect for conquering those tough workouts.",
                category: .outfits,
                rarity: .uncommon,
                price: 150,
                previewImageName: "outfit_superhero",
                isNew: false,
                isFeatured: true
            ),
            ShopItem(
                id: "outfit_athlete",
                name: "Athlete Jersey",
                description: "A sporty jersey with your hamster's favorite number. Go team!",
                category: .outfits,
                rarity: .common,
                price: 75,
                previewImageName: "outfit_athlete",
                isNew: false,
                isFeatured: false
            ),
            ShopItem(
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
            ShopItem(
                id: "outfit_astronaut",
                name: "Astronaut Suit",
                description: "To infinity and beyond! A mini spacesuit for cosmic adventures.",
                category: .outfits,
                rarity: .legendary,
                price: 500,
                previewImageName: "outfit_astronaut",
                isNew: false,
                isFeatured: true
            ),
            ShopItem(
                id: "outfit_chef",
                name: "Chef Outfit",
                description: "A cute chef hat and apron. Your hamster loves cooking up healthy snacks!",
                category: .outfits,
                rarity: .common,
                price: 80,
                previewImageName: "outfit_chef",
                isNew: false,
                isFeatured: false
            ),
            ShopItem(
                id: "outfit_ninja",
                name: "Ninja Suit",
                description: "Stealthy and speedy! A black ninja outfit for the sneakiest hamster.",
                category: .outfits,
                rarity: .uncommon,
                price: 175,
                previewImageName: "outfit_ninja",
                isNew: true,
                isFeatured: false
            ),
            ShopItem(
                id: "outfit_pirate",
                name: "Pirate Costume",
                description: "Arrr! A pirate captain outfit with a tiny hat and eyepatch.",
                category: .outfits,
                rarity: .uncommon,
                price: 160,
                previewImageName: "outfit_pirate",
                isNew: false,
                isFeatured: false
            ),
            ShopItem(
                id: "outfit_cozy",
                name: "Cozy Sweater",
                description: "A warm knit sweater for rest days. Soft and snuggly!",
                category: .outfits,
                rarity: .common,
                price: 60,
                previewImageName: "outfit_cozy",
                isNew: false,
                isFeatured: false
            )
        ])

        // MARK: Accessories
        items.append(contentsOf: [
            ShopItem(
                id: "acc_sunglasses",
                name: "Cool Sunglasses",
                description: "Ultra stylish shades for your cool hamster. Too cool for school!",
                category: .accessories,
                rarity: .common,
                price: 50,
                previewImageName: "acc_sunglasses",
                isNew: false,
                isFeatured: false
            ),
            ShopItem(
                id: "acc_headband",
                name: "Workout Headband",
                description: "A sporty headband to keep the sweat out of your hamster's eyes.",
                category: .accessories,
                rarity: .common,
                price: 40,
                previewImageName: "acc_headband",
                isNew: false,
                isFeatured: false
            ),
            ShopItem(
                id: "acc_crown",
                name: "Golden Crown",
                description: "A majestic crown fit for hamster royalty. All hail!",
                category: .accessories,
                rarity: .legendary,
                price: 450,
                previewImageName: "acc_crown",
                isNew: false,
                isFeatured: true
            ),
            ShopItem(
                id: "acc_bowtie",
                name: "Fancy Bowtie",
                description: "A dapper bowtie for special occasions. Looking sharp!",
                category: .accessories,
                rarity: .uncommon,
                price: 100,
                previewImageName: "acc_bowtie",
                isNew: false,
                isFeatured: false
            ),
            ShopItem(
                id: "acc_flower",
                name: "Flower Crown",
                description: "A beautiful flower crown. Your hamster is a nature fairy!",
                category: .accessories,
                rarity: .uncommon,
                price: 120,
                previewImageName: "acc_flower",
                isNew: true,
                isFeatured: true
            ),
            ShopItem(
                id: "acc_wings",
                name: "Angel Wings",
                description: "Fluffy white wings for your angelic hamster. So pure!",
                category: .accessories,
                rarity: .rare,
                price: 275,
                previewImageName: "acc_wings",
                isNew: false,
                isFeatured: false
            ),
            ShopItem(
                id: "acc_backpack",
                name: "Tiny Backpack",
                description: "An adorable mini backpack. What's your hamster carrying?",
                category: .accessories,
                rarity: .common,
                price: 65,
                previewImageName: "acc_backpack",
                isNew: false,
                isFeatured: false
            ),
            ShopItem(
                id: "acc_scarf",
                name: "Rainbow Scarf",
                description: "A colorful scarf for chilly days. Warm and stylish!",
                category: .accessories,
                rarity: .uncommon,
                price: 90,
                previewImageName: "acc_scarf",
                isNew: false,
                isFeatured: false
            )
        ])

        // MARK: Enclosure Items
        items.append(contentsOf: [
            ShopItem(
                id: "enc_wheel",
                name: "Rainbow Wheel",
                description: "A colorful exercise wheel that sparkles! Perfect for hamster cardio.",
                category: .enclosure,
                rarity: .uncommon,
                price: 125,
                previewImageName: "enc_wheel",
                isNew: false,
                isFeatured: true
            ),
            ShopItem(
                id: "enc_hammock",
                name: "Cozy Hammock",
                description: "A soft hammock for post-workout naps. Rest is important!",
                category: .enclosure,
                rarity: .common,
                price: 75,
                previewImageName: "enc_hammock",
                isNew: false,
                isFeatured: false
            ),
            ShopItem(
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
            ShopItem(
                id: "enc_plants",
                name: "Potted Plants",
                description: "Cute little plants to freshen up the space. Green and serene!",
                category: .enclosure,
                rarity: .common,
                price: 45,
                previewImageName: "enc_plants",
                isNew: false,
                isFeatured: false
            ),
            ShopItem(
                id: "enc_tunnel",
                name: "Adventure Tunnel",
                description: "A twisty tunnel system for exploring. Where does it go?",
                category: .enclosure,
                rarity: .uncommon,
                price: 110,
                previewImageName: "enc_tunnel",
                isNew: false,
                isFeatured: false
            ),
            ShopItem(
                id: "enc_treehouse",
                name: "Treehouse",
                description: "A magical treehouse hideaway. Your hamster's secret spot!",
                category: .enclosure,
                rarity: .legendary,
                price: 475,
                previewImageName: "enc_treehouse",
                isNew: false,
                isFeatured: true
            ),
            ShopItem(
                id: "enc_pool",
                name: "Tiny Pool",
                description: "A refreshing mini pool (hamster-safe, of course). Splash!",
                category: .enclosure,
                rarity: .uncommon,
                price: 140,
                previewImageName: "enc_pool",
                isNew: false,
                isFeatured: false
            ),
            ShopItem(
                id: "enc_lights",
                name: "Fairy Lights",
                description: "Twinkling string lights for a cozy ambiance. So magical!",
                category: .enclosure,
                rarity: .common,
                price: 55,
                previewImageName: "enc_lights",
                isNew: true,
                isFeatured: false
            )
        ])

        return items
    }
}

// MARK: - Singleton Access

extension MockShopService {
    static let shared = MockShopService()
}
