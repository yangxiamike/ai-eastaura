param(
  [ValidateSet("dev", "start")]
  [string]$Mode = "dev",
  [int]$Port = 5182,
  [int]$WaitSeconds = 25
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$workbenchDir = Join-Path (Get-Location) "workbecnch-ui-2\app-old"
if (-not (Test-Path $workbenchDir)) {
  throw "workbench directory not found: $workbenchDir"
}

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

Write-Output "🚀 Starting workbench service: npm run $scriptName"

$logOut = ".tmp-workbench-$Mode-$Port.log"
$logErr = ".tmp-workbench-$Mode-$Port.err.log"

$process = Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/c", "npm run $scriptName 1>>$logOut 2>>$logErr" `
  -WorkingDirectory $workbenchDir `
  -WindowStyle Hidden `
  -PassThru

$ready = $false
for ($i = 0; $i -lt $WaitSeconds; $i += 1) {
  Start-Sleep -Seconds 1
  try {
    $resp = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/workbench/" -UseBasicParsing -TimeoutSec 3
    if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400) {
      $ready = $true
      Write-Output "✅ Workbench is ready on http://127.0.0.1:$Port/workbench/"
      break
    }
  } catch {
  }
}

if (-not $ready) {
  Write-Output "❌ Workbench failed to become ready in ${WaitSeconds}s"
  Write-Output "PID=$($process.Id)"
  if (Test-Path $logErr) {
    Write-Output "---- stderr tail ----"
    Get-Content -Encoding UTF8 $logErr -Tail 40
  }
  exit 1
}

Write-Output "PID=$($process.Id)"
Write-Output "LOG=$logOut"
