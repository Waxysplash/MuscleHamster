// Inventory Item Preview Screen - Phase 07.3
// Preview and equip/place items from inventory

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ShopService } from '../../services/ShopService';
import Logger from '../../services/LoggerService';
import { ShopItemCategory, ShopItemCategoryInfo, ShopItemRarityInfo } from '../../models/ShopItem';
import LoadingView from '../../components/LoadingView';

export default function InventoryItemPreviewScreen({ route, navigation }) {
  const { item, category } = route.params;
  const categoryInfo = ShopItemCategoryInfo[category];
  const rarityInfo = ShopItemRarityInfo[item.rarity];
  const categoryColor = categoryInfo?.color || '#8E8E93';

  const [isLoading, setIsLoading] = useState(false);
  const [isInUse, setIsInUse] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [hamsterReaction, setHamsterReaction] = useState('');

  // Animation
  const successScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    checkItemStatus();
  }, []);

  useEffect(() => {
    if (showSuccess) {
      Animated.spring(successScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      successScale.setValue(0.5);
    }
  }, [showSuccess]);

  const checkItemStatus = async () => {
    try {
      const inventory = await ShopService.getInventory();
      switch (category) {
        case ShopItemCategory.OUTFITS:
          setIsInUse(inventory.equippedOutfit === item.id);
          break;
        case ShopItemCategory.ACCESSORIES:
          setIsInUse(inventory.equippedAccessory === item.id);
          break;
        case ShopItemCategory.ENCLOSURE:
          setIsInUse(inventory.placedEnclosureItems?.includes(item.id));
          break;
      }
    } catch (error) {
      Logger.warn('Error checking item status:', error);
    }
  };

  const performAction = async () => {
    setIsLoading(true);

    try {
      let result;

      if (isInUse) {
        // Remove/unequip
        switch (category) {
          case ShopItemCategory.OUTFITS:
            // For outfits, we equip null to unequip
            result = { success: true };
            // We need to manually update since there's no unequip function
            const inv = await ShopService.getInventory();
            inv.equippedOutfit = null;
            break;
          case ShopItemCategory.ACCESSORIES:
            result = { success: true };
            break;
          case ShopItemCategory.ENCLOSURE:
            result = await ShopService.removeEnclosureItem(item.id);
            break;
          default:
            result = { success: false };
        }

        if (result.success) {
          setResultMessage(`${item.name} removed!`);
          setHamsterReaction("Okay, I'll try something else!");
          setIsInUse(false);
          setShowSuccess(true);
        }
      } else {
        // Equip/place
        switch (category) {
          case ShopItemCategory.OUTFITS:
            result = await ShopService.equipOutfit(item.id);
            break;
          case ShopItemCategory.ACCESSORIES:
            result = await ShopService.equipAccessory(item.id);
            break;
          case ShopItemCategory.ENCLOSURE:
            result = await ShopService.placeEnclosureItem(item.id);
            break;
          default:
            result = { success: false };
        }

        if (result.success) {
          setResultMessage(getSuccessMessage());
          setHamsterReaction(getHamsterReaction());
          setIsInUse(true);
          setShowSuccess(true);
        }
      }
    } catch (error) {
      Logger.warn('Error performing action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuccessMessage = () => {
    switch (category) {
      case ShopItemCategory.OUTFITS:
        return `Now wearing ${item.name}!`;
      case ShopItemCategory.ACCESSORIES:
        return `${item.name} equipped!`;
      case ShopItemCategory.ENCLOSURE:
        return `${item.name} placed in home!`;
      default:
        return 'Done!';
    }
  };

  const getHamsterReaction = () => {
    const reactions = {
      [ShopItemCategory.OUTFITS]: [
        "Look at me! I feel so fancy!",
        "This is my new favorite outfit!",
        "*strikes a pose* How do I look?",
      ],
      [ShopItemCategory.ACCESSORIES]: [
        "Ooh, I love this accessory!",
        "Now I'm extra stylish!",
        "This completes my look!",
      ],
      [ShopItemCategory.ENCLOSURE]: [
        "My home is getting cozier!",
        "I love my new decoration!",
        "This makes me so happy!",
      ],
    };

    const categoryReactions = reactions[category] || ["I love it!"];
    return categoryReactions[Math.floor(Math.random() * categoryReactions.length)];
  };

  const getActionButtonText = () => {
    if (isInUse) {
      switch (category) {
        case ShopItemCategory.OUTFITS:
        case ShopItemCategory.ACCESSORIES:
          return 'Remove';
        case ShopItemCategory.ENCLOSURE:
          return 'Remove from Home';
        default:
          return 'Remove';
      }
    } else {
      switch (category) {
        case ShopItemCategory.OUTFITS:
          return 'Wear This Outfit';
        case ShopItemCategory.ACCESSORIES:
          return 'Wear This Accessory';
        case ShopItemCategory.ENCLOSURE:
          return 'Place in Home';
        default:
          return 'Use';
      }
    }
  };

  const getActionIcon = () => {
    if (isInUse) {
      return 'close-circle';
    }
    switch (category) {
      case ShopItemCategory.OUTFITS:
        return 'shirt';
      case ShopItemCategory.ACCESSORIES:
        return 'sparkles';
      case ShopItemCategory.ENCLOSURE:
        return 'home';
      default:
        return 'checkmark-circle';
    }
  };

  const getHintText = () => {
    if (isInUse) {
      switch (category) {
        case ShopItemCategory.OUTFITS:
        case ShopItemCategory.ACCESSORIES:
          return 'This will remove the item from your hamster.';
        case ShopItemCategory.ENCLOSURE:
          return 'This will remove the item from display.';
        default:
          return 'This will remove the item.';
      }
    } else {
      switch (category) {
        case ShopItemCategory.OUTFITS:
          return 'This will replace any currently equipped outfit.';
        case ShopItemCategory.ACCESSORIES:
          return 'This will replace any currently equipped accessory.';
        case ShopItemCategory.ENCLOSURE:
          return "You can place multiple items in your hamster's home.";
        default:
          return 'Use this item.';
      }
    }
  };

  const getGradientColors = () => {
    switch (category) {
      case ShopItemCategory.OUTFITS:
        return ['rgba(175,82,222,0.7)', 'rgba(255,45,85,0.6)'];
      case ShopItemCategory.ACCESSORIES:
        return ['rgba(255,45,85,0.7)', 'rgba(255,149,0,0.5)'];
      case ShopItemCategory.ENCLOSURE:
        return ['rgba(255,149,0,0.7)', 'rgba(255,204,0,0.5)'];
      default:
        return ['rgba(0,122,255,0.7)', 'rgba(90,200,250,0.5)'];
    }
  };

  const handleDismissSuccess = () => {
    setShowSuccess(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Item Preview */}
        <View style={styles.previewSection}>
          <LinearGradient colors={getGradientColors()} style={styles.previewContainer}>
            {/* Hamster with item */}
            <View style={styles.hamsterPreview}>
              <View style={styles.hamsterCircle}>
                <Ionicons name="paw" size={60} color="rgba(255,255,255,0.9)" />
              </View>
            </View>

            {/* In-use badge */}
            {isInUse && (
              <View style={styles.inUseBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#fff" />
                <Text style={styles.inUseBadgeText}>
                  {category === ShopItemCategory.ENCLOSURE ? 'Placed' : 'Equipped'}
                </Text>
              </View>
            )}

            {/* Rarity badge */}
            <View style={styles.rarityBadge}>
              <Ionicons name={rarityInfo?.badgeIcon} size={12} color={rarityInfo?.color} />
              <Text style={[styles.rarityBadgeText, { color: rarityInfo?.color }]}>
                {rarityInfo?.displayName}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Item Info */}
        <View style={styles.infoSection}>
          <Text style={styles.itemName}>{item.name}</Text>

          <View style={styles.categoryLabel}>
            <Ionicons name={categoryInfo?.icon} size={16} color={categoryColor} />
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {categoryInfo?.displayName}
            </Text>
            {item.isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>

          <Text style={styles.description}>{item.description}</Text>
        </View>

        {/* Action Section */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isInUse ? '#8E8E93' : categoryColor },
            ]}
            onPress={performAction}
            disabled={isLoading}
            accessibilityLabel={getActionButtonText()}
            accessibilityHint={isInUse ? 'Remove this item' : 'Use this item'}
          >
            {isLoading ? (
              <Text style={styles.actionButtonText}>
                {isInUse ? 'Removing...' : 'Setting up...'}
              </Text>
            ) : (
              <>
                <Ionicons name={getActionIcon()} size={20} color="#fff" />
                <Text style={styles.actionButtonText}>{getActionButtonText()}</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.hintText}>{getHintText()}</Text>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <Animated.View
            style={[styles.successContent, { transform: [{ scale: successScale }] }]}
          >
            {/* Success icon */}
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={50} color="#34C759" />
            </View>

            {/* Message */}
            <Text style={styles.successMessage}>{resultMessage}</Text>

            {/* Hamster reaction */}
            <View style={styles.reactionContainer}>
              <View style={styles.reactionHamster}>
                <Ionicons name="paw" size={30} color="#FF9500" />
              </View>
              <Text style={styles.reactionText}>"{hamsterReaction}"</Text>
            </View>

            {/* Done button */}
            <TouchableOpacity style={styles.doneButton} onPress={handleDismissSuccess}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <Text style={styles.loadingText}>
              {isInUse ? 'Removing...' : 'Setting up...'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  previewSection: {
    padding: 16,
  },
  previewContainer: {
    height: 240,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  hamsterPreview: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamsterCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inUseBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  inUseBadgeText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  rarityBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rarityBadgeText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  itemName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A3728',
  },
  categoryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  newBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  description: {
    fontSize: 16,
    color: '#6B5D52',
    marginTop: 12,
    lineHeight: 24,
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  hintText: {
    fontSize: 14,
    color: '#6B5D52',
    textAlign: 'center',
    marginTop: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B5D52',
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  successContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(52,199,89,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#4A3728',
    marginBottom: 20,
  },
  reactionContainer: {
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  reactionHamster: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE0B2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  reactionText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#6B5D52',
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});
