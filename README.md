# TaskFlow Enterprise - Professional Task Management Platform

전문가를 위한 엔터프라이즈급 업무 관리 플랫폼입니다. 팀 협업, 실시간 대시보드, 고급 분석 기능을 제공합니다.

🚀 **데모**: [Vercel에 배포 후 URL]

## 🚀 주요 기능

### 🏢 엔터프라이즈 기능
- **팀 협업**: 팀 생성, 멤버 초대, 업무 할당
- **실시간 대시보드**: Chart.js 기반 시각화
- **댓글 시스템**: 업무별 실시간 소통
- **활동 로그**: 모든 변경사항 추적
- **PWA 지원**: 모바일 앱처럼 설치 가능

### 💾 데이터베이스 기능
- **이중 DB 지원**: SQLite(개발) / PostgreSQL(프로덕션)
- **사용자 인증**: 안전한 bcrypt 암호화
- **세션 관리**: Express-session 기반
- **자동 마이그레이션**: 스키마 자동 적용

### 업무 관리 기능
- **CRUD 작업**: 생성, 읽기, 수정, 삭제
- **우선순위 관리**: 높음/보통/낮음 3단계
- **카테고리 분류**: 업무/개인/프로젝트/회의
- **태그 시스템**: 유연한 라벨링
- **마감일 관리**: 날짜별 업무 추적
- **실시간 검색**: 제목, 태그, 카테고리 통합 검색

### UI/UX 기능
- **모던 디자인**: Glassmorphism, 그라디언트
- **다크모드**: 눈의 피로 감소
- **애니메이션**: 부드러운 전환 효과
- **반응형 디자인**: 모바일/태블릿/데스크톱 지원
- **실시간 통계**: 완료율, 생산성 점수
- **토스트 알림**: 작업 피드백

## 📦 설치 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 데이터베이스 초기화
```bash
npm run init-db
```
- 데모 계정 생성: username: `demo`, password: `demo123`
- 샘플 데이터 추가

### 3. 서버 실행
```bash
npm start
```
또는 개발 모드:
```bash
npm run dev
```

### 4. 접속
브라우저에서 `http://localhost:3000` 접속 (자동으로 index-enterprise.html로 리다이렉트)

## 🗂️ 프로젝트 구조

```
taskflow-pro/
├── database/
│   ├── schema.sql      # 데이터베이스 스키마
│   └── taskflow.db     # SQLite 데이터베이스 파일
├── scripts/
│   ├── init-db.js      # DB 초기화 스크립트
│   └── backup.js       # 백업 스크립트
├── backups/            # 데이터베이스 백업 폴더
├── server.js           # Express API 서버
├── api-client.js       # 프론트엔드 API 클라이언트
├── app-db.js          # 메인 애플리케이션 로직
├── index-db.html      # 메인 페이지
├── styles-modern.css   # 모던 스타일시트
└── package.json       # 프로젝트 설정

```

## 🔧 API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### 업무 관리
- `GET /api/tasks` - 업무 목록 조회
- `POST /api/tasks` - 새 업무 생성
- `PUT /api/tasks/:id` - 업무 수정
- `DELETE /api/tasks/:id` - 업무 삭제

### 통계 및 기타
- `GET /api/stats/overview` - 전체 통계
- `GET /api/categories` - 카테고리 목록
- `GET /api/tags` - 태그 목록

## 💾 데이터베이스 스키마

### 주요 테이블
- **users**: 사용자 정보
- **tasks**: 업무 데이터
- **categories**: 카테고리 분류
- **tags**: 태그 정보
- **task_tags**: 업무-태그 관계
- **activity_logs**: 활동 로그
- **daily_statistics**: 일별 통계

## 🔐 보안 기능
- bcrypt 암호화
- 세션 기반 인증
- CORS 설정
- Helmet.js 보안 헤더
- SQL Injection 방지

## 📊 백업 및 복원

### 백업 실행
```bash
npm run backup
```
- 자동으로 타임스탬프가 포함된 백업 생성
- 최근 10개 백업만 유지

### 데이터 내보내기
웹 인터페이스에서 "내보내기" 버튼 클릭하여 JSON 형식으로 다운로드

## 🚀 Vercel 배포

### 빠른 배포 (Windows)
```bash
deploy.bat
```

### 빠른 배포 (Mac/Linux)
```bash
sh deploy.sh
```

### 수동 배포
1. GitHub에 코드 푸시
2. https://vercel.com/new 에서 리포지토리 연결
3. 환경 변수 설정 (DATABASE_URL, SESSION_SECRET)
4. Deploy 클릭

자세한 내용은 [VERCEL_DEPLOY_GUIDE.md](VERCEL_DEPLOY_GUIDE.md) 참조

## 🔧 환경 변수

`.env` 파일 생성:
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SESSION_SECRET=your-secret-key-here
NODE_ENV=production
PORT=3000
```

## 🚦 개발 팁
- 개발 시 `nodemon`으로 자동 재시작
- 로그는 Morgan으로 확인
- 로컬 개발: SQLite 사용
- 프로덕션: PostgreSQL 사용

## 📱 PWA 기능
- 오프라인 작동 (Service Worker)
- 홈 화면에 추가
- 푸시 알림 (준비 중)
- 백그라운드 동기화 (준비 중)

## 🔮 향후 계획
- [ ] WebSocket 실시간 협업
- [ ] AI 기반 업무 추천
- [ ] 2FA 인증
- [ ] 다국어 지원
- [ ] 파일 첨부 기능
- [ ] 캘린더 뷰

## 📝 라이선스
MIT License

## 🤝 기여하기
PR과 이슈는 언제나 환영합니다!