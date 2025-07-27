# TaskFlow Enterprise - 빠른 배포 가이드

## 옵션 1: GitHub 없이 직접 배포 (가장 빠름)

1. **프로젝트 압축**
   - 현재 폴더를 ZIP으로 압축
   - node_modules 폴더는 제외

2. **Vercel에 직접 업로드**
   - https://vercel.com 접속 및 로그인
   - Dashboard → "Import Project" 클릭
   - "Upload" 탭 선택
   - ZIP 파일 드래그 앤 드롭

3. **프로젝트 설정**
   ```
   Framework Preset: Other
   Build Command: (비워두기)
   Output Directory: (비워두기)
   Install Command: npm install
   ```

4. **환경 변수 추가**
   ```
   NODE_ENV=production
   SESSION_SECRET=my-super-secret-key-2024
   DATABASE_URL=(아래 무료 DB 중 선택)
   ```

## 옵션 2: 무료 PostgreSQL 데이터베이스

### Supabase (추천)
1. https://supabase.com 가입
2. New Project 생성
3. Settings → Database → Connection string 복사
4. DATABASE_URL에 붙여넣기

### Neon
1. https://neon.tech 가입
2. Create Database
3. Connection string 복사
4. DATABASE_URL에 붙여넣기

## 배포 후 데이터베이스 초기화

1. Supabase/Neon 대시보드에서 SQL Editor 열기
2. `database/schema-pg.sql` 내용 복사/붙여넣기
3. Run 실행

## 접속 URL

배포가 완료되면 Vercel이 자동으로 URL을 생성합니다:
- 기본: `https://[프로젝트명].vercel.app`
- 예시: `https://taskflow-enterprise.vercel.app`

## 테스트 계정

1. 배포된 사이트 접속
2. "회원가입" 클릭
3. 테스트 계정 생성:
   - Username: test
   - Email: test@example.com
   - Password: test123

## 주요 기능 확인

1. ✅ 회원가입/로그인
2. ✅ 업무 생성/수정/삭제
3. ✅ 대시보드 차트
4. ✅ 팀 생성 및 협업
5. ✅ 댓글 시스템
6. ✅ PWA 설치 (모바일)

## 문제 해결

### "500 Error" 발생 시
- 환경 변수 확인
- DATABASE_URL 연결 확인

### 로그인 안 될 때
- SESSION_SECRET 설정 확인
- 쿠키 설정 확인

## 예상 배포 시간

- Vercel 업로드: 1-2분
- 빌드 및 배포: 2-3분
- 총 소요시간: 5분 이내

---

🎉 축하합니다! TaskFlow Enterprise가 전 세계에서 접속 가능해졌습니다!