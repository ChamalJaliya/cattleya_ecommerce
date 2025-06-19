# Cattleya E-commerce Platform Startup Script
Write-Host "🌺 Starting Cattleya E-commerce Platform..." -ForegroundColor Magenta

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Stop existing containers if any
Write-Host "🧹 Cleaning up existing containers..." -ForegroundColor Yellow
docker-compose down --volumes --remove-orphans

# Build and start all services
Write-Host "🚀 Building and starting all services..." -ForegroundColor Cyan
docker-compose up --build -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service status
Write-Host "`n🔍 Checking service status..." -ForegroundColor Cyan

$services = @(
    @{Name="MongoDB"; Url="http://localhost:27017"; Container="cattleya-mongodb"},
    @{Name="Backend API"; Url="http://localhost:3001/api/health"; Container="cattleya-backend"},
    @{Name="Frontend"; Url="http://localhost:3000"; Container="cattleya-frontend"},
    @{Name="Nginx Proxy"; Url="http://localhost/health"; Container="cattleya-nginx"}
)

foreach ($service in $services) {
    $status = docker ps --filter "name=$($service.Container)" --format "table {{.Status}}" | Select-Object -Skip 1
    if ($status -like "*Up*") {
        Write-Host "✅ $($service.Name): Running" -ForegroundColor Green
    } else {
        Write-Host "❌ $($service.Name): Not running" -ForegroundColor Red
    }
}

Write-Host "`n🌺 Cattleya Platform is starting up!" -ForegroundColor Magenta
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔗 API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "📚 API Docs: http://localhost:3001/api/docs" -ForegroundColor Cyan
Write-Host "🏠 Main Site: http://localhost" -ForegroundColor Cyan
Write-Host "`n🔑 Demo Credentials:" -ForegroundColor Yellow
Write-Host "   Admin: admin@cattleya.com / password123" -ForegroundColor White
Write-Host "   Staff: staff@cattleya.com / password123" -ForegroundColor White
Write-Host "   Customer: customer@cattleya.com / password123" -ForegroundColor White

Write-Host "`n📝 To view logs: docker-compose logs -f" -ForegroundColor Gray
Write-Host "🛑 To stop: docker-compose down" -ForegroundColor Gray 