//
//  AssetStatusView.swift
//  MuscleHamster
//
//  Debug view for checking art asset availability
//  Shows which assets are loaded vs placeholder
//  Phase 10.1: Art Asset Specifications
//

import SwiftUI

#if DEBUG

/// Debug view for checking which art assets are available
struct AssetStatusView: View {
    @State private var missingAssets: [String: [String]] = [:]
    @State private var isLoading = true

    var body: some View {
        NavigationStack {
            List {
                // Summary Section
                Section {
                    summaryRow
                } header: {
                    Text("Summary")
                }

                // Hamster Assets
                Section {
                    assetCategoryRow(
                        title: "Hamster States",
                        total: AssetNames.allHamsterAssets.count,
                        missing: missingAssets["Hamsters"]?.count ?? 0
                    )

                    if let missing = missingAssets["Hamsters"], !missing.isEmpty {
                        ForEach(missing, id: \.self) { name in
                            missingAssetRow(name: name)
                        }
                    }
                } header: {
                    Text("Hamsters (\(AssetNames.allHamsterAssets.count) total)")
                }

                // Outfit Assets
                Section {
                    assetCategoryRow(
                        title: "Outfits",
                        total: AssetNames.allOutfitAssets.count,
                        missing: missingAssets["Outfits"]?.count ?? 0
                    )

                    if let missing = missingAssets["Outfits"], !missing.isEmpty {
                        ForEach(missing, id: \.self) { name in
                            missingAssetRow(name: name)
                        }
                    }
                } header: {
                    Text("Outfits (\(AssetNames.allOutfitAssets.count) total)")
                }

                // Accessory Assets
                Section {
                    assetCategoryRow(
                        title: "Accessories",
                        total: AssetNames.allAccessoryAssets.count,
                        missing: missingAssets["Accessories"]?.count ?? 0
                    )

                    if let missing = missingAssets["Accessories"], !missing.isEmpty {
                        ForEach(missing, id: \.self) { name in
                            missingAssetRow(name: name)
                        }
                    }
                } header: {
                    Text("Accessories (\(AssetNames.allAccessoryAssets.count) total)")
                }

                // Enclosure Item Assets
                Section {
                    assetCategoryRow(
                        title: "Enclosure Items",
                        total: AssetNames.allEnclosureItemAssets.count,
                        missing: missingAssets["Enclosure Items"]?.count ?? 0
                    )

                    if let missing = missingAssets["Enclosure Items"], !missing.isEmpty {
                        ForEach(missing, id: \.self) { name in
                            missingAssetRow(name: name)
                        }
                    }
                } header: {
                    Text("Enclosure Items (\(AssetNames.allEnclosureItemAssets.count) total)")
                }

                // Background Assets
                Section {
                    assetCategoryRow(
                        title: "Backgrounds",
                        total: 1,
                        missing: missingAssets["Backgrounds"]?.count ?? 0
                    )

                    if let missing = missingAssets["Backgrounds"], !missing.isEmpty {
                        ForEach(missing, id: \.self) { name in
                            missingAssetRow(name: name)
                        }
                    }
                } header: {
                    Text("Backgrounds")
                }

                // Color Palette Preview
                Section {
                    colorPalettePreview
                } header: {
                    Text("Color Palette")
                }
            }
            .navigationTitle("Asset Status")
            .onAppear {
                loadAssetStatus()
            }
            .refreshable {
                loadAssetStatus()
            }
        }
    }

    // MARK: - Subviews

    private var summaryRow: some View {
        let totalAssets = AssetNames.allHamsterAssets.count +
                          AssetNames.allOutfitAssets.count +
                          AssetNames.allAccessoryAssets.count +
                          AssetNames.allEnclosureItemAssets.count + 1

        let totalMissing = missingAssets.values.reduce(0) { $0 + $1.count }
        let totalLoaded = totalAssets - totalMissing

        return VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Assets Loaded")
                Spacer()
                Text("\(totalLoaded) / \(totalAssets)")
                    .foregroundStyle(totalMissing == 0 ? .green : .orange)
            }

            ProgressView(value: Double(totalLoaded), total: Double(totalAssets))
                .tint(totalMissing == 0 ? .green : .orange)

            if totalMissing > 0 {
                Text("\(totalMissing) assets using placeholders")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                Text("All assets loaded!")
                    .font(.caption)
                    .foregroundStyle(.green)
            }
        }
        .padding(.vertical, 4)
    }

    private func assetCategoryRow(title: String, total: Int, missing: Int) -> some View {
        HStack {
            Circle()
                .fill(missing == 0 ? .green : .orange)
                .frame(width: 10, height: 10)

            Text(title)

            Spacer()

            Text("\(total - missing) / \(total)")
                .foregroundStyle(.secondary)
        }
    }

    private func missingAssetRow(name: String) -> some View {
        HStack {
            Image(systemName: "xmark.circle")
                .foregroundStyle(.orange)

            Text(name)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(.leading, 20)
    }

    private var colorPalettePreview: some View {
        VStack(alignment: .leading, spacing: 12) {
            colorRow(name: "Hamster Orange", color: HamsterColorPalette.hamsterOrange, hex: "F5A623")
            colorRow(name: "Hamster Cream", color: HamsterColorPalette.hamsterCream, hex: "FFE4B5")
            colorRow(name: "Nose Pink", color: HamsterColorPalette.nosePink, hex: "FFB6C1")
            colorRow(name: "Eye Black", color: HamsterColorPalette.eyeBlack, hex: "2C2C2C")
            colorRow(name: "Outline", color: HamsterColorPalette.outline, hex: "D4892E")
            colorRow(name: "Sky Start", color: HamsterColorPalette.enclosureSkyStart, hex: "FFFAF5")
            colorRow(name: "Sky End", color: HamsterColorPalette.enclosureSkyEnd, hex: "FFF0E0")
            colorRow(name: "Ground", color: HamsterColorPalette.enclosureGround, hex: "C08050")
        }
    }

    private func colorRow(name: String, color: Color, hex: String) -> some View {
        HStack {
            RoundedRectangle(cornerRadius: 4)
                .fill(color)
                .frame(width: 30, height: 30)
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .strokeBorder(Color.gray.opacity(0.3), lineWidth: 1)
                )

            Text(name)

            Spacer()

            Text("#\(hex)")
                .font(.caption)
                .foregroundStyle(.secondary)
                .monospaced()
        }
    }

    // MARK: - Data Loading

    private func loadAssetStatus() {
        isLoading = true
        missingAssets = AssetLoader.missingAssetsReport()
        isLoading = false
    }
}

// MARK: - Preview

#Preview("Asset Status") {
    AssetStatusView()
}

#endif
