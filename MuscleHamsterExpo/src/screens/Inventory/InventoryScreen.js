// Inventory Screen - Simplified
// Shows owned items and lets you equip one at a time

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ShopService } from '../../services/ShopService';
import { getShopItemImage } from '../../config/AssetImages';
import HamsterPortrait from '../../components/HamsterPortrait';
import LoadingView from '../../components/LoadingView';
import ErrorBanner from '../../components/ErrorBanner';

export default function InventoryScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [ownedItems, setOwnedItems] = useState([]);
  const [equippedItemId, setEquippedItemId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadInventory();
    }, [])
  );

  const loadInventory = async () => {
    setError(null);
    try {
      const [inventory, allItems] = await Promise.all([
        ShopService.getInventory(),
        ShopService.getAllItems(),
      ]);

      // Get owned item details
      const owned = inventory.ownedItems
        .map((o) => allItems.find((item) => item.id === o.itemId))
        .filter(Boolean);

      setOwnedItems(owned);

      // Get currently equipped item (outfit or accessory - only one at a time)
      const equipped = inventory.equippedOutfit || inventory.equippedAccessory || null;
      setEquippedItemId(equipped);
    } catch (e) {
      console.error('Failed to load inventory:', e);
      setError('Could not load your items. Pull down to try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await loadInventory();
    } catch (e) {
      setError('Could not refresh. Pull down to try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleEquip = async (itemId) => {
    try {
      // If tapping the currently equipped item, unequip it
      if (equippedItemId === itemId) {
        await ShopService.unequipAll();
        setEquippedItemId(null);
      } else {
        // Equip the new item (this unequips any current item)
        await ShopService.equipItem(itemId);
        setEquippedItemId(itemId);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update outfit');
    }
  };

  if (isLoading) {
    return <LoadingView message="Opening your wardrobe..." />;
  }

  const equippedItem = ownedItems.find((item) => item.id === equippedItemId);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Items</Text>
      </View>

      {error && (
        <ErrorBanner
          message={error}
          onRetry={loadInventory}
          onDismiss={() => setError(null)}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hamster Preview */}
        <View style={styles.previewSection}>
          <View style={styles.previewCard}>
            <HamsterPortrait
              state="happy"
              size={140}
              equippedOutfit={equippedItemId?.startsWith('outfit') ? equippedItemId : null}
              equippedAccessory={equippedItemId?.startsWith('acc') ? equippedItemId : null}
            />
            {equippedItem ? (
              <View style={styles.equippedLabel}>
                <Ionicons name="checkmark-circle" size={14} color="#34C759" />
                <Text style={styles.equippedLabelText}>Wearing: {equippedItem.name}</Text>
              </View>
            ) : (
              <Text style={styles.noEquippedText}>No item equipped</Text>
            )}
          </View>
        </View>

        {/* Owned Items */}
        {ownedItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="shirt-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>No items yet</Text>
            <Text style={styles.emptySubtitle}>Visit the shop to buy items for your hamster!</Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate('Shop')}
            >
              <Ionicons name="bag" size={18} color="#fff" />
              <Text style={styles.shopButtonText}>Go to Shop</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>Your Items ({ownedItems.length})</Text>

            {ownedItems.map((item) => {
              const isEquipped = equippedItemId === item.id;
              const itemImage = getShopItemImage(item.id);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.itemCard, isEquipped && styles.itemCardEquipped]}
                  onPress={() => handleEquip(item.id)}
                >
                  {/* Item Image */}
                  <View style={styles.itemImageContainer}>
                    {itemImage ? (
                      <Image source={itemImage} style={styles.itemImage} resizeMode="contain" />
                    ) : (
                      <Ionicons name="shirt" size={32} color="#6B5D52" />
                    )}
                  </View>

                  {/* Item Info */}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  </View>

                  {/* Equip Status */}
                  <View style={styles.equipStatus}>
                    {isEquipped ? (
                      <View style={styles.equippedBadge}>
                        <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                      </View>
                    ) : (
                      <View style={styles.equipButton}>
                        <Text style={styles.equipButtonText}>Wear</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Unequip Button */}
            {equippedItemId && (
              <TouchableOpacity
                style={styles.unequipButton}
                onPress={() => handleEquip(equippedItemId)}
              >
                <Ionicons name="close-circle-outline" size={18} color="#FF3B30" />
                <Text style={styles.unequipButtonText}>Remove current item</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  previewSection: {
    marginBottom: 20,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  equippedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  equippedLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  noEquippedText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B5D52',
  },
  itemsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
    color: '#4A3728',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemCardEquipped: {
    borderColor: '#34C759',
    backgroundColor: 'rgba(52, 199, 89, 0.05)',
  },
  itemImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: 46,
    height: 46,
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
  equipStatus: {
    marginLeft: 10,
  },
  equippedBadge: {
    padding: 4,
  },
  equipButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  equipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  unequipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 14,
    gap: 6,
  },
  unequipButtonText: {
    fontSize: 15,
    color: '#FF3B30',
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
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
    gap: 8,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
