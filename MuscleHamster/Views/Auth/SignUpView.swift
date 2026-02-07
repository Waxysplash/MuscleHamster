//
//  SignUpView.swift
//  MuscleHamster
//
//  Account creation screen with email/password form and social sign-up options
//

import SwiftUI

struct SignUpView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var isSubmitting = false
    @State private var showSignIn = false

    @FocusState private var focusedField: Field?

    private enum Field {
        case email, password, confirmPassword
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                // Header
                VStack(spacing: 8) {
                    Text("Let's set up your space!")
                        .font(.title)
                        .fontWeight(.bold)

                    Text("Create an account to save your progress")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .multilineTextAlignment(.center)
                .padding(.top, 24)
                .accessibilityElement(children: .combine)

                // Form fields
                VStack(spacing: 16) {
                    AuthTextField(
                        icon: "envelope.fill",
                        placeholder: "Email",
                        text: $email,
                        keyboardType: .emailAddress,
                        textContentType: .emailAddress,
                        error: emailError
                    )
                    .focused($focusedField, equals: .email)
                    .submitLabel(.next)
                    .onSubmit { focusedField = .password }

                    AuthTextField(
                        icon: "lock.fill",
                        placeholder: "Password",
                        text: $password,
                        isSecure: true,
                        textContentType: .newPassword,
                        error: passwordError,
                        hint: password.isEmpty ? "At least 8 characters - your hamster will keep it safe!" : nil
                    )
                    .focused($focusedField, equals: .password)
                    .submitLabel(.next)
                    .onSubmit { focusedField = .confirmPassword }

                    AuthTextField(
                        icon: "lock.fill",
                        placeholder: "Confirm Password",
                        text: $confirmPassword,
                        isSecure: true,
                        textContentType: .newPassword,
                        error: confirmPasswordError
                    )
                    .focused($focusedField, equals: .confirmPassword)
                    .submitLabel(.go)
                    .onSubmit { submitForm() }
                }

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
                                Text("Setting up your space...")
                            }
                        } else {
                            Text("Create Account")
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
                .accessibilityLabel(isSubmitting ? "Setting up your space" : "Create Account")
                .accessibilityHint(isFormValid ? "Double tap to create your account" : "Complete all fields to enable")

                // Divider
                HStack {
                    Rectangle()
                        .fill(Color(.systemGray4))
                        .frame(height: 1)
                    Text("or")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Rectangle()
                        .fill(Color(.systemGray4))
                        .frame(height: 1)
                }

                // Social sign-up buttons
                VStack(spacing: 12) {
                    SocialAuthButton(provider: .apple) {
                        // Apple sign-in placeholder
                    }

                    SocialAuthButton(provider: .google) {
                        // Google sign-in placeholder
                    }
                }

                // Sign in link
                Button {
                    showSignIn = true
                } label: {
                    Text("Already have an account? Sign in")
                        .font(.subheadline)
                        .foregroundStyle(.accentColor)
                }
                .padding(.bottom, 32)
            }
            .padding(.horizontal, 24)
        }
        .navigationTitle("Create Account")
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(isPresented: $showSignIn) {
            SignInView()
        }
        .onDisappear {
            authViewModel.clearError()
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

    private var isValidPassword: Bool {
        password.count >= 8
    }

    private var passwordError: String? {
        guard !password.isEmpty else { return nil }
        return isValidPassword ? nil : "Password must be at least 8 characters"
    }

    private var passwordsMatch: Bool {
        !confirmPassword.isEmpty && password == confirmPassword
    }

    private var confirmPasswordError: String? {
        guard !confirmPassword.isEmpty else { return nil }
        return passwordsMatch ? nil : "Passwords don't match"
    }

    private var isFormValid: Bool {
        isValidEmail && isValidPassword && passwordsMatch
    }

    // MARK: - Actions

    private func submitForm() {
        guard isFormValid && !isSubmitting else { return }

        focusedField = nil
        isSubmitting = true
        authViewModel.clearError()

        Task {
            let success = await authViewModel.signUp(email: email, password: password)
            isSubmitting = false

            if !success {
                // Focus on the appropriate field based on error
                if authViewModel.error == .invalidEmail {
                    focusedField = .email
                } else if authViewModel.error == .weakPassword {
                    focusedField = .password
                }
            }
        }
    }
}

#Preview {
    NavigationStack {
        SignUpView()
            .environmentObject(AuthViewModel())
    }
}
