$ErrorActionPreference = "Stop"

param(
  [string]$ProjectRef = $(if ($env:SUPABASE_PROJECT_REF) { $env:SUPABASE_PROJECT_REF } else { "emeuelwnghssbywebvqn" })
)

function Run-Supabase {
  param([string[]]$Args)
  & npx -y supabase @Args
  if ($LASTEXITCODE -ne 0) { throw "supabase komutu basarisiz oldu: supabase $($Args -join ' ')" }
}

Write-Host "Supabase CLI surumu:"
Run-Supabase @("--version")

if (-not $env:SUPABASE_DB_PASSWORD) {
  Write-Host "UYARI: SUPABASE_DB_PASSWORD tanimli degil. 'supabase db push' sirasinda parola isteyebilir veya hata verebilir."
  Write-Host "Isterseniz once su sekilde ayarlayin:"
  Write-Host "  `$env:SUPABASE_DB_PASSWORD = '...'"
}

Write-Host "Projeye linkleniyor (gerekirse tarayicida login acilir)..."
Run-Supabase @("link", "--project-ref", $ProjectRef)

Write-Host "Migration'lar remote DB'ye uygulaniyor..."
Run-Supabase @("db", "push")

Write-Host "Tamamlandi."

