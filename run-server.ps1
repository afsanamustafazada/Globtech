$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$bundledNode = "C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if (Test-Path $bundledNode) {
  $node = $bundledNode
} elseif (Get-Command node -ErrorAction SilentlyContinue) {
  $node = "node"
} else {
  Write-Host "Node.js tapilmadi. Node.js qurasdirin: https://nodejs.org/"
  exit 1
}

Set-Location $projectRoot
& $node .\server.js
