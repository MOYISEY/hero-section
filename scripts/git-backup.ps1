param(
  [string]$RepoPath = "C:\Users\aldia\CascadeProjects\hero-section",
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $RepoPath

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$logPath = Join-Path $RepoPath "backup.log"

try {
  git rev-parse --is-inside-work-tree | Out-Null

  $ignoredEnv = git check-ignore .env.local 2>$null
  if (-not $ignoredEnv) {
    throw ".env.local is not ignored by Git. Backup stopped to protect secrets."
  }

  git fetch origin $Branch | Out-Null

  $status = git status --porcelain
  if (-not $status) {
    "[$timestamp] No changes to back up." | Add-Content -LiteralPath $logPath
    exit 0
  }

  git add --all
  git reset -- .env.local 2>$null

  $staged = git diff --cached --name-only
  if (-not $staged) {
    "[$timestamp] No safe staged changes to back up." | Add-Content -LiteralPath $logPath
    exit 0
  }

  git commit -m "Auto backup $timestamp" | Out-Null
  git push origin $Branch | Out-Null

  "[$timestamp] Backup pushed successfully." | Add-Content -LiteralPath $logPath
} catch {
  "[$timestamp] Backup failed: $($_.Exception.Message)" | Add-Content -LiteralPath $logPath
  exit 1
}
