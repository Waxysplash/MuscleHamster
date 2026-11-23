# Build the iOS app and send it to TestFlight.
# Works from ANY folder: it moves into the app folder itself first.
#   & C:\dev\musclehamster\MuscleHamsterExpo\scripts\testflight.ps1
# Apple team: pick "KAMAL CHIOUA (Individual)" if asked (not 17023073 Canada Inc.).
Set-Location (Join-Path $PSScriptRoot '..')
Write-Host "Building Muscle Hamster for TestFlight from $(Get-Location)" -ForegroundColor Yellow
eas build --platform ios --profile production --auto-submit
