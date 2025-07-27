# 🚀 지금 바로 배포하기!

## 📋 체크리스트 (5분 완료)

### 1️⃣ GitHub 리포지토리 생성 (1분)
1. https://github.com/new 접속
2. 다음 정보 입력:
   - **Repository name**: `taskflow-enterprise`
   - **Public** 선택
   - ⚠️ **중요**: "Add a README file" 체크 해제!
3. "Create repository" 클릭

### 2️⃣ 코드 푸시 (1분)
리포지토리 생성 후 아래 명령어 실행:
```bash
git push -u origin master
```

### 3️⃣ Vercel 배포 (3분)
1. https://vercel.com/new 접속
2. "Import Git Repository" 클릭
3. GitHub 계정 연결 후 `taskflow-enterprise` 선택
4. 환경 변수 추가:
   ```
   NODE_ENV=production
   SESSION_SECRET=taskflow-secret-2024
   DATABASE_URL=(아래 참조)
   ```

### 4️⃣ 무료 데이터베이스 (2분)

#### 가장 쉬운 방법: Supabase
1. https://supabase.com/dashboard 접속
2. "New project" 클릭
3. 프로젝트 생성:
   - Name: `taskflow`
   - Password: 강력한 비밀번호
   - Region: `Northeast Asia (Seoul)`
4. Settings → Database → Connection string 복사
5. Vercel의 DATABASE_URL에 붙여넣기

### 5️⃣ 데이터베이스 초기화
1. Supabase Dashboard → SQL Editor
2. "New query" 클릭
3. `database/schema-pg.sql` 내용 복사/붙여넣기
4. "Run" 클릭

## ✅ 완료!

배포된 URL: `https://taskflow-enterprise.vercel.app`

### 테스트 순서
1. 회원가입 (Sign Up)
2. 로그인
3. 업무 추가
4. 팀 생성
5. 대시보드 확인

---

## 🆘 문제 발생 시

### GitHub Push 오류
```bash
# Token 필요 시
# GitHub → Settings → Developer settings → Personal access tokens → Generate new token
# 'repo' 권한 체크
```

### Vercel 빌드 오류
- 환경 변수 확인
- DATABASE_URL 형식 확인

### 데이터베이스 연결 오류
- Supabase 프로젝트가 활성화될 때까지 1-2분 대기
- Connection string이 전체 복사되었는지 확인

---

💡 **팁**: 모든 단계 스크린샷은 [GITHUB_SETUP.md](GITHUB_SETUP.md) 참고