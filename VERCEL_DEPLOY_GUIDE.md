# Vercel 배포 가이드

TaskFlow Enterprise를 Vercel에 배포하는 방법입니다.

## 사전 준비사항

1. **Vercel 계정**
   - https://vercel.com 에서 계정 생성 (무료)
   - GitHub 계정으로 가입 권장

2. **GitHub 리포지토리**
   - 코드를 GitHub에 푸시
   - Public 또는 Private 리포지토리 모두 가능

## 배포 단계

### 1. GitHub에 코드 푸시

```bash
# GitHub 리포지토리 생성 후
git remote add origin https://github.com/YOUR_USERNAME/taskflow-enterprise.git
git push -u origin master
```

### 2. Vercel에서 프로젝트 가져오기

1. https://vercel.com/new 접속
2. "Import Git Repository" 클릭
3. GitHub 연동 및 리포지토리 선택
4. 프로젝트 설정:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: 비워두기
   - **Output Directory**: 비워두기
   - **Install Command**: `npm install`

### 3. 환경 변수 설정

Vercel 대시보드에서 환경 변수 추가:

```
DATABASE_URL=your-postgres-connection-string
SESSION_SECRET=your-secret-key-here
NODE_ENV=production
```

### 4. PostgreSQL 데이터베이스 설정

#### 옵션 A: Vercel PostgreSQL (추천)
1. Vercel 대시보드 → Storage 탭
2. "Create Database" → PostgreSQL 선택
3. 자동으로 DATABASE_URL 설정됨

#### 옵션 B: 외부 PostgreSQL
- Supabase (https://supabase.com) - 무료 플랜 제공
- ElephantSQL (https://www.elephantsql.com) - 무료 플랜 제공
- Neon (https://neon.tech) - 무료 플랜 제공

### 5. 데이터베이스 초기화

배포 후 데이터베이스 스키마 초기화:

1. Vercel 대시보드에서 Functions 로그 확인
2. 또는 로컬에서 원격 DB에 연결하여 스키마 실행:

```bash
# PostgreSQL 클라이언트 사용
psql YOUR_DATABASE_URL < database/schema-pg.sql
```

## 배포 확인

1. Vercel이 제공하는 URL로 접속 (예: https://your-project.vercel.app)
2. 회원가입 후 로그인
3. 팀 생성 및 업무 관리 테스트

## 주의사항

1. **무료 플랜 제한**
   - Vercel: 월 100GB 대역폭, 무제한 배포
   - PostgreSQL: 제공업체별 상이 (보통 10-50MB 스토리지)

2. **보안**
   - SESSION_SECRET은 충분히 복잡하게 설정
   - HTTPS는 Vercel이 자동 제공

3. **성능 최적화**
   - 정적 파일은 Vercel CDN이 자동 캐싱
   - API 응답은 Edge Functions로 최적화됨

## 문제 해결

### 500 에러 발생 시
- Vercel Functions 로그 확인
- 환경 변수 설정 확인
- 데이터베이스 연결 확인

### 로그인이 안 될 때
- SESSION_SECRET 환경 변수 확인
- 데이터베이스 users 테이블 확인

### 느린 응답 시간
- 데이터베이스 위치 확인 (Vercel과 같은 리전 권장)
- 콜드 스타트 문제일 수 있음 (첫 요청 후 개선됨)

## 추가 기능

### 커스텀 도메인
1. Vercel 대시보드 → Settings → Domains
2. 도메인 추가 및 DNS 설정

### 환경별 배포
- Production: master 브랜치
- Staging: develop 브랜치
- Preview: PR마다 자동 생성

## 지원

문제가 발생하면:
1. Vercel 문서: https://vercel.com/docs
2. PostgreSQL 문서: https://www.postgresql.org/docs/
3. 프로젝트 이슈: GitHub Issues에 등록