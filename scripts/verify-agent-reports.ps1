param(
  [string]$Correo = "juandavidcast2019@gmail.com",
  [string]$Contrasena = "Juan20072020",
  [int]$Days = 30,
  [string]$Prompt = "Muestrame los productos mas vendidos en fisico del ultimo mes"
)

$ErrorActionPreference = "Stop"

function Invoke-WithRetry {
  param(
    [scriptblock]$Operation,
    [int]$MaxRetries = 6,
    [int]$DelaySeconds = 4,
    [string]$Name = "operacion"
  )

  $attempt = 1
  while ($attempt -le $MaxRetries) {
    try {
      return & $Operation
    } catch {
      if ($attempt -eq $MaxRetries) {
        throw
      }
      Write-Output ("WARN=" + $Name + " fallo intento " + $attempt + ", reintentando...")
      Start-Sleep -Seconds $DelaySeconds
      $attempt++
    }
  }
}

function Get-TopCount {
  param([object]$TopResp)

  if ($TopResp.data -is [System.Array]) {
    return $TopResp.data.Count
  }

  if ($TopResp.data -and $TopResp.data.data -is [System.Array]) {
    return $TopResp.data.data.Count
  }

  return 0
}

Write-Output "== Verificacion Agente + Reportes =="

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$loginBody = @{ correo = $Correo; contrasena = $Contrasena } | ConvertTo-Json
$loginResp = Invoke-WithRetry -Name "login" -Operation {
  Invoke-RestMethod -Method Post -Uri "http://localhost:4000/users/auth/login" -ContentType "application/json" -Body $loginBody -WebSession $session
}

if (-not $loginResp.success) {
  throw "Login fallido"
}

$start = (Get-Date).AddDays(-1 * [Math]::Abs($Days)).ToString("yyyy-MM-dd")
$end = (Get-Date).ToString("yyyy-MM-dd")

$topResp = Invoke-WithRetry -Name "reports top" -Operation {
  Invoke-RestMethod -Method Get -Uri "http://localhost:4000/reports/analytics/products/top?startDate=$start&endDate=$end&limit=10" -WebSession $session
}
$topCount = Get-TopCount -TopResp $topResp

$salesResp = Invoke-WithRetry -Name "reports sales" -Operation {
  Invoke-RestMethod -Method Get -Uri "http://localhost:4000/reports/sales/by-dates?fechaInicio=$start&fechaFin=$end&canalVenta=fisico" -WebSession $session
}
$salesTotal = 0
if ($salesResp.data -and $salesResp.data.totalVentas -ne $null) {
  $salesTotal = [int]$salesResp.data.totalVentas
}

$queryBody = @{ message = $Prompt } | ConvertTo-Json
$agentResp = Invoke-WithRetry -Name "agent query" -Operation {
  Invoke-RestMethod -Method Post -Uri "http://localhost:4000/agent/query" -ContentType "application/json" -Body $queryBody -WebSession $session
}

Write-Output ("RANGO=" + $start + ".." + $end)
Write-Output ("TOP_SUCCESS=" + [string]$topResp.success)
Write-Output ("TOP_COUNT=" + [string]$topCount)
Write-Output ("SALES_SUCCESS=" + [string]$salesResp.success)
Write-Output ("SALES_TOTAL=" + [string]$salesTotal)
Write-Output ("AGENT_OK=" + [string]$agentResp.ok)
Write-Output ("AGENT_TOOLS=" + ($agentResp.meta.tools_called -join ","))
Write-Output ("AGENT_MESSAGE=" + [string]$agentResp.message)

if ($salesTotal -gt 0 -and $topCount -eq 0) {
  Write-Output "DIAGNOSTICO=Hay ventas pero top agregado vacio (analytics potencialmente desincronizado)."
  exit 2
}

if ($salesTotal -eq 0 -and $topCount -eq 0) {
  Write-Output "DIAGNOSTICO=Sin ventas en el rango consultado."
  exit 0
}

Write-Output "DIAGNOSTICO=Datos de top y ventas consistentes."
exit 0
