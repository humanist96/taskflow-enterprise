# TaskFlow Pro - Enterprise Task Management System

SQLite 데이터베이스를 활용한 전문적인 업무 관리 시스템입니다.

## 🚀 주요 기능

### 데이터베이스 기능
- **SQLite 영구 저장소**: 모든 데이터를 안전하게 저장
- **사용자 인증**: 회원가입/로그인으로 개인 데이터 보호
- **다중 사용자 지원**: 각 사용자별 독립된 업무 관리
- **세션 관리**: 안전한 로그인 상태 유지
- **데이터 백업**: 자동 백업 및 복원 기능

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
브라우저에서 `http://localhost:3000/index-db.html` 접속

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

## 🚦 개발 팁
- 개발 시 `nodemon`으로 자동 재시작
- 로그는 Morgan으로 확인
- 데이터베이스는 `database/taskflow.db`에 저장

## 📝 라이선스
MIT License