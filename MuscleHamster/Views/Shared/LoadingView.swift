//
//  LoadingView.swift
//  MuscleHamster
//
//  Friendly loading state with hamster-toned messaging
//

import SwiftUI

struct LoadingView: View {
    let message: String

    init(message: String = "Loading...") {
        self.message = message
    }

    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.2)

            Text(message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Loading. \(message)")
    }
}

#Preview {
    LoadingView(message: "Waking up your hamster...")
}
