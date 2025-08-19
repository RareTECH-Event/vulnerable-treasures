Param(
  [string]$Image = "ghcr.io/OWNER/vulnerable-treasures:latest",
  [int]$Port = 3000
)

$name = "vt"

docker ps -a --format '{{.Names}}' | Select-String -Pattern "^$name$" > $null
if ($?) { docker rm -f $name | Out-Null }

Write-Host "Starting $Image on port $Port..."
docker run -d --name $name -p "$Port:3000" $Image | Out-Null
Write-Host "Open http://localhost:$Port"
