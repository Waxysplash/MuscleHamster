//
//  PasswordResetView.swift
//  MuscleHamster
//
//  Password reset screen with email entry and success confirmation
//

import SwiftUI

struct PasswordResetView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var email = ""
    @State private var isSubmitting = false
    @State private var showSuccess = false

    @FocusState private var isEmailFocused: Bool

    var body: some View {
        Group {
            if showSuccess {
                successView
            } else {
                formView
            }
        }
        .navigationTitle("Reset Password")
        .navigationBarTitleDisplayMode(.inline)
        .onDisappear {
            authViewModel.clearError()
        }
    }

    // MARK: - Form View

    private var formView: some View {
        ScrollView {
            VStack(spacing: 32) {
                // Header
                VStack(spacing: 8) {
                    Image(systemName: "lock.rotation")
                        .font(.system(size: 60))
                        .foregroundStyle(.accentColor)
                        .padding(.bottom, 8)
                        .accessibilityHidden(true)

                    Text("Let's get you back in!")
                        .font(.title2)
                        .fontWeight(.bold)

                    Text("Enter your email and we'll send you a link to reset your password.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 16)
                }
                .padding(.top, 40)
                .accessibilityElement(children: .combine)

                // Email field
                AuthTextField(
                    icon: "envelope.fill",
                    placeholder: "Email",
                    text: $email,
                    keyboardType: .emailAddress,
                    textContentType: .emailAddress,
                    error: emailError
                )
                .focused($isEmailFocused)
                .submitLabel(.go)
                .onSubmit { submitForm() }

                // Error from auth service
                if let error = authViewModel.error {
                    HStack(spacing: 8) {
                        Image(systemName: "exclamationmark.triangle.fill")
                        Text(error.userMessage)
                    }
                    .font(.subheadline)
                    .foregroundStyle(.red)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.red.opacity(0.1))
                    .cornerRadius(12)
                    .accessibilityLabel("Error: \(error.userMessage)")
                }

                // Submit button
                Button {
                    submitForm()
                } label: {
                    Group {
                        if isSubmitting {
                            HStack(spacing: 8) {
                                ProgressView()
                                    .tint(.white)
                                Text("Sending reset link...")
                            }
                        } else {
                            Text("Send Reset Link")
                        }
                    }
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(isFormValid && !isSubmitting ? Color.accentColor : Color.gray)
                    .foregroundStyle(.white)
                    .cornerRadius(14)
                }
                .disabled(!isFormValid || isSubmitting)
                .accessibilityLabel(isSubmitting ? "Sending reset link" : "Send Reset Link")
                .accessibilityHint(isFormValid ? "Double tap to send password reset email" : "Enter valid email to enable")

                Spacer()
            }
            .padding(.horizontal, 24)
        }
    }

    // MARK: - Success View

    private var successView: some View {
        VStack(spacing: 32) {
            Spacer()

            VStack(spacing: 24) {
                Image(systemName: "envelope.badge.shield.half.filled")
                    .font(.system(size: 70))
                    .foregroundStyle(.accentColor)
                    .accessibilityHidden(true)

                VStack(spacing: 12) {
                    Text("Check your inbox!")
                        .font(.title2)
                        .fontWeight(.bold)

                    Text("Your hamster just sent a reset link to:")
                        .font(.body)
                        .foregroundStyle(.secondary)

                    Text(email)
                        .font(.body)
                        .fontWeight(.medium)

                    Text("Follow the link in the email to reset your password.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.top, 8)
                }
            }
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Check your inbox! Your hamster just sent a reset link to \(email). Follow the link in the email to reset your password.")

            Spacer()

            VStack(spacing: 16) {
                Button {
                    dismiss()
                } label: {
                    Text("Back to Sign In")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.accentColor)
                        .foregroundStyle(.white)
                        .cornerRadius(14)
                }
                .accessibilityHint("Returns to sign in screen")

                Button {
                    // Reset state to allow resending
                    showSuccess = false
                    authViewModel.clearError()
                } label: {
                    Text("Didn't get the email? Try again")
                        .font(.subheadline)
                        .foregroundStyle(.accentColor)
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 48)
        }
    }

    // MARK: - Validation

    private var isValidEmail: Bool {
        let emailRegex = #"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"#
        return email.range(of: emailRegex, options: .regularExpression) != nil
    }

    private var emailError: String? {
        guard !email.isEmpty else { return nil }
        return isValidEmail ? nil : "Please enter a valid email address"
    }

    private var isFormValid: Bool {
        isValidEmail
    }

    // MARK: - Actions

    private func submitForm() {
        guard isFormValid && !isSubmitting else { return }

        isEmailFocused = false
        isSubmitting = true
        authViewModel.clearError()

        Task {
            let success = await authViewModel.resetPassword(email: email)
            isSubmitting = false

            if success {
                withAnimation {
                    showSuccess = true
                }
            } else {
                isEmailFocused = true
            }
        }
    }
}

#Preview("Form") {
    NavigationStack {
        PasswordResetView()
            .environmentObject(AuthViewModel())
    }
}
