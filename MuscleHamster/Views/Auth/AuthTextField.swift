//
//  AuthTextField.swift
//  MuscleHamster
//
//  Reusable styled text field for auth forms with icon, validation, and accessibility
//

import SwiftUI

struct AuthTextField: View {
    let icon: String
    let placeholder: String
    @Binding var text: String
    var isSecure: Bool = false
    var keyboardType: UIKeyboardType = .default
    var textContentType: UITextContentType?
    var autocapitalization: TextInputAutocapitalization = .never
    var error: String?
    var hint: String?

    @FocusState private var isFocused: Bool
    @State private var isPasswordVisible = false

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.body)
                    .foregroundStyle(isFocused ? .accentColor : .secondary)
                    .frame(width: 24)

                Group {
                    if isSecure && !isPasswordVisible {
                        SecureField(placeholder, text: $text)
                    } else {
                        TextField(placeholder, text: $text)
                    }
                }
                .keyboardType(keyboardType)
                .textContentType(textContentType)
                .textInputAutocapitalization(autocapitalization)
                .focused($isFocused)
                .accessibilityLabel(placeholder)
                .accessibilityValue(text.isEmpty ? "Empty" : text)
                .accessibilityHint(buildAccessibilityHint())

                if isSecure {
                    Button {
                        isPasswordVisible.toggle()
                    } label: {
                        Image(systemName: isPasswordVisible ? "eye.slash.fill" : "eye.fill")
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }
                    .accessibilityLabel(isPasswordVisible ? "Hide password" : "Show password")
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(.systemGray6))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(borderColor, lineWidth: isFocused ? 2 : 1)
            )

            if let error = error, !error.isEmpty {
                HStack(spacing: 4) {
                    Image(systemName: "exclamationmark.circle.fill")
                        .font(.caption)
                    Text(error)
                        .font(.caption)
                }
                .foregroundStyle(.red)
                .accessibilityLabel("Error: \(error)")
            } else if let hint = hint, !hint.isEmpty {
                Text(hint)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var borderColor: Color {
        if error != nil {
            return .red
        } else if isFocused {
            return .accentColor
        } else {
            return Color(.systemGray4)
        }
    }

    private func buildAccessibilityHint() -> String {
        var hints: [String] = []
        if let hint = hint {
            hints.append(hint)
        }
        if let error = error {
            hints.append("Error: \(error)")
        }
        return hints.joined(separator: ". ")
    }
}

#Preview {
    VStack(spacing: 20) {
        AuthTextField(
            icon: "envelope.fill",
            placeholder: "Email",
            text: .constant(""),
            keyboardType: .emailAddress,
            textContentType: .emailAddress
        )

        AuthTextField(
            icon: "lock.fill",
            placeholder: "Password",
            text: .constant(""),
            isSecure: true,
            textContentType: .password,
            hint: "At least 8 characters"
        )

        AuthTextField(
            icon: "envelope.fill",
            placeholder: "Email",
            text: .constant("test@"),
            keyboardType: .emailAddress,
            error: "Please enter a valid email address"
        )
    }
    .padding()
}
