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
    color: '#AF52DE',
  },
  [ShopItemCategory.ACCESSORIES]: {
    displayName: 'Accessories',
    description: 'Add some flair with fun accessories!',
    icon: 'glasses',
    color: '#FF2D55',
  },
  [ShopItemCategory.ENCLOSURE]: {
    displayName: 'Enclosure',
    description: 'Decorate your hamster\'s home!',
    icon: 'home',
    color: '#FF9500',
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
    color: '#8E8E93',
    icon: 'ellipse',
    badgeIcon: 'ellipse',
  },
  [ShopItemRarity.UNCOMMON]: {
    displayName: 'Uncommon',
    color: '#34C759',
    icon: 'triangle',
    badgeIcon: 'triangle',
  },
  [ShopItemRarity.RARE]: {
    displayName: 'Rare',
    color: '#5856D6',
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
