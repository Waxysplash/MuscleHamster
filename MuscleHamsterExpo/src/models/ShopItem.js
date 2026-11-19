// Shop Item Model - Phase 07

export const ShopItemCategory = {
  OUTFITS: 'outfits',
  ACCESSORIES: 'accessories',
  ENCLOSURE: 'enclosure',
};

export const ShopItemCategoryInfo = {
  [ShopItemCategory.OUTFITS]: {
    displayName: 'Outfits',
    description: 'Dress up your hamster in style!',
    icon: 'shirt',
    color: '#8B5A2B',
  },
  [ShopItemCategory.ACCESSORIES]: {
    displayName: 'Accessories',
    description: 'Add some flair with fun accessories!',
    icon: 'glasses',
    color: '#C0392B',
  },
  [ShopItemCategory.ENCLOSURE]: {
    displayName: 'Enclosure',
    description: 'Decorate your hamster\'s home!',
    icon: 'home',
    color: '#A65000',
  },
};

export const ShopItemRarity = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  LEGENDARY: 'legendary',
};

export const ShopItemRarityInfo = {
  [ShopItemRarity.COMMON]: {
    displayName: 'Common',
    color: '#6B5D52',
    icon: 'ellipse',
    badgeIcon: 'ellipse',
  },
  [ShopItemRarity.UNCOMMON]: {
    displayName: 'Uncommon',
    color: '#2E7D32',
    icon: 'triangle',
    badgeIcon: 'triangle',
  },
  [ShopItemRarity.RARE]: {
    displayName: 'Rare',
    color: '#8B5A2B',
    icon: 'diamond',
    badgeIcon: 'diamond',
  },
  [ShopItemRarity.LEGENDARY]: {
    displayName: 'Legendary',
    color: '#FFD700',
    icon: 'star',
    badgeIcon: 'star',
  },
};

// Create shop item
export const createShopItem = ({
  id,
  name,
  description,
  category,
  rarity = ShopItemRarity.COMMON,
  price,
  previewImageName = null,
  isNew = false,
  isFeatured = false,
}) => ({
  id,
  name,
  description,
  category,
  rarity,
  price,
  previewImageName,
  isNew,
  isFeatured,
});

// Create owned item record
export const createOwnedItem = ({
  itemId,
  purchasedAt,
  pointsSpent,
}) => ({
  itemId,
  purchasedAt,
  pointsSpent,
});

// Create default inventory
export const createDefaultInventory = () => ({
  ownedItems: [],
  equippedOutfit: null,
  equippedAccessory: null,
  placedEnclosureItems: [],
});

// Purchase result
export const createPurchaseResult = ({
  success,
  item = null,
  pointsSpent = 0,
  message,
  hamsterReaction = null,
}) => ({
  success,
  item,
  pointsSpent,
  message,
  hamsterReaction,
});
