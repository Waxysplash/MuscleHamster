/**
 * ShopScreen.js
 * MuscleHamster Expo
 *
 * Full shop implementation with featured items, categories, and purchase flow
 * Ported from Phase 07: Shop MVP (Swift version)
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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ShopService } from '../../services/ShopService';
import { useActivity } from '../../context/ActivityContext';
import {
  ShopItemCategory,
  ShopItemCategoryInfo,
  ShopItemRarityInfo,
} from '../../models/ShopItem';
import { getShopItemImage } from '../../config/AssetImages';
import LoadingView from '../../components/LoadingView';
import ErrorView from '../../components/ErrorView';

export default function ShopScreen({ navigation }) {
  const { totalPoints, recordShopPurchase } = useActivity();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [allItems, setAllItems] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [ownedItemIds, setOwnedItemIds] = useState(new Set());

  // Item detail modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadShopData();
    }, [])
  );

  const loadShopData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [items, featured, newArrivals, inventory] = await Promise.all([
        ShopService.getAllItems(),
        ShopService.getFeaturedItems(),
        ShopService.getNewItems(),
        ShopService.getInventory(),
      ]);

      setAllItems(items);
      setFeaturedItems(featured);
      setNewItems(newArrivals);
      setOwnedItemIds(new Set(inventory.ownedItems.map((o) => o.itemId)));
    } catch (e) {
      setError('Failed to load shop');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadShopData();
    setRefreshing(false);
  };

  const handlePurchase = async () => {
    if (!selectedItem || isPurchasing) return;

    setIsPurchasing(true);
    try {
      const result = await ShopService.purchaseItem(selectedItem.id, totalPoints);

      if (result.success) {
        // Deduct points and record purchase
        await recordShopPurchase(selectedItem.id, selectedItem.name, result.pointsSpent);

        // Update owned items
        setOwnedItemIds((prev) => new Set([...prev, selectedItem.id]));

        // Show success
        Alert.alert(
          '🎉 ' + result.message,
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

  const getCategoryCount = (category) => {
    return allItems.filter((item) => item.category === category).length;
  };

  const getOwnedCount = () => {
    return ownedItemIds.size;
  };

  if (isLoading) {
    return <LoadingView message="Opening the shop..." />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadShopData} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Points Header */}
        <View style={styles.pointsHeader}>
          <Ionicons name="star" size={20} color="#FF9500" />
          <Text style={styles.pointsText}>{totalPoints} points</Text>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeRow}>
            <Ionicons name="sparkles" size={24} color="#FFD700" />
            <View style={styles.welcomeInfo}>
              <Text style={styles.welcomeTitle}>Welcome to the Shop!</Text>
              <Text style={styles.welcomeSubtitle}>
                Find something special for your hamster
              </Text>
            </View>
          </View>
        </View>

        {/* My Collection Link */}
        {getOwnedCount() > 0 && (
          <TouchableOpacity
            style={styles.collectionLink}
            onPress={() => navigation.navigate('Inventory')}
          >
            <View style={styles.collectionIcon}>
              <Ionicons name="archive" size={20} color="#007AFF" />
            </View>
            <View style={styles.collectionInfo}>
              <Text style={styles.collectionTitle}>My Collection</Text>
              <Text style={styles.collectionSubtitle}>
                {getOwnedCount()} items owned
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
          </TouchableOpacity>
        )}

        {/* Featured Section */}
        {featuredItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.sectionTitle}>Featured</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {featuredItems.map((item) => (
                <FeaturedItemCard
                  key={item.id}
                  item={item}
                  isOwned={ownedItemIds.has(item.id)}
                  onPress={() => setSelectedItem(item)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {Object.values(ShopItemCategory).map((category) => {
            const info = ShopItemCategoryInfo[category];
            const count = getCategoryCount(category);
            return (
              <TouchableOpacity
                key={category}
                style={styles.categoryRow}
                onPress={() => navigation.navigate('ShopCategory', { category })}
              >
                <View style={[styles.categoryIcon, { backgroundColor: info.color + '20' }]}>
                  <Ionicons name={info.icon} size={22} color={info.color} />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryLabel}>{info.displayName}</Text>
                  <Text style={styles.categoryDesc}>{info.description}</Text>
                </View>
                <View style={styles.categoryCount}>
                  <Text style={styles.categoryCountText}>{count}</Text>
                  <Text style={styles.categoryCountLabel}>items</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* New Arrivals Section */}
        {newItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkle" size={18} color="#5856D6" />
              <Text style={styles.sectionTitle}>New Arrivals</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {newItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isOwned={ownedItemIds.has(item.id)}
                  onPress={() => setSelectedItem(item)}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

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

// Featured Item Card
function FeaturedItemCard({ item, isOwned, onPress }) {
  const categoryInfo = ShopItemCategoryInfo[item.category];
  const itemImage = getShopItemImage(item.id);

  return (
    <TouchableOpacity style={styles.featuredCard} onPress={onPress}>
      {item.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}
      <View style={[styles.featuredIcon, { backgroundColor: categoryInfo.color + '20' }]}>
        {itemImage ? (
          <Image source={itemImage} style={styles.featuredImage} resizeMode="contain" />
        ) : (
          <Ionicons name={categoryInfo.icon} size={32} color={categoryInfo.color} />
        )}
      </View>
      <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
      {isOwned ? (
        <View style={styles.ownedBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#34C759" />
          <Text style={styles.ownedText}>Owned</Text>
        </View>
      ) : (
        <View style={styles.priceRow}>
          <Ionicons name="star" size={14} color="#FF9500" />
          <Text style={styles.priceText}>{item.price}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Regular Item Card
function ItemCard({ item, isOwned, onPress }) {
  const categoryInfo = ShopItemCategoryInfo[item.category];
  const itemImage = getShopItemImage(item.id);

  return (
    <TouchableOpacity style={styles.itemCard} onPress={onPress}>
      {item.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}
      <View style={[styles.itemIcon, { backgroundColor: categoryInfo.color + '20' }]}>
        {itemImage ? (
          <Image source={itemImage} style={styles.itemImage} resizeMode="contain" />
        ) : (
          <Ionicons name={categoryInfo.icon} size={24} color={categoryInfo.color} />
        )}
      </View>
      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
      {isOwned ? (
        <View style={styles.ownedBadgeSmall}>
          <Ionicons name="checkmark" size={12} color="#34C759" />
        </View>
      ) : (
        <View style={styles.priceRowSmall}>
          <Ionicons name="star" size={12} color="#FF9500" />
          <Text style={styles.priceTextSmall}>{item.price}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Item Detail Modal
function ItemDetailModal({ item, isOwned, userPoints, isPurchasing, onPurchase, onClose }) {
  if (!item) return null;

  const categoryInfo = ShopItemCategoryInfo[item.category];
  const canAfford = userPoints >= item.price;
  const itemImage = getShopItemImage(item.id);

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
          {/* Item Preview */}
          <View style={[styles.previewContainer, { backgroundColor: categoryInfo.color + '15' }]}>
            {itemImage ? (
              <Image source={itemImage} style={styles.previewImage} resizeMode="contain" />
            ) : (
              <View style={[styles.previewIcon, { backgroundColor: categoryInfo.color + '30' }]}>
                <Ionicons name={categoryInfo.icon} size={60} color={categoryInfo.color} />
              </View>
            )}
          </View>

          {/* Item Info */}
          <Text style={styles.itemDetailName}>{item.name}</Text>

          <View style={styles.badgesRow}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '20' }]}>
              <Ionicons name={categoryInfo.icon} size={14} color={categoryInfo.color} />
              <Text style={[styles.categoryBadgeText, { color: categoryInfo.color }]}>
                {categoryInfo.displayName}
              </Text>
            </View>
          </View>

          <Text style={styles.itemDescription}>{item.description}</Text>

          {/* Price Section */}
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

        {/* Purchase Button */}
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
  content: {
    paddingBottom: 32,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(255,149,0,0.1)',
  },
  pointsText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9500',
  },
  welcomeCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  collectionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  collectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(0,122,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  collectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  collectionSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 6,
  },
  horizontalScroll: {
    paddingRight: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryDesc: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  categoryCount: {
    alignItems: 'center',
    marginRight: 8,
  },
  categoryCountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryCountLabel: {
    fontSize: 11,
    color: '#8E8E93',
  },
  // Featured Card
  featuredCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    alignItems: 'center',
  },
  featuredIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featuredImage: {
    width: 70,
    height: 70,
  },
  featuredName: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
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
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  // Item Card
  itemCard: {
    width: 120,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  itemIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImage: {
    width: 50,
    height: 50,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  ownedBadgeSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceTextSmall: {
    marginLeft: 3,
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9500',
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
  previewImage: {
    width: 150,
    height: 150,
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
    gap: 4,
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
