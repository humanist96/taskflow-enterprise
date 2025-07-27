# TaskFlow Pro - 클라우드 배포 가이드 (Render.com)

## 🚀 빠른 배포 단계

### 1. GitHub 저장소 생성 및 푸시

1. GitHub.com에 로그인
2. 새 저장소 생성 (New Repository)
   - Repository name: `taskflow-pro`
   - Public 선택
   - Create repository 클릭

3. 로컬 프로젝트를 GitHub에 푸시:
```bash
# GitHub 원격 저장소 추가 (YOUR_GITHUB_USERNAME을 실제 사용자명으로 변경)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/taskflow-pro.git

# 코드 푸시
git branch -M main
git push -u origin main
```

### 2. Render.com 계정 생성

1. [Render.com](https://render.com) 접속
2. "Get Started for Free" 클릭
3. GitHub 계정으로 가입 (권장)

### 3. Render.com에서 앱 배포

1. Render 대시보드에서 "New +" 클릭
2. "Web Service" 선택
3. GitHub 저장소 연결:
   - "Connect a repository" 클릭
   - `taskflow-pro` 저장소 선택
   - "Connect" 클릭

4. 서비스 설정:
   - **Name**: `taskflow-pro` (또는 원하는 이름)
   - **Region**: Singapore (아시아)
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. 환경 변수 설정 (Advanced 클릭):
   - `NODE_ENV` = `production`
   - `SESSION_SECRET` = (자동 생성 선택)

6. "Create Web Service" 클릭

### 4. PostgreSQL 데이터베이스 생성

1. Render 대시보드에서 "New +" 클릭
2. "PostgreSQL" 선택
3. 설정:
   - **Name**: `taskflow-db`
   - **Database**: `taskflow`
   - **User**: `taskflow`
   - **Region**: Singapore (웹 서비스와 동일)
   - **Plan**: Free

4. "Create Database" 클릭

### 5. 데이터베이스 연결

1. PostgreSQL 대시보드에서 "Connect" 탭 클릭
2. "Internal Database URL" 복사
3. 웹 서비스 대시보드로 이동
4. "Environment" 탭에서:
   - `DATABASE_URL` 추가
   - 값으로 복사한 Internal Database URL 붙여넣기
5. "Save Changes" 클릭

### 6. 배포 완료

1. 웹 서비스가 자동으로 재시작됨
2. 빌드 로그에서 진행 상황 확인
3. "Live" 상태가 되면 URL 클릭하여 접속

## 📝 배포 후 설정

### 초기 데이터베이스 설정

배포 후 처음 접속 시 자동으로 데이터베이스 스키마가 생성됩니다.

### 사용자 생성

1. 배포된 URL에 접속 (예: `https://taskflow-pro.onrender.com`)
2. 회원가입으로 새 계정 생성

## 🔧 문제 해결

### 빌드 실패 시
- Render 대시보드의 "Logs" 탭 확인
- `package.json`의 의존성 확인

### 데이터베이스 연결 실패
- DATABASE_URL 환경 변수 확인
- PostgreSQL 서비스 상태 확인

### 세션 문제
- SESSION_SECRET 환경 변수 설정 확인
- 브라우저 쿠키 설정 확인

## 🌟 추가 기능

### 커스텀 도메인
1. Render 대시보드 > Settings > Custom Domain
2. 도메인 추가 및 DNS 설정

### 자동 배포
- GitHub에 push하면 자동으로 재배포됨

### 백업
- Render PostgreSQL은 자동 백업 제공 (유료 플랜)
- 수동 백업: `npm run backup` 스크립트 사용

## 📊 모니터링

- Render 대시보드에서 실시간 로그 확인
- 메트릭 탭에서 CPU, 메모리 사용량 모니터링
- 알림 설정으로 다운타임 감지

## 🆓 무료 플랜 제한사항

- 매월 750시간 무료 (충분함)
- PostgreSQL 1GB 저장 공간
- 자동 슬립 모드 (15분 비활성 시)
- 첫 요청 시 부팅 시간 소요 (약 30초)

## 🎉 배포 완료!

이제 TaskFlow Pro가 클라우드에서 실행됩니다. 
어디서든 접속 가능한 업무 관리 시스템을 즐기세요!