//
//  MuscleHamsterApp.swift
//  MuscleHamster
//
//  Muscle Hamster - Self-care fitness app with a nurturing virtual pet loop
//  Phase 08.3: Added notification tap routing support
//

import SwiftUI

@main
struct MuscleHamsterApp: App {
    @StateObject private var authViewModel = AuthViewModel()
    @ObservedObject private var routingState = AppRoutingState.shared

    // Initialize NotificationManager to set up delegate
    private let notificationManager = NotificationManager.shared

    var body: some Scene {
        WindowGroup {
            rootView
                .environmentObject(authViewModel)
                .environmentObject(routingState)
                .task {
                    await authViewModel.checkAuthStatus()
                }
                .onChange(of: authViewModel.currentUser?.id) { userId in
                    // Store current user ID for notification handler
                    if let userId = userId {
                        UserDefaults.standard.set(userId, forKey: "currentUserId")
                    } else {
                        UserDefaults.standard.removeObject(forKey: "currentUserId")
                    }
                }
        }
    }

    @ViewBuilder
    private var rootView: some View {
        switch authViewModel.authState {
        case .unknown:
            LoadingView(message: "Waking up your hamster...")
        case .unauthenticated:
            // Clear any pending notification context if user is logged out
            WelcomeView()
                .onAppear {
                    routingState.clearAll()
                }
        case .authenticated:
            if authViewModel.currentUser?.profileComplete == true {
                MainTabView()
            } else {
                // Clear notification context during onboarding
                OnboardingContainerView()
                    .onAppear {
                        routingState.clearAll()
                    }
            }
        }
    }
}
