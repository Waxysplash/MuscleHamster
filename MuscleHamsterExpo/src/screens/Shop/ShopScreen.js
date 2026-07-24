/**
 * ShopScreen.js
 * Simplified shop - just a list of wearable items
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ShopService } from '../../services/ShopService';
import Logger from '../../services/LoggerService';
import { StatIcons } from '../../config/AssetImages';
import { useActivity } from '../../context/ActivityContext';
import { playSFX } from '../../services/AudioService';
import { SoundEffect } from '../../models/AudioPreferences';
import { logShopPurchase } from '../../services/AnalyticsService';
import { useAlert } from '../../context/AlertContext';
import { getShopItemImage } from '../../config/AssetImages';
import LoadingView from '../../components/LoadingView';
import ErrorBanner from '../../components/ErrorBanner';
import { useResponsive } from '../../utils/responsive';

export default function ShopScreen({ navigation }) {
  const { totalPoints, recordShopPurchase } = useActivity();
  const { showAlert } = useAlert();
  const { isTablet, contentMaxWidth } = useResponsive();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [ownedItemIds, setOwnedItemIds] = useState(new Set());
  const [isPurchasing, setIsPurchasing] = useState(null); // Track which item is being purchased

  useFocusEffect(
    useCallback(() => {
      loadShopData();
    }, [])
  );

  const loadShopData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [allItems, inventory] = await Promise.all([
        ShopService.getAllItems(),
        ShopService.getInventory(),
      ]);

      setItems(allItems);
      setOwnedItemIds(new Set((inventory?.ownedItems || []).map((o) => o.itemId)));
    } catch (e) {
      Logger.error('Failed to load shop:', e);
      setError('Could not load the shop. Pull down to try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadShopData();
    setRefreshing(false);
  };

  const handlePurchase = async (item) => {
    if (isPurchasing) return;

    const canAfford = totalPoints >= item.price;
    if (!canAfford) {
      showAlert(
        'Not Enough Points',
        `You need ${item.price - totalPoints} more points to buy this item.`
      );
      return;
    }

    setIsPurchasing(item.id);
    try {
      const result = await ShopService.purchaseItem(item.id, totalPoints);

      if (result.success) {
        playSFX(SoundEffect.PURCHASE);
        logShopPurchase({ itemId: item.id, category: item.category, price: item.price });
        await recordShopPurchase(item.id, item.name, result.pointsSpent);
        setOwnedItemIds((prev) => new Set([...prev, item.id]));

        showAlert(
          '🎉 Success!',
          `You got the ${item.name}!`,
          [{ text: 'Awesome!' }]
        );
      } else {
        showAlert('Oops!', result.message);
      }
    } catch (e) {
      showAlert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsPurchasing(null);
    }
  };

  if (isLoading) {
    return <LoadingView message="Opening the shop..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Points Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop</Text>
        <View style={styles.pointsBadge}>
          <Image source={StatIcons.points} style={{ width: 18, height: 18 }} resizeMode="contain" />
          <Text style={styles.pointsText}>{totalPoints}</Text>
        </View>
      </View>

      {error && (
        <ErrorBanner
          message={error}
          onRetry={loadShopData}
          onDismiss={() => setError(null)}
        />
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.content,
          isTablet && { alignItems: 'center' }
        ]}
        style={isTablet ? { width: '100%' } : undefined}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isOwned = ownedItemIds.has(item.id);
          const itemImage = getShopItemImage(item.id);
          const canAfford = totalPoints >= item.price;

          return (
            <View style={[
              styles.itemCard,
              isTablet && { maxWidth: contentMaxWidth, width: '100%' }
            ]}>
              {/* Item Image */}
              <View style={styles.itemImageContainer}>
                {itemImage ? (
                  <Image source={itemImage} style={styles.itemImage} resizeMode="contain" />
                ) : (
                  <Ionicons name="shirt" size={40} color="#6B5D52" />
                )}
              </View>

              {/* Item Info */}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>

              {/* Price / Owned / Buy Button */}
              <View style={styles.itemAction}>
                {isOwned ? (
                  <View style={styles.ownedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                    <Text style={styles.ownedText}>Owned</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.buyButton,
                      !canAfford && styles.buyButtonDisabled,
                    ]}
                    onPress={() => handlePurchase(item)}
                    disabled={isPurchasing === item.id || !canAfford}
                  >
                    {isPurchasing === item.id ? (
                      <Text style={styles.buyButtonText}>...</Text>
                    ) : (
                      <>
                        <Ionicons name="star" size={14} color="#fff" />
                        <Text style={styles.buyButtonText}>{item.price}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={48} color="#C4B8AE" />
            <Text style={styles.emptyTitle}>Shop is empty</Text>
            <Text style={styles.emptySubtitle}>Check back soon for new items!</Text>
          </View>
        }
        ListFooterComponent={
          items.length > 0 ? (
            <TouchableOpacity
              style={[
                styles.inventoryLink,
                isTablet && { maxWidth: contentMaxWidth, width: '100%' }
              ]}
              onPress={() => navigation.navigate('Inventory')}
            >
              <Ionicons name="grid" size={20} color="#FF9500" />
              <Text style={styles.inventoryLinkText}>View My Items</Text>
              <Ionicons name="chevron-forward" size={16} color="#FF9500" />
            </TouchableOpacity>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF8F0',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139,90,43,0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4A3728',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF9500',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: 50,
    height: 50,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A3728',
  },
  itemDescription: {
    fontSize: 13,
    color: '#6B5D52',
    marginTop: 2,
  },
  itemAction: {
    marginLeft: 10,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  buyButtonDisabled: {
    backgroundColor: '#C4B8AE',
  },
  buyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  ownedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ownedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34C759',
  },
  inventoryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    gap: 8,
  },
  inventoryLinkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5A2B',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A3728',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B5D52',
    marginTop: 8,
    textAlign: 'center',
  },
});
