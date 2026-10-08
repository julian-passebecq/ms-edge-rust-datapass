# Run from PowerShell after installing the unpacked Edge extension.
# This registers an opt-in ping-only Native Messaging host for the current user.
param(
  [Parameter(Mandatory=$true)]
  [ValidatePattern("^[a-p]{32}$")]
  [string]$ExtensionId
)
$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Executable = Join-Path $Root "bridge\target\release\datapass-edge-bridge.exe"
if (-not (Test-Path -LiteralPath $Executable -PathType Leaf)) {
  throw "Host binary not found. Run: cargo build --release --manifest-path bridge/Cargo.toml"
}
$Directory = Join-Path $env:LOCALAPPDATA "DataPass\EdgeBridge"
New-Item -ItemType Directory -Path $Directory -Force | Out-Null
$ManifestFile = Join-Path $Directory "com.datapass.edgebridge.json"
$Manifest = @{
  name = "com.datapass.edgebridge"
  description = "DataPass Edge local diagnostics host (ping only)"
  type = "stdio"
  path = $Executable
  allowed_origins = @("chrome-extension://$ExtensionId/")
} | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText($ManifestFile, $Manifest, (New-Object System.Text.UTF8Encoding($false)))
$Key = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey("Software\Microsoft\Edge\NativeMessagingHosts\com.datapass.edgebridge")
try {
  $Key.SetValue("", $ManifestFile, [Microsoft.Win32.RegistryValueKind]::String)
} finally {
  $Key.Close()
}
Write-Host "Registered DataPass Edge host for extension $ExtensionId"
Write-Host "Manifest: $ManifestFile"
