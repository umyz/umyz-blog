param(
  [string]$Destination = (Join-Path $PSScriptRoot '..\backups')
)

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$backupDirectory = [System.IO.Path]::GetFullPath($Destination)
$stamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$archivePath = Join-Path $backupDirectory "umyz-blog_$stamp.zip"
$sources = @(
  (Join-Path $projectRoot 'src\content'),
  (Join-Path $projectRoot 'src\data'),
  (Join-Path $projectRoot 'public\docs-static'),
  (Join-Path $projectRoot '.git')
) | Where-Object { Test-Path -LiteralPath $_ }

New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
if ($sources.Count -eq 0) { throw 'Yedeklenecek kaynak bulunamadı.' }
Compress-Archive -LiteralPath $sources -DestinationPath $archivePath -CompressionLevel Optimal
Write-Output "Backup created: $archivePath"
