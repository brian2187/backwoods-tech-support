# Dual-notify Brian: email moorebmoore@hotmail.com and SMS 706.315.3390 at the same time.
# SMS path: T-Mobile (Powertel Atlanta / 706-315) via 7063153390@tmomail.net
param(
    [Parameter(Mandatory = $true)][string]$Subject,
    [Parameter(Mandatory = $true)][string]$Body,
    [string]$Kind = "review"
)

$ErrorActionPreference = "Stop"
$EmailTo = "moorebmoore@hotmail.com"
$SmsTo = "7063153390@tmomail.net"
$Tag = "[VA-DESK]"

function Shorten([string]$text, [int]$max) {
    if ($null -eq $text) { return "" }
    $t = $text.Trim()
    if ($t.Length -le $max) { return $t }
    return $t.Substring(0, $max - 3) + "..."
}

$smsBody = Shorten $Body 280
$smsSubj = Shorten ($Tag + " " + $Subject) 40
$mailSubj = "$Tag $Subject"
$mailBody = @"
$Body

--
Virtual Assistant desk
MTTech_SARFarm@outlook.com
Kind: $Kind
Sent to email and 706.315.3390 together.
"@

$outlook = New-Object -ComObject Outlook.Application

function Send-DeskMail([string]$to, [string]$subj, [string]$text) {
    $mail = $outlook.CreateItem(0)
    $mail.To = $to
    $mail.Subject = $subj
    $mail.Body = $text
    $mail.Send()
}

Send-DeskMail $EmailTo $mailSubj $mailBody
Send-DeskMail $SmsTo $smsSubj $smsBody

Write-Output ("NOTIFIED email=" + $EmailTo + " sms=" + $SmsTo + " subject=" + $Subject)
