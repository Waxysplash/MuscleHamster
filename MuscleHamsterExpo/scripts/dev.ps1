# Start the Expo dev server for the development build (press s if it opens Expo Go).
# Works from ANY folder:
#   & C:\dev\musclehamster\MuscleHamsterExpo\scripts\dev.ps1
Set-Location (Join-Path $PSScriptRoot '..')
npx expo start --dev-client
