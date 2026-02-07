//
//  OnboardingScheduleView.swift
//  MuscleHamster
//
//  Onboarding step for selecting schedule preference (fixed vs flexible)
//

import SwiftUI

struct OnboardingScheduleView: View {
    @EnvironmentObject private var viewModel: OnboardingViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                // Header
                VStack(spacing: 12) {
                    Image(systemName: "clock.fill")
                        .font(.system(size: 60))
                        .foregroundStyle(.accentColor)
                        .accessibilityHidden(true)

                    Text("How do you like to plan?")
                        .font(.title2)
                        .fontWeight(.bold)
                        .multilineTextAlignment(.center)

                    Text("Pick what works best for your lifestyle")
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 40)

                // Schedule options
                VStack(spacing: 16) {
                    ForEach(SchedulePreference.allCases) { preference in
                        scheduleButton(preference)
                    }
                }

                Spacer()
            }
            .padding(.horizontal, 24)
        }
    }

    private func scheduleButton(_ preference: SchedulePreference) -> some View {
        let isSelected = viewModel.profile.schedulePreference == preference

        return Button {
            viewModel.setSchedulePreference(preference)
        } label: {
            HStack(spacing: 16) {
                // Icon
                Image(systemName: iconForPreference(preference))
                    .font(.title2)
                    .frame(width: 56, height: 56)
                    .background(isSelected ? Color.accentColor : Color(.systemGray5))
                    .foregroundStyle(isSelected ? .white : .primary)
                    .cornerRadius(12)

                // Text
                VStack(alignment: .leading, spacing: 6) {
                    Text(preference.displayName)
                        .font(.headline)
                        .foregroundStyle(.primary)

                    Text(preference.description)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    // Example
                    Text(exampleForPreference(preference))
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
        .accessibilityLabel("\(preference.displayName): \(preference.description)")
        .accessibilityAddTraits(isSelected ? .isSelected : [])
        .accessibilityHint("Double tap to select")
    }

    private func iconForPreference(_ preference: SchedulePreference) -> String {
        switch preference {
        case .fixed: return "calendar.badge.clock"
        case .flexible: return "arrow.triangle.2.circlepath"
        }
    }

    private func exampleForPreference(_ preference: SchedulePreference) -> String {
        switch preference {
        case .fixed: return "e.g., \"I work out Mon, Wed, Fri\""
        case .flexible: return "e.g., \"I fit it in when I can\""
        }
    }
}

#Preview {
    OnboardingScheduleView()
        .environmentObject(OnboardingViewModel())
}
