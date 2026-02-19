/**
 * ShopCategoryScreen.js
 * MuscleHamster Expo
 *
 * Displays items from a specific shop category with filtering and sorting
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ShopService } from '../../services/ShopService';
import { useActivity } from '../../context/ActivityContext';
import {
  ShopItemCategory,
  ShopItemCategoryInfo,
  ShopItemRarity,
  ShopItemRarityInfo,
} from '../../models/ShopItem';
import LoadingView from '../../components/LoadingView';
import ErrorView from '../../components/ErrorView';

const SortOption = {
  PRICE_LOW: 'price_low',
  PRICE_HIGH: 'price_high',
  RARITY: 'rarity',
  NAME: 'name',
};

const SortOptionLabels = {
  [SortOption.PRICE_LOW]: 'Price: Low to High',
  [SortOption.PRICE_HIGH]: 'Price: High to Low',
  [SortOption.RARITY]: 'Rarity',
  [SortOption.NAME]: 'Name',
};

const rarityOrder = {
  [ShopItemRarity.LEGENDARY]: 0,
  [ShopItemRarity.RARE]: 1,
  [ShopItemRarity.UNCOMMON]: 2,
  [ShopItemRarity.COMMON]: 3,
};

export default function ShopCategoryScreen({ route, navigation }) {
  const { category } = route.params || {};
  const categoryInfo = ShopItemCategoryInfo[category] || {};
  const { totalPoints, recordShopPurchase } = useActivity();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [items, setItems] = useState([]);
  const [ownedItemIds, setOwnedItemIds] = useState(new Set());
  const [sortBy, setSortBy] = useState(SortOption.RARITY);
  const [showSortModal, setShowSortModal] = useState(false);

  // Item detail modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCategoryData();
    }, [category])
  );

  const loadCategoryData = async () => {
    if (!category) {
      setError('No category specified');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [allItems, inventory] = await Promise.all([
        ShopService.getItems(category),
        ShopService.getInventory(),
      ]);

      setItems(allItems);
      setOwnedItemIds(new Set(inventory.ownedItems.map((o) => o.itemId)));
    } catch (e) {
      setError('Failed to load items');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategoryData();
    setRefreshing(false);
  };

  const getSortedItems = () => {
    const sorted = [...items];
    switch (sortBy) {
      case SortOption.PRICE_LOW:
        sorted.sort((a, b) => a.price - b.price);
        break;
      case SortOption.PRICE_HIGH:
        sorted.sort((a, b) => b.price - a.price);
        break;
      case SortOption.RARITY:
        sorted.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
        break;
      case SortOption.NAME:
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return sorted;
  };

  const handlePurchase = async () => {
    if (!selectedItem || isPurchasing) return;

    setIsPurchasing(true);
    try {
      const result = await ShopService.purchaseItem(selectedItem.id, totalPoints);

      if (result.success) {
        // Deduct points and record purchase
        await recordShopPurchase(selectedItem.id, selectedItem.name, result.pointsSpent);
        setOwnedItemIds((prev) => new Set([...prev, selectedItem.id]));

        Alert.alert(
          result.message,
          result.hamsterReaction,
          [{ text: 'Yay!', onPress: () => setSelectedItem(null) }]
        );
      } else {
        Alert.alert('Oops!', result.message);
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return <LoadingView message={`Loading ${categoryInfo.displayName || 'items'}...`} />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadCategoryData} />;
  }

  const sortedItems = getSortedItems();

  return (
    <View style={styles.container}>
      {/* Header with sort */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={[styles.categoryIcon, { backgroundColor: categoryInfo.color + '20' }]}>
            <Ionicons name={categoryInfo.icon} size={24} color={categoryInfo.color} />
          </View>
          <View>
            <Text style={styles.headerTitle}>{categoryInfo.displayName}</Text>
            <Text style={styles.headerSubtitle}>{items.length} items</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <Ionicons name="swap-vertical" size={18} color="#007AFF" />
          <Text style={styles.sortButtonText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Items Grid */}
      <ScrollView
        contentContainerStyle={styles.itemsGrid}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {sortedItems.map((item) => (
          <CategoryItemCard
            key={item.id}
            item={item}
            isOwned={ownedItemIds.has(item.id)}
            onPress={() => setSelectedItem(item)}
          />
        ))}
      </ScrollView>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.sortModalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.sortModalContent}>
            <Text style={styles.sortModalTitle}>Sort By</Text>
            {Object.values(SortOption).map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.sortOption}
                onPress={() => {
                  setSortBy(option);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === option && styles.sortOptionTextActive,
                  ]}
                >
                  {SortOptionLabels[option]}
                </Text>
                {sortBy === option && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOwned={selectedItem ? ownedItemIds.has(selectedItem.id) : false}
        userPoints={totalPoints}
        isPurchasing={isPurchasing}
        onPurchase={handlePurchase}
        onClose={() => setSelectedItem(null)}
      />
    </View>
  );
}

