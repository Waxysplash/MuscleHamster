import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Image
            source={require('../../../assets/images/hamster_icon.png')}
            style={styles.hamsterLogo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Ready to get moving?</Text>
          <Text style={styles.subtitle}>
            Your new workout buddy is excited to meet you!
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('SignUp')}
            accessibilityLabel="Let's Get Started"
            accessibilityHint="Creates a new account"
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Let's Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('SignIn')}
            accessibilityLabel="Already have an account? Welcome back!"
            accessibilityHint="Signs in to existing account"
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>
              Already have an account? Welcome back!
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hamsterLogo: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 24,
    color: '#4A3728',
  },
  subtitle: {
    fontSize: 17,
    color: '#6B5D52',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 32,
  },
  actions: {
    paddingBottom: 48,
  },
  primaryButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: '#8B5A2B',
    fontSize: 15,
  },
});
