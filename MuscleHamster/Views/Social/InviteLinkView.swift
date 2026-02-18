//
//  InviteLinkView.swift
//  MuscleHamster
//
//  View for generating and sharing invite links
//  Phase 09.2: Add Friends UX
//

import SwiftUI

struct InviteLinkView: View {
    let userId: String

    @Environment(\.dismiss) private var dismiss
    @State private var inviteCode: String = ""
    @State private var isLoading = true
    @State private var showShareSheet = false
    @State private var copiedToClipboard = false

    private var inviteLink: String {
        "https://musclehamster.app/invite/\(inviteCode)"
    }

    private var shareMessage: String {
        "Join me on Muscle Hamster! Let's keep each other's hamsters happy and build streaks together. \(inviteLink)"
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 32) {
                Spacer()

                // Header illustration
                headerSection

                // Invite info
                inviteInfoSection

                // Actions
                actionButtons

                Spacer()
            }
            .padding()
            .navigationTitle("Invite Friends")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .task {
                await loadInviteCode()
            }
            .sheet(isPresented: $showShareSheet) {
                ShareSheet(items: [shareMessage])
            }
        }
    }

    // MARK: - Header Section

    private var headerSection: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color.green.opacity(0.15))
                    .frame(width: 100, height: 100)

                Image(systemName: "person.2.fill")
                    .font(.system(size: 40))
                    .foregroundStyle(.green)
            }

            VStack(spacing: 8) {
                Text("Invite a Friend!")
                    .font(.title2)
                    .fontWeight(.bold)

                Text("Share your personal invite link and start building streaks together")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
        }
    }

    // MARK: - Invite Info Section

    private var inviteInfoSection: some View {
        VStack(spacing: 16) {
            if isLoading {
                ProgressView()
                    .padding()
            } else {
                // Invite code display
                VStack(spacing: 8) {
                    Text("Your Invite Code")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .textCase(.uppercase)

                    Text(inviteCode)
                        .font(.system(size: 28, weight: .bold, design: .monospaced))
                        .foregroundStyle(.primary)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                        .accessibilityLabel("Invite code: \(inviteCode)")
                }

                // Link preview
                VStack(spacing: 4) {
                    Text("Link")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .textCase(.uppercase)

                    Text(inviteLink)
                        .font(.footnote)
                        .foregroundStyle(.blue)
                        .lineLimit(1)
                        .truncationMode(.middle)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 10, y: 4)
    }

    // MARK: - Action Buttons

    private var actionButtons: some View {
        VStack(spacing: 12) {
            // Share button
            Button {
                showShareSheet = true
            } label: {
                HStack {
                    Image(systemName: "square.and.arrow.up")
                    Text("Share Invite Link")
                }
                .font(.headline)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.accentColor)
                .cornerRadius(14)
            }
            .disabled(isLoading)
            .accessibilityLabel("Share invite link")
            .accessibilityHint("Opens share sheet to send your invite link")

            // Copy button
            Button {
                copyToClipboard()
            } label: {
                HStack {
                    Image(systemName: copiedToClipboard ? "checkmark" : "doc.on.doc")
                    Text(copiedToClipboard ? "Copied!" : "Copy Link")
                }
                .font(.headline)
                .foregroundStyle(.accentColor)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.accentColor.opacity(0.1))
                .cornerRadius(14)
            }
            .disabled(isLoading)
            .accessibilityLabel(copiedToClipboard ? "Link copied to clipboard" : "Copy invite link")
        }
    }

    // MARK: - Actions

    private func loadInviteCode() async {
        isLoading = true
        inviteCode = await MockFriendService.shared.generateInviteCode(userId: userId)
        isLoading = false
    }

    private func copyToClipboard() {
        UIPasteboard.general.string = inviteLink
        copiedToClipboard = true

        // Reset after a moment
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            copiedToClipboard = false
        }
    }
}

// MARK: - Share Sheet

struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

// MARK: - Preview

#Preview {
    InviteLinkView(userId: "test_user")
}