// Category Item Card (larger format for grid)
function CategoryItemCard({ item, isOwned, onPress }) {
  const rarityInfo = ShopItemRarityInfo[item.rarity];
  const categoryInfo = ShopItemCategoryInfo[item.category];

  return (
    <TouchableOpacity style={styles.itemCard} onPress={onPress}>
      {item.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}
      <View style={[styles.itemIcon, { backgroundColor: categoryInfo.color + '20' }]}>
        <Ionicons name={categoryInfo.icon} size={32} color={categoryInfo.color} />
      </View>
      <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
      <View style={styles.rarityRow}>
        <View style={[styles.rarityDot, { backgroundColor: rarityInfo.color }]} />
        <Text style={[styles.rarityText, { color: rarityInfo.color }]}>
          {rarityInfo.displayName}
        </Text>
      </View>
      {isOwned ? (
        <View style={styles.ownedBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#34C759" />
          <Text style={styles.ownedText}>Owned</Text>
        </View>
      ) : (
        <View style={styles.priceRow}>
          <Ionicons name="star" size={16} color="#FF9500" />
          <Text style={styles.priceText}>{item.price}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Item Detail Modal (reused from ShopScreen)
function ItemDetailModal({ item, isOwned, userPoints, isPurchasing, onPurchase, onClose }) {
  if (!item) return null;

  const rarityInfo = ShopItemRarityInfo[item.rarity];
  const categoryInfo = ShopItemCategoryInfo[item.category];
  const canAfford = userPoints >= item.price;

  return (
    <Modal
      visible={!!item}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Item Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.modalContent}>
          <View style={[styles.previewContainer, { backgroundColor: categoryInfo.color + '15' }]}>
            <View style={[styles.previewIcon, { backgroundColor: categoryInfo.color + '30' }]}>
              <Ionicons name={categoryInfo.icon} size={60} color={categoryInfo.color} />
            </View>
          </View>

          <Text style={styles.itemDetailName}>{item.name}</Text>

          <View style={styles.badgesRow}>
            <View style={[styles.rarityBadge, { backgroundColor: rarityInfo.color + '20' }]}>
              <View style={[styles.rarityDotLarge, { backgroundColor: rarityInfo.color }]} />
              <Text style={[styles.rarityBadgeText, { color: rarityInfo.color }]}>
                {rarityInfo.displayName}
              </Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '20' }]}>
              <Ionicons name={categoryInfo.icon} size={14} color={categoryInfo.color} />
              <Text style={[styles.categoryBadgeText, { color: categoryInfo.color }]}>
                {categoryInfo.displayName}
              </Text>
            </View>
          </View>

          <Text style={styles.itemDescription}>{item.description}</Text>

          <View style={styles.priceSection}>
            <View style={styles.priceLarge}>
              <Ionicons name="star" size={24} color="#FF9500" />
              <Text style={styles.priceLargeText}>{item.price}</Text>
            </View>
            <Text style={styles.balanceText}>
              Your balance: {userPoints} points
            </Text>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          {isOwned ? (
            <View style={styles.ownedButton}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.ownedButtonText}>Already Owned</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.purchaseButton,
                !canAfford && styles.purchaseButtonDisabled,
              ]}
              onPress={onPurchase}
              disabled={!canAfford || isPurchasing}
            >
              {isPurchasing ? (
                <Text style={styles.purchaseButtonText}>Purchasing...</Text>
              ) : canAfford ? (
                <>
                  <Ionicons name="cart" size={20} color="#fff" />
                  <Text style={styles.purchaseButtonText}>Purchase</Text>
                </>
              ) : (
                <Text style={styles.purchaseButtonText}>
                  Need {item.price - userPoints} more points
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderRadius: 8,
  },
  sortButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  itemCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    margin: '1%',
    alignItems: 'center',
  },
  itemIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
    height: 40,
  },
  rarityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rarityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  rarityDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '700',
    color: '#FF9500',
  },
  ownedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownedText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '600',
    color: '#34C759',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  // Sort Modal
  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#000',
  },
  sortOptionTextActive: {
    fontWeight: '600',
    color: '#007AFF',
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  previewContainer: {
    height: 200,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewIcon: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetailName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  rarityBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: 16,
    color: '#3C3C43',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  priceSection: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  priceLarge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLargeText: {
    marginLeft: 8,
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  balanceText: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  modalFooter: {
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  purchaseButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  purchaseButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  ownedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  ownedButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#34C759',
  },
});
