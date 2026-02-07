//
//  OnboardingAgeView.swift
//  MuscleHamster
//
//  Onboarding step for collecting user age (for personalization)
//

import SwiftUI

struct OnboardingAgeView: View {
    @EnvironmentObject private var viewModel: OnboardingViewModel
    @State private var ageText: String = ""
    @FocusState private var isFocused: Bool

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                // Header
                VStack(spacing: 12) {
                    Image(systemName: "birthday.cake.fill")
                        .font(.system(size: 60))
                        .foregroundStyle(.accentColor)
                        .accessibilityHidden(true)

                    Text("Let's personalize your experience!")
                        .font(.title2)
                        .fontWeight(.bold)
                        .multilineTextAlignment(.center)

                    Text("Your age helps us recommend the right workouts for you.")
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 40)

                // Age input
                VStack(spacing: 16) {
                    TextField("Age", text: $ageText)
                        .keyboardType(.numberPad)
                        .font(.system(size: 48, weight: .bold, design: .rounded))
                        .multilineTextAlignment(.center)
                        .frame(width: 120)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(16)
                        .focused($isFocused)
                        .onChange(of: ageText) { newValue in
                            // Filter non-digits and limit to 3 characters
                            let filtered = newValue.filter { $0.isNumber }
                            if filtered != newValue {
                                ageText = filtered
                            }
                            if filtered.count > 3 {
                                ageText = String(filtered.prefix(3))
                            }
                            // Update view model
                            if let age = Int(ageText) {
                                viewModel.setAge(age)
                            }
                        }
                        .accessibilityLabel("Enter your age")
                        .accessibilityHint("Type a number between 13 and 120")

                    Text("years old")
                        .font(.title3)
                        .foregroundStyle(.secondary)
                }

                // Validation message
                if !ageText.isEmpty, let age = Int(ageText) {
                    if age < 13 {
                        validationMessage("You must be 13 or older to use Muscle Hamster.", isError: true)
                    } else if age > 120 {
                        validationMessage("Please enter a valid age.", isError: true)
                    } else {
                        validationMessage("Great! We'll tailor workouts for your age.", isError: false)
                    }
                }

                Spacer()
            }
            .padding(.horizontal, 24)
        }
        .onAppear {
            // Restore saved age if available
            if let savedAge = viewModel.profile.age {
                ageText = String(savedAge)
            }
            // Auto-focus the field
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                isFocused = true
            }
        }
    }

    private func validationMessage(_ text: String, isError: Bool) -> some View {
        HStack(spacing: 8) {
            Image(systemName: isError ? "exclamationmark.circle.fill" : "checkmark.circle.fill")
            Text(text)
        }
        .font(.subheadline)
        .foregroundStyle(isError ? .red : .green)
        .padding()
        .frame(maxWidth: .infinity)
        .background((isError ? Color.red : Color.green).opacity(0.1))
        .cornerRadius(12)
        .accessibilityLabel(text)
    }
}

#Preview {
    OnboardingAgeView()
        .environmentObject(OnboardingViewModel())
}
