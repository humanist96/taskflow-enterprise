@echo off
echo GitHub 저장소에 코드 푸시하기
echo.
echo GitHub 사용자명을 입력하세요:
set /p username=

echo.
echo 원격 저장소 추가 중...
git remote add origin https://github.com/%username%/taskflow-pro.git

echo.
echo 코드 푸시 중...
git branch -M main
git push -u origin main

echo.
echo 푸시 완료!
echo.
echo 이제 Render.com에서 배포를 진행하세요.
echo https://render.com 접속 후 GitHub 저장소를 연결하세요.
pause