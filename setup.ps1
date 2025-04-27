# Define variables
$repoUrl = "https://github.com/Nzeb/Dentist-clinic-management"
$repoDir = "Dentist-clinic-management"
$nodeVersion = "16.0.0"
$pnpmVersion = "6.0.0"
$psqlUser = "postgres"
$psqlPassword = "postgres"  # Replace with the actual default password
$psqlDb = "dentist_clinic"
$sqlFile = "$repoDir\src\server\db\migrations\001_init.sql"
$envDevFile = "$repoDir\.env-dev"
$envFile = "$repoDir\.env"

# # Install Git if not installed
# if (-Not (Get-Command git -ErrorAction SilentlyContinue)) {
#     Invoke-WebRequest "https://github.com/git-for-windows/git/releases/download/v2.31.1.windows.1/Git-2.31.1-64-bit.exe" -OutFile "git-installer.exe"
#     Start-Process "git-installer.exe" -ArgumentList "/VERYSILENT" -Wait
#     Remove-Item "git-installer.exe"
# }

# # Clone the repository if it doesn't exist
# if (-Not (Test-Path $repoDir)) {
#     git clone $repoUrl
# }

# Install Node.js if not installed
if (-Not (Get-Command node -ErrorAction SilentlyContinue)) {
    Invoke-WebRequest "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-x64.msi" -OutFile "nodejs.msi"
    Start-Process "msiexec.exe" -ArgumentList "/i nodejs.msi /quiet" -Wait
    Remove-Item "nodejs.msi"
}

# Install pnpm if not installed
if (-Not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    npm install -g pnpm@$pnpmVersion
}

# Install PostgreSQL if not installed
if (-Not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Invoke-WebRequest "https://get.enterprisedb.com/postgresql/postgresql-13.3-1-windows-x64.exe" -OutFile "postgresql.exe"
    Start-Process "postgresql.exe" -ArgumentList "--mode unattended" -Wait
    Remove-Item "postgresql.exe"
}

# Debugging: List contents of the repository directory
Write-Host "Listing contents of the repository directory:"
Get-ChildItem -Path $repoDir

# Debugging: Check if the .env-dev file exists
Write-Host "Checking if .env-dev file exists at path: $envDevFile"
if (Test-Path $envDevFile) {
    Write-Host ".env-dev file found. Renaming to .env..."
    try {
        Rename-Item -Path $envDevFile -NewName ".env"
        Write-Host "Renamed .env-dev to .env successfully."
    } catch {
        Write-Host "Failed to rename .env-dev to .env: $_"
    }
} else {
    Write-Host ".env-dev file not found at path: $envDevFile"
}


# Debugging: Check if the SQL file exists
Write-Host "Checking if SQL file exists at path: $sqlFile"
if (Test-Path $sqlFile) {
     Write-Host "SQL file found. Executing..."
     # Create PostgreSQL database and user if not exists
     $psqlCommand = "psql postgresql://${psqlUser}:${psqlPassword}@localhost -c `"CREATE DATABASE $psqlDb;`""
     Invoke-Expression $psqlCommand

     $psqlCommand = "psql postgresql://${psqlUser}:${psqlPassword}@localhost/$psqlDb -f $sqlFile"
     Invoke-Expression $psqlCommand
} else {
     Write-Host "SQL file not found at path: $sqlFile"
}


# Navigate to the repository directory
Set-Location $repoDir

# Install Node modules
pnpm install

# Build and run the application
pnpm build
pnpm start
