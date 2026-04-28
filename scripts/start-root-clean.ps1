param(
  [ValidateSet("dev", "start")]
  [string]$Mode = "start",
  [int]$Port = 3000,
  [int]$WaitSeconds = 20
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Output "🔧 Cleaning listeners on :$Port"
$listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique

if ($listeners) {
  foreach ($pid in $listeners) {
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
  }
}

Start-Sleep -Seconds 1

$scriptName =
if ($Mode -eq "dev") { "dev -- --hostname 127.0.0.1 --port $Port" }
else { "start -- --hostname 127.0.0.1 --port $Port" }

Write-Output "🚀 Starting root service: npm run $scriptName"

$logOut = ".tmp-root-$Mode-$Port.log"
$logErr = ".tmp-root-$Mode-$Port.err.log"

$process = Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/c", "npm run $scriptName 1>>$logOut 2>>$logErr" `
  -WorkingDirectory (Get-Location) `
  -WindowStyle Hidden `
  -PassThru

$ready = $false
for ($i = 0; $i -lt $WaitSeconds; $i += 1) {
  Start-Sleep -Seconds 1
  try {
    $health = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/api/health" -UseBasicParsing -TimeoutSec 3
    $ready = $true
    Write-Output "✅ Root service is ready on http://127.0.0.1:$Port"
    Write-Output $health.Content
    break
  } catch {
  }
}

if (-not $ready) {
  Write-Output "❌ Root service failed to become ready in ${WaitSeconds}s"
  Write-Output "PID=$($process.Id)"
  if (Test-Path $logErr) {
    Write-Output "---- stderr tail ----"
    Get-Content -Encoding UTF8 $logErr -Tail 40
  }
  exit 1
}

Write-Output "PID=$($process.Id)"
Write-Output "LOG=$logOut"
