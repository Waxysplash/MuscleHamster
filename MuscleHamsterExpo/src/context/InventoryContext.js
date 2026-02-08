/**
 * InventoryContext.js
 * Manages equipped items and placed enclosure decorations
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ShopService } from '../services/ShopService';

const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState(null);
  const [equippedOutfit, setEquippedOutfit] = useState(null);
  const [equippedAccessory, setEquippedAccessory] = useState(null);
  const [placedEnclosureItems, setPlacedEnclosureItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load inventory on mount
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const [inv, items] = await Promise.all([
        ShopService.getInventory(),
        ShopService.getAllItems(),
      ]);

      setInventory(inv);
      setAllItems(items);
      setEquippedOutfit(inv.equippedOutfit);
      setEquippedAccessory(inv.equippedAccessory);
      setPlacedEnclosureItems(inv.placedEnclosureItems || []);
    } catch (e) {
      console.warn('Failed to load inventory:', e);
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

  // Equip an outfit
  const equipOutfit = async (itemId) => {
    const result = await ShopService.equipOutfit(itemId);
    if (result.success) {
      setEquippedOutfit(itemId);
      await loadInventory(); // Refresh
    }
    return result;
  };

  // Unequip outfit
  const unequipOutfit = async () => {
    // Save null as equipped outfit
    const inv = await ShopService.getInventory();
    inv.equippedOutfit = null;
    // Note: ShopService doesn't have unequip, so we'll handle locally
    setEquippedOutfit(null);
  };

  // Equip an accessory
  const equipAccessory = async (itemId) => {
    const result = await ShopService.equipAccessory(itemId);
    if (result.success) {
      setEquippedAccessory(itemId);
      await loadInventory();
    }
    return result;
  };

  // Unequip accessory
  const unequipAccessory = async () => {
    setEquippedAccessory(null);
  };

  // Place an enclosure item
  const placeEnclosureItem = async (itemId) => {
    const result = await ShopService.placeEnclosureItem(itemId);
    if (result.success) {
      setPlacedEnclosureItems(prev =>
        prev.includes(itemId) ? prev : [...prev, itemId]
      );
      await loadInventory();
    }
    return result;
  };

  // Remove an enclosure item
  const removeEnclosureItem = async (itemId) => {
    const result = await ShopService.removeEnclosureItem(itemId);
    if (result.success) {
      setPlacedEnclosureItems(prev => prev.filter(id => id !== itemId));
      await loadInventory();
    }
    return result;
  };

  // Get equipped outfit details
  const getEquippedOutfitDetails = useCallback(() => {
    if (!equippedOutfit) return null;
    return getItemById(equippedOutfit);
  }, [equippedOutfit, getItemById]);

  // Get equipped accessory details
  const getEquippedAccessoryDetails = useCallback(() => {
    if (!equippedAccessory) return null;
    return getItemById(equippedAccessory);
  }, [equippedAccessory, getItemById]);

  // Get placed enclosure item details
  const getPlacedEnclosureItemDetails = useCallback(() => {
    return placedEnclosureItems.map(id => getItemById(id)).filter(Boolean);
  }, [placedEnclosureItems, getItemById]);

  const value = {
    inventory,
    isLoading,
    allItems,
    equippedOutfit,
    equippedAccessory,
    placedEnclosureItems,
    loadInventory,
    getItemById,
    ownsItem,
    getOwnedItems,
    equipOutfit,
    unequipOutfit,
    equipAccessory,
    unequipAccessory,
    placeEnclosureItem,
    removeEnclosureItem,
    getEquippedOutfitDetails,
    getEquippedAccessoryDetails,
    getPlacedEnclosureItemDetails,
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
