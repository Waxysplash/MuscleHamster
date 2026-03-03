// Inventory Category Screen - Phase 07.3
// Browse owned items in a category and equip/place them

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ShopService } from '../../services/ShopService';
import { ShopItemCategory, ShopItemCategoryInfo, ShopItemRarityInfo } from '../../models/ShopItem';
import LoadingView from '../../components/LoadingView';
import EmptyStateView from '../../components/EmptyStateView';
import ErrorView from '../../components/ErrorView';

export default function InventoryCategoryScreen({ route, navigation }) {
  const { category } = route.params;
  const categoryInfo = ShopItemCategoryInfo[category];
  const categoryColor = categoryInfo?.color || '#8E8E93';

  const [viewState, setViewState] = useState('loading');
  const [ownedItems, setOwnedItems] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadContent();
    }, [category])
  );

  const loadContent = async () => {
    try {
      const [inv, allItems] = await Promise.all([
        ShopService.getInventory(),
        ShopService.getAllItems(),
      ]);

      setInventory(inv);

      // Filter owned items in this category
      const ownedInCategory = inv.ownedItems
        .map((owned) => allItems.find((item) => item.id === owned.itemId))
        .filter((item) => item && item.category === category);

      setOwnedItems(ownedInCategory);

      if (ownedInCategory.length === 0) {
        setViewState('empty');
      } else {
        setViewState('content');
      }
    } catch (error) {
      console.warn('Error loading category items:', error);
      setViewState('error');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContent();
    setRefreshing(false);
  };

  const isItemInUse = (itemId) => {
    if (!inventory) return false;

    switch (category) {
      case ShopItemCategory.OUTFITS:
        return inventory.equippedOutfit === itemId;
      case ShopItemCategory.ACCESSORIES:
        return inventory.equippedAccessory === itemId;
      case ShopItemCategory.ENCLOSURE:
        return inventory.placedEnclosureItems?.includes(itemId);
      default:
        return false;
    }
  };

  const getInUseCount = () => {
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

  const getHeaderStatusText = () => {
    const inUseCount = getInUseCount();

    switch (category) {
      case ShopItemCategory.OUTFITS:
        return inUseCount > 0 ? '1 equipped' : 'Tap an item to try it on';
      case ShopItemCategory.ACCESSORIES:
        return inUseCount > 0 ? '1 equipped' : 'Tap an item to wear it';
      case ShopItemCategory.ENCLOSURE:
        return inUseCount > 0 ? `${inUseCount} placed in home` : 'Tap an item to place it';
      default:
        return '';
    }
  };

  const getEmptyMessage = () => {
    switch (category) {
      case ShopItemCategory.OUTFITS:
        return 'Find fun outfits in the shop to dress up your hamster!';
      case ShopItemCategory.ACCESSORIES:
        return 'Discover cute accessories to add some flair!';
      case ShopItemCategory.ENCLOSURE:
        return "Get some items to make your hamster's home extra cozy!";
      default:
        return 'Visit the shop to find items!';
    }
  };

  const getGradientColors = () => {
    switch (category) {
      case ShopItemCategory.OUTFITS:
        return ['rgba(175,82,222,0.6)', 'rgba(255,45,85,0.5)'];
      case ShopItemCategory.ACCESSORIES:
        return ['rgba(255,45,85,0.6)', 'rgba(255,149,0,0.5)'];
      case ShopItemCategory.ENCLOSURE:
        return ['rgba(255,149,0,0.6)', 'rgba(255,204,0,0.5)'];
      default:
        return ['rgba(0,122,255,0.6)', 'rgba(90,200,250,0.5)'];
    }
  };

  if (viewState === 'loading') {
    return <LoadingView message={`Loading your ${categoryInfo?.displayName.toLowerCase()}...`} />;
  }

  if (viewState === 'error') {
    return (
      <ErrorView
        message="Couldn't load your items. Let's try again!"
        retryAction={loadContent}
      />
    );
  }

  if (viewState === 'empty') {
    return (
      <EmptyStateView
        icon={categoryInfo?.icon || 'bag'}
        title={`No ${categoryInfo?.displayName} Yet`}
        message={getEmptyMessage()}
        actionTitle="Browse Shop"
        onAction={() => navigation.navigate('Shop')}
        iconColor={categoryColor}
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
      {/* Category Header */}
      <View style={[styles.header, { backgroundColor: `${categoryColor}15` }]}>
        <View style={[styles.headerIcon, { backgroundColor: `${categoryColor}30` }]}>
          <Ionicons name={categoryInfo?.icon} size={28} color={categoryColor} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{ownedItems.length} {categoryInfo?.displayName}</Text>
          <Text style={styles.headerStatus}>{getHeaderStatusText()}</Text>
        </View>
      </View>

      {/* Items Grid */}
      <View style={styles.grid}>
        {ownedItems.map((item) => (
          <InventoryItemCard
            key={item.id}
            item={item}
            isInUse={isItemInUse(item.id)}
            gradientColors={getGradientColors()}
            onPress={() => navigation.navigate('InventoryItemPreview', { item, category })}
          />
        ))}
      </View>
    </ScrollView>
  );
}

// Item Card Component
function InventoryItemCard({ item, isInUse, gradientColors, onPress }) {
  const rarityInfo = ShopItemRarityInfo[item.rarity];

  const getInUseIcon = () => {
    switch (item.category) {
      case ShopItemCategory.OUTFITS:
      case ShopItemCategory.ACCESSORIES:
        return 'checkmark-circle';
      case ShopItemCategory.ENCLOSURE:
        return 'home';
      default:
        return 'checkmark-circle';
    }
  };

  const getInUseText = () => {
    switch (item.category) {
      case ShopItemCategory.OUTFITS:
      case ShopItemCategory.ACCESSORIES:
        return 'Equipped';
      case ShopItemCategory.ENCLOSURE:
        return 'Placed';
      default:
        return 'Active';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.itemCard, isInUse && styles.itemCardInUse]}
      onPress={onPress}
      accessibilityLabel={`${item.name}, ${rarityInfo?.displayName}${isInUse ? `, currently ${getInUseText().toLowerCase()}` : ''}`}
      accessibilityHint={`Double tap to preview and ${item.category === ShopItemCategory.ENCLOSURE ? 'place' : 'equip'}`}
    >
      {/* Preview */}
      <LinearGradient colors={gradientColors} style={styles.itemPreview}>
        <Ionicons name="paw" size={40} color="rgba(255,255,255,0.9)" />

        {/* In-use badge */}
        {isInUse && (
          <View style={styles.inUseBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
          </View>
        )}

        {/* Rarity badge */}
        {item.rarity !== 'common' && (
          <View style={styles.rarityBadge}>
            <Ionicons name={rarityInfo?.badgeIcon} size={12} color={rarityInfo?.color} />
          </View>
        )}
      </LinearGradient>

      {/* Info */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        {isInUse ? (
          <View style={styles.inUseLabel}>
            <Ionicons name={getInUseIcon()} size={12} color="#34C759" />
            <Text style={styles.inUseLabelText}>{getInUseText()}</Text>
          </View>
        ) : (
          <Text style={styles.itemHint}>Tap to preview</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  contentContainer: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A3728',
  },
  headerStatus: {
    fontSize: 14,
    color: '#6B5D52',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  itemCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemCardInUse: {
    borderWidth: 2,
    borderColor: 'rgba(52,199,89,0.5)',
  },
  itemPreview: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  inUseBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rarityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A3728',
  },
  inUseLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  inUseLabelText: {
    fontSize: 13,
    color: '#34C759',
    marginLeft: 4,
  },
  itemHint: {
    fontSize: 13,
    color: '#6B5D52',
    marginTop: 4,
  },
});
