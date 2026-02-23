// Shop Service - Phase 07
import AsyncStorage from '@react-native-async-storage/async-storage';
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
// 3 items per category, flat 50 points each
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
    isFeatured: true,
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
    isNew: true,
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
    isFeatured: true,
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
    isNew: true,
  }));

  // ENCLOSURE (3 items)
  items.push(createShopItem({
    id: 'enc-1',
    name: 'Rainbow Wheel',
    description: 'Run in style!',
    category: ShopItemCategory.ENCLOSURE,
    rarity: ShopItemRarity.COMMON,
    price: 50,
    previewImageName: 'enc-1',
    isFeatured: true,
  }));

  items.push(createShopItem({
    id: 'enc-2',
    name: 'Cozy Hammock',
    description: 'Perfect for nap time!',
    category: ShopItemCategory.ENCLOSURE,
    rarity: ShopItemRarity.COMMON,
    price: 50,
    previewImageName: 'enc-2',
  }));

  items.push(createShopItem({
    id: 'enc-8',
    name: 'Fairy Lights',
    description: 'Magical ambiance!',
    category: ShopItemCategory.ENCLOSURE,
    rarity: ShopItemRarity.COMMON,
    price: 50,
    previewImageName: 'enc-8',
    isNew: true,
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
    const stored = await AsyncStorage.getItem(storageKey);
    if (stored) {
      cachedInventory = JSON.parse(stored);
    } else {
      cachedInventory = createDefaultInventory();
    }
  } catch (e) {
    console.warn('Failed to load inventory:', e);
    cachedInventory = createDefaultInventory();
  }

  return cachedInventory;
};

// Save inventory to storage
const saveInventory = async (inventory) => {
  cachedInventory = inventory;
  try {
    const storageKey = getStorageKey();
    await AsyncStorage.setItem(storageKey, JSON.stringify(inventory));
  } catch (e) {
    console.warn('Failed to save inventory:', e);
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

  async equipOutfit(itemId) {
    await delay(200);
    const inventory = await loadInventory();

    if (!inventory.ownedItems.some((o) => o.itemId === itemId)) {
      return { success: false, error: "You don't own this item!" };
    }

    const updatedInventory = {
      ...inventory,
      equippedOutfit: itemId,
    };

    await saveInventory(updatedInventory);
    return { success: true };
  },

  async unequipOutfit() {
    await delay(200);
    const inventory = await loadInventory();

    const updatedInventory = {
      ...inventory,
      equippedOutfit: null,
    };

    await saveInventory(updatedInventory);
    return { success: true };
  },

  async equipAccessory(itemId) {
    await delay(200);
    const inventory = await loadInventory();

    if (!inventory.ownedItems.some((o) => o.itemId === itemId)) {
      return { success: false, error: "You don't own this item!" };
    }

    const updatedInventory = {
      ...inventory,
      equippedAccessory: itemId,
    };

    await saveInventory(updatedInventory);
    return { success: true };
  },

  async unequipAccessory() {
    await delay(200);
    const inventory = await loadInventory();

    const updatedInventory = {
      ...inventory,
      equippedAccessory: null,
    };

    await saveInventory(updatedInventory);
    return { success: true };
  },

  async placeEnclosureItem(itemId) {
    await delay(200);
    const inventory = await loadInventory();

    if (!inventory.ownedItems.some((o) => o.itemId === itemId)) {
      return { success: false, error: "You don't own this item!" };
    }

    if (inventory.placedEnclosureItems.includes(itemId)) {
      return { success: true }; // Already placed
    }

    const updatedInventory = {
      ...inventory,
      placedEnclosureItems: [...inventory.placedEnclosureItems, itemId],
    };

    await saveInventory(updatedInventory);
    return { success: true };
  },

  async removeEnclosureItem(itemId) {
    await delay(200);
    const inventory = await loadInventory();

    const updatedInventory = {
      ...inventory,
      placedEnclosureItems: inventory.placedEnclosureItems.filter((id) => id !== itemId),
    };

    await saveInventory(updatedInventory);
    return { success: true };
  },

  // Clear all data (for testing)
  async clearAllData() {
    cachedInventory = null;
    const storageKey = getStorageKey();
    await AsyncStorage.removeItem(storageKey);
  },
};
