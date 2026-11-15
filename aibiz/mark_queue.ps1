# Update a queued desk-mail row after Grok acts or notifies.
param(
    [Parameter(Mandatory = $true)][string]$Id,
    [Parameter(Mandatory = $true)][string]$Status,
    [string]$Action = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$QueuePath = Join-Path $Root "data\queue.jsonl"
if (-not (Test-Path $QueuePath)) { throw "no queue" }

$rows = @()
$found = $false
Get-Content -Encoding UTF8 $QueuePath | ForEach-Object {
    $line = $_.Trim()
    if (-not $line) { return }
    $row = ConvertFrom-Json $line
    if ([string]$row.id -eq $Id) {
        $row.status = $Status
        if ($Action) { $row.action = $Action }
        if ($Status -eq "notified") { $row.notified_at = (Get-Date).ToString("o") }
        $found = $true
    }
    $rows += $row
}
if (-not $found) { throw "id not in queue" }
$lines = foreach ($r in $rows) { ($r | ConvertTo-Json -Compress -Depth 6) }
Set-Content -Path $QueuePath -Value $lines -Encoding UTF8
Write-Output ("MARKED id=$Id status=$Status")
