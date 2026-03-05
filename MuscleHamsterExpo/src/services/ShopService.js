// Shop Service - Phase 07
import { saveSecure, getSecure, deleteSecure } from './SecureStorageService';
import Logger from './LoggerService';
import {
  ShopItemCategory,
  ShopItemRarity,
  createShopItem,
  createOwnedItem,
  createDefaultInventory,
  createPurchaseResult,
} from '../models/ShopItem';

const INVENTORY_STORAGE_KEY = '@MuscleHamster:inventory';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Current user ID (set by context)
let currentUserId = null;

// In-memory cache
let cachedInventory = null;

// Set the current user ID
export const setShopUserId = (userId) => {
  if (currentUserId !== userId) {
    currentUserId = userId;
    cachedInventory = null; // Clear cache when user changes
  }
};

// Get user-specific storage key
const getStorageKey = () => {
  if (currentUserId) {
    return `${INVENTORY_STORAGE_KEY}:${currentUserId}`;
  }
  return INVENTORY_STORAGE_KEY;
};

// Seed shop items - Simplified catalogue
// Wearable items only (no enclosure), flat 50 points each
const createSeedShopItems = () => {
  const items = [];

  // OUTFITS (3 items)
  items.push(createShopItem({
    id: 'outfit-1',
    name: 'Cozy Sweater',
    description: 'Perfect for rest days!',
    category: ShopItemCategory.OUTFITS,
    rarity: ShopItemRarity.COMMON,
    price: 50,
    previewImageName: 'outfit-1',
  }));

  items.push(createShopItem({
    id: 'outfit-2',
    name: 'Athlete Jersey',
    description: 'Show off your sporty side!',
    category: ShopItemCategory.OUTFITS,
    rarity: ShopItemRarity.COMMON,
    price: 50,
    previewImageName: 'outfit-2',
  }));

  items.push(createShopItem({
    id: 'outfit-3',
    name: 'Bathrobe',
    description: 'Relaxation mode activated!',
    category: ShopItemCategory.OUTFITS,
    rarity: ShopItemRarity.COMMON,
    price: 50,
    previewImageName: 'outfit-3',
  }));

  // ACCESSORIES (3 items)
  items.push(createShopItem({
    id: 'acc-1',
    name: 'Cool Sunglasses',
    description: 'Because your hamster is too cool!',
    category: ShopItemCategory.ACCESSORIES,
    rarity: ShopItemRarity.COMMON,
    price: 50,
    previewImageName: 'acc-1',
  }));

  items.push(createShopItem({
    id: 'acc-3',
    name: 'Golden Crown',
    description: 'Royalty deserves royal accessories!',
    category: ShopItemCategory.ACCESSORIES,
    rarity: ShopItemRarity.COMMON,
    price: 50,
    previewImageName: 'acc-3',
  }));

  items.push(createShopItem({
    id: 'acc-5',
    name: 'Flower Crown',
    description: 'Spring vibes all year!',
    category: ShopItemCategory.ACCESSORIES,
    rarity: ShopItemRarity.COMMON,
    price: 50,
    previewImageName: 'acc-5',
  }));

  return items;
};

let seedItems = null;

const getSeedItems = () => {
  if (!seedItems) {
    seedItems = createSeedShopItems();
  }
  return seedItems;
};

// Load inventory from storage
const loadInventory = async () => {
  if (cachedInventory) return cachedInventory;

  try {
    const storageKey = getStorageKey();
    const stored = await getSecure(storageKey);
    if (stored) {
      cachedInventory = stored;
    } else {
      cachedInventory = createDefaultInventory();
    }
  } catch (e) {
    Logger.warn('Failed to load inventory:', e);
    cachedInventory = createDefaultInventory();
  }

  return cachedInventory;
};

// Save inventory to storage
const saveInventory = async (inventory) => {
  cachedInventory = inventory;
  try {
    const storageKey = getStorageKey();
    await saveSecure(storageKey, inventory);
  } catch (e) {
    Logger.warn('Failed to save inventory:', e);
  }
};

export const ShopService = {
  async getAllItems() {
    await delay(300);
    return getSeedItems();
  },

  async getItems(category) {
    await delay(300);
    return getSeedItems().filter((item) => item.category === category);
  },

  async getItem(id) {
    await delay(200);
    return getSeedItems().find((item) => item.id === id) || null;
  },

  async getFeaturedItems() {
    await delay(300);
    return getSeedItems().filter((item) => item.isFeatured);
  },

  async getNewItems() {
    await delay(300);
    return getSeedItems().filter((item) => item.isNew);
  },

  async getInventory() {
    await delay(200);
    return loadInventory();
  },

  async ownsItem(itemId) {
    const inventory = await loadInventory();
    return inventory.ownedItems.some((owned) => owned.itemId === itemId);
  },

  async purchaseItem(itemId, userPoints) {
    await delay(400);
    const item = await this.getItem(itemId);

    if (!item) {
      return createPurchaseResult({
        success: false,
        message: "Hmm, I can't find that item. Try again?",
      });
    }

    // Check if already owned
    const alreadyOwned = await this.ownsItem(itemId);
    if (alreadyOwned) {
      return createPurchaseResult({
        success: false,
        message: 'You already own this item! Check your inventory.',
      });
    }

    // Check sufficient points
    if (userPoints < item.price) {
      return createPurchaseResult({
        success: false,
        message: `Not enough points! You need ${item.price - userPoints} more points.`,
      });
    }

    // Add to inventory
    const inventory = await loadInventory();
    const ownedItem = createOwnedItem({
      itemId: item.id,
      purchasedAt: new Date().toISOString(),
      pointsSpent: item.price,
    });

    const updatedInventory = {
      ...inventory,
      ownedItems: [...inventory.ownedItems, ownedItem],
    };

    await saveInventory(updatedInventory);

    return createPurchaseResult({
      success: true,
      item,
      pointsSpent: item.price,
      message: `You got the ${item.name}!`,
      hamsterReaction: "Ooh, I love it! Thank you! *happy dance*",
    });
  },

  // Equip a single item (replaces any currently equipped item)
  async equipItem(itemId) {
    await delay(200);
    const inventory = await loadInventory();

    if (!inventory.ownedItems.some((o) => o.itemId === itemId)) {
      return { success: false, error: "You don't own this item!" };
    }

    // Get the item to determine if it's an outfit or accessory
    const item = await this.getItem(itemId);

    // Clear both slots and set the new item in the appropriate slot
    const updatedInventory = {
      ...inventory,
      equippedOutfit: item?.category === ShopItemCategory.OUTFITS ? itemId : null,
      equippedAccessory: item?.category === ShopItemCategory.ACCESSORIES ? itemId : null,
    };

    await saveInventory(updatedInventory);
    return { success: true };
  },

  // Unequip all items
  async unequipAll() {
    await delay(200);
    const inventory = await loadInventory();

    const updatedInventory = {
      ...inventory,
      equippedOutfit: null,
      equippedAccessory: null,
    };

    await saveInventory(updatedInventory);
    return { success: true };
  },

  // Legacy methods for compatibility
  async equipOutfit(itemId) {
    return this.equipItem(itemId);
  },

  async unequipOutfit() {
    return this.unequipAll();
  },

  async equipAccessory(itemId) {
    return this.equipItem(itemId);
  },

  async unequipAccessory() {
    return this.unequipAll();
  },

  // Clear all data (for testing)
  async clearAllData() {
    cachedInventory = null;
    const storageKey = getStorageKey();
    await deleteSecure(storageKey);
  },
};
