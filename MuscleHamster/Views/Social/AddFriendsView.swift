//
//  AddFriendsView.swift
//  MuscleHamster
//
//  Main screen for discovering and adding friends
//  Phase 09.2: Add Friends UX
//

import SwiftUI

// MARK: - Add Friends View Model

@MainActor
class AddFriendsViewModel: ObservableObject {
    @Published var searchQuery = ""
    @Published var searchResults: [FriendProfile] = []
    @Published var isSearching = false
    @Published var searchError: String?
    @Published var pendingRequestIds: Set<String> = []  // Users we've sent requests to
    @Published var friendIds: Set<String> = []  // Users we're already friends with

    private var searchTask: Task<Void, Never>?
    private let debounceDelay: UInt64 = 300_000_000  // 300ms

    var userId: String = ""

    init() {}

    // MARK: - Search

    func search() {
        // Cancel previous search
        searchTask?.cancel()

        let query = searchQuery.trimmingCharacters(in: .whitespacesAndNewlines)

        // Minimum 2 characters
        guard query.count >= 2 else {
            searchResults = []
            isSearching = false
            searchError = nil
            return
        }

        isSearching = true
        searchError = nil

        // Debounced search
        searchTask = Task {
            // Wait for debounce
            try? await Task.sleep(nanoseconds: debounceDelay)

            guard !Task.isCancelled else { return }

            do {
                let results = try await MockFriendService.shared.searchUsers(
                    query: query,
                    searcherId: userId
                )

                guard !Task.isCancelled else { return }

                // Update results
                searchResults = results
                isSearching = false
            } catch {
                guard !Task.isCancelled else { return }

                searchError = "Couldn't search right now. Try again?"
                isSearching = false
            }
        }
    }

    func clearSearch() {
        searchQuery = ""
        searchResults = []
        isSearching = false
        searchError = nil
        searchTask?.cancel()
    }

    // MARK: - Friend Actions

    func sendFriendRequest(to receiverId: String) async {
        // Optimistic UI
        pendingRequestIds.insert(receiverId)

        do {
            _ = try await MockFriendService.shared.sendFriendRequest(
                from: userId,
                to: receiverId
            )
            // Request sent successfully - keep pending state
        } catch {
            // Revert on failure
            pendingRequestIds.remove(receiverId)
        }
    }

    func cancelFriendRequest(to receiverId: String) async {
        // We'd need to find the request ID first - for now, just update UI
        pendingRequestIds.remove(receiverId)
    }

    // MARK: - Load State

    func loadInitialState() async {
        // Load current friends list
        do {
            let friends = try await MockFriendService.shared.getFriends(userId: userId)
            friendIds = Set(friends.map { $0.id })

            // Load pending outgoing requests
            let pendingRequests = try await MockFriendService.shared.getPendingOutgoingRequests(userId: userId)
            pendingRequestIds = Set(pendingRequests.map { $0.receiverId })
        } catch {
            // Silent fail - will show add buttons by default
        }
    }

    func relationState(for profileId: String) -> FriendRelationState {
        if friendIds.contains(profileId) {
            return .friends
        }
        if pendingRequestIds.contains(profileId) {
            return .pending
        }
        return .none
    }
}

// MARK: - Add Friends View

