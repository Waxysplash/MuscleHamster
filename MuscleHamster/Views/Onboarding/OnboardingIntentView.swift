//
//  OnboardingIntentView.swift
//  MuscleHamster
//
//  Onboarding step for selecting fitness intent (maintenance vs improvement)
//

import SwiftUI

struct OnboardingIntentView: View {
    @EnvironmentObject private var viewModel: OnboardingViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                // Header
                VStack(spacing: 12) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 60))
                        .foregroundStyle(.accentColor)
                        .accessibilityHidden(true)

                    Text("What's your focus?")
                        .font(.title2)
                        .fontWeight(.bold)
                        .multilineTextAlignment(.center)

                    Text("Both paths are great! This helps us pick the right intensity.")
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 40)

                // Intent options
                VStack(spacing: 16) {
                    ForEach(FitnessIntent.allCases) { intent in
                        intentButton(intent)
                    }
                }

                // Almost done encouragement
                VStack(spacing: 8) {
                    Text("Almost there!")
                        .font(.headline)
                        .foregroundStyle(.accentColor)

                    Text("Your hamster is getting excited to meet you.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color.accentColor.opacity(0.1))
                .cornerRadius(16)

                Spacer()
            }
            .padding(.horizontal, 24)
        }
    }

    private func intentButton(_ intent: FitnessIntent) -> some View {
        let isSelected = viewModel.profile.fitnessIntent == intent

        return Button {
            viewModel.setFitnessIntent(intent)
        } label: {
            HStack(spacing: 16) {
                // Icon
                Image(systemName: iconForIntent(intent))
                    .font(.title)
                    .frame(width: 64, height: 64)
                    .background(isSelected ? Color.accentColor : Color(.systemGray5))
                    .foregroundStyle(isSelected ? .white : .primary)
                    .cornerRadius(16)

                // Text
                VStack(alignment: .leading, spacing: 6) {
                    Text(intent.displayName)
                        .font(.title3)
                        .fontWeight(.semibold)
                        .foregroundStyle(.primary)

                    Text(intent.description)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    // What to expect
                    Text(expectationForIntent(intent))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .italic()
                }

                Spacer()

                // Selection indicator
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.title2)
                    .foregroundStyle(isSelected ? .accentColor : Color(.systemGray4))
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(isSelected ? Color.accentColor.opacity(0.1) : Color(.systemGray6))
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .strokeBorder(isSelected ? Color.accentColor : Color.clear, lineWidth: 2)
            )
        }
        .accessibilityLabel("\(intent.displayName): \(intent.description)")
        .accessibilityAddTraits(isSelected ? .isSelected : [])
        .accessibilityHint("Double tap to select")
    }

    private func iconForIntent(_ intent: FitnessIntent) -> String {
        switch intent {
        case .maintenance: return "equal.circle.fill"
        case .improvement: return "arrow.up.circle.fill"
        }
    }

    private func expectationForIntent(_ intent: FitnessIntent) -> String {
        switch intent {
        case .maintenance: return "Steady workouts to stay where you are"
        case .improvement: return "Progressive challenges to level up"
        }
    }
}

#Preview {
    OnboardingIntentView()
        .environmentObject(OnboardingViewModel())
}
