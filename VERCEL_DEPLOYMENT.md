# TaskFlow Pro - Vercel 배포 가이드

## 🚀 초간단 배포 방법

### 1. Vercel 계정 생성 (이미 있다면 스킵)
1. [Vercel.com](https://vercel.com) 접속
2. "Sign Up" 클릭
3. GitHub/GitLab/Bitbucket 또는 이메일로 가입

### 2. 배포 명령 실행
터미널에서 다음 명령 실행:
```bash
vercel
```

### 3. 프롬프트 따라가기
1. "Set up and deploy?" → `Y` 입력
2. "Which scope?" → 기본값 선택 (Enter)
3. "Link to existing project?" → `N` 입력
4. "What's your project's name?" → `taskflow-pro` 입력
5. "In which directory is your code located?" → `.` 입력 (현재 디렉토리)
6. "Want to modify settings?" → `N` 입력

### 4. 환경 변수 설정
배포 후 Vercel 대시보드에서:
1. 프로젝트 클릭
2. Settings → Environment Variables
3. 다음 변수 추가:
   - `SESSION_SECRET` = (아무 랜덤 문자열)
   - `NODE_ENV` = `production`

### 5. 데이터베이스 설정 (옵션)
현재 설정은 SQLite를 사용하므로 별도 데이터베이스 없이도 작동합니다.

PostgreSQL을 사용하려면:
1. Vercel 대시보드 → Storage → Create Database
2. Postgres 선택
3. 연결 정보를 DATABASE_URL 환경 변수에 추가

## 📱 배포 완료!

배포가 완료되면 다음과 같은 URL을 받게 됩니다:
- `https://taskflow-pro.vercel.app`
- `https://taskflow-pro-YOUR_USERNAME.vercel.app`

## 🔄 업데이트 방법

코드 수정 후:
```bash
vercel --prod
```

## 🎯 장점

- **무료**: 개인 사용 무료
- **빠른 배포**: 1분 내 완료
- **자동 HTTPS**: 보안 연결 제공
- **글로벌 CDN**: 전 세계 빠른 접속
- **간단한 설정**: Git 없이도 가능

## ⚠️ 주의사항

- SQLite 사용 시 데이터는 재배포 시 초기화될 수 있음
- 영구 저장을 원한다면 Vercel Postgres 사용 권장

## 🛠️ 문제 해결

### 빌드 오류
- `vercel logs` 명령으로 로그 확인

### 500 에러
- 환경 변수 설정 확인
- `vercel env pull` 명령으로 환경 변수 동기화