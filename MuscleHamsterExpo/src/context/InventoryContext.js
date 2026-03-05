/**
 * InventoryContext.js
 * Manages equipped items (simplified - only one item at a time)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ShopService, setShopUserId } from '../services/ShopService';
import { useAuth } from './AuthContext';
import Logger from '../services/LoggerService';

const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const { currentUser } = useAuth();
  const [inventory, setInventory] = useState(null);
  const [equippedOutfit, setEquippedOutfit] = useState(null);
  const [equippedAccessory, setEquippedAccessory] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set user ID when user changes and reload inventory
  useEffect(() => {
    const userId = currentUser?.id || null;
    setShopUserId(userId);

    if (userId) {
      loadInventory();
    } else {
      // Reset to defaults when logged out
      setInventory(null);
      setEquippedOutfit(null);
      setEquippedAccessory(null);
      setError(null);
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  const loadInventory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [inv, items] = await Promise.all([
        ShopService.getInventory(),
        ShopService.getAllItems(),
      ]);

      setInventory(inv);
      setAllItems(items);
      setEquippedOutfit(inv.equippedOutfit);
      setEquippedAccessory(inv.equippedAccessory);
    } catch (e) {
      Logger.warn('Failed to load inventory:', e);
      setError(e.message || 'Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  // Get item details by ID
  const getItemById = useCallback((itemId) => {
    return allItems.find(item => item.id === itemId) || null;
  }, [allItems]);

  // Check if user owns an item
  const ownsItem = useCallback((itemId) => {
    if (!inventory) return false;
    return inventory.ownedItems.some(owned => owned.itemId === itemId);
  }, [inventory]);

  // Get all owned items with full details
  const getOwnedItems = useCallback(() => {
    if (!inventory) return [];
    return inventory.ownedItems.map(owned => ({
      ...owned,
      item: getItemById(owned.itemId),
    })).filter(o => o.item);
  }, [inventory, getItemById]);

  // Equip a single item (only one item can be equipped at a time)
  const equipItem = async (itemId) => {
    const result = await ShopService.equipItem(itemId);
    if (result.success) {
      await loadInventory(); // Refresh to get updated state
    }
    return result;
  };

  // Unequip all items
  const unequipAll = async () => {
    const result = await ShopService.unequipAll();
    if (result.success) {
      setEquippedOutfit(null);
      setEquippedAccessory(null);
    }
    return result;
  };

  // Legacy methods for compatibility
  const equipOutfit = (itemId) => equipItem(itemId);
  const equipAccessory = (itemId) => equipItem(itemId);
  const unequipOutfit = () => unequipAll();
  const unequipAccessory = () => unequipAll();

  // Get equipped item details (either outfit or accessory)
  const getEquippedItemDetails = useCallback(() => {
    if (equippedOutfit) return getItemById(equippedOutfit);
    if (equippedAccessory) return getItemById(equippedAccessory);
    return null;
  }, [equippedOutfit, equippedAccessory, getItemById]);

  // Get equipped outfit details (for compatibility)
  const getEquippedOutfitDetails = useCallback(() => {
    if (!equippedOutfit) return null;
    return getItemById(equippedOutfit);
  }, [equippedOutfit, getItemById]);

  // Get equipped accessory details (for compatibility)
  const getEquippedAccessoryDetails = useCallback(() => {
    if (!equippedAccessory) return null;
    return getItemById(equippedAccessory);
  }, [equippedAccessory, getItemById]);

  const value = {
    inventory,
    isLoading,
    error,
    allItems,
    equippedOutfit,
    equippedAccessory,
    loadInventory,
    getItemById,
    ownsItem,
    getOwnedItems,
    equipItem,
    unequipAll,
    // Legacy methods
    equipOutfit,
    unequipOutfit,
    equipAccessory,
    unequipAccessory,
    getEquippedItemDetails,
    getEquippedOutfitDetails,
    getEquippedAccessoryDetails,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
