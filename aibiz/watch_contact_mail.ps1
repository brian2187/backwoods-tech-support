# Scan the Virtual Assistant mailbox (MTTech_SARFarm@outlook.com) plus Hotmail
# for contact / enroll mail. MTTech is a separate Outlook.com account, not an
# alias. Until that account is added in Outlook, only Hotmail is visible.
# Does not change the public site. Queues new desk mail. Escalates unprocessed items.
param(
    [switch]$EscalateUnprocessed,
    [int]$EscalateAfterMinutes = 8
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Data = Join-Path $Root "data"
New-Item -ItemType Directory -Force -Path $Data | Out-Null
$QueuePath = Join-Path $Data "queue.jsonl"
$SeenPath = Join-Path $Data "seen.json"
$HeartPath = Join-Path $Data "heartbeat.json"
$NotifyScript = Join-Path $Root "desk_notify.ps1"

function Read-JsonFile($path, $fallback) {
    if (-not (Test-Path $path)) { return $fallback }
    try {
        $raw = Get-Content -Raw -Encoding UTF8 $path
        if (-not $raw.Trim()) { return $fallback }
        return ConvertFrom-Json $raw
    } catch { return $fallback }
}

function Load-Queue {
    $rows = @()
    if (-not (Test-Path $QueuePath)) { return $rows }
    Get-Content -Encoding UTF8 $QueuePath | ForEach-Object {
        $line = $_.Trim()
        if ($line) {
            try { $rows += ,(ConvertFrom-Json $line) } catch {}
        }
    }
    return $rows
}

function Save-Queue($rows) {
    $lines = foreach ($r in $rows) { ($r | ConvertTo-Json -Compress -Depth 6) }
    if ($lines) {
        Set-Content -Path $QueuePath -Value $lines -Encoding UTF8
    } else {
        Set-Content -Path $QueuePath -Value "" -Encoding UTF8
    }
}

function Is-SkipMail($it) {
    $subj = "" + $it.Subject
    $from = ""
    try { $from = "" + $it.SenderEmailAddress } catch {}
    if ($subj -match '\[VA-DESK\]') { return $true }
    if ($subj -match '^(Undeliverable|Delivery Status Notification)') { return $true }
    if ($from -match 'tmomail\.net|vtext\.com|vzwpix\.com|txt\.att\.net') { return $true }
    return $false
}

function Is-DeskMail($it) {
    if (Is-SkipMail $it) { return $false }
    $subj = "" + $it.Subject
    $to = "" + $it.To
    $cc = "" + $it.CC
    $from = ""
    try { $from = "" + $it.SenderEmailAddress } catch {}
    $bodyHead = ""
    try {
        $b = "" + $it.Body
        if ($b.Length -gt 800) { $b = $b.Substring(0, 800) }
        $bodyHead = $b
    } catch {}
    $blob = ($subj + " " + $to + " " + $cc + " " + $from + " " + $bodyHead).ToLowerInvariant()

    if ($blob -match 'mttech_sarfarm|mttech@|sarfarm@outlook') { return $true }
    if ($subj -match '^(Less Traveled:|ENROLL\b|New customer setup sale|Ready to work)') { return $true }
    if ($bodyHead -match 'ENROLLMENT — Virtual Assistant|Name: .+\r?\nTitle: ') { return $true }
    return $false
}

function Store-IsMttech($store) {
    $blob = ""
    try { $blob += " " + $store.DisplayName } catch {}
    try { $blob += " " + $store.FilePath } catch {}
    return ($blob -match 'mttech|sarfarm')
}

function Kind-Of($it) {
    $subj = "" + $it.Subject
    $body = ""
    try { $body = "" + $it.Body } catch {}
    if ($subj -match '^ENROLL\b' -or $body -match 'ENROLLMENT — Virtual Assistant') { return "enroll" }
    if ($subj -match 'New customer setup sale') { return "setup" }
    if ($subj -match '^Ready to work') { return "ready" }
    if ($subj -match '^Less Traveled:') { return "contact" }
    if ($subj -match '(?i)paypal|donation|received a payment|you received') { return "money" }
    return "desk"
}

$seenObj = Read-JsonFile $SeenPath @{ ids = @() }
$seen = New-Object 'System.Collections.Generic.HashSet[string]'
foreach ($id in @($seenObj.ids)) { [void]$seen.Add([string]$id) }

$queue = @(Load-Queue)
$byId = @{}
foreach ($q in $queue) { $byId[[string]$q.id] = $q }

$outlook = New-Object -ComObject Outlook.Application
$ns = $outlook.GetNamespace("MAPI")
function Get-FolderByName($parent, $name) {
    for ($i = 1; $i -le $parent.Folders.Count; $i++) {
        $f = $parent.Folders.Item($i)
        if ($f.Name -eq $name) { return $f }
    }
    return $null
}

$newItems = @()
$storeNames = @()
$mttechConnected = $false
foreach ($store in @($ns.Stores)) {
    $storeName = ""
    try { $storeName = [string]$store.DisplayName } catch { $storeName = "?" }
    $storeNames += $storeName
    $isMttech = Store-IsMttech $store
    if ($isMttech) { $mttechConnected = $true }
    $root = $null
    try { $root = $store.GetRootFolder() } catch { continue }
    foreach ($fname in @("Inbox", "Junk Email")) {
        $folder = Get-FolderByName $root $fname
        if (-not $folder) { continue }
        $items = $folder.Items
        try { $items.Sort("[ReceivedTime]", $true) } catch {}
        $cap = [Math]::Min($items.Count, 250)
        for ($i = 1; $i -le $cap; $i++) {
            $it = $items.Item($i)
            $keep = $false
            if ($isMttech) {
                $keep = -not (Is-SkipMail $it)
            } else {
                $keep = Is-DeskMail $it
            }
            if (-not $keep) { continue }
            $eid = [string]$it.EntryID
            [void]$seen.Add($eid)
            if ($byId.ContainsKey($eid)) { continue }
            $fromAddr = ""
            try { $fromAddr = [string]$it.SenderEmailAddress } catch {}
            $body = ""
            try { $body = [string]$it.Body } catch {}
            if ($body.Length -gt 4000) { $body = $body.Substring(0, 4000) }
            $row = [pscustomobject]@{
                id          = $eid
                ts          = (Get-Date).ToString("o")
                when        = ([datetime]$it.ReceivedTime).ToString("o")
                unread      = [bool]$it.UnRead
                folder      = ($storeName + "/" + $fname)
                from        = [string]$it.SenderName
                from_addr   = $fromAddr
                to          = [string]$it.To
                subject     = [string]$it.Subject
                body        = $body
                kind        = (Kind-Of $it)
                status      = "new"
                action      = ""
                notified_at = $null
            }
            $queue += $row
            $byId[$eid] = $row
            $newItems += $row
        }
    }
}

$escalated = @()
if ($EscalateUnprocessed) {
    $cutoff = (Get-Date).AddMinutes(-1 * $EscalateAfterMinutes)
    foreach ($q in $queue) {
        if ($q.status -ne "new") { continue }
        $queuedAt = $null
        try { $queuedAt = [datetime]$q.ts } catch { $queuedAt = Get-Date }
        if ($queuedAt -gt $cutoff) { continue }
        if ($q.notified_at) { continue }
        $sms = "REVIEW $($q.kind): $($q.subject) from $($q.from). Open Grok / MTTech mailbox. Site not changed."
        & $NotifyScript -Subject ("Review: " + $q.kind) -Body $sms -Kind $q.kind
        $q.status = "notified"
        $q.notified_at = (Get-Date).ToString("o")
        $q.action = "escalated-unprocessed"
        $escalated += $q
    }
}

Save-Queue $queue
$seenOut = @{ ids = @($seen); updated = (Get-Date).ToString("o") }
($seenOut | ConvertTo-Json -Compress -Depth 4) | Set-Content -Path $SeenPath -Encoding UTF8

$open = @($queue | Where-Object { $_.status -eq "new" })
$heart = @{
    ts                 = (Get-Date).ToString("o")
    account            = "MTTech_SARFarm@outlook.com"
    mttech_connected   = $mttechConnected
    stores             = $storeNames
    new                = $newItems.Count
    open               = $open.Count
    escalated          = $escalated.Count
    queue_total        = $queue.Count
    warn               = $(if ($mttechConnected) { "" } else { "mttech_store_missing" })
}
($heart | ConvertTo-Json -Compress -Depth 4) | Set-Content -Path $HeartPath -Encoding UTF8

$summary = @{
    ok        = $true
    new       = @($newItems | ForEach-Object { @{ id = $_.id; kind = $_.kind; subject = $_.subject; from = $_.from; from_addr = $_.from_addr; when = $_.when; body = $_.body } })
    open      = @($open | ForEach-Object { @{ id = $_.id; kind = $_.kind; status = $_.status; subject = $_.subject; from = $_.from; from_addr = $_.from_addr; when = $_.when; body = $_.body } })
    escalated = $escalated.Count
}
$summary | ConvertTo-Json -Depth 8
