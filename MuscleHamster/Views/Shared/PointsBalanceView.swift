//
//  PointsBalanceView.swift
//  MuscleHamster
//
//  Reusable component for displaying points balance consistently across the app
//  Phase 07.1: Points Wallet
//

import SwiftUI

/// Display style for points balance
enum PointsDisplayStyle {
    case full       // Star icon + balance + "points"
    case compact    // Star icon + balance only
    case change     // "+75" or "-100" for transaction feedback
}

/// Reusable view for displaying points balance consistently
struct PointsBalanceView: View {
    let balance: Int
    let style: PointsDisplayStyle
    var showAnimation: Bool = false
    var changeAmount: Int? = nil  // For .change style

    @State private var animatedBalance: Int = 0
    @State private var showChangeIndicator = false

    var body: some View {
        switch style {
        case .full:
            fullBalanceView
        case .compact:
            compactBalanceView
        case .change:
            changeView
        }
    }

    // MARK: - Full Style

    private var fullBalanceView: some View {
        HStack(spacing: 6) {
            Image(systemName: "star.fill")
                .foregroundStyle(.yellow)
                .font(.system(size: 16))

            Text(formattedBalance)
                .font(.headline)
                .fontWeight(.semibold)

            Text("points")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(balance) points")
        .onAppear {
            if showAnimation {
                animatedBalance = 0
                withAnimation(.easeOut(duration: 0.5)) {
                    animatedBalance = balance
                }
            } else {
                animatedBalance = balance
            }
        }
    }

    // MARK: - Compact Style

    private var compactBalanceView: some View {
        HStack(spacing: 4) {
            Image(systemName: "star.fill")
                .foregroundStyle(.yellow)
                .font(.system(size: 14))

            Text(formattedBalance)
                .font(.subheadline)
                .fontWeight(.medium)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(balance) points")
    }

    // MARK: - Change Style

    private var changeView: some View {
        HStack(spacing: 4) {
            Image(systemName: "star.fill")
                .foregroundStyle(.yellow)
                .font(.system(size: 14))

            if let amount = changeAmount {
                Text(amount >= 0 ? "+\(amount)" : "\(amount)")
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundStyle(amount >= 0 ? .green : .orange)
            } else {
                Text("+\(balance)")
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundStyle(.green)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityLabelForChange)
    }

    // MARK: - Helpers

    private var formattedBalance: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        return formatter.string(from: NSNumber(value: showAnimation ? animatedBalance : balance)) ?? "\(balance)"
    }

    private var accessibilityLabelForChange: String {
        if let amount = changeAmount {
            return amount >= 0 ? "Earned \(amount) points" : "Spent \(abs(amount)) points"
        }
        return "Earned \(balance) points"
    }
}

// MARK: - Insufficient Points Message

/// Friendly messaging for insufficient points scenarios
struct InsufficientPointsMessage: View {
    let currentBalance: Int
    let requiredAmount: Int

    private var pointsNeeded: Int {
        max(0, requiredAmount - currentBalance)
    }

    var body: some View {
        VStack(spacing: 8) {
            HStack(spacing: 4) {
                Image(systemName: "star.fill")
                    .foregroundStyle(.yellow)
                    .font(.system(size: 12))

                Text("You have \(currentBalance) points")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            if pointsNeeded > 0 {
                Text(friendlyMessage)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityLabel)
    }

    private var friendlyMessage: String {
        if pointsNeeded <= 25 {
            return "Almost there! Just \(pointsNeeded) more points to go."
        } else if pointsNeeded <= 100 {
            return "You're getting closer! \(pointsNeeded) more points needed."
        } else {
            return "You'll earn more with your next workout!"
        }
    }

    private var accessibilityLabel: String {
        "You have \(currentBalance) points. \(friendlyMessage)"
    }
}

// MARK: - Points Change Indicator

/// Animated indicator for points earned or spent
struct PointsChangeIndicator: View {
    let amount: Int
    let isEarning: Bool
    @Binding var isVisible: Bool

    @State private var offset: CGFloat = 0
    @State private var opacity: Double = 1

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "star.fill")
                .foregroundStyle(.yellow)
                .font(.system(size: 16))

            Text(isEarning ? "+\(amount)" : "-\(amount)")
                .font(.title3)
                .fontWeight(.bold)
                .foregroundStyle(isEarning ? .green : .orange)
        }
        .offset(y: offset)
        .opacity(opacity)
        .onAppear {
            withAnimation(.easeOut(duration: 1.5)) {
                offset = -30
                opacity = 0
            }

            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                isVisible = false
            }
        }
        .accessibilityLabel(isEarning ? "Earned \(amount) points" : "Spent \(amount) points")
    }
}

// MARK: - Previews

#Preview("Full Balance") {
    VStack(spacing: 20) {
        PointsBalanceView(balance: 1250, style: .full)
        PointsBalanceView(balance: 50, style: .full)
        PointsBalanceView(balance: 0, style: .full)
    }
    .padding()
}

#Preview("Compact Balance") {
    VStack(spacing: 20) {
        PointsBalanceView(balance: 1250, style: .compact)
        PointsBalanceView(balance: 50, style: .compact)
    }
    .padding()
}

#Preview("Change Style") {
    VStack(spacing: 20) {
        PointsBalanceView(balance: 75, style: .change)
        PointsBalanceView(balance: 0, style: .change, changeAmount: -100)
    }
    .padding()
}

#Preview("Insufficient Points") {
    VStack(spacing: 30) {
        InsufficientPointsMessage(currentBalance: 75, requiredAmount: 100)
        InsufficientPointsMessage(currentBalance: 25, requiredAmount: 100)
        InsufficientPointsMessage(currentBalance: 0, requiredAmount: 150)
    }
    .padding()
}
