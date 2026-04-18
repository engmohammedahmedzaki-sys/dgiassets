# Script to add sample projects to database
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Adding Sample Projects to Database" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

Write-Host "Docker is running ✓" -ForegroundColor Green
Write-Host ""

# Check if PostgreSQL container is running
Write-Host "Checking PostgreSQL container..." -ForegroundColor Yellow
$postgresRunning = docker ps --filter "name=marketplace_postgres" --format "{{.Names}}"
if (-not $postgresRunning) {
    Write-Host "ERROR: PostgreSQL container is not running!" -ForegroundColor Red
    Write-Host "Please run: docker-compose up -d" -ForegroundColor Red
    exit 1
}

Write-Host "PostgreSQL is running ✓" -ForegroundColor Green
Write-Host ""

# Execute SQL file
Write-Host "Adding sample projects..." -ForegroundColor Yellow
$result = docker exec -i marketplace_postgres psql -U postgres -d marketplace_db -f /seed-projects.sql 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Sample projects added successfully! ✓" -ForegroundColor Green
    Write-Host ""
    Write-Host "8 projects have been added to the database." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now browse them at:" -ForegroundColor Cyan
    Write-Host "  http://localhost:4200/browse" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "ERROR: Failed to add sample projects!" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure you have registered at least one user first:" -ForegroundColor Yellow
    Write-Host "  http://localhost:4200/register" -ForegroundColor White
    exit 1
}

Write-Host "Done! ✓" -ForegroundColor Green
