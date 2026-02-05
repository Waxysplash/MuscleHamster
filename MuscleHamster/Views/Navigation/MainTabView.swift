//
//  MainTabView.swift
//  MuscleHamster
//
//  Primary tab bar navigation for the app
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

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label(Tab.home.rawValue, systemImage: Tab.home.icon)
                }
                .tag(Tab.home)
                .accessibilityLabel(Tab.home.accessibilityLabel)

            WorkoutsView()
                .tabItem {
                    Label(Tab.workouts.rawValue, systemImage: Tab.workouts.icon)
                }
                .tag(Tab.workouts)
                .accessibilityLabel(Tab.workouts.accessibilityLabel)

            ShopView()
                .tabItem {
                    Label(Tab.shop.rawValue, systemImage: Tab.shop.icon)
                }
                .tag(Tab.shop)
                .accessibilityLabel(Tab.shop.accessibilityLabel)

            SocialView()
                .tabItem {
                    Label(Tab.social.rawValue, systemImage: Tab.social.icon)
                }
                .tag(Tab.social)
                .accessibilityLabel(Tab.social.accessibilityLabel)
        }
        .tint(.accentColor)
    }
}

#Preview {
    MainTabView()
}
