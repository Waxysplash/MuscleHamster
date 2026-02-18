//
//  OnboardingTimeView.swift
//  MuscleHamster
//
//  Onboarding step for selecting preferred workout time
//

import SwiftUI

struct OnboardingTimeView: View {
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
                    Image(systemName: "sun.and.horizon.fill")
                        .font(.system(size: 60))
                        .foregroundStyle(.accentColor)
                        .accessibilityHidden(true)

                    Text("When do you like to move?")
                        .font(.title2)
                        .fontWeight(.bold)
                        .multilineTextAlignment(.center)

                    Text("We'll remind you at the right time")
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 40)

                // Time options
                LazyVGrid(columns: columns, spacing: 16) {
                    ForEach(WorkoutTime.allCases) { time in
                        timeButton(time)
                    }
                }

                Spacer()
            }
            .padding(.horizontal, 24)
        }
    }

    private func timeButton(_ time: WorkoutTime) -> some View {
        let isSelected = viewModel.profile.preferredWorkoutTime == time

        return Button {
            viewModel.setPreferredWorkoutTime(time)
        } label: {
            VStack(spacing: 12) {
                // Icon
                ZStack {
                    Circle()
                        .fill(isSelected ? Color.accentColor : Color(.systemGray5))
                        .frame(width: 64, height: 64)

                    Image(systemName: time.icon)
                        .font(.title)
                        .foregroundStyle(isSelected ? .white : .primary)
                }

                // Label
                VStack(spacing: 4) {
                    Text(time.displayName)
                        .font(.headline)
                        .foregroundStyle(.primary)

                    Text(time.timeRange)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .padding()
            .frame(maxWidth: .infinity)
            .frame(minHeight: 150)
            .background(isSelected ? Color.accentColor.opacity(0.1) : Color(.systemGray6))
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .strokeBorder(isSelected ? Color.accentColor : Color.clear, lineWidth: 2)
            )
        }
        .accessibilityLabel("\(time.displayName): \(time.timeRange)")
        .accessibilityAddTraits(isSelected ? .isSelected : [])
        .accessibilityHint("Double tap to select")
    }
}

#Preview {
    OnboardingTimeView()
        .environmentObject(OnboardingViewModel())
}
