//
//  SignInView.swift
//  MuscleHamster
//
//  Sign in screen for returning users with email/password and social options
//

import SwiftUI

struct SignInView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var email = ""
    @State private var password = ""
    @State private var isSubmitting = false
    @State private var showPasswordReset = false
    @State private var showSignUp = false

    @FocusState private var focusedField: Field?

    private enum Field {
        case email, password
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                // Header
                VStack(spacing: 8) {
                    Text("Welcome back!")
                        .font(.title)
                        .fontWeight(.bold)

                    Text("Your hamster missed you.")
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
                        textContentType: .password
                    )
                    .focused($focusedField, equals: .password)
                    .submitLabel(.go)
                    .onSubmit { submitForm() }
                }

                // Forgot password link
                HStack {
                    Spacer()
                    Button {
                        showPasswordReset = true
                    } label: {
                        Text("Forgot password?")
                            .font(.subheadline)
                            .foregroundStyle(.accentColor)
                    }
                    .accessibilityHint("Opens password reset screen")
                }
                .padding(.top, -16)

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
                                Text("Waking up your hamster...")
                            }
                        } else {
                            Text("Sign In")
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
                .accessibilityLabel(isSubmitting ? "Waking up your hamster" : "Sign In")
                .accessibilityHint(isFormValid ? "Double tap to sign in" : "Enter email and password to enable")

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

                // Social sign-in buttons
                VStack(spacing: 12) {
                    SocialAuthButton(provider: .apple) {
                        // Apple sign-in placeholder
                    }

                    SocialAuthButton(provider: .google) {
                        // Google sign-in placeholder
                    }
                }

                // Sign up link
                Button {
                    showSignUp = true
                } label: {
                    Text("Don't have an account? Create one")
                        .font(.subheadline)
                        .foregroundStyle(.accentColor)
                }
                .padding(.bottom, 32)
            }
            .padding(.horizontal, 24)
        }
        .navigationTitle("Sign In")
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(isPresented: $showPasswordReset) {
            PasswordResetView()
        }
        .navigationDestination(isPresented: $showSignUp) {
            SignUpView()
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

    private var isFormValid: Bool {
        isValidEmail && !password.isEmpty
    }

    // MARK: - Actions

    private func submitForm() {
        guard isFormValid && !isSubmitting else { return }

        focusedField = nil
        isSubmitting = true
        authViewModel.clearError()

        Task {
            let success = await authViewModel.signIn(email: email, password: password)
            isSubmitting = false

            if !success {
                // Focus on email field for retry
                focusedField = .email
            }
        }
    }
}

#Preview {
    NavigationStack {
        SignInView()
            .environmentObject(AuthViewModel())
    }
}
