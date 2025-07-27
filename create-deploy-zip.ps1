# TaskFlow Enterprise 배포용 ZIP 생성 스크립트

Write-Host "TaskFlow Enterprise 배포 패키지 생성 중..." -ForegroundColor Green

# 제외할 항목들
$excludes = @(
    'node_modules',
    'database/*.db',
    'backups',
    '.git',
    '.env',
    '.env.local',
    '.vscode',
    '.idea',
    '.vercel',
    'create-deploy-zip.ps1',
    'deploy.bat',
    'deploy.sh',
    '*.log'
)

# 임시 폴더 생성
$tempFolder = "taskflow-deploy-temp"
if (Test-Path $tempFolder) {
    Remove-Item $tempFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $tempFolder | Out-Null

# 파일 복사 (제외 항목 빼고)
Write-Host "파일 복사 중..." -ForegroundColor Yellow
Get-ChildItem -Path . -Exclude $excludes | Copy-Item -Destination $tempFolder -Recurse -Force

# ZIP 파일 생성
$zipFile = "taskflow-enterprise-deploy.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

Write-Host "ZIP 파일 생성 중..." -ForegroundColor Yellow
Compress-Archive -Path "$tempFolder\*" -DestinationPath $zipFile -CompressionLevel Optimal

# 임시 폴더 삭제
Remove-Item $tempFolder -Recurse -Force

Write-Host "✅ 배포 패키지 생성 완료!" -ForegroundColor Green
Write-Host "📦 파일명: $zipFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Yellow
Write-Host "1. https://vercel.com 접속" -ForegroundColor White
Write-Host "2. 'Import Project' 클릭" -ForegroundColor White
Write-Host "3. 'Upload' 탭에서 $zipFile 업로드" -ForegroundColor White
Write-Host ""