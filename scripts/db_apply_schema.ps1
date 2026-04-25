$ErrorActionPreference = "Stop"

param(
  [string]$ProjectRef = $(if ($env:SUPABASE_PROJECT_REF) { $env:SUPABASE_PROJECT_REF } else { "emeuelwnghssbywebvqn" }),
  [string]$SchemaFile = "supabase/healthcorner_schema.sql"
)

function Require-Command {
  param([string]$Name)
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $cmd) {
    throw "Komut bulunamadi: $Name. Once Postgres'i (psql) kurup PATH'e ekleyin."
  }
}

Require-Command "psql"

if (-not (Test-Path -LiteralPath $SchemaFile)) {
  throw "Schema dosyasi bulunamadi: $SchemaFile"
}

$dbPassword = $env:SUPABASE_DB_PASSWORD
if (-not $dbPassword) {
  $secure = Read-Host "Supabase DB sifresi (Settings -> Database -> Connection string'deki parola)" -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $dbPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

# Remote Postgres endpoint: db.<project-ref>.supabase.co
$conn = "postgresql://postgres:$dbPassword@db.$ProjectRef.supabase.co:5432/postgres?sslmode=require"

Write-Host "Schema uygulanıyor: $SchemaFile"
psql $conn -v ON_ERROR_STOP=1 -f $SchemaFile

Write-Host "Tamamlandi."

