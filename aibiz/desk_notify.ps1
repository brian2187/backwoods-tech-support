# Notify Brian at moorebmoore@hotmail.com.
# Do not email-to-SMS. Verizon shut down vtext.com / vzwpix.com (NDR 550 5.1.1
# decommission). tmomail.net is the wrong carrier and bounces. Real SMS needs
# Twilio or Verizon EMAG — do not invent a key.
param(
    [Parameter(Mandatory = $true)][string]$Subject,
    [Parameter(Mandatory = $true)][string]$Body,
    [string]$Kind = "review"
)

$ErrorActionPreference = "Stop"
$EmailTo = "moorebmoore@hotmail.com"
$SmsTo = ""
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
Sent to email. Phone text is off until an SMS API is wired (Verizon ended email-to-text).
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
if ($SmsTo) {
    Send-DeskMail $SmsTo $smsSubj $smsBody
}

Write-Output ("NOTIFIED email=" + $EmailTo + " sms=" + $(if ($SmsTo) { $SmsTo } else { "off" }) + " subject=" + $Subject)
