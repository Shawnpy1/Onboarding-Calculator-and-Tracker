# Open the Creator Seeding & Onboarding Target Tracker in the default web browser
$htmlPath = Join-Path $PSScriptRoot "index.html"
Write-Host "Opening Creator Seeding & Onboarding Target Tracker..." -ForegroundColor Cyan
Start-Process $htmlPath
