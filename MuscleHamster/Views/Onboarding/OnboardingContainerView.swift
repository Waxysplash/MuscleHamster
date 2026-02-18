//
//  OnboardingContainerView.swift
//  MuscleHamster
//
//  Container view managing onboarding flow with progress indicator and navigation
//

import SwiftUI

struct OnboardingContainerView: View {
    @StateObject private var viewModel = OnboardingViewModel()
    @EnvironmentObject private var authViewModel: AuthViewModel

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Progress indicator
                progressBar
                    .padding(.horizontal, 24)
                    .padding(.top, 16)

                // Current step content
                stepContent
                    .frame(maxWidth: .infinity, maxHeight: .infinity)

                // Error message
                if let error = viewModel.error {
                    errorBanner(error)
                }

                // Navigation buttons
                navigationButtons
                    .padding(.horizontal, 24)
                    .padding(.bottom, 32)
            }
            .background(Color(.systemBackground))
            .navigationTitle(viewModel.currentStep.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    if viewModel.canGoBack {
                        Button {
                            viewModel.goBack()
                        } label: {
                            Image(systemName: "chevron.left")
                                .fontWeight(.semibold)
                        }
                        .accessibilityLabel("Go back")
                        .accessibilityHint("Return to the previous question")
                    }
                }
            }
            .alert("Exit Setup?", isPresented: $viewModel.showExitConfirmation) {
                Button("Continue Setup", role: .cancel) { }
                Button("Exit", role: .destructive) {
                    // Progress is already saved, just dismiss
                    Task {
                        await authViewModel.signOut()
                    }
                }
            } message: {
                Text("Your progress is saved. You can continue where you left off next time.")
            }
            .disabled(viewModel.isLoading)
            .overlay {
                if viewModel.isLoading {
                    loadingOverlay
                }
            }
        }
        .environmentObject(viewModel)
    }

    // MARK: - Progress Bar

    private var progressBar: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                // Background track
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color(.systemGray5))
                    .frame(height: 8)

                // Progress fill
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.accentColor)
                    .frame(width: geometry.size.width * viewModel.progressFraction, height: 8)
                    .animation(.easeInOut(duration: 0.3), value: viewModel.currentStep)
            }
        }
        .frame(height: 8)
        .accessibilityLabel("Progress: step \(viewModel.currentStep.rawValue + 1) of \(OnboardingStep.totalSteps)")
    }

    // MARK: - Step Content

    @ViewBuilder
    private var stepContent: some View {
        switch viewModel.currentStep {
        case .age:
            OnboardingAgeView()
        case .fitnessLevel:
            OnboardingFitnessLevelView()
        case .goals:
            OnboardingGoalsView()
        case .frequency:
            OnboardingFrequencyView()
        case .schedule:
            OnboardingScheduleView()
        case .time:
            OnboardingTimeView()
        case .intent:
            OnboardingIntentView()
        case .hamsterName:
            OnboardingHamsterNameView()
        case .meetHamster:
            OnboardingMeetHamsterView()
        }
    }

    // MARK: - Error Banner

    private func errorBanner(_ message: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.triangle.fill")
            Text(message)
        }
        .font(.subheadline)
        .foregroundStyle(.red)
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color.red.opacity(0.1))
        .cornerRadius(12)
        .padding(.horizontal, 24)
        .accessibilityLabel("Error: \(message)")
    }

    // MARK: - Navigation Buttons

    private var navigationButtons: some View {
        Button {
            if viewModel.isLastStep {
                completeOnboarding()
            } else {
                viewModel.goNext()
            }
        } label: {
            Text(buttonTitle)
                .fontWeight(.semibold)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(viewModel.canProceed ? Color.accentColor : Color.gray)
                .foregroundStyle(.white)
                .cornerRadius(14)
        }
        .disabled(!viewModel.canProceed)
        .accessibilityLabel(buttonAccessibilityLabel)
        .accessibilityHint(viewModel.canProceed ? "Double tap to proceed" : "Make a selection to enable")
    }

    private var buttonTitle: String {
        switch viewModel.currentStep {
        case .intent:
            return "Meet Your Hamster"
        case .hamsterName:
            return "Say Hello!"
        case .meetHamster:
            return "Let's Get Started!"
        default:
            return "Continue"
        }
    }

    private var buttonAccessibilityLabel: String {
        switch viewModel.currentStep {
        case .intent:
            return "Continue to name your hamster"
        case .hamsterName:
            return "Continue to meet your hamster"
        case .meetHamster:
            return "Complete setup and start using the app"
        default:
            return "Continue to next question"
        }
    }

    // MARK: - Loading Overlay

    private var loadingOverlay: some View {
        ZStack {
            Color.black.opacity(0.3)
                .ignoresSafeArea()

            VStack(spacing: 16) {
                ProgressView()
                    .scaleEffect(1.5)
                    .tint(.white)
                Text(loadingMessage)
                    .font(.headline)
                    .foregroundStyle(.white)
            }
            .padding(32)
            .background(Color(.systemBackground).opacity(0.9))
            .cornerRadius(16)
        }
        .accessibilityLabel(loadingMessage)
    }

    private var loadingMessage: String {
        if let name = viewModel.profile.hamsterName, !name.isEmpty {
            return "\(name) is getting ready..."
        }
        return "Setting up your hamster home..."
    }

    // MARK: - Actions

    private func completeOnboarding() {
        Task {
            if let profile = await viewModel.completeOnboarding() {
                await authViewModel.completeOnboarding(profile: profile)
            }
        }
    }
}

#Preview {
    OnboardingContainerView()
        .environmentObject(AuthViewModel())
}
