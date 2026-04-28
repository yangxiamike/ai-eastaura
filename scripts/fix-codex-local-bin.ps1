$ErrorActionPreference = 'Stop'

$sourceDir = 'C:\Users\hp\AppData\Roaming\npm\node_modules\@openai\codex\node_modules\@openai\codex-win32-x64\vendor\x86_64-pc-windows-msvc\codex'
$targetDir = 'C:\Users\hp\AppData\Local\OpenAI\Codex\bin'
$logPath = 'D:\work\ai-eastaura\docs\BROWSER_USE_PROXY_FIX_RUN.log'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$files = @(
  'codex.exe',
  'codex-command-runner.exe',
  'codex-windows-sandbox-setup.exe'
)

function Write-Log {
  param([string]$Message)
  $line = '{0} {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message
  Add-Content -LiteralPath $logPath -Encoding UTF8 -Value $line
}

Write-Log 'Starting Codex local bin repair.'
Write-Log "Source: $sourceDir"
Write-Log "Target: $targetDir"

foreach ($file in $files) {
  $source = Join-Path $sourceDir $file
  if (-not (Test-Path -LiteralPath $source)) {
    throw "Missing source file: $source"
  }
}

Write-Log 'Waiting for Codex local bin processes to exit.'
$deadline = (Get-Date).AddMinutes(10)
do {
  $blocking = Get-Process -Name codex,node_repl -ErrorAction SilentlyContinue |
    Where-Object {
      $_.Path -like (Join-Path $targetDir '*')
    }

  if (-not $blocking) {
    break
  }

  $ids = ($blocking | ForEach-Object { '{0}:{1}' -f $_.ProcessName, $_.Id }) -join ', '
  Write-Log "Still waiting on: $ids"
  Start-Sleep -Seconds 3
} while ((Get-Date) -lt $deadline)

if ($blocking) {
  throw 'Timed out waiting for Codex local bin processes to exit. Close Codex Desktop completely and rerun the script.'
}

foreach ($file in $files) {
  $source = Join-Path $sourceDir $file
  $target = Join-Path $targetDir $file
  $backup = "$target.bak-$stamp"

  if (Test-Path -LiteralPath $target) {
    Copy-Item -LiteralPath $target -Destination $backup -Force
    Write-Log "Backed up $target to $backup"
  }

  Copy-Item -LiteralPath $source -Destination $target -Force
  Write-Log "Copied stable $file"
}

$version = & (Join-Path $targetDir 'codex.exe') --version
Write-Log "Installed version: $version"
Write-Log 'Codex local bin repair completed.'

