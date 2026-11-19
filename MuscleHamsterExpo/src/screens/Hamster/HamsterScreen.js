// Hamster tab - the pet's own place: see your hamster, shop for items, dress it up.
// Phase 2 redesign: Shop and Customize used to be two buttons at the bottom of Home.
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useActivity } from '../../context/ActivityContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { useInventory } from '../../context/InventoryContext';
import { HamsterStateInfo, getSimplifiedState } from '../../models/Activity';
import HamsterPortrait from '../../components/HamsterPortrait';
import { EnclosureBackground, StatIcons } from '../../config/AssetImages';
import { getHamsterSize } from '../../utils/responsive';

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
              <Ionicons name={hamsterInfo.icon} size={14} color={hamsterInfo.color} />
              <Text style={[styles.badgeText, { color: hamsterInfo.color }]}>{hamsterInfo.displayName}</Text>
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
        <TouchableOpacity
          style={styles.tile}
          onPress={() => navigation.navigate('Shop')}
          accessibilityRole="button"
          accessibilityLabel="Shop. Spend your points on outfits and items"
        >
          <View style={[styles.tileIcon, { backgroundColor: 'rgba(255,149,0,0.12)' }]}>
            <Ionicons name="bag" size={26} color="#FF9500" />
          </View>
          <View style={styles.tileText}>
            <Text style={styles.tileTitle}>Shop</Text>
            <Text style={styles.tileSubtitle}>Spend your points on outfits and treats</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#8B5A2B" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tile}
          onPress={() => navigation.navigate('Inventory')}
          accessibilityRole="button"
          accessibilityLabel={`Dress up ${hamsterName}. Choose what your hamster wears`}
        >
          <View style={[styles.tileIcon, { backgroundColor: 'rgba(139,90,43,0.12)' }]}>
            <Ionicons name="sparkles" size={26} color="#8B5A2B" />
          </View>
          <View style={styles.tileText}>
            <Text style={styles.tileTitle}>Dress up {hamsterName}</Text>
            <Text style={styles.tileSubtitle}>Choose outfits and accessories you own</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#8B5A2B" />
        </TouchableOpacity>

        <Text style={styles.hint}>
          Every workout, daily exercise and walk earns points for {hamsterName}.
        </Text>
      </ScrollView>
    </View>
  );
}

const shadow = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  android: { elevation: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  enclosure: { width: '100%' },
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
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: { fontSize: 14, fontWeight: '600' },
  pointsText: { fontSize: 16, fontWeight: '700', color: '#4A3728' },
  nameBadge: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  name: { fontSize: 18, fontWeight: '700', color: '#4A3728' },
  content: { padding: 16, gap: 12 },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    minHeight: 72,
    ...shadow,
  },
  tileIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: { flex: 1, marginLeft: 14 },
  tileTitle: { fontSize: 17, fontWeight: '700', color: '#4A3728' },
  tileSubtitle: { fontSize: 14, color: '#6B5D52', marginTop: 2 },
  hint: { fontSize: 14, color: '#6B5D52', textAlign: 'center', marginTop: 8 },
});
