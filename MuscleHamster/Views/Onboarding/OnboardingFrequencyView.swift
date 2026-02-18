//
//  OnboardingFrequencyView.swift
//  MuscleHamster
//
//  Onboarding step for selecting weekly workout frequency
//

import SwiftUI

struct OnboardingFrequencyView: View {
    @EnvironmentObject private var viewModel: OnboardingViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                // Header
                VStack(spacing: 12) {
                    Image(systemName: "calendar")
                        .font(.system(size: 60))
                        .foregroundStyle(.accentColor)
                        .accessibilityHidden(true)

                    Text("How many days a week?")
                        .font(.title2)
                        .fontWeight(.bold)
                        .multilineTextAlignment(.center)

                    Text("We recommend starting with what feels achievable. You can always adjust later!")
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 40)

                // Day buttons
                HStack(spacing: 12) {
                    ForEach(1...7, id: \.self) { day in
                        dayButton(day)
                    }
                }

                // Selected feedback
                if let days = viewModel.profile.weeklyWorkoutGoal {
                    VStack(spacing: 8) {
                        Text(feedbackForDays(days))
                            .font(.headline)
                            .foregroundStyle(.primary)

                        Text(descriptionForDays(days))
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.accentColor.opacity(0.1))
                    .cornerRadius(16)
                }

                Spacer()
            }
            .padding(.horizontal, 24)
        }
    }

    private func dayButton(_ day: Int) -> some View {
        let isSelected = viewModel.profile.weeklyWorkoutGoal == day

        return Button {
            viewModel.setWeeklyWorkoutGoal(day)
        } label: {
            Text("\(day)")
                .font(.title2)
                .fontWeight(.bold)
                .frame(width: 44, height: 44)
                .background(isSelected ? Color.accentColor : Color(.systemGray6))
                .foregroundStyle(isSelected ? .white : .primary)
                .clipShape(Circle())
                .overlay(
                    Circle()
                        .strokeBorder(isSelected ? Color.accentColor : Color.clear, lineWidth: 2)
                )
        }
        .accessibilityLabel("\(day) day\(day == 1 ? "" : "s") per week")
        .accessibilityAddTraits(isSelected ? .isSelected : [])
        .accessibilityHint("Double tap to select")
    }

    private func feedbackForDays(_ days: Int) -> String {
        switch days {
        case 1: return "Starting small is smart!"
        case 2: return "A gentle start!"
        case 3: return "The sweet spot!"
        case 4: return "Building momentum!"
        case 5: return "Dedicated!"
        case 6: return "Impressive commitment!"
        case 7: return "Every day counts!"
        default: return ""
        }
    }

    private func descriptionForDays(_ days: Int) -> String {
        switch days {
        case 1: return "One workout a week keeps your hamster happy."
        case 2: return "Perfect for building a sustainable habit."
        case 3: return "Most popular choice for balanced fitness."
        case 4: return "Great for steady progress and rest days."
        case 5: return "Your hamster will be so proud!"
        case 6: return "Leaving one day for full recovery."
        case 7: return "Rest is important too! We'll include light days."
        default: return ""
        }
    }
}

#Preview {
    OnboardingFrequencyView()
        .environmentObject(OnboardingViewModel())
}
