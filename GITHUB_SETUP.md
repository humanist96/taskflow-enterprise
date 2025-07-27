# GitHub 리포지토리 생성 및 Vercel 연동 가이드

## 1단계: GitHub 리포지토리 생성

1. **GitHub 접속**
   - https://github.com 로그인 (humanist96@gmail.com)

2. **새 리포지토리 생성**
   - 우측 상단 "+" 버튼 → "New repository" 클릭
   - Repository name: `taskflow-enterprise`
   - Description: "Professional Task Management Platform with Team Collaboration"
   - Public 선택
   - ❌ "Add a README file" 체크 해제 (중요!)
   - "Create repository" 클릭

3. **생성된 리포지토리 URL 복사**
   - 예: `https://github.com/humanist96/taskflow-enterprise.git`

## 2단계: 로컬 코드를 GitHub에 푸시

터미널이나 Git Bash에서 다음 명령어 실행:

```bash
# 원격 저장소 추가
git remote add origin https://github.com/humanist96/taskflow-enterprise.git

# 코드 푸시
git push -u origin master
```

GitHub 인증이 필요한 경우:
- Username: humanist96
- Password: GitHub Personal Access Token (비밀번호 대신)

## 3단계: Vercel과 연동

1. **Vercel 접속**
   - https://vercel.com 로그인

2. **GitHub 연동**
   - "Import Project" 클릭
   - "Import Git Repository" 선택
   - GitHub 계정 연결 (처음인 경우)
   - `humanist96/taskflow-enterprise` 리포지토리 선택

3. **프로젝트 설정**
   ```
   Project Name: taskflow-enterprise
   Framework Preset: Other
   Root Directory: ./
   Build Command: (비워두기)
   Output Directory: (비워두기)
   Install Command: npm install
   ```

4. **환경 변수 설정**
   "Environment Variables" 섹션에서 추가:
   
   ```
   NODE_ENV = production
   SESSION_SECRET = taskflow-secret-key-2024-secure
   DATABASE_URL = (아래 참조)
   ```

## 4단계: 무료 PostgreSQL 데이터베이스 설정

### 옵션 A: Vercel Postgres (가장 쉬움)
1. Vercel Dashboard → Storage 탭
2. "Create Database" → "Postgres" 선택
3. 자동으로 DATABASE_URL 설정됨

### 옵션 B: Supabase (추천)
1. https://supabase.com 가입
2. "New Project" 생성
   - Project name: taskflow-enterprise
   - Database Password: 강력한 비밀번호
   - Region: 가까운 지역 선택
3. Settings → Database → Connection string 복사
4. Vercel 환경 변수에 DATABASE_URL로 추가

## 5단계: 배포

1. **Deploy 버튼 클릭**
   - Vercel이 자동으로 빌드 및 배포 시작
   - 약 2-3분 소요

2. **데이터베이스 초기화**
   - Supabase SQL Editor 또는 Vercel Data 탭에서
   - `database/schema-pg.sql` 내용 실행

## 6단계: 접속 URL 확인

배포 완료 후 Vercel이 제공하는 URL:
- Production: `https://taskflow-enterprise.vercel.app`
- Preview: `https://taskflow-enterprise-[hash].vercel.app`

## 문제 해결

### Push 권한 오류
```bash
# Personal Access Token 생성 필요
# GitHub → Settings → Developer settings → Personal access tokens
# repo 권한 체크 후 토큰 생성
```

### 빌드 실패
- package.json의 의존성 확인
- 환경 변수 설정 확인

---

준비되셨으면 위 단계를 따라 진행해주세요!