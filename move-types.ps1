Get-ChildItem -Path src/lib/hooks -File -Force | ForEach-Object { git mv $_.FullName "src/hooks/" }
Get-ChildItem -Path src/lib/types -File -Force | ForEach-Object { git mv $_.FullName "src/types/" }
