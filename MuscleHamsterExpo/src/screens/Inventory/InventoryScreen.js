// Inventory Screen - Phase 07.3
// Customization hub - Browse owned items and customize your hamster

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ShopService } from '../../services/ShopService';
import { ShopItemCategory, ShopItemCategoryInfo } from '../../models/ShopItem';
import { getShopItemImage } from '../../config/AssetImages';
import HamsterView from '../../components/HamsterView';
import LoadingView from '../../components/LoadingView';
import EmptyStateView from '../../components/EmptyStateView';
import ErrorView from '../../components/ErrorView';

export default function InventoryScreen({ navigation }) {
  const [viewState, setViewState] = useState('loading');
  const [inventory, setInventory] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [equippedItems, setEquippedItems] = useState({ outfit: null, accessory: null });
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadContent();
    }, [])
  );

  const loadContent = async () => {
    try {
      const [inv, items] = await Promise.all([
        ShopService.getInventory(),
        ShopService.getAllItems(),
      ]);

      setInventory(inv);
      setAllItems(items);

      // Get equipped item details
      const equippedOutfit = inv.equippedOutfit
        ? items.find((i) => i.id === inv.equippedOutfit)
        : null;
      const equippedAccessory = inv.equippedAccessory
        ? items.find((i) => i.id === inv.equippedAccessory)
        : null;
      setEquippedItems({ outfit: equippedOutfit, accessory: equippedAccessory });

      // Check if inventory is empty
      if (inv.ownedItems.length === 0) {
        setViewState('empty');
      } else {
        setViewState('content');
      }
    } catch (error) {
      console.warn('Error loading inventory:', error);
      setViewState('error');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContent();
    setRefreshing(false);
  };

  const getOwnedItemCount = (category) => {
    if (!inventory || !allItems.length) return 0;
    return inventory.ownedItems.filter((owned) => {
      const item = allItems.find((i) => i.id === owned.itemId);
      return item?.category === category;
    }).length;
  };

  const getInUseCount = (category) => {
    if (!inventory) return 0;

    switch (category) {
      case ShopItemCategory.OUTFITS:
        return inventory.equippedOutfit ? 1 : 0;
      case ShopItemCategory.ACCESSORIES:
        return inventory.equippedAccessory ? 1 : 0;
      case ShopItemCategory.ENCLOSURE:
        return inventory.placedEnclosureItems?.length || 0;
      default:
        return 0;
    }
  };

  const getCategoryColor = (category) => {
    return ShopItemCategoryInfo[category]?.color || '#8E8E93';
  };

  const getStatusText = (category, ownedCount, inUseCount) => {
    if (ownedCount === 0) {
      return 'No items yet - visit the shop!';
    }

    switch (category) {
      case ShopItemCategory.OUTFITS:
      case ShopItemCategory.ACCESSORIES:
        return inUseCount > 0
          ? 'Currently wearing an item'
          : `${ownedCount} item${ownedCount === 1 ? '' : 's'} available`;
      case ShopItemCategory.ENCLOSURE:
        return inUseCount > 0
          ? `${inUseCount} item${inUseCount === 1 ? '' : 's'} on display`
          : `${ownedCount} item${ownedCount === 1 ? '' : 's'} available to place`;
      default:
        return `${ownedCount} items`;
    }
  };

  if (viewState === 'loading') {
    return <LoadingView message="Opening your collection..." />;
  }

  if (viewState === 'error') {
    return (
      <ErrorView
        message="Couldn't load your collection. Let's try again!"
        retryAction={loadContent}
      />
    );
  }

  if (viewState === 'empty') {
    return (
      <EmptyStateView
        icon="bag"
        title="Your Collection is Empty"
        message="Visit the shop to find outfits, accessories, and items to decorate your hamster's home!"
        actionTitle="Go to Shop"
        onAction={() => navigation.navigate('Shop')}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Current Look Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Look</Text>

        <View style={styles.previewContainer}>
          {/* Hamster with equipped items */}
          <View style={styles.hamsterPreview}>
            <HamsterView
              state="happy"
              size={120}
              equippedOutfit={inventory?.equippedOutfit}
              equippedAccessory={inventory?.equippedAccessory}
            />
          </View>

          {/* Equipped items badges */}
          {(equippedItems.outfit || equippedItems.accessory) && (
            <View style={styles.equippedBadges}>
              {equippedItems.outfit && (
                <View style={[styles.equippedBadge, { backgroundColor: 'rgba(175,82,222,0.15)' }]}>
                  {getShopItemImage(equippedItems.outfit.id) ? (
                    <Image
                      source={getShopItemImage(equippedItems.outfit.id)}
                      style={styles.badgeImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons name="shirt" size={12} color="#AF52DE" />
                  )}
                  <Text style={[styles.equippedBadgeText, { color: '#AF52DE' }]}>
                    {equippedItems.outfit.name}
                  </Text>
                </View>
              )}
              {equippedItems.accessory && (
                <View style={[styles.equippedBadge, { backgroundColor: 'rgba(255,45,85,0.15)' }]}>
                  {getShopItemImage(equippedItems.accessory.id) ? (
                    <Image
                      source={getShopItemImage(equippedItems.accessory.id)}
                      style={styles.badgeImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons name="sparkles" size={12} color="#FF2D55" />
                  )}
                  <Text style={[styles.equippedBadgeText, { color: '#FF2D55' }]}>
                    {equippedItems.accessory.name}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>

        {Object.values(ShopItemCategory).map((category) => {
          const ownedCount = getOwnedItemCount(category);
          const inUseCount = getInUseCount(category);
          const categoryInfo = ShopItemCategoryInfo[category];
          const categoryColor = getCategoryColor(category);

          return (
            <TouchableOpacity
              key={category}
              style={styles.categoryRow}
              onPress={() => navigation.navigate('InventoryCategory', { category })}
              accessibilityLabel={`${categoryInfo.displayName}, ${ownedCount} items owned, ${inUseCount} in use`}
              accessibilityHint="Double tap to view and manage items"
            >
              {/* Icon */}
              <View style={[styles.categoryIcon, { backgroundColor: `${categoryColor}20` }]}>
                <Ionicons name={categoryInfo.icon} size={24} color={categoryColor} />
              </View>

              {/* Info */}
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{categoryInfo.displayName}</Text>
                <Text style={styles.categoryStatus}>
                  {getStatusText(category, ownedCount, inUseCount)}
                </Text>
              </View>

              {/* Count and indicator */}
              <View style={styles.categoryMeta}>
                {ownedCount > 0 ? (
                  <View style={styles.countContainer}>
                    <Text style={styles.countText}>{ownedCount}</Text>
                    {inUseCount > 0 && (
                      <View style={styles.inUseIndicator}>
                        <Ionicons name="checkmark-circle" size={12} color="#34C759" />
                        <Text style={styles.inUseText}>{inUseCount} active</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>Empty</Text>
                )}
                <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingVertical: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  previewContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF5E6',
    borderRadius: 20,
  },
  hamsterPreview: {
    marginBottom: 16,
  },
  hamsterAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFE0B2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  equippedBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  equippedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  equippedBadgeText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  badgeImage: {
    width: 20,
    height: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 16,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  categoryStatus: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countContainer: {
    alignItems: 'flex-end',
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  inUseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  inUseText: {
    fontSize: 11,
    color: '#34C759',
    marginLeft: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
