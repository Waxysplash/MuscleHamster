// Hamster tab - the pet's own place: see your hamster, shop for items, dress it up.
// Phase 2 redesign: Shop and Customize used to be two buttons at the bottom of Home.
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  Image,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useActivity } from '../../context/ActivityContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { useInventory } from '../../context/InventoryContext';
import { HamsterStateInfo, getSimplifiedState } from '../../models/Activity';
import HamsterPortrait from '../../components/HamsterPortrait';
import { EnclosureBackground, StatIcons } from '../../config/AssetImages';
import { getHamsterSize } from '../../utils/responsive';
import { StoryCard, StoryIcon } from '../../components/ui/Story';
import { Colors, Fonts, Outline, T } from '../../config/theme';

export default function HamsterScreen({ navigation }) {
  const { hamsterState, totalPoints, hasLoggedRestDayToday } = useActivity();
  const { profile } = useUserProfile();
  const { equippedOutfit, equippedAccessory, loadInventory } = useInventory();

  useFocusEffect(
    useCallback(() => {
      loadInventory();
    }, [loadInventory])
  );

  const displayState = getSimplifiedState(hamsterState);
  const hamsterInfo = HamsterStateInfo[displayState] || HamsterStateInfo.happy;
  const hamsterName = profile?.hamsterName || 'Your Hamster';

  return (
    <View style={styles.container}>
      <ImageBackground source={EnclosureBackground} style={styles.enclosure} resizeMode="cover">
        <SafeAreaView style={styles.enclosureInner}>
          <View style={styles.topRow}>
            <View style={styles.badge}>
              <Ionicons name={hamsterInfo.icon} size={14} color={Colors.ink} />
              <Text style={styles.badgeText}>{hamsterInfo.displayName}</Text>
            </View>
            <View style={styles.badge} accessibilityLabel={`${totalPoints} points`}>
              <Image source={StatIcons.points} style={{ width: 18, height: 18 }} resizeMode="contain" />
              <Text style={styles.pointsText}>{totalPoints}</Text>
            </View>
          </View>
          <HamsterPortrait
            state={displayState}
            size={getHamsterSize()}
            equippedOutfit={equippedOutfit}
            equippedAccessory={equippedAccessory}
            isRestDay={hasLoggedRestDayToday}
          />
          <View style={styles.nameBadge}>
            <Text style={styles.name}>{hamsterName}</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.content}>
        <StoryCard color={Colors.peach} containerStyle={{ marginBottom: 14 }} padded={false}>
          <Pressable
            style={styles.tile}
            onPress={() => navigation.navigate('Shop')}
            accessibilityRole="button"
            accessibilityLabel="Shop. Spend your points on outfits and items"
          >
            <StoryIcon name="bag" size={56} color={Colors.surface} />
            <View style={styles.tileText}>
              <Text style={T.title}>Shop</Text>
              <Text style={[T.small, { color: Colors.text }]}>Spend your points on outfits and treats</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.ink} />
          </Pressable>
        </StoryCard>

        <StoryCard color={Colors.mint} containerStyle={{ marginBottom: 14 }} padded={false}>
          <Pressable
            style={styles.tile}
            onPress={() => navigation.navigate('Inventory')}
            accessibilityRole="button"
            accessibilityLabel={`Dress up ${hamsterName}. Choose what your hamster wears`}
          >
            <StoryIcon name="shirt" size={56} color={Colors.surface} />
            <View style={styles.tileText}>
              <Text style={T.title}>Dress up {hamsterName}</Text>
              <Text style={[T.small, { color: Colors.text }]}>Choose outfits and accessories you own</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.ink} />
          </Pressable>
        </StoryCard>

        <Text style={styles.hint}>
          Every workout, daily exercise and walk earns points for {hamsterName}.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  enclosure: { width: '100%', borderBottomWidth: Outline.width, borderColor: Colors.ink },
  enclosureInner: { alignItems: 'center', paddingBottom: 16 },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.ink },
  pointsText: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.ink },
  nameBadge: {
    backgroundColor: Colors.surface,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  name: { fontFamily: Fonts.heading, fontSize: 20, color: Colors.ink },
  content: { padding: 18 },
  tile: { flexDirection: 'row', alignItems: 'center', padding: 16, minHeight: 88 },
  tileText: { flex: 1, marginLeft: 14 },
  hint: { fontFamily: Fonts.body, fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginTop: 8 },
});