struct AddFriendsView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var authViewModel: AuthViewModel
    @StateObject private var viewModel = AddFriendsViewModel()

    @State private var showInviteLink = false
    @State private var showQRCode = false
    @State private var showContactsImport = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Search section
                    searchSection

                    // Discovery methods (only show when not searching)
                    if viewModel.searchQuery.isEmpty {
                        discoveryMethodsSection
                    }
                }
                .padding()
            }
            .navigationTitle("Add Friends")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .sheet(isPresented: $showInviteLink) {
                InviteLinkView(userId: authViewModel.currentUser?.id ?? "")
            }
            .sheet(isPresented: $showQRCode) {
                QRCodeView(userId: authViewModel.currentUser?.id ?? "")
            }
            .task {
                viewModel.userId = authViewModel.currentUser?.id ?? ""
                await viewModel.loadInitialState()
            }
        }
    }

    // MARK: - Search Section

    private var searchSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            VStack(alignment: .leading, spacing: 4) {
                Text("Find your friends!")
                    .font(.headline)

                Text("Search by username to connect")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            // Search bar
            HStack(spacing: 12) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(.secondary)

                TextField("Search username...", text: $viewModel.searchQuery)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .submitLabel(.search)
                    .onChange(of: viewModel.searchQuery) { _ in
                        viewModel.search()
                    }

                if !viewModel.searchQuery.isEmpty {
                    Button {
                        viewModel.clearSearch()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(.secondary)
                    }
                    .accessibilityLabel("Clear search")
                }
            }
            .padding(12)
            .background(Color(.systemGray6))
            .cornerRadius(12)
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Search by username")

            // Search results
            if !viewModel.searchQuery.isEmpty {
                searchResultsSection
            }
        }
    }

    @ViewBuilder
    private var searchResultsSection: some View {
        if viewModel.isSearching {
            // Loading state
            HStack {
                Spacer()
                ProgressView()
                    .padding()
                Text("Searching...")
                    .foregroundStyle(.secondary)
                Spacer()
            }
            .padding(.vertical)
        } else if let error = viewModel.searchError {
            // Error state
            VStack(spacing: 12) {
                Image(systemName: "exclamationmark.triangle")
                    .font(.title)
                    .foregroundStyle(.orange)
                Text(error)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                Button("Try Again") {
                    viewModel.search()
                }
                .buttonStyle(.bordered)
            }
            .padding()
            .frame(maxWidth: .infinity)
        } else if viewModel.searchResults.isEmpty && viewModel.searchQuery.count >= 2 {
            // No results
            VStack(spacing: 12) {
                Image(systemName: "person.slash")
                    .font(.title)
                    .foregroundStyle(.secondary)
                Text("No hamster friends found with that name")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Text("Try a different search!")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
            .padding()
            .frame(maxWidth: .infinity)
            .accessibilityElement(children: .combine)
            .accessibilityLabel("No results found. Try a different search.")
        } else {
            // Results list
            VStack(spacing: 0) {
                ForEach(viewModel.searchResults) { profile in
                    FriendRowView(
                        profile: profile,
                        relationState: viewModel.relationState(for: profile.id),
                        onAction: {
                            Task {
                                let state = viewModel.relationState(for: profile.id)
                                if state == .none {
                                    await viewModel.sendFriendRequest(to: profile.id)
                                } else if state == .pending {
                                    await viewModel.cancelFriendRequest(to: profile.id)
                                }
                            }
                        }
                    )

                    if profile.id != viewModel.searchResults.last?.id {
                        Divider()
                    }
                }
            }
            .background(Color(.systemBackground))
            .cornerRadius(12)
        }
    }

    // MARK: - Discovery Methods Section

    private var discoveryMethodsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("More ways to connect")
                .font(.headline)
                .padding(.top, 8)

            // Contacts import card
            DiscoveryMethodCard(
                icon: "person.crop.rectangle.stack",
                iconColor: .blue,
                title: "From Contacts",
                description: "Find friends who are already on Muscle Hamster",
                action: {
                    showContactsImport = true
                }
            )

            // Invite link card
            DiscoveryMethodCard(
                icon: "link",
                iconColor: .green,
                title: "Share Invite Link",
                description: "Send a link via message, email, or social media",
                action: {
                    showInviteLink = true
                }
            )

            // QR code card
            DiscoveryMethodCard(
                icon: "qrcode",
                iconColor: .purple,
                title: "QR Code",
                description: "Show your code or scan a friend's code in person",
                action: {
                    showQRCode = true
                }
            )
        }
    }
}

// MARK: - Discovery Method Card

struct DiscoveryMethodCard: View {
    let icon: String
    let iconColor: Color
    let title: String
    let description: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                // Icon
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(iconColor.opacity(0.15))
                        .frame(width: 50, height: 50)

                    Image(systemName: icon)
                        .font(.title2)
                        .foregroundStyle(iconColor)
                }

                // Text
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.body)
                        .fontWeight(.medium)
                        .foregroundStyle(.primary)

                    Text(description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                Spacer()

                // Chevron
                Image(systemName: "chevron.right")
                    .font(.body)
                    .foregroundStyle(.tertiary)
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(16)
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(title). \(description)")
        .accessibilityHint("Double tap to open")
    }
}

// MARK: - Preview

#Preview {
    AddFriendsView()
        .environmentObject(AuthViewModel())
}
