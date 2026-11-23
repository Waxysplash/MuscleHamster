# Build the Android app (AAB for Google Play). Works from ANY folder:
#   & C:\dev\musclehamster\MuscleHamsterExpo\scripts\android.ps1
Set-Location (Join-Path $PSScriptRoot '..')
eas build --platform android --profile production
