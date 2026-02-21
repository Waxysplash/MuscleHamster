//
//  MainTabView.swift
//  MuscleHamster
//
//  Primary tab bar navigation for the app
//  Phase 08.3: Added notification tap routing support
//  Simplified MVP: Conditional tab bar based on FeatureFlags
//

import SwiftUI

enum Tab: String, CaseIterable {
    case home = "Home"
    case workouts = "Workouts"
    case shop = "Shop"
    case social = "Social"

    var icon: String {
        switch self {
        case .home: return "house.fill"
        case .workouts: return "figure.run"
        case .shop: return "bag.fill"
        case .social: return "person.2.fill"
        }
    }

    var accessibilityLabel: String {
        switch self {
        case .home: return "Home tab - View your hamster"
        case .workouts: return "Workouts tab - Browse and start workouts"
        case .shop: return "Shop tab - Buy items for your hamster"
        case .social: return "Social tab - Connect with friends"
        }
    }
}

struct MainTabView: View {
    @State private var selectedTab: Tab = .home
    @ObservedObject private var routingState = AppRoutingState.shared

    var body: some View {
        // Simplified MVP: No tab bar, just HomeView as hub
        if !FeatureFlags.tabBarNavigation {
            HomeView()
                .onChange(of: routingState.shouldNavigateToHome) { shouldNavigate in
                    if shouldNavigate {
                        routingState.clearPendingDestination()
                    }
                }
        } else {
            // Full tab bar navigation
            tabBarView
        }
    }

    private var tabBarView: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label(Tab.home.rawValue, systemImage: Tab.home.icon)
                }
                .tag(Tab.home)
                .accessibilityLabel(Tab.home.accessibilityLabel)

            // Workouts tab - only if workout library enabled
            if FeatureFlags.workoutLibrary {
                WorkoutsView()
                    .tabItem {
                        Label(Tab.workouts.rawValue, systemImage: Tab.workouts.icon)
                    }
                    .tag(Tab.workouts)
                    .accessibilityLabel(Tab.workouts.accessibilityLabel)
            }

            ShopView()
                .tabItem {
                    Label(Tab.shop.rawValue, systemImage: Tab.shop.icon)
                }
                .tag(Tab.shop)
                .accessibilityLabel(Tab.shop.accessibilityLabel)

            // Social tab - only if social features enabled
            if FeatureFlags.socialFeatures {
                SocialView()
                    .tabItem {
                        Label(Tab.social.rawValue, systemImage: Tab.social.icon)
                    }
                    .tag(Tab.social)
                    .accessibilityLabel(Tab.social.accessibilityLabel)
            }
        }
        .tint(.accentColor)
        .onChange(of: routingState.shouldNavigateToHome) { shouldNavigate in
            if shouldNavigate {
                // Switch to home tab when notification is tapped
                selectedTab = .home
                // Clear the navigation flag
                routingState.clearPendingDestination()
            }
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthViewModel())
}
