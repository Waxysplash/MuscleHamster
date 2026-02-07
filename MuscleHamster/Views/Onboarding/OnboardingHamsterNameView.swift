//
//  OnboardingHamsterNameView.swift
//  MuscleHamster
//
//  Onboarding step for naming the user's hamster with validation
//

import SwiftUI

struct OnboardingHamsterNameView: View {
    @EnvironmentObject private var viewModel: OnboardingViewModel
    @State private var nameInput: String = ""
    @State private var hasAttemptedSubmit = false
    @FocusState private var isNameFieldFocused: Bool

    private var validationError: String? {
        guard hasAttemptedSubmit || !nameInput.isEmpty else { return nil }
        return UserProfile.validateHamsterName(nameInput)
    }

    private var isValidName: Bool {
        UserProfile.isValidHamsterName(nameInput)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                // Header with hamster illustration placeholder
                VStack(spacing: 16) {
                    // Hamster waiting to be named
                    ZStack {
                        Circle()
                            .fill(Color.accentColor.opacity(0.15))
                            .frame(width: 120, height: 120)

                        Image(systemName: "pawprint.fill")
                            .font(.system(size: 50))
                            .foregroundStyle(.accentColor)
                    }
                    .accessibilityHidden(true)

                    Text("What should I call you, little one?")
                        .font(.title2)
                        .fontWeight(.bold)
                        .multilineTextAlignment(.center)

                    Text("Give your new hamster buddy a name. You can always change it later!")
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 32)

                // Name input section
                VStack(spacing: 12) {
                    // Text field with decorative border
                    VStack(spacing: 8) {
                        TextField("Hamster name", text: $nameInput)
                            .font(.title3)
                            .fontWeight(.medium)
                            .multilineTextAlignment(.center)
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(16)
                            .overlay(
                                RoundedRectangle(cornerRadius: 16)
                                    .strokeBorder(
                                        validationError != nil ? Color.red :
                                            isNameFieldFocused ? Color.accentColor : Color.clear,
                                        lineWidth: 2
                                    )
                            )
                            .focused($isNameFieldFocused)
                            .textInputAutocapitalization(.words)
                            .autocorrectionDisabled()
                            .submitLabel(.done)
                            .onChange(of: nameInput) { newValue in
                                // Enforce max length while typing
                                if newValue.count > UserProfile.hamsterNameMaxLength {
                                    nameInput = String(newValue.prefix(UserProfile.hamsterNameMaxLength))
                                }
                                viewModel.setHamsterName(newValue)
                            }
                            .onSubmit {
                                hasAttemptedSubmit = true
                                isNameFieldFocused = false
                            }
                            .accessibilityLabel("Hamster name")
                            .accessibilityHint("Enter a name for your hamster, up to \(UserProfile.hamsterNameMaxLength) characters")

                        // Character count
                        HStack {
                            Spacer()
                            Text("\(nameInput.count)/\(UserProfile.hamsterNameMaxLength)")
                                .font(.caption)
                                .foregroundStyle(
                                    nameInput.count >= UserProfile.hamsterNameMaxLength ? .orange : .secondary
                                )
                        }
                        .padding(.horizontal, 8)
                    }

                    // Validation error message
                    if let error = validationError {
                        HStack(spacing: 6) {
                            Image(systemName: "exclamationmark.circle.fill")
                                .font(.subheadline)
                            Text(error)
                                .font(.subheadline)
                        }
                        .foregroundStyle(.red)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .accessibilityLabel("Error: \(error)")
                    }
                }
                .padding(.horizontal, 8)

                // Name suggestions
                VStack(spacing: 12) {
                    Text("Need inspiration?")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    // Suggestion chips
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 10) {
                        ForEach(nameSuggestions, id: \.self) { suggestion in
                            suggestionChip(suggestion)
                        }
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(16)

                // Encouraging message
                VStack(spacing: 8) {
                    Text("Your hamster is so excited!")
                        .font(.headline)
                        .foregroundStyle(.accentColor)

                    Text("Once you name them, they'll be ready to help you on your fitness journey.")
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
        .onAppear {
            // Restore previously entered name if returning to this step
            if let savedName = viewModel.profile.hamsterName {
                nameInput = savedName
            }
            // Auto-focus the text field
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                isNameFieldFocused = true
            }
        }
        .onDisappear {
            hasAttemptedSubmit = true
        }
    }

    // MARK: - Suggestion Chip

    private func suggestionChip(_ name: String) -> some View {
        Button {
            nameInput = name
            viewModel.setHamsterName(name)
            hasAttemptedSubmit = true
        } label: {
            Text(name)
                .font(.subheadline)
                .fontWeight(.medium)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .frame(maxWidth: .infinity)
                .background(
                    nameInput == name ? Color.accentColor : Color(.systemBackground)
                )
                .foregroundStyle(nameInput == name ? .white : .primary)
                .cornerRadius(20)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .strokeBorder(Color.accentColor.opacity(0.5), lineWidth: 1)
                )
        }
        .accessibilityLabel("Suggestion: \(name)")
        .accessibilityHint("Double tap to use this name")
        .accessibilityAddTraits(nameInput == name ? .isSelected : [])
    }

    // MARK: - Name Suggestions

    private var nameSuggestions: [String] {
        ["Hammy", "Peanut", "Whiskers", "Nugget", "Biscuit", "Coco"]
    }
}

#Preview {
    OnboardingHamsterNameView()
        .environmentObject(OnboardingViewModel())
}
