//
//  ProfileSettingsView.swift
//  MuscleHamster
//
//  Settings screen for editing user profile and fitness preferences
//  Phase 03.3: Persist and edit profile in settings
//

import SwiftUI

struct ProfileSettingsView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss

    // Local editing state
    @State private var hamsterName: String = ""
    @State private var fitnessLevel: FitnessLevel?
    @State private var fitnessGoals: Set<FitnessGoal> = []
    @State private var weeklyWorkoutGoal: Int = 3
    @State private var schedulePreference: SchedulePreference?
    @State private var preferredWorkoutTime: WorkoutTime?
    @State private var fitnessIntent: FitnessIntent?

    // UI state
    @State private var isSaving = false
    @State private var showSaveConfirmation = false
    @State private var showDiscardConfirmation = false
    @State private var hasUnsavedChanges = false

    private var profile: UserProfile? {
        authViewModel.userProfile
    }

    private var isValidProfile: Bool {
        !hamsterName.isEmpty &&
        UserProfile.isValidHamsterName(hamsterName) &&
        fitnessLevel != nil &&
        !fitnessGoals.isEmpty &&
        weeklyWorkoutGoal >= 1 && weeklyWorkoutGoal <= 7 &&
        schedulePreference != nil &&
        preferredWorkoutTime != nil &&
        fitnessIntent != nil
    }

    var body: some View {
        List {
            infoSection
            hamsterSection
            fitnessLevelSection
            goalsSection
            scheduleSection
            intentSection
        }
        .navigationTitle("My Profile")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Save") {
                    saveProfile()
                }
                .fontWeight(.semibold)
                .disabled(!isValidProfile || !hasUnsavedChanges || isSaving)
            }
        }
        .disabled(isSaving)
        .overlay {
            if isSaving {
                savingOverlay
            }
        }
        .alert("Changes Saved!", isPresented: $showSaveConfirmation) {
            Button("OK") {
                dismiss()
            }
        } message: {
            Text("Your profile has been updated. Your workout recommendations will reflect these changes.")
        }
        .interactiveDismissDisabled(hasUnsavedChanges)
        .onAppear {
            loadCurrentProfile()
        }
        .onChange(of: hamsterName) { _ in checkForChanges() }
        .onChange(of: fitnessLevel) { _ in checkForChanges() }
        .onChange(of: fitnessGoals) { _ in checkForChanges() }
        .onChange(of: weeklyWorkoutGoal) { _ in checkForChanges() }
        .onChange(of: schedulePreference) { _ in checkForChanges() }
        .onChange(of: preferredWorkoutTime) { _ in checkForChanges() }
        .onChange(of: fitnessIntent) { _ in checkForChanges() }
    }

    // MARK: - Info Section

    private var infoSection: some View {
        Section {
            HStack(spacing: 12) {
                Image(systemName: "info.circle.fill")
                    .foregroundStyle(.blue)

                Text("Changes to your profile will update your workout recommendations and reminders.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .listRowBackground(Color.blue.opacity(0.1))
        }
    }

    // MARK: - Hamster Section

    private var hamsterSection: some View {
        Section {
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(Color.accentColor.opacity(0.2))
                            .frame(width: 50, height: 50)

                        Image(systemName: "pawprint.fill")
                            .font(.title2)
                            .foregroundStyle(.accentColor)
                    }
                    .accessibilityHidden(true)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("Your Hamster")
                            .font(.caption)
                            .foregroundStyle(.secondary)

                        TextField("Hamster name", text: $hamsterName)
                            .font(.title3)
                            .fontWeight(.semibold)
                            .textInputAutocapitalization(.words)
                            .autocorrectionDisabled()
                    }
                }

                if let error = UserProfile.validateHamsterName(hamsterName), !hamsterName.isEmpty {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                }

                Text("\(hamsterName.count)/\(UserProfile.hamsterNameMaxLength) characters")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            .padding(.vertical, 4)
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Hamster name: \(hamsterName)")
            .accessibilityHint("Edit your hamster's name")
        } header: {
            Text("Hamster")
        }
    }

    // MARK: - Fitness Level Section

    private var fitnessLevelSection: some View {
        Section {
            ForEach(FitnessLevel.allCases) { level in
                Button {
                    fitnessLevel = level
                } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(level.displayName)
                                .foregroundStyle(.primary)
                            Text(level.description)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }

                        Spacer()

                        if fitnessLevel == level {
                            Image(systemName: "checkmark")
                                .foregroundStyle(.accentColor)
                                .fontWeight(.semibold)
                        }
                    }
                }
                .accessibilityLabel("\(level.displayName): \(level.description)")
                .accessibilityAddTraits(fitnessLevel == level ? .isSelected : [])
            }
        } header: {
            Text("Fitness Level")
        } footer: {
            Text("This helps us pick workouts that match your experience.")
        }
    }

    // MARK: - Goals Section

    private var goalsSection: some View {
        Section {
            ForEach(FitnessGoal.allCases) { goal in
                Button {
                    toggleGoal(goal)
                } label: {
                    HStack {
                        Image(systemName: goal.icon)
                            .foregroundStyle(.accentColor)
                            .frame(width: 24)

                        Text(goal.displayName)
                            .foregroundStyle(.primary)

                        Spacer()

                        if fitnessGoals.contains(goal) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(.accentColor)
                        } else {
                            Image(systemName: "circle")
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .accessibilityLabel(goal.displayName)
                .accessibilityAddTraits(fitnessGoals.contains(goal) ? .isSelected : [])
                .accessibilityHint("Double tap to \(fitnessGoals.contains(goal) ? "remove" : "add")")
            }
        } header: {
            Text("Fitness Goals")
        } footer: {
            Text("Select all that apply. We'll recommend workouts that help you reach these goals.")
        }
    }

    // MARK: - Schedule Section

    private var scheduleSection: some View {
        Section {
            // Weekly goal
            VStack(alignment: .leading, spacing: 12) {
                Text("Weekly Workout Goal")
                    .font(.subheadline)
                    .fontWeight(.medium)

                HStack(spacing: 8) {
                    ForEach(1...7, id: \.self) { day in
                        Button {
                            weeklyWorkoutGoal = day
                        } label: {
                            Text("\(day)")
                                .font(.headline)
                                .frame(width: 36, height: 36)
                                .background(weeklyWorkoutGoal == day ? Color.accentColor : Color(.systemGray5))
                                .foregroundStyle(weeklyWorkoutGoal == day ? .white : .primary)
                                .cornerRadius(8)
                        }
                        .accessibilityLabel("\(day) days per week")
                        .accessibilityAddTraits(weeklyWorkoutGoal == day ? .isSelected : [])
                    }
                }

                Text("\(weeklyWorkoutGoal) workout\(weeklyWorkoutGoal == 1 ? "" : "s") per week")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(.vertical, 4)

            // Schedule preference
            ForEach(SchedulePreference.allCases) { preference in
                Button {
                    schedulePreference = preference
                } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(preference.displayName)
                                .foregroundStyle(.primary)
                            Text(preference.description)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }

                        Spacer()

                        if schedulePreference == preference {
                            Image(systemName: "checkmark")
                                .foregroundStyle(.accentColor)
                                .fontWeight(.semibold)
                        }
                    }
                }
                .accessibilityLabel("\(preference.displayName): \(preference.description)")
                .accessibilityAddTraits(schedulePreference == preference ? .isSelected : [])
            }

            // Preferred time
            VStack(alignment: .leading, spacing: 12) {
                Text("Preferred Workout Time")
                    .font(.subheadline)
                    .fontWeight(.medium)

                ForEach(WorkoutTime.allCases) { time in
                    Button {
                        preferredWorkoutTime = time
                    } label: {
                        HStack {
                            Image(systemName: time.icon)
                                .foregroundStyle(.accentColor)
                                .frame(width: 24)

                            VStack(alignment: .leading, spacing: 2) {
                                Text(time.displayName)
                                    .foregroundStyle(.primary)
                                Text(time.timeRange)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }

                            Spacer()

                            if preferredWorkoutTime == time {
                                Image(systemName: "checkmark")
                                    .foregroundStyle(.accentColor)
                                    .fontWeight(.semibold)
                            }
                        }
                    }
                    .accessibilityLabel("\(time.displayName): \(time.timeRange)")
                    .accessibilityAddTraits(preferredWorkoutTime == time ? .isSelected : [])
                }
            }
            .padding(.vertical, 4)
        } header: {
            Text("Schedule")
        } footer: {
            Text("We'll use this to plan your workout days and send reminders at the right time.")
        }
    }

    // MARK: - Intent Section

    private var intentSection: some View {
        Section {
            ForEach(FitnessIntent.allCases) { intent in
                Button {
                    fitnessIntent = intent
                } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(intent.displayName)
                                .foregroundStyle(.primary)
                            Text(intent.description)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }

                        Spacer()

                        if fitnessIntent == intent {
                            Image(systemName: "checkmark")
                                .foregroundStyle(.accentColor)
                                .fontWeight(.semibold)
                        }
                    }
                }
                .accessibilityLabel("\(intent.displayName): \(intent.description)")
                .accessibilityAddTraits(fitnessIntent == intent ? .isSelected : [])
            }
        } header: {
            Text("Focus")
        } footer: {
            Text("Maintain keeps things steady. Improve gradually increases intensity over time.")
        }
    }

    // MARK: - Saving Overlay

    private var savingOverlay: some View {
        ZStack {
            Color.black.opacity(0.3)
                .ignoresSafeArea()

            VStack(spacing: 16) {
                ProgressView()
                    .scaleEffect(1.2)
                Text("Saving...")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .padding(24)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
        }
        .accessibilityLabel("Saving your profile")
    }

    // MARK: - Actions

    private func loadCurrentProfile() {
        guard let profile = authViewModel.userProfile else { return }

        hamsterName = profile.hamsterName ?? ""
        fitnessLevel = profile.fitnessLevel
        fitnessGoals = profile.fitnessGoals
        weeklyWorkoutGoal = profile.weeklyWorkoutGoal ?? 3
        schedulePreference = profile.schedulePreference
        preferredWorkoutTime = profile.preferredWorkoutTime
        fitnessIntent = profile.fitnessIntent

        // Reset change tracking after loading
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            hasUnsavedChanges = false
        }
    }

    private func checkForChanges() {
        guard let profile = authViewModel.userProfile else {
            hasUnsavedChanges = true
            return
        }

        hasUnsavedChanges =
            hamsterName != (profile.hamsterName ?? "") ||
            fitnessLevel != profile.fitnessLevel ||
            fitnessGoals != profile.fitnessGoals ||
            weeklyWorkoutGoal != (profile.weeklyWorkoutGoal ?? 3) ||
            schedulePreference != profile.schedulePreference ||
            preferredWorkoutTime != profile.preferredWorkoutTime ||
            fitnessIntent != profile.fitnessIntent
    }

    private func toggleGoal(_ goal: FitnessGoal) {
        if fitnessGoals.contains(goal) {
            fitnessGoals.remove(goal)
        } else {
            fitnessGoals.insert(goal)
        }
    }

    private func saveProfile() {
        guard isValidProfile else { return }

        isSaving = true

        Task {
            // Create updated profile
            var updatedProfile = authViewModel.userProfile ?? UserProfile()
            updatedProfile.hamsterName = hamsterName.trimmingCharacters(in: .whitespacesAndNewlines)
            updatedProfile.fitnessLevel = fitnessLevel
            updatedProfile.fitnessGoals = fitnessGoals
            updatedProfile.weeklyWorkoutGoal = weeklyWorkoutGoal
            updatedProfile.schedulePreference = schedulePreference
            updatedProfile.preferredWorkoutTime = preferredWorkoutTime
            updatedProfile.fitnessIntent = fitnessIntent

            // Save to AuthViewModel
            await authViewModel.updateProfile(updatedProfile)

            // Brief delay for UX
            try? await Task.sleep(nanoseconds: 300_000_000)

            isSaving = false
            hasUnsavedChanges = false
            showSaveConfirmation = true
        }
    }
}

#Preview {
    NavigationStack {
        ProfileSettingsView()
            .environmentObject({
                let vm = AuthViewModel()
                return vm
            }())
    }
}
