@echo off
echo TaskFlow Enterprise 배포 패키지 생성
echo =====================================
echo.

powershell -ExecutionPolicy Bypass -File create-deploy-zip.ps1

pause