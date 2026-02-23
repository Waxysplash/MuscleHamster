/**
 * AssetImages.js
 * Central mapping of all image assets
 * All images are in assets/images/
 */

// Hamster state images (base - no outfit)
export const HamsterImages = {
  happy: require('../../assets/images/hamster_happy.png'),
  hungry: require('../../assets/images/hamster_hungry.png'),
  // Map old state names to new images for compatibility
  chillin: require('../../assets/images/hamster_happy.png'),
  sad: require('../../assets/images/hamster_hungry.png'),
};

// Hamster wearing outfits (complete images)
export const HamsterWearingOutfit = {
  'outfit-1': require('../../assets/images/hamster_wearing_sweater.png'),
  'outfit-2': require('../../assets/images/hamster_wearing_jersey.png'),
  'outfit-3': require('../../assets/images/hamster_wearing_bathrobe.png'),
};

// Hamster wearing accessories (complete images)
export const HamsterWearingAccessory = {
  'acc-1': require('../../assets/images/hamster_wearing_sunglasses.png'),
  // Note: crown and flower crown don't have "wearing" versions yet
};

// Outfit images (standalone items for shop display)
export const OutfitImages = {
  'outfit-1': require('../../assets/images/outfit_cozy_sweater.png'),
  'outfit-2': require('../../assets/images/outfit_athlete_jersey.png'),
  'outfit-3': require('../../assets/images/outfit_bathrobe.png'),
};

// Accessory images (standalone items for shop display)
export const AccessoryImages = {
  'acc-1': require('../../assets/images/accessory_sunglasses.png'),
  'acc-3': require('../../assets/images/accessory_crown.png'),
  'acc-5': require('../../assets/images/accessory_flower_crown.png'),
};

// Enclosure item images
export const EnclosureItemImages = {
  'enc-1': require('../../assets/images/enclosure_rainbow_wheel.png'),
  'enc-2': require('../../assets/images/enclosure_hammock.png'),
  'enc-8': require('../../assets/images/enclosure_fairy_lights.png'),
};

// Enclosure background
export const EnclosureBackground = require('../../assets/images/enclosure_bg_default.png');

// Helper to get shop item image by ID (for shop/inventory display)
export const getShopItemImage = (itemId) => {
  if (OutfitImages[itemId]) return OutfitImages[itemId];
  if (AccessoryImages[itemId]) return AccessoryImages[itemId];
  if (EnclosureItemImages[itemId]) return EnclosureItemImages[itemId];
  return null;
};

// Helper to get hamster image by state (base, no outfit)
export const getHamsterImage = (state) => {
  return HamsterImages[state] || HamsterImages.happy;
};

// Helper to get the right hamster image based on equipped items
// Priority: hungry state (no outfit) > outfit > accessory > base state
export const getHamsterWithEquipment = (state, equippedOutfit, equippedAccessory) => {
  // If hamster is hungry, always show the sad/hungry image without any outfit
  // This encourages the user to work out and "feed" their hamster
  if (state === 'hungry' || state === 'sad') {
    return HamsterImages.hungry;
  }

  // If wearing an outfit, use the outfit composite image
  if (equippedOutfit && HamsterWearingOutfit[equippedOutfit]) {
    return HamsterWearingOutfit[equippedOutfit];
  }

  // If wearing an accessory (and no outfit), use the accessory composite image
  if (equippedAccessory && HamsterWearingAccessory[equippedAccessory]) {
    return HamsterWearingAccessory[equippedAccessory];
  }

  // Otherwise use the base state image
  return getHamsterImage(state);
};
