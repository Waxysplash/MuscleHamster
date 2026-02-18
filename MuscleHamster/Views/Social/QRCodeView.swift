//
//  QRCodeView.swift
//  MuscleHamster
//
//  View for displaying personal QR code and scanning others' codes
//  Phase 09.2: Add Friends UX
//

import SwiftUI
import CoreImage.CIFilterBuiltins
import AVFoundation

// MARK: - QR Code View

struct QRCodeView: View {
    let userId: String

    @Environment(\.dismiss) private var dismiss
    @State private var selectedTab = 0
    @State private var inviteCode: String = ""
    @State private var isLoading = true

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Tab picker
                Picker("QR Code Mode", selection: $selectedTab) {
                    Text("My Code").tag(0)
                    Text("Scan").tag(1)
                }
                .pickerStyle(.segmented)
                .padding()

                // Content
                TabView(selection: $selectedTab) {
                    myCodeTab.tag(0)
                    scanTab.tag(1)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
            }
            .navigationTitle("QR Code")
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
        }
    }

    // MARK: - My Code Tab

    private var myCodeTab: some View {
        ScrollView {
            VStack(spacing: 24) {
                Spacer(minLength: 20)

                // Header
                VStack(spacing: 8) {
                    Text("Your QR Code")
                        .font(.title2)
                        .fontWeight(.bold)

                    Text("Have a friend scan this to add you")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                // QR Code display
                if isLoading {
                    ProgressView()
                        .frame(width: 250, height: 250)
                } else {
                    qrCodeImage
                        .interpolation(.none)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 250, height: 250)
                        .padding(20)
                        .background(Color.white)
                        .cornerRadius(20)
                        .shadow(color: .black.opacity(0.1), radius: 10, y: 4)
                        .accessibilityLabel("Your personal QR code for adding friends")
                }

                // Invite code text
                if !isLoading {
                    VStack(spacing: 4) {
                        Text("Code")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .textCase(.uppercase)

                        Text(inviteCode)
                            .font(.system(.title3, design: .monospaced))
                            .fontWeight(.semibold)
                    }
                }

                // Share button
                Button {
                    shareQRCode()
                } label: {
                    HStack {
                        Image(systemName: "square.and.arrow.up")
                        Text("Share QR Code")
                    }
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.accentColor)
                    .cornerRadius(14)
                }
                .disabled(isLoading)
                .padding(.horizontal)
                .accessibilityHint("Save or share your QR code image")

                Spacer(minLength: 40)
            }
            .padding()
        }
    }

    private var qrCodeImage: Image {
        let inviteLink = "https://musclehamster.app/invite/\(inviteCode)"
        return generateQRCode(from: inviteLink)
    }

    // MARK: - Scan Tab

    private var scanTab: some View {
        QRScannerView(userId: userId)
    }

    // MARK: - QR Code Generation

    private func generateQRCode(from string: String) -> Image {
        let context = CIContext()
        let filter = CIFilter.qrCodeGenerator()

        filter.message = Data(string.utf8)
        filter.correctionLevel = "M"

        if let outputImage = filter.outputImage {
            // Scale up the image
            let transform = CGAffineTransform(scaleX: 10, y: 10)
            let scaledImage = outputImage.transformed(by: transform)

            if let cgImage = context.createCGImage(scaledImage, from: scaledImage.extent) {
                return Image(uiImage: UIImage(cgImage: cgImage))
            }
        }

        // Fallback placeholder
        return Image(systemName: "qrcode")
    }

    // MARK: - Actions

    private func loadInviteCode() async {
        isLoading = true
        inviteCode = await MockFriendService.shared.generateInviteCode(userId: userId)
        isLoading = false
    }

    private func shareQRCode() {
        // Generate QR code image for sharing
        let inviteLink = "https://musclehamster.app/invite/\(inviteCode)"
        let qrImage = generateQRCodeUIImage(from: inviteLink)

        let activityVC = UIActivityViewController(
            activityItems: [qrImage, "Scan this to add me on Muscle Hamster!"],
            applicationActivities: nil
        )

        // Present share sheet
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first,
           let rootVC = window.rootViewController {
            rootVC.present(activityVC, animated: true)
        }
    }

    private func generateQRCodeUIImage(from string: String) -> UIImage {
        let context = CIContext()
        let filter = CIFilter.qrCodeGenerator()

        filter.message = Data(string.utf8)
        filter.correctionLevel = "M"

        if let outputImage = filter.outputImage {
            let transform = CGAffineTransform(scaleX: 10, y: 10)
            let scaledImage = outputImage.transformed(by: transform)

            if let cgImage = context.createCGImage(scaledImage, from: scaledImage.extent) {
                return UIImage(cgImage: cgImage)
            }
        }

        return UIImage(systemName: "qrcode") ?? UIImage()
    }
}

