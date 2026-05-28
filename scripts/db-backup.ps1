param(
  [string]$DatabaseUrl = $env:DATABASE_URL,
  [string]$BackupDir = "database/backups"
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
  throw "DATABASE_URL is not set. Pass -DatabaseUrl or define it in the environment."
}

if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
  throw "pg_dump was not found. Install PostgreSQL client tools and add them to PATH."
}

if (-not (Test-Path $BackupDir)) {
  New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = Join-Path $BackupDir "neuralbrief-$timestamp.sql"

pg_dump $DatabaseUrl --clean --if-exists --no-owner --no-privileges --file $backupPath

Write-Host "Database backup created: $backupPath"
