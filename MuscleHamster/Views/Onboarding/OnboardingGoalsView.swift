//
//  OnboardingGoalsView.swift
//  MuscleHamster
//
//  Onboarding step for selecting fitness goals (multi-select)
//

import SwiftUI

struct OnboardingGoalsView: View {
    @EnvironmentObject private var viewModel: OnboardingViewModel

    private let columns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                // Header
                VStack(spacing: 12) {
                    Image(systemName: "target")
                        .font(.system(size: 60))
                        .foregroundStyle(.accentColor)
                        .accessibilityHidden(true)

                    Text("What are you working towards?")
                        .font(.title2)
                        .fontWeight(.bold)
                        .multilineTextAlignment(.center)

                    Text("Pick all that resonate with you")
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 40)

                // Goals grid
                LazyVGrid(columns: columns, spacing: 16) {
                    ForEach(FitnessGoal.allCases) { goal in
                        goalButton(goal)
                    }
                }

                // Selection count
                if !viewModel.profile.fitnessGoals.isEmpty {
                    Text("\(viewModel.profile.fitnessGoals.count) goal\(viewModel.profile.fitnessGoals.count == 1 ? "" : "s") selected")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                Spacer()
            }
            .padding(.horizontal, 24)
        }
    }

    private func goalButton(_ goal: FitnessGoal) -> some View {
        let isSelected = viewModel.profile.fitnessGoals.contains(goal)

        return Button {
            viewModel.toggleGoal(goal)
        } label: {
            VStack(spacing: 12) {
                // Icon
                ZStack {
                    Circle()
                        .fill(isSelected ? Color.accentColor : Color(.systemGray5))
                        .frame(width: 56, height: 56)

                    Image(systemName: goal.icon)
                        .font(.title2)
                        .foregroundStyle(isSelected ? .white : .primary)
                }

                // Label
                Text(goal.displayName)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundStyle(.primary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .minimumScaleFactor(0.8)

                // Selection indicator
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(isSelected ? .accentColor : Color(.systemGray4))
            }
            .padding()
            .frame(maxWidth: .infinity)
            .frame(minHeight: 140)
            .background(isSelected ? Color.accentColor.opacity(0.1) : Color(.systemGray6))
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .strokeBorder(isSelected ? Color.accentColor : Color.clear, lineWidth: 2)
            )
        }
        .accessibilityLabel(goal.displayName)
        .accessibilityAddTraits(isSelected ? .isSelected : [])
        .accessibilityHint("Double tap to \(isSelected ? "deselect" : "select")")
    }
}

#Preview {
    OnboardingGoalsView()
        .environmentObject(OnboardingViewModel())
}