// MARK: - QR Scanner View

struct QRScannerView: View {
    let userId: String

    @State private var cameraPermissionStatus: AVAuthorizationStatus = .notDetermined
    @State private var scannedCode: String?
    @State private var scannedProfile: FriendProfile?
    @State private var scanError: String?
    @State private var isProcessing = false
    @State private var requestSent = false

    var body: some View {
        VStack {
            switch cameraPermissionStatus {
            case .authorized:
                scannerContent

            case .denied, .restricted:
                permissionDeniedView

            case .notDetermined:
                permissionRequestView

            @unknown default:
                permissionRequestView
            }
        }
        .onAppear {
            checkCameraPermission()
        }
    }

    // MARK: - Scanner Content

    @ViewBuilder
    private var scannerContent: some View {
        if let profile = scannedProfile {
            // Show scanned user
            scannedUserView(profile: profile)
        } else {
            // Camera scanner
            ZStack {
                // Camera preview placeholder
                // In a real implementation, this would be AVCaptureVideoPreviewLayer
                CameraScannerPlaceholder(onCodeScanned: handleScannedCode)

                // Scan frame overlay
                VStack {
                    Spacer()

                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color.white, lineWidth: 3)
                        .frame(width: 250, height: 250)
                        .background(Color.clear)

                    Spacer()

                    // Instructions
                    VStack(spacing: 8) {
                        Text("Point at a QR code")
                            .font(.headline)
                            .foregroundStyle(.white)

                        Text("Position the code within the frame")
                            .font(.subheadline)
                            .foregroundStyle(.white.opacity(0.7))
                    }
                    .padding()
                    .background(Color.black.opacity(0.5))
                    .cornerRadius(12)
                    .padding(.bottom, 40)
                }
            }
            .background(Color.black)
        }
    }

    private func scannedUserView(profile: FriendProfile) -> some View {
        VStack(spacing: 24) {
            Spacer()

            // Success icon
            ZStack {
                Circle()
                    .fill(Color.green.opacity(0.15))
                    .frame(width: 100, height: 100)

                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 50))
                    .foregroundStyle(.green)
            }

            // User info
            VStack(spacing: 8) {
                Text("Found!")
                    .font(.title2)
                    .fontWeight(.bold)

                Text(profile.displayName)
                    .font(.title3)
                    .foregroundStyle(.secondary)

                if let hamsterName = profile.hamsterName {
                    HStack(spacing: 4) {
                        Image(systemName: profile.growthStage.icon)
                        Text(hamsterName)
                    }
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                }
            }

            // Action button
            if requestSent {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                    Text("Friend request sent!")
                }
                .font(.headline)
                .padding()
            } else {
                Button {
                    sendFriendRequest()
                } label: {
                    HStack {
                        if isProcessing {
                            ProgressView()
                                .tint(.white)
                        } else {
                            Image(systemName: "person.badge.plus")
                        }
                        Text("Add Friend")
                    }
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.accentColor)
                    .cornerRadius(14)
                }
                .disabled(isProcessing)
                .padding(.horizontal, 40)
            }

            // Scan another button
            Button {
                resetScanner()
            } label: {
                Text("Scan Another")
                    .font(.subheadline)
                    .foregroundStyle(.accentColor)
            }
            .padding(.top, 8)

            Spacer()
        }
        .padding()
    }

    // MARK: - Permission Views

    private var permissionRequestView: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "camera.fill")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)

            VStack(spacing: 8) {
                Text("Camera Access Needed")
                    .font(.title2)
                    .fontWeight(.bold)

                Text("To scan QR codes, we need access to your camera")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }

            Button {
                requestCameraPermission()
            } label: {
                Text("Enable Camera")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.accentColor)
                    .cornerRadius(14)
            }
            .padding(.horizontal, 40)

            Spacer()
        }
        .padding()
    }

    private var permissionDeniedView: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "camera.slash.fill")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)

            VStack(spacing: 8) {
                Text("Camera Access Denied")
                    .font(.title2)
                    .fontWeight(.bold)

                Text("To scan QR codes, please enable camera access in Settings")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }

            Button {
                openSettings()
            } label: {
                Text("Open Settings")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.accentColor)
                    .cornerRadius(14)
            }
            .padding(.horizontal, 40)

            Spacer()
        }
        .padding()
    }

    // MARK: - Actions

    private func checkCameraPermission() {
        cameraPermissionStatus = AVCaptureDevice.authorizationStatus(for: .video)
    }

    private func requestCameraPermission() {
        AVCaptureDevice.requestAccess(for: .video) { granted in
            DispatchQueue.main.async {
                cameraPermissionStatus = granted ? .authorized : .denied
            }
        }
    }

    private func openSettings() {
        if let url = URL(string: UIApplication.openSettingsURLString) {
            UIApplication.shared.open(url)
        }
    }

    private func handleScannedCode(_ code: String) {
        guard scannedCode == nil else { return }  // Prevent double-scan

        // Parse the code
        if code.contains("musclehamster.app/invite/") {
            // Extract invite code
            if let inviteCode = code.components(separatedBy: "/invite/").last {
                scannedCode = inviteCode
                processInviteCode(inviteCode)
            }
        } else {
            // Invalid QR code
            scanError = "That doesn't look like a Muscle Hamster code. Try another!"
        }
    }

    private func processInviteCode(_ code: String) {
        isProcessing = true

        Task {
            do {
                // Try to accept the invite code to get the user info
                // In a real implementation, we'd have a separate endpoint to lookup by invite code
                let request = try await MockFriendService.shared.acceptInviteCode(code: code, userId: userId)

                // If successful, show the profile
                // For mock, we'll create a placeholder profile
                let profile = FriendProfile(
                    id: request.senderId,
                    email: "friend@example.com",
                    hamsterName: "New Friend",
                    hamsterState: .happy,
                    growthStage: .baby
                )
                scannedProfile = profile
                requestSent = true
            } catch let error as FriendError {
                scanError = error.friendlyMessage
            } catch {
                scanError = "Couldn't process that code. Try again?"
            }

            isProcessing = false
        }
    }

    private func sendFriendRequest() {
        guard let profile = scannedProfile else { return }

        isProcessing = true

        Task {
            do {
                _ = try await MockFriendService.shared.sendFriendRequest(
                    from: userId,
                    to: profile.id
                )
                requestSent = true
            } catch {
                scanError = "Couldn't send request. Try again?"
            }

            isProcessing = false
        }
    }

    private func resetScanner() {
        scannedCode = nil
        scannedProfile = nil
        scanError = nil
        requestSent = false
    }
}

// MARK: - Camera Scanner Placeholder

/// Placeholder for camera scanner. In a real implementation, this would use AVCaptureSession.
struct CameraScannerPlaceholder: View {
    let onCodeScanned: (String) -> Void

    @State private var mockScanProgress: CGFloat = 0

    var body: some View {
        ZStack {
            // Dark background simulating camera
            Color.black.opacity(0.9)

            VStack {
                Text("Camera Scanner")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.5))

                // Mock scan button for testing
                Button {
                    // Simulate scanning a valid code
                    onCodeScanned("https://musclehamster.app/invite/TEST1234")
                } label: {
                    Text("Simulate Scan (Dev)")
                        .font(.caption)
                        .foregroundStyle(.blue)
                        .padding(8)
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(8)
                }
            }
        }
    }
}

// MARK: - Preview

#Preview("QR Code View") {
    QRCodeView(userId: "test_user")
}

#Preview("QR Scanner") {
    QRScannerView(userId: "test_user")
}
