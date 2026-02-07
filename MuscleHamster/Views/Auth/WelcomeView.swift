//
//  WelcomeView.swift
//  MuscleHamster
//
//  Entry point for unauthenticated users - sign up or sign in options
//  Includes age gate flow for new account creation (13+ requirement)
//

import SwiftUI

struct WelcomeView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel

    // Persists age confirmation across app launches
    // Once confirmed, user won't see age gate again until storage is cleared
    @AppStorage("hasConfirmedAge") private var hasConfirmedAge = false

    @State private var showAgeGate = false
    @State private var showSignUp = false
    @State private var showSignIn = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Spacer()

                // Hero section
                VStack(spacing: 24) {
                    // Placeholder for hamster illustration
                    Image(systemName: "figure.run.circle.fill")
                        .font(.system(size: 100))
                        .foregroundStyle(.accentColor)
                        .accessibilityHidden(true)

                    VStack(spacing: 12) {
                        Text("Ready to get moving?")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .multilineTextAlignment(.center)

                        Text("Your new workout buddy is excited to meet you!")
                            .font(.body)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                    }
                }
                .accessibilityElement(children: .combine)
                .accessibilityLabel("Ready to get moving? Your new workout buddy is excited to meet you!")

                Spacer()

                // Action buttons
                VStack(spacing: 16) {
                    Button {
                        handleGetStarted()
                    } label: {
                        Text("Let's Get Started")
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Color.accentColor)
                            .foregroundStyle(.white)
                            .cornerRadius(14)
                    }
                    .accessibilityLabel("Let's Get Started")
                    .accessibilityHint("Creates a new account")

                    Button {
                        showSignIn = true
                    } label: {
                        Text("Already have an account? Welcome back!")
                            .font(.subheadline)
                            .foregroundStyle(.accentColor)
                    }
                    .accessibilityLabel("Already have an account? Welcome back!")
                    .accessibilityHint("Signs in to existing account")
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 48)
            }
            .navigationDestination(isPresented: $showAgeGate) {
                AgeGateView(hasConfirmedAge: $hasConfirmedAge)
            }
            .navigationDestination(isPresented: $showSignUp) {
                SignUpView()
            }
            .navigationDestination(isPresented: $showSignIn) {
                SignInView()
            }
            // When age is confirmed via AgeGateView, automatically proceed to SignUp
            .onChange(of: hasConfirmedAge) { newValue in
                if newValue && showAgeGate {
                    // Dismiss age gate and show sign up
                    showAgeGate = false
                    // Small delay to allow navigation stack to settle
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        showSignUp = true
                    }
                }
            }
        }
    }

    // MARK: - Actions

    /// Routes to sign-up flow, going through age gate if not already confirmed
    private func handleGetStarted() {
        if hasConfirmedAge {
            // User has previously confirmed age, go directly to sign up
            showSignUp = true
        } else {
            // Show age gate first
            showAgeGate = true
        }
    }
}

#Preview {
    WelcomeView()
        .environmentObject(AuthViewModel())
}
