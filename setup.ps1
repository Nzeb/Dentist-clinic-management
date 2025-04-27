# Enable script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Output "Node.js not found. Installing Node.js..."
    Invoke-WebRequest -Uri "https://nodejs.org/dist/v16.14.0/node-v16.14.0-x64.msi" -OutFile "nodejs.msi"
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i nodejs.msi /quiet" -Wait
    Remove-Item -Path "nodejs.msi"
} else {
    Write-Output "Node.js is already installed."
}

# Check if pnpm is installed
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Output "pnpm not found. Installing pnpm..."
    npm install -g pnpm
} else {
    Write-Output "pnpm is already installed."
}

# Check if PostgreSQL is installed
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Output "PostgreSQL not found. Installing PostgreSQL..."
    Invoke-WebRequest -Uri "https://get.enterprisedb.com/postgresql/postgresql-13.3-1-windows-x64.exe" -OutFile "postgresql.exe"
    Start-Process -FilePath "postgresql.exe" -ArgumentList "/S /D=C:\PostgreSQL" -Wait
    Remove-Item -Path "postgresql.exe"
    $env:PATH += ";C:\PostgreSQL\bin"
} else {
    Write-Output "PostgreSQL is already installed."
}

# Execute SQL file to create tables and user
Write-Output "Setting up PostgreSQL database..."
$psqlCommand = "psql -U postgres -f .\database.sql"
Invoke-Expression $psqlCommand

# Navigate to the Next.js application directory
Set-Location -Path $PSScriptRoot
# Install Node.js modules
if (-not (Test-Path "node_modules")) {
    Write-Output "Installing Node.js modules..."
    pnpm install
} else {
    Write-Output "Node.js modules are already installed."
}

# Start the Next.js application
Write-Output "Starting the Next.js application..."
pnpm dev
