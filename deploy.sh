#!/bin/bash

echo "TaskFlow Enterprise - Vercel 배포 스크립트"
echo "========================================"
echo ""

# Check if git remote exists
if ! git remote | grep -q 'origin'; then
    echo "❌ GitHub 리포지토리가 연결되어 있지 않습니다."
    echo "먼저 GitHub에 리포지토리를 만들고 다음 명령을 실행하세요:"
    echo ""
    echo "git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "git push -u origin master"
    echo ""
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "❌ 커밋되지 않은 변경사항이 있습니다."
    echo "먼저 변경사항을 커밋하세요:"
    echo ""
    echo "git add ."
    echo "git commit -m 'your message'"
    echo ""
    exit 1
fi

# Push to GitHub
echo "📤 GitHub에 푸시 중..."
git push origin master

if [ $? -eq 0 ]; then
    echo "✅ GitHub 푸시 완료!"
    echo ""
    echo "이제 Vercel에서 배포하세요:"
    echo ""
    echo "1. https://vercel.com/new 방문"
    echo "2. 'Import Git Repository' 클릭"
    echo "3. GitHub 리포지토리 선택"
    echo "4. 환경 변수 설정:"
    echo "   - DATABASE_URL"
    echo "   - SESSION_SECRET"
    echo "   - NODE_ENV=production"
    echo ""
    echo "또는 Vercel CLI 사용:"
    echo ""
    echo "vercel login"
    echo "vercel --prod"
    echo ""
else
    echo "❌ GitHub 푸시 실패!"
    exit 1
fi