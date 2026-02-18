//
//  OnboardingFitnessLevelView.swift
//  MuscleHamster
//
//  Onboarding step for selecting fitness level
//

import SwiftUI

struct OnboardingFitnessLevelView: View {
    @EnvironmentObject private var viewModel: OnboardingViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                // Header
                VStack(spacing: 12) {
                    Image(systemName: "figure.walk")
                        .font(.system(size: 60))
                        .foregroundStyle(.accentColor)
                        .accessibilityHidden(true)

                    Text("Every journey has a starting point")
                        .font(.title2)
                        .fontWeight(.bold)
                        .multilineTextAlignment(.center)

                    Text("Where are you now? There's no wrong answer!")
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 40)

                // Level options
                VStack(spacing: 16) {
                    ForEach(FitnessLevel.allCases) { level in
                        levelButton(level)
                    }
                }

                Spacer()
            }
            .padding(.horizontal, 24)
        }
    }

    private func levelButton(_ level: FitnessLevel) -> some View {
        let isSelected = viewModel.profile.fitnessLevel == level

        return Button {
            viewModel.setFitnessLevel(level)
        } label: {
            HStack(spacing: 16) {
                // Icon
                Image(systemName: iconForLevel(level))
                    .font(.title2)
                    .frame(width: 44, height: 44)
                    .background(isSelected ? Color.accentColor : Color(.systemGray5))
                    .foregroundStyle(isSelected ? .white : .primary)
                    .cornerRadius(12)

                // Text
                VStack(alignment: .leading, spacing: 4) {
                    Text(level.displayName)
                        .font(.headline)
                        .foregroundStyle(.primary)

                    Text(level.description)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                Spacer()

                // Selection indicator
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.title2)
                        .foregroundStyle(.accentColor)
                }
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
        .accessibilityLabel("\(level.displayName): \(level.description)")
        .accessibilityAddTraits(isSelected ? .isSelected : [])
        .accessibilityHint("Double tap to select")
    }

    private func iconForLevel(_ level: FitnessLevel) -> String {
        switch level {
        case .beginner: return "leaf.fill"
        case .intermediate: return "flame.fill"
        case .advanced: return "bolt.fill"
        }
    }
}

#Preview {
    OnboardingFitnessLevelView()
        .environmentObject(OnboardingViewModel())
}
