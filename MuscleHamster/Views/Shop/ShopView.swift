//
//  ShopView.swift
//  MuscleHamster
//
//  Shop tab - Purchase items for hamster customization
//

import SwiftUI

struct ShopView: View {
    @State private var viewState: ViewState = .loading

    var body: some View {
        NavigationStack {
            Group {
                switch viewState {
                case .loading:
                    LoadingView(message: "Opening the shop...")

                case .empty:
                    EmptyStateView(
                        icon: "bag.fill",
                        title: "Shop Coming Soon",
                        message: "Outfits and items for your hamster will be available here."
                    )

                case .error(let message):
                    ErrorView(
                        message: message,
                        retryAction: { loadContent() }
                    )

                case .content:
                    shopContent
                }
            }
            .navigationTitle("Shop")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    pointsBalance
                }
            }
        }
        .onAppear {
            loadContent()
        }
    }

    private var pointsBalance: some View {
        HStack(spacing: 4) {
            Image(systemName: "star.fill")
                .foregroundStyle(.yellow)
            Text("0")
                .fontWeight(.semibold)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(Color.yellow.opacity(0.15))
        .cornerRadius(20)
        .accessibilityLabel("Points balance: 0 points")
    }

    private var shopContent: some View {
        ScrollView {
            VStack(spacing: 20) {
                featuredSection
                categoriesSection
            }
            .padding()
        }
    }

    private var featuredSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Featured")
                .font(.title2)
                .fontWeight(.semibold)
                .accessibilityAddTraits(.isHeader)

            RoundedRectangle(cornerRadius: 16)
                .fill(LinearGradient(
                    colors: [.purple.opacity(0.3), .pink.opacity(0.3)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ))
                .frame(height: 150)
                .overlay {
                    VStack {
                        Image(systemName: "sparkles")
                            .font(.largeTitle)
                            .foregroundStyle(.purple)
                        Text("Featured items placeholder")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .accessibilityLabel("Featured items section")
        }
    }

    private var categoriesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Categories")
                .font(.title2)
                .fontWeight(.semibold)
                .accessibilityAddTraits(.isHeader)

            ForEach(ShopCategory.allCases, id: \.self) { category in
                categoryRow(category)
            }
        }
    }

    private func categoryRow(_ category: ShopCategory) -> some View {
        Button {
            // Category navigation placeholder
        } label: {
            HStack {
                Image(systemName: category.icon)
                    .font(.title3)
                    .frame(width: 44)
                    .foregroundStyle(.accentColor)

                VStack(alignment: .leading) {
                    Text(category.rawValue)
                        .font(.headline)
                    Text(category.description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundStyle(.secondary)
            }
            .padding()
            .background(Color.gray.opacity(0.1))
            .cornerRadius(12)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(category.rawValue): \(category.description)")
    }

    private func loadContent() {
        viewState = .loading
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            viewState = .content
        }
    }
}

enum ShopCategory: String, CaseIterable {
    case outfits = "Outfits"
    case accessories = "Accessories"
    case enclosure = "Enclosure"

    var icon: String {
        switch self {
        case .outfits: return "tshirt.fill"
        case .accessories: return "sparkles"
        case .enclosure: return "house.fill"
        }
    }

    var description: String {
        switch self {
        case .outfits: return "Dress up your hamster"
        case .accessories: return "Fun extras and decorations"
        case .enclosure: return "Customize your hamster's home"
        }
    }
}

#Preview {
    ShopView()
}
