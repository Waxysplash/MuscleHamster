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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { getShopItemImage, HamsterImages } from '../../config/AssetImages';
import { StoryCard, StoryButton, StoryChip } from '../../components/ui/Story';
import { Colors, Fonts, Outline, T } from '../../config/theme';
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
  const [section, setSection] = useState('outfits');

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
        'Almost there',
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
          "It's yours!",
          `You got the ${item.name}. Tap "Wear it" to dress up your hamster.`,
          [{ text: 'Yay' }]
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

  const sections = [
    { id: 'outfits', label: 'Outfits' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'enclosure', label: 'Home' },
  ].filter((s) => items.some((i) => i.category === s.id));
  const activeSection = sections.find((s) => s.id === section) ? section : sections[0]?.id;
  const visibleItems = items.filter((i) => !activeSection || i.category === activeSection);

  if (isLoading) {
    return <LoadingView message="Opening the shop..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={[styles.content, isTablet && { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.ink} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Points */}
            <View style={styles.pointsRow}>
              <Text style={T.small}>Your points</Text>
              <View style={styles.pointsBadge} accessibilityLabel={`${totalPoints} points`}>
                <Image source={StatIcons.points} style={{ width: 20, height: 20 }} resizeMode="contain" />
                <Text style={styles.pointsText}>{totalPoints}</Text>
              </View>
            </View>

            {/* Tip */}
            <StoryCard color={Colors.mint} shadow={false} containerStyle={{ marginBottom: 14 }}>
              <View style={styles.tipRow}>
                <Image source={HamsterImages.happy} style={{ width: 52, height: 52 }} resizeMode="contain" />
                <Text style={[T.body, { flex: 1 }]}>Every workout, walk and daily exercise earns points to spend here.</Text>
              </View>
            </StoryCard>

            {error && (
              <ErrorBanner message={error} onRetry={loadShopData} onDismiss={() => setError(null)} />
            )}

            {/* Sections */}
            {sections.length > 1 && (
              <View style={styles.chipRow} accessibilityRole="radiogroup">
                {sections.map((s) => (
                  <StoryChip
                    key={s.id}
                    label={s.label}
                    selected={s.id === activeSection}
                    onPress={() => setSection(s.id)}
                  />
                ))}
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const isOwned = ownedItemIds.has(item.id);
          const itemImage = getShopItemImage(item.id);
          const canAfford = totalPoints >= item.price;
          const busy = isPurchasing === item.id;
          return (
            <StoryCard containerStyle={styles.itemWrap} style={styles.itemCard}>
              <View style={styles.itemImageBox}>
                {itemImage ? (
                  <Image source={itemImage} style={styles.itemImage} resizeMode="contain" />
                ) : (
                  <Ionicons name="shirt" size={44} color={Colors.ink} />
                )}
              </View>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              {isOwned ? (
                <Text style={styles.owned}>Owned</Text>
              ) : (
                <View style={styles.priceRow} accessibilityLabel={`${item.price} points`}>
                  <Image source={StatIcons.points} style={{ width: 16, height: 16 }} resizeMode="contain" />
                  <Text style={styles.priceText}>{item.price}</Text>
                </View>
              )}
              {isOwned ? (
                <StoryButton
                  title="Wear it"
                  variant="secondary"
                  size="sm"
                  style={styles.itemButton}
                  accessibilityLabel={`Wear the ${item.name}`}
                  onPress={() => navigation.navigate('Inventory')}
                />
              ) : (
                <StoryButton
                  title={busy ? 'Buying...' : canAfford ? 'Buy' : `Need ${item.price - totalPoints}`}
                  variant={canAfford ? 'primary' : 'soft'}
                  size="sm"
                  style={styles.itemButton}
                  disabled={busy}
                  accessibilityLabel={canAfford ? `Buy the ${item.name} for ${item.price} points` : `${item.name}: you need ${item.price - totalPoints} more points`}
                  onPress={() => handlePurchase(item)}
                />
              )}
            </StoryCard>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={48} color={Colors.textSecondary} />
            <Text style={T.heading}>Nothing here yet</Text>
            <Text style={T.small}>New items are on the way.</Text>
          </View>
        }
        ListFooterComponent={
          items.length > 0 ? (
            <StoryButton
              title="See what I own"
              icon="shirt"
              variant="secondary"
              style={{ marginTop: 8 }}
              onPress={() => navigation.navigate('Inventory')}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 18, paddingBottom: 40 },
  pointsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.peach,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pointsText: { fontFamily: Fonts.bodyHeavy, fontSize: 17, color: Colors.ink },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  gridRow: { justifyContent: 'space-between' },
  itemWrap: { width: '47%', marginBottom: 16 },
  itemCard: { alignItems: 'center', padding: 12 },
  itemImageBox: { width: '100%', height: 100, alignItems: 'center', justifyContent: 'center' },
  itemImage: { width: 100, height: 100 },
  itemName: { fontFamily: Fonts.heading, fontSize: 16, color: Colors.ink, textAlign: 'center', marginTop: 6, minHeight: 40 },
  owned: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.success, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  priceText: { fontFamily: Fonts.bodyHeavy, fontSize: 15, color: Colors.ink },
  itemButton: { alignSelf: 'stretch', marginTop: 10 },
  emptyState: { alignItems: 'center', gap: 6, paddingVertical: 40 },
});
